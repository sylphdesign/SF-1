
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { UploadCloud, Loader2, Wand2, X, CheckCircle, Image as ImageIcon, BoxSelect, Save } from 'lucide-react';
import { FunnelTemplate } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Simplified schema that's more likely to work with the AI
const getSimplifiedLayoutSchema = () => ({
  "type": "object",
  "properties": {
    "title": { "type": "string", "description": "Page title" },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "type": "string" },
          "content": { "type": "string", "description": "A summary of the content in this section" }, // Changed to string for flexibility
          "children": { 
            "type": "array", 
            "description": "An array of child elements, can be simple strings or objects",
            "items": { "type": "string" } // FIX: Define items as strings for simplicity
          } 
        }
      }
    }
  },
  "required": ["title", "sections"] // Marking as required to ensure AI returns these
});

export default function FunnelCreator() {
  const [funnelName, setFunnelName] = useState('');
  const [funnelDescription, setFunnelDescription] = useState('');
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newPages = files.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      fileName: file.name,
      status: 'uploading',
      imageUrl: null,
      extractedJson: null,
      error: null,
    }));
    setPages(prev => [...prev, ...newPages]);

    for (const page of newPages) {
      try {
        const { file_url } = await UploadFile({ file: page.file });
        setPages(prev => prev.map(p => (p.id === page.id ? { ...p, status: 'uploaded', imageUrl: file_url } : p)));
      } catch (err) {
        setPages(prev => prev.map(p => (p.id === page.id ? { ...p, status: 'error', error: 'Upload failed' } : p)));
        console.error("Upload failed for", page.fileName, err);
      }
    }
  };

  const handleRemovePage = (id) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const handleAnalyzeFunnel = async () => {
    setIsProcessing(true);
    
    for (const page of pages) {
      if (page.status === 'uploaded') {
        setPages(prev => prev.map(p => (p.id === page.id ? { ...p, status: 'processing' } : p)));
        try {
          // Much simpler prompt without complex schema requirements
          const prompt = `Analyze this webpage image and describe its layout structure. 

Return a simple JSON object with:
- title: A descriptive title for the page (e.g., "Homepage Landing", "Product Details")
- sections: An array of the main sections you see, ordered from top to bottom (e.g., header, hero, content, form, footer).

For each section, describe:
- type: What kind of section it is (e.g., "Header", "Hero", "Features", "Testimonials", "Call to Action", "Form", "Footer")
- content: A brief summary of the main content elements you see within this section (e.g., "Logo, Navigation links", "Headline, Image, Button", "3 feature cards with icons and text", "Email signup form, Submit button")
- children: An optional array of more specific nested elements or bullet points of key components, if relevant (e.g., ["Main headline", "Sub-headline", "CTA button"], ["Product image", "Price", "Add to Cart button"]). Keep this simple, use strings if possible.

Be flexible with the structure - just describe what you see in a logical way that adheres to the schema. The goal is to get a high-level overview.

Image URL: ${page.imageUrl}`;

          const extractedJson = await InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: getSimplifiedLayoutSchema()
          });

          // Comprehensive debug logging
          console.log("=== AI RESPONSE DEBUG ===");
          console.log("Page:", page.fileName);
          console.log("Response type:", typeof extractedJson);
          console.log("Response keys:", Object.keys(extractedJson || {}));
          console.log("Full response:", JSON.stringify(extractedJson, null, 2));
          console.log("========================");

          setPages(prev => prev.map(p => (p.id === page.id ? { ...p, status: 'done', extractedJson } : p)));

        } catch (err) {
          console.error("Layout analysis failed for", page.fileName, err);
          setPages(prev => prev.map(p => (p.id === page.id ? { ...p, status: 'error', error: 'Analysis failed' } : p)));
        }
      }
    }
    
    setIsProcessing(false);
  };
  
  const handleSaveFunnel = async () => {
    if (!funnelName.trim()) {
      alert("Please provide a name for your funnel template.");
      return;
    }
    
    setIsSaving(true);
    try {
      const transformedPages = pages.map(page => {
        if (page.status !== 'done' || !page.extractedJson) {
          throw new Error(`Page "${page.fileName}" has not been analyzed successfully.`);
        }

        console.log("=== SAVE DEBUG ===");
        console.log("Processing page:", page.fileName);
        console.log("Extracted JSON (from AI):", JSON.stringify(page.extractedJson, null, 2));
        console.log("==================");

        // For now, just save whatever we got from the AI
        const data = page.extractedJson;
        
        return {
          page_name: data.title || page.fileName.replace(/\.[^/.]+$/, ""),
          page_description: `Analyzed from ${page.fileName}`,
          page_blocks: data.sections || [], // Directly use the 'sections' array as page_blocks
          meta: { 
            title: data.title || page.fileName.replace(/\.[^/.]+$/, ""),
            extracted_data: data // Save the full AI response for debugging/future use
          }
        };
      });

      console.log("Final transformed pages (for saving):", JSON.stringify(transformedPages, null, 2));

      await FunnelTemplate.create({
        name: funnelName,
        description: funnelDescription,
        category: 'ai_generated_custom',
        pages: transformedPages,
        generation_type: 'simplified_analysis' // Updated generation type
      });
      
      alert('Funnel template saved successfully! Check the console logs to see what data was captured.');
      navigate(createPageUrl('Templates'));

    } catch (error) {
      console.error("Failed to save funnel template:", error);
      alert(`Error saving funnel: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const allUploaded = pages.length > 0 && pages.every(p => p.status === 'uploaded' || p.status === 'done' || p.status === 'processing');
  const analysisComplete = pages.length > 0 && pages.every(p => p.status === 'done');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BoxSelect className="w-8 h-8 text-blue-600" />
          AI Funnel Creator
        </h1>
        <p className="text-slate-600 mt-2">Upload images of your funnel pages, and we'll analyze their structure.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Funnel Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="funnel-name">Funnel Name</Label>
            <Input id="funnel-name" value={funnelName} onChange={e => setFunnelName(e.target.value)} placeholder="e.g., New Product Launch Funnel" />
          </div>
          <div>
            <Label htmlFor="funnel-description">Description</Label>
            <Textarea id="funnel-description" value={funnelDescription} onChange={e => setFunnelDescription(e.target.value)} placeholder="A brief description of this funnel's purpose." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Upload Page Layouts</CardTitle>
          <CardDescription>Upload an image for each page in your funnel, in order.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center relative">
            <UploadCloud className="w-12 h-12 mx-auto text-slate-400" />
            <p className="mt-4 text-slate-600">Drag & drop files or click to browse</p>
            <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
            <Input type="file" multiple onChange={handleFileChange} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" accept="image/png, image/jpeg" />
          </div>
          <div className="mt-6 space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border">
                <div className="w-16 h-16 bg-slate-200 rounded-md flex items-center justify-center overflow-hidden">
                  {page.imageUrl ? (
                    <img src={page.imageUrl} alt={page.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{page.fileName}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    {page.status === 'uploading' && <><Loader2 className="w-3 h-3 animate-spin" /><span>Uploading...</span></>}
                    {page.status === 'uploaded' && <><CheckCircle className="w-3 h-3 text-green-500" /><span>Ready for analysis</span></>}
                    {page.status === 'processing' && <><Loader2 className="w-3 h-3 animate-spin" /><span>Analyzing layout...</span></>}
                    {page.status === 'done' && <><CheckCircle className="w-3 h-3 text-green-500" /><span>Analysis complete</span></>}
                    {page.status === 'error' && <><span className="text-red-500">{page.error}</span></>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemovePage(page.id)} disabled={isProcessing || isSaving}>
                  <X className="w-4 h-4 text-slate-500" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {allUploaded && !analysisComplete && (
        <div className="flex justify-end">
          <Button size="lg" onClick={handleAnalyzeFunnel} disabled={isProcessing || pages.some(p => p.status !== 'uploaded')}>
            {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Wand2 className="w-5 h-5 mr-2" />}
            Analyze Layouts
          </Button>
        </div>
      )}

      {analysisComplete && (
         <Card>
            <CardHeader>
                <CardTitle>3. Review & Save</CardTitle>
                <CardDescription>Analysis complete! Check browser console for detailed results, then save the funnel template.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end pt-4">
                    <Button size="lg" onClick={handleSaveFunnel} disabled={isSaving || !funnelName.trim()}>
                      {isSaving ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5 mr-2" />
                      )}
                      Save Funnel Template
                    </Button>
                </div>
            </CardContent>
         </Card>
      )}
    </div>
  );
}
