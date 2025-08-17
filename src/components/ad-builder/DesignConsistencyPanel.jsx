import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Eye, Wand2, CheckCircle, AlertTriangle } from 'lucide-react';
import _ from 'lodash';

// Color theory-based palettes
const COLOR_HARMONIES = {
  monochromatic: {
    name: 'Monochromatic',
    description: 'Different shades of the same color',
    generate: (baseColor) => {
      const hsl = hexToHsl(baseColor);
      return [
        hslToHex(hsl.h, hsl.s, Math.max(0.1, hsl.l - 0.3)),
        hslToHex(hsl.h, hsl.s, Math.max(0.2, hsl.l - 0.15)),
        baseColor,
        hslToHex(hsl.h, hsl.s, Math.min(0.9, hsl.l + 0.15)),
        hslToHex(hsl.h, hsl.s, Math.min(0.95, hsl.l + 0.3))
      ];
    }
  },
  complementary: {
    name: 'Complementary',
    description: 'Opposite colors on the color wheel',
    generate: (baseColor) => {
      const hsl = hexToHsl(baseColor);
      const complementHue = (hsl.h + 180) % 360;
      return [
        baseColor,
        hslToHex(complementHue, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s * 0.3, Math.min(0.95, hsl.l + 0.2)),
        hslToHex(complementHue, hsl.s * 0.3, Math.min(0.95, hsl.l + 0.2)),
        '#ffffff'
      ];
    }
  },
  triadic: {
    name: 'Triadic',
    description: 'Three evenly spaced colors',
    generate: (baseColor) => {
      const hsl = hexToHsl(baseColor);
      return [
        baseColor,
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        hslToHex(hsl.h, hsl.s * 0.2, Math.min(0.95, hsl.l + 0.3)),
        '#ffffff'
      ];
    }
  }
};

// Professional font pairings
const FONT_PAIRINGS = [
  {
    name: 'Classic Professional',
    heading: 'Georgia, serif',
    body: 'Helvetica, sans-serif',
    description: 'Timeless and trustworthy',
    category: 'professional'
  },
  {
    name: 'Modern Clean',
    heading: 'Arial, sans-serif',
    body: 'Verdana, sans-serif',
    description: 'Clean and contemporary',
    category: 'modern'
  },
  {
    name: 'Bold Impact',
    heading: 'Impact, sans-serif',
    body: 'Arial, sans-serif',
    description: 'Strong and attention-grabbing',
    category: 'bold'
  },
  {
    name: 'Elegant Serif',
    heading: "'Times New Roman', serif",
    body: 'Helvetica, sans-serif',
    description: 'Sophisticated and refined',
    category: 'elegant'
  },
  {
    name: 'Tech Forward',
    heading: 'Verdana, sans-serif',
    body: "'Courier New', monospace",
    description: 'Technical and precise',
    category: 'tech'
  }
];

