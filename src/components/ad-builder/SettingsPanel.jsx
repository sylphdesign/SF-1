import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const COMMON_SIZES = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1024, height: 512 },
];

export default function SettingsPanel({ frame, onUpdateFrame }) {
  const handleDimensionChange = (dimension, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      onUpdateFrame({ [dimension]: numValue });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Canvas Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <Label className="text-xs font-semibold uppercase text-gray-500">Dimensions</Label>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1">
              <Label htmlFor="canvas-width" className="text-sm">Width</Label>
              <Input
                id="canvas-width"
                type="number"
                value={frame.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="canvas-height" className="text-sm">Height</Label>
              <Input
                id="canvas-height"
                type="number"
                value={frame.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label className="text-xs font-semibold uppercase text-gray-500">Common Sizes</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {COMMON_SIZES.map(size => (
              <Button
                key={size.name}
                variant="outline"
                onClick={() => onUpdateFrame({ width: size.width, height: size.height })}
                className="h-auto flex flex-col py-2"
              >
                <span className="font-semibold">{size.name}</span>
                <span className="text-xs text-gray-500">{size.width} × {size.height}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}