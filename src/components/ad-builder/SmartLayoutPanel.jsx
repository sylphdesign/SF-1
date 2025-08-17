import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, Lightbulb, CheckCircle, Target, AlignCenterHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import _ from 'lodash';

// Helper to find a layer recursively, including within groups
const findLayerRecursive = (layers, layerId) => {
  for (const layer of layers) {
    if (layer.id === layerId) return layer;
    if (layer.type === 'group' && layer.layers) {
      const found = findLayerRecursive(layer.layers, layerId);
      if (found) return found;
    }
  }
  return null;
};

export default function SmartLayoutPanel({ design, onUpdateDesign, adType }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  const generateRealSuggestions = useCallback((currentDesign) => {
    const newSuggestions = [];
    const { frame, layers } = currentDesign;

    // --- RULE 1: CTA POSITION ---
    const ctaLayer = layers.find(l => l.id?.includes('cta-button') || l.name?.toLowerCase().includes('cta'));
    if (ctaLayer) {
      const ctaBottom = ctaLayer.y + (ctaLayer.height || 50);
      if (ctaBottom < frame.height * 0.65) {
        newSuggestions.push({
          id: 'cta-position',
          title: 'Move CTA to Action Zone',
          description: `Buttons in the bottom third of an ad see a 23% higher click-through rate.`,
          priority: 'high',
          icon: ArrowDown,
          action: { elementId: ctaLayer.id, updates: { y: frame.height * 0.8 - (ctaLayer.height || 50) } }
        });
      }
    }

    // --- RULE 2: HEADLINE POSITION ---
    const headlineLayer = layers.find(l => l.id?.includes('headline') && l.type === 'text');
    if (headlineLayer) {
      if (headlineLayer.y > frame.height * 0.2) {
        newSuggestions.push({
          id: 'headline-position',
          title: 'Elevate Main Headline',
          description: `Positioning the headline in the top 20% of the canvas improves read time by 40%.`,
          priority: 'high',
          icon: ArrowUp,
          action: { elementId: headlineLayer.id, updates: { y: frame.height * 0.1 } }
        });
      }
    }

    // --- RULE 3: HORIZONTAL CENTERING ---
    const elementsToCenter = layers.filter(l => l.id?.includes('headline') || l.id?.includes('cta'));
    elementsToCenter.forEach(layer => {
      const targetX = (frame.width - (layer.width || 100)) / 2;
      if (Math.abs(layer.x - targetX) > 20) {
        newSuggestions.push({
          id: `center-${layer.id}`,
          title: `Center '${layer.name || 'Element'}'`,
          description: `Centering key elements creates a strong visual hierarchy and focus for the viewer.`,
          priority: 'medium',
          icon: AlignCenterHorizontal,
          action: { elementId: layer.id, updates: { x: targetX } }
        });
      }
    });
    
    // --- RULE 4: FONT SIZE & READABILITY ---
    const textLayers = layers.filter(l => l.type === 'text');
    textLayers.forEach(layer => {
        if (layer.fontSize && layer.fontSize < 18 && !layer.id?.includes('disclaimer')) {
            newSuggestions.push({
                id: `font-size-${layer.id}`,
                title: 'Increase Font Size',
                description: `Text below 18px can be difficult to read on mobile devices, hurting engagement.`,
                priority: 'medium',
                icon: Type,
                action: { elementId: layer.id, updates: { fontSize: 18 } }
            });
        }
    });

    return newSuggestions;
  }, []);

  const analyzeLayout = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const realSuggestions = generateRealSuggestions(design);
      setSuggestions(realSuggestions);
      setIsAnalyzing(false);
    }, 1200);
  }, [design, generateRealSuggestions]);

  const applySuggestion = async (suggestionToAction) => {
    setIsApplying(true);
    
    // Use a function for the state update to ensure we have the latest design
    const newDesign = _.cloneDeep(design);
    const layerToUpdate = findLayerRecursive(newDesign.layers, suggestionToAction.action.elementId);

    if (layerToUpdate) {
      Object.assign(layerToUpdate, suggestionToAction.action.updates);
      onUpdateDesign(newDesign);
      // Remove the applied suggestion from the list
      setSuggestions(prev => prev.filter(s => s.id !== suggestionToAction.id));
    } else {
      console.error("Could not find layer to apply suggestion:", suggestionToAction.action.elementId);
    }

    setIsApplying(false);
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800', text: 'High Impact' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Medium Impact' };
      case 'low':
        return { color: 'bg-blue-100 text-blue-800', text: 'Low Impact' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Suggestion' };
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Smart Layout Assistant</h2>
        <p className="text-sm text-gray-600">Get AI-powered suggestions to improve your ad's layout and conversion potential.</p>
        <Button onClick={analyzeLayout} disabled={isAnalyzing} className="w-full mt-4">
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
          ) : (
            <><Wand2 className="w-4 h-4 mr-2" />Analyze Design</>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => {
            const priorityInfo = getPriorityInfo(suggestion.priority);
            const Icon = suggestion.icon || Lightbulb;
            return (
              <Card key={suggestion.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold flex items-center">
                      <Icon className="w-5 h-5 mr-3 text-blue-600" />
                      {suggestion.title}
                    </CardTitle>
                    <Badge variant="secondary" className={priorityInfo.color}>{priorityInfo.text}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={() => applySuggestion(suggestion)}
                    disabled={isApplying}
                  >
                    {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Suggestion'}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-gray-500 pt-10">
            <CheckCircle className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2 font-semibold">No suggestions yet.</p>
            <p className="text-sm">Click "Analyze Design" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}