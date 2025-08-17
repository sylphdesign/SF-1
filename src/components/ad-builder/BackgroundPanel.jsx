import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PRESET_COLORS = [
  '#ffffff', '#f1f5f9', '#e2e8f0', '#94a3b8',
  '#1e293b', '#0f172a', '#000000', '#ef4444',
  '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#0ea5e9', '#3b82f6', '#8b5cf6',
];

export default function BackgroundPanel({ frame, onUpdateFrame }) {
  const handleColorChange = (color) => {
    onUpdateFrame({ backgroundColor: color });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Background</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <Label className="text-xs font-semibold uppercase text-gray-500">Solid Color</Label>
          <div className="grid grid-cols-8 gap-2 mt-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 transition-all ${frame.backgroundColor === color ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="custom-bg-color" className="text-xs font-semibold uppercase text-gray-500">Custom Color</Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="custom-bg-color"
              type="color"
              value={frame.backgroundColor || '#ffffff'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              value={frame.backgroundColor || '#ffffff'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 h-10 text-sm font-mono"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>
    </div>
  );
}