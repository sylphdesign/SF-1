
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const EXPORT_FORMATS = [
  { value: 'png', label: 'PNG', description: 'High quality with transparency support' },
  { value: 'jpg', label: 'JPG', description: 'Smaller file size, no transparency' },
  { value: 'pdf', label: 'PDF', description: 'Print-ready document format' },
];

const QUALITY_OPTIONS = [
  { value: 1, label: 'Standard (1x)', description: 'Good for web preview' },
  { value: 2, label: 'High (2x)', description: 'Recommended for most uses' },
  { value: 3, label: 'Ultra (3x)', description: 'Best for print and large displays' },
];

// Helper function to extract fonts from the design recursively
const getFontsFromDesign = (design) => {
  const fontFamilies = new Set();
  const extract = (layers) => {
    if (!layers) return;
    layers.forEach(layer => {
      if (layer.type === 'text' && layer.fontFamily) {
        // A simple split for font stacks, taking the primary font
        fontFamilies.add(layer.fontFamily.split(',')[0].replace(/['"]/g, '').trim());
      }
      if (layer.type === 'group' && layer.layers) {
        extract(layer.layers);
      }
    });
  };
  extract(design.layers);
  return Array.from(fontFamilies);
};


export default function ExportModal({ isOpen, onClose, adData, previewRef }) {
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [selectedQuality, setSelectedQuality] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      // 1. Get all unique fonts from the design
      const fonts = getFontsFromDesign(adData.design);
      
      // 2. Preload all fonts to ensure they are available for rendering
      if (fonts.length > 0) {
        const fontPromises = fonts.map(font => document.fonts.load(`1em "${font}"`));
        await Promise.all(fontPromises);
      }

      // 3. Add a small delay to allow the browser to apply the fonts before capture
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(previewRef.current.querySelector('.ad-canvas'), {
        useCORS: true,
        scale: selectedQuality,
        backgroundColor: adData.design.frame.backgroundColor,
        logging: true, // Enable logging for easier debugging
        imageTimeout: 20000, // Increase timeout for loading external images
      });

      const fileName = `${adData.name || 'ad-design'}`;

      switch (selectedFormat) {
        case 'png':
          downloadCanvas(canvas, `${fileName}.png`, 'image/png');
          break;
        case 'jpg':
          downloadCanvas(canvas, `${fileName}.jpg`, 'image/jpeg', 0.9);
          break;
        case 'pdf':
          await exportToPDF(canvas, `${fileName}.pdf`, adData.design.frame);
          break;
        default:
          downloadCanvas(canvas, `${fileName}.png`, 'image/png');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. There might be an issue loading external images or fonts. Please check the console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCanvas = (canvas, filename, mimeType, quality = 1.0) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(mimeType, quality);
    link.click();
  };

  const exportToPDF = async (canvas, filename, frame) => {
    const imgData = canvas.toDataURL('image/png');
    
    // Convert pixels to mm for PDF (assuming 96 DPI)
    const mmPerPx = 0.264583;
    const width = frame.width * mmPerPx;
    const height = frame.height * mmPerPx;
    
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [width, height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(filename);
  };

  const selectedFormatInfo = EXPORT_FORMATS.find(f => f.value === selectedFormat);
  const selectedQualityInfo = QUALITY_OPTIONS.find(q => q.value === selectedQuality);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Design</DialogTitle>
          <DialogDescription>
            Choose your export format and quality settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold">Export Format</Label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map(format => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{format.label}</span>
                      <span className="text-xs text-gray-500">{format.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold">Quality</Label>
            <Select value={selectedQuality.toString()} onValueChange={(value) => setSelectedQuality(parseInt(value))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map(quality => (
                  <SelectItem key={quality.value} value={quality.value.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{quality.label}</span>
                      <span className="text-xs text-gray-500">{quality.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Output Size:</span>
                <Badge variant="outline">
                  {adData.design.frame.width * selectedQuality} × {adData.design.frame.height * selectedQuality}px
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{selectedFormatInfo?.label}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedFormatInfo?.label}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
