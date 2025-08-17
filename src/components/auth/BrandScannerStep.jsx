
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, ArrowRight } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

export default function BrandScannerStep({ onComplete, onSkip }) {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL.');
      return;
    }
    setIsScanning(true);
    setError('');

    // Simplified schema to avoid serialization issues
    const responseSchema = {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "domain": { "type": "string" },
        "description": { "type": "string" },
        "longDescription": { "type": "string" },
        "primaryColor": { "type": "string" },
        "secondaryColor": { "type": "string" },
        "accentColor": { "type": "string" },
        "logoUrl": { "type": "string" },
        "faviconUrl": { "type": "string" },
        "headingFont": { "type": "string" },
        "bodyFont": { "type": "string" },
        "socialLinks": { "type": "string" },
        "targetAudience": { "type": "string" },
        "valueProposition": { "type": "string" },
        "customerMotivation": { "type": "string" },
        "potentialFriction": { "type": "string" },
        "customerAnxiety": { "type": "string" },
        "imageAssets": { 
          "type": "array", 
          "items": { "type": "string" },
          "description": "An array of up to 10 key image asset URLs from the website (e.g., hero images, product shots, banners)."
        }
      }
    };

    const prompt = `
      You are an expert brand analyst and web crawler. Your task is to visit the website at the URL "${url}" and extract a comprehensive brand profile.

      Analyze the entire website to understand the company's identity, offerings, and visual style. Extract the following information:

      1. Company name and domain
      2. Brief description and longer description of the company
      3. Primary brand colors (hex codes) - identify the main brand color, secondary color, and accent color
      4. Logo URL (main logo image) and favicon URL if visible
      5. A list of up to 10 key marketing images and visual assets from the site.
      6. Typography - identify the main fonts used for headings and body text
      7. Social media links (as a comma-separated string)
      8. Based on MECLABS principles, analyze:
         - Target audience description
         - Value proposition offered
         - Customer motivation (what they want to achieve)
         - Potential friction points (difficulties customers might face)
         - Customer anxiety (fears or uncertainties)

      Return the information in the JSON format requested. If you cannot find specific information, use reasonable defaults or leave fields empty.
    `;

    try {
      const response = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: responseSchema
      });

      // Transform the simplified response back to the expected format
      const transformedResponse = {
        name: response.name || '',
        domain: response.domain || '',
        description: response.description || '',
        longDescription: response.longDescription || '',
        logos: [
          ...(response.logoUrl ? [{ type: 'logo', formats: [{ src: response.logoUrl }] }] : []),
          ...(response.faviconUrl ? [{ type: 'favicon', formats: [{ src: response.faviconUrl }] }] : [])
        ],
        colors: [
          ...(response.primaryColor ? [{ hex: response.primaryColor, type: 'primary' }] : []),
          ...(response.secondaryColor ? [{ hex: response.secondaryColor, type: 'secondary' }] : []),
          ...(response.accentColor ? [{ hex: response.accentColor, type: 'accent' }] : [])
        ],
        fonts: [
          ...(response.headingFont ? [{ name: response.headingFont, type: 'title' }] : []),
          ...(response.bodyFont ? [{ name: response.bodyFont, type: 'body' }] : [])
        ],
        links: response.socialLinks ? 
          response.socialLinks.split(',').map(link => {
            const trimmed = link.trim();
            const name = trimmed.includes('twitter') ? 'twitter' :
                        trimmed.includes('linkedin') ? 'linkedin' :
                        trimmed.includes('facebook') ? 'facebook' :
                        trimmed.includes('instagram') ? 'instagram' : 'social';
            return { name, url: trimmed };
          }) : [],
        icp: {
          target_audience: response.targetAudience || '',
          motivation: response.customerMotivation || '',
          value_proposition: response.valueProposition || '',
          friction: response.potentialFriction || '',
          anxiety: response.customerAnxiety || ''
        },
        imageAssets: response.imageAssets || []
      };

      onComplete(transformedResponse);
    } catch (err) {
      console.error("Scanning failed:", err);
      setError("Failed to scan the website. Please check the URL or try again later.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Wand2 className="w-6 h-6 mr-2 text-blue-600" />
            Import Your Brand
          </CardTitle>
          <CardDescription>
            Enter your website URL to let our AI automatically create your brand kit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="website-url">Website URL</Label>
            <Input
              id="website-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourcompany.com"
              className="mt-1"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleScan}
              className="w-full"
              size="lg"
              disabled={isScanning || !url}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scanning... This may take a minute.
                </>
              ) : (
                <>
                  Scan Website & Import Brand
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <Button
              variant="link"
              className="w-full"
              onClick={onSkip}
              disabled={isScanning}
            >
              Skip and create manually
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