// Color utility functions
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToHex(h, s, l) {
  h = h / 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function DesignConsistencyPanel({ design, onUpdateDesign }) {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [selectedFonts, setSelectedFonts] = useState(null);

  const analyzeDesign = useCallback(() => {
    const analysis = {
      colors: extractColors(design),
      fonts: extractFonts(design),
      contrast: analyzeContrast(design),
      hierarchy: analyzeHierarchy(design)
    };

    const newSuggestions = generateDesignSuggestions(analysis, design);
    setSuggestions(newSuggestions);
  }, [design]);

  const extractColors = (design) => {
    const colors = new Set();
    design.layers.forEach(layer => {
      if (layer.fill) colors.add(layer.fill);
      if (layer.type === 'rect' && layer.fill) colors.add(layer.fill);
    });
    if (design.frame.backgroundColor) colors.add(design.frame.backgroundColor);
    return Array.from(colors);
  };

  const extractFonts = (design) => {
    const fonts = new Set();
    design.layers.forEach(layer => {
      if (layer.type === 'text' && layer.fontFamily) {
        fonts.add(layer.fontFamily);
      }
    });
    return Array.from(fonts);
  };

  const analyzeContrast = (design) => {
    const issues = [];
    design.layers.forEach(layer => {
      if (layer.type === 'text') {
        const textColor = layer.fill || '#000000';
        const bgColor = design.frame.backgroundColor || '#ffffff';
        const contrast = calculateContrast(textColor, bgColor);
        if (contrast < 4.5) {
          issues.push({
            layerId: layer.id,
            type: 'low_contrast',
            current: contrast,
            recommended: 4.5
          });
        }
      }
    });
    return issues;
  };

  const analyzeHierarchy = (design) => {
    const textLayers = design.layers.filter(l => l.type === 'text');
    const fontSizes = textLayers.map(l => l.fontSize || 16);
    const uniqueSizes = [...new Set(fontSizes)];
    
    return {
      fontSizeVariety: uniqueSizes.length,
      hasProperHierarchy: uniqueSizes.length >= 2 && Math.max(...fontSizes) - Math.min(...fontSizes) >= 16
    };
  };

  const calculateContrast = (color1, color2) => {
    // Simplified contrast calculation
    const getLuminance = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const generateDesignSuggestions = (analysis, design) => {
    const suggestions = [];

    // Color suggestions
    if (analysis.colors.length > 5) {
      suggestions.push({
        id: 'too_many_colors',
        type: 'colors',
        priority: 'high',
        title: 'Too Many Colors',
        description: 'Using more than 5 colors can make your design look chaotic',
        action: 'Reduce to 3-4 main colors'
      });
    }

    // Font suggestions
    if (analysis.fonts.length > 2) {
      suggestions.push({
        id: 'too_many_fonts',
        type: 'typography',
        priority: 'medium',
        title: 'Too Many Fonts',
        description: 'Using more than 2 font families reduces readability',
        action: 'Stick to 1-2 font families'
      });
    }

    // Contrast suggestions
    analysis.contrast.forEach(issue => {
      suggestions.push({
        id: `contrast_${issue.layerId}`,
        type: 'accessibility',
        priority: 'high',
        title: 'Poor Color Contrast',
        description: `Text contrast is ${issue.current.toFixed(1)}, should be at least ${issue.recommended}`,
        action: 'Increase contrast for better readability',
        layerId: issue.layerId
      });
    });

    // Hierarchy suggestions
    if (!analysis.hierarchy.hasProperHierarchy) {
      suggestions.push({
        id: 'poor_hierarchy',
        type: 'typography',
        priority: 'medium',
        title: 'Weak Visual Hierarchy',
        description: 'Text sizes are too similar, making it hard to scan',
        action: 'Create more distinction between heading and body text'
      });
    }

    return suggestions;
  };

  const applyColorPalette = (palette) => {
    const newDesign = _.cloneDeep(design);
    const colors = palette.colors;
    let colorIndex = 0;

    newDesign.layers.forEach(layer => {
      if (layer.type === 'rect' || layer.type === 'circle') {
        layer.fill = colors[colorIndex % colors.length];
        colorIndex++;
      } else if (layer.type === 'text') {
        // Use darker colors for text
        layer.fill = colors[0]; // Primary color for text
      }
    });

    // Set background to the lightest color
    newDesign.frame.backgroundColor = colors[colors.length - 1];

    onUpdateDesign(newDesign);
    setSelectedPalette(palette);
  };

  const applyFontPairing = (fontPair) => {
    const newDesign = _.cloneDeep(design);

    newDesign.layers.forEach(layer => {
      if (layer.type === 'text') {
        if (layer.fontSize >= 24) {
          layer.fontFamily = fontPair.heading;
        } else {
          layer.fontFamily = fontPair.body;
        }
      }
    });

    onUpdateDesign(newDesign);
    setSelectedFonts(fontPair);
  };

  const fixContrastIssue = (suggestion) => {
    const newDesign = _.cloneDeep(design);
    const layer = newDesign.layers.find(l => l.id === suggestion.layerId);
    
    if (layer && layer.type === 'text') {
      // Make text darker for better contrast
      layer.fill = '#1f2937';
    }

    onUpdateDesign(newDesign);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  // Generate color palettes based on current design
  const currentColors = extractColors(design);
  const dominantColor = currentColors[0] || '#3b82f6';
  
  const colorPalettes = Object.entries(COLOR_HARMONIES).map(([key, harmony]) => ({
    id: key,
    name: harmony.name,
    description: harmony.description,
    colors: harmony.generate(dominantColor)
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Design Consistency</h2>
        <p className="text-sm text-gray-600 mb-4">
          AI-powered suggestions to improve your design's visual harmony
        </p>
        <Button onClick={analyzeDesign} className="w-full">
          <Eye className="w-4 h-4 mr-2" />
          Analyze Design
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="suggestions">Issues</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="p-4 space-y-3">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className={`border-l-4 ${
                  suggestion.priority === 'high' ? 'border-l-red-500' : 
                  suggestion.priority === 'medium' ? 'border-l-yellow-500' : 
                  'border-l-blue-500'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">
                        {suggestion.title}
                      </CardTitle>
                      <Badge variant={
                        suggestion.priority === 'high' ? 'destructive' : 
                        suggestion.priority === 'medium' ? 'secondary' : 
                        'outline'
                      }>
                        {suggestion.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-2">
                      {suggestion.description}
                    </p>
                    <p className="text-xs text-blue-600 mb-3">
                      💡 {suggestion.action}
                    </p>
                    {suggestion.layerId && (
                      <Button 
                        size="sm" 
                        onClick={() => fixContrastIssue(suggestion)}
                        className="w-full"
                      >
                        Fix This Issue
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="text-sm">
                  {suggestions.length === 0 ? 'Click "Analyze Design" to check for issues' : 'Great! No design issues found.'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="colors" className="p-4 space-y-4">
            {colorPalettes.map((palette) => (
              <Card key={palette.id} className={`cursor-pointer transition-all hover:shadow-md ${
                selectedPalette?.id === palette.id ? 'ring-2 ring-blue-500' : ''
              }`} onClick={() => applyColorPalette(palette)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{palette.name}</CardTitle>
                  <p className="text-xs text-gray-600">{palette.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex space-x-2">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    <Wand2 className="w-3 h-3 mr-2" />
                    Apply Palette
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="fonts" className="p-4 space-y-3">
            {FONT_PAIRINGS.map((fontPair) => (
              <Card key={fontPair.name} className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFonts?.name === fontPair.name ? 'ring-2 ring-blue-500' : ''
              }`} onClick={() => applyFontPairing(fontPair)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{fontPair.name}</CardTitle>
                  <p className="text-xs text-gray-600">{fontPair.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-3">
                    <div style={{ fontFamily: fontPair.heading }} className="text-lg font-bold">
                      Heading Font
                    </div>
                    <div style={{ fontFamily: fontPair.body }} className="text-sm">
                      Body text sample for readability
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    <Type className="w-3 h-3 mr-2" />
                    Apply Fonts
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}