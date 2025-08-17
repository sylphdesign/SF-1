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
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Check } from 'lucide-react';
import _ from 'lodash';

const PLATFORM_SIZES = [
  {
    platform: 'Instagram',
    formats: [
      { name: 'Square Post', width: 1080, height: 1080, icon: '📷' },
      { name: 'Story', width: 1080, height: 1920, icon: '📱' },
      { name: 'Reel Cover', width: 1080, height: 1350, icon: '🎥' },
    ]
  },
  {
    platform: 'Facebook',
    formats: [
      { name: 'Feed Post', width: 1200, height: 630, icon: '📘' },
      { name: 'Story', width: 1080, height: 1920, icon: '📱' },
      { name: 'Cover Photo', width: 1200, height: 315, icon: '🖼️' },
    ]
  },
  {
    platform: 'LinkedIn',
    formats: [
      { name: 'Feed Post', width: 1200, height: 627, icon: '💼' },
      { name: 'Company Banner', width: 1536, height: 768, icon: '🏢' },
      { name: 'Article Header', width: 1200, height: 627, icon: '📰' },
    ]
  },
  {
    platform: 'Twitter',
    formats: [
      { name: 'Tweet Image', width: 1024, height: 512, icon: '🐦' },
      { name: 'Header Photo', width: 1500, height: 500, icon: '🎭' },
    ]
  },
  {
    platform: 'YouTube',
    formats: [
      { name: 'Thumbnail', width: 1280, height: 720, icon: '▶️' },
      { name: 'Channel Art', width: 2560, height: 1440, icon: '🎬' },
    ]
  }
];

export default function MagicResizeModal({ isOpen, onClose, adData, onResize }) {
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [isResizing, setIsResizing] = useState(false);

  const handleFormatToggle = (format) => {
    const formatKey = `${format.platform}-${format.name}`;
    setSelectedFormats(prev => 
      prev.includes(formatKey) 
        ? prev.filter(f => f !== formatKey)
        : [...prev, formatKey]
    );
  };

  const isFormatSelected = (format) => {
    return selectedFormats.includes(`${format.platform}-${format.name}`);
  };

  const handleMagicResize = async () => {
    if (selectedFormats.length === 0) {
      alert('Please select at least one format to resize to.');
      return;
    }

    setIsResizing(true);
    
    // Create resized versions
    const resizedVersions = [];
    
    for (const formatKey of selectedFormats) {
      const [platformName, formatName] = formatKey.split('-');
      const platform = PLATFORM_SIZES.find(p => p.platform === platformName);
      const format = platform?.formats.find(f => f.name === formatName);
      
      if (format) {
        const resizedDesign = resizeDesignToFormat(adData.design, format);
        resizedVersions.push({
          name: `${adData.name} - ${platform.platform} ${format.name}`,
          design: resizedDesign,
          platform: platform.platform,
          format: format.name
        });
      }
    }

    setTimeout(() => {
      setIsResizing(false);
      onResize(resizedVersions);
      onClose();
    }, 2000);
  };

  const resizeDesignToFormat = (originalDesign, targetFormat) => {
    const newDesign = _.cloneDeep(originalDesign);
    
    const scaleX = targetFormat.width / originalDesign.frame.width;
    const scaleY = targetFormat.height / originalDesign.frame.height;
    const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
    
    // Update frame
    newDesign.frame.width = targetFormat.width;
    newDesign.frame.height = targetFormat.height;
    
    // Scale and reposition layers
    const offsetX = (targetFormat.width - originalDesign.frame.width * scale) / 2;
    const offsetY = (targetFormat.height - originalDesign.frame.height * scale) / 2;
    
    const scaleLayers = (layers) => {
      return layers.map(layer => {
        const scaledLayer = { ...layer };
        
        // Scale position and size
        scaledLayer.x = layer.x * scale + offsetX;
        scaledLayer.y = layer.y * scale + offsetY;
        
        if (layer.width) scaledLayer.width = layer.width * scale;
        if (layer.height) scaledLayer.height = layer.height * scale;
        if (layer.radius) scaledLayer.radius = layer.radius * scale;
        if (layer.fontSize) scaledLayer.fontSize = Math.max(12, layer.fontSize * scale);
        
        // Handle groups recursively
        if (layer.type === 'group' && layer.layers) {
          scaledLayer.layers = scaleLayers(layer.layers);
        }
        
        return scaledLayer;
      });
    };
    
    newDesign.layers = scaleLayers(newDesign.layers);
    return newDesign;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Magic Resize
          </DialogTitle>
          <DialogDescription>
            Automatically resize your design for different social media platforms. 
            Select the formats you need and we'll create optimized versions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {PLATFORM_SIZES.map(platform => (
            <div key={platform.platform}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                {platform.platform}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {platform.formats.map(format => (
                  <Card 
                    key={`${platform.platform}-${format.name}`}
                    className={`cursor-pointer transition-all ${
                      isFormatSelected(format)
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleFormatToggle({ ...format, platform: platform.platform })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{format.icon}</span>
                          <div>
                            <div className="font-medium">{format.name}</div>
                            <div className="text-sm text-gray-500">
                              {format.width} × {format.height}px
                            </div>
                          </div>
                        </div>
                        {isFormatSelected(format) && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {selectedFormats.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-blue-900">
                      {selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''} selected
                    </div>
                    <div className="text-sm text-blue-700">
                      We'll create {selectedFormats.length} resized version{selectedFormats.length > 1 ? 's' : ''} of your design
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedFormats.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isResizing}>
              Cancel
            </Button>
            <Button 
              onClick={handleMagicResize} 
              disabled={selectedFormats.length === 0 || isResizing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isResizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Resized Versions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create {selectedFormats.length} Version{selectedFormats.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}