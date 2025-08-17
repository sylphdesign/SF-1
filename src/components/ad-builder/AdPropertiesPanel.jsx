
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Move, Palette, Type, Image as ImageIcon, Copy, Lock, Unlock, Eye, EyeOff, Group, Ungroup, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const PropertySection = ({ title, icon: Icon, children }) => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-semibold flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

const PropertyInput = ({ label, value, onChange, ...props }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium text-gray-700">{label}</Label>
    <Input value={value || ''} onChange={onChange} className="h-8" {...props} />
  </div>
);

const ColorInput = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium text-gray-700">{label}</Label>
    <div className="flex gap-2">
      <div className="relative">
        <Input 
          type="color" 
          value={value || '#000000'} 
          onChange={onChange} 
          className="w-10 h-8 p-1 cursor-pointer"
        />
      </div>
      <Input 
        value={value || '#000000'} 
        onChange={onChange} 
        className="flex-1 h-8 text-xs font-mono" 
        placeholder="#000000"
      />
    </div>
  </div>
);

const GroupLayerList = ({ group, onUpdateGroupOrder }) => {

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(group.layers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onUpdateGroupOrder(group.id, items);
  };

  return (
    <PropertySection title="Group Layers" icon={Group}>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="group-layers">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
              {group.layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center bg-gray-50 p-2 rounded-md border"
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-800 flex-1 truncate">{layer.name || layer.type}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </PropertySection>
  );
};


export default function AdPropertiesPanel({ selectedLayers, onUpdate, onGroup, onUngroup, onDelete, onDeselect, onCopy, onUpdateGroupOrder }) {
  if (!selectedLayers || selectedLayers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Move className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No selection</h3>
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  if (selectedLayers.length > 1) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <Group className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{selectedLayers.length} items selected</h3>
            <p className="text-sm mb-4">Edit properties for multiple items or group them to edit together.</p>
            <Button onClick={onGroup}>
                <Group className="w-4 h-4 mr-2" />
                Group Items
            </Button>
        </div>
    )
  }

  const selectedLayer = selectedLayers[0];

  const updateProperty = (property, value) => {
    onUpdate(selectedLayer.id, { [property]: value });
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    updateProperty(name, type === 'number' ? parseFloat(value) || 0 : value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold capitalize">{selectedLayer.type}</h3>
          <div className="flex items-center space-x-1">
            <Button 
                variant="ghost" 
                size="sm" 
                className="w-8 h-8 p-0" 
                onClick={() => updateProperty('isLocked', !selectedLayer.isLocked)}>
              {selectedLayer.isLocked ? <Lock className="w-4 h-4 text-gray-600" /> : <Unlock className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={onCopy}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => updateProperty('isVisible', selectedLayer.isVisible === false ? true : false)}>
              {selectedLayer.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDelete}
              className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Input 
            value={selectedLayer.name}
            onChange={(e) => updateProperty('name', e.target.value)}
            placeholder={selectedLayer.type === 'group' ? "Group Name" : "Element Name"}
            className="text-xs"
          />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Position & Size */}
        <PropertySection title="Position & Size" icon={Move}>
          <div className="grid grid-cols-2 gap-3">
            <PropertyInput 
              label="X" 
              type="number" 
              value={Math.round(selectedLayer.x || 0)} 
              name="x" 
              onChange={handleChange} 
            />
            <PropertyInput 
              label="Y" 
              type="number" 
              value={Math.round(selectedLayer.y || 0)} 
              name="y" 
              onChange={handleChange} 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PropertyInput 
              label="Width" 
              type="number" 
              value={selectedLayer.width || 0} 
              name="width" 
              onChange={handleChange} 
            />
            {selectedLayer.type !== 'text' && selectedLayer.type !== 'circle' && (
              <PropertyInput 
                label="Height" 
                type="number" 
                value={selectedLayer.height || 0} 
                name="height" 
                onChange={handleChange} 
              />
            )}
            {selectedLayer.type === 'circle' && (
              <PropertyInput 
                label="Radius" 
                type="number" 
                value={selectedLayer.radius || 0} 
                name="radius" 
                onChange={handleChange} 
              />
            )}
          </div>
        </PropertySection>

        {/* Group Layers List */}
        {selectedLayer.type === 'group' && (
            <>
                <GroupLayerList group={selectedLayer} onUpdateGroupOrder={onUpdateGroupOrder} />
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={onUngroup}>
                    <Ungroup className="w-4 h-4 mr-2" />
                    Ungroup
                </Button>
            </>
        )}

        {/* Text Properties */}
        {selectedLayer.type === 'text' && (
          <PropertySection title="Text" icon={Type}>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700">Content</Label>
                <Textarea 
                  value={selectedLayer.text || ''} 
                  name="text" 
                  onChange={handleChange} 
                  placeholder="Enter text..." 
                  className="min-h-[60px] resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <PropertyInput 
                  label="Font Size" 
                  value={selectedLayer.fontSize || 16} 
                  name="fontSize" 
                  type="number" 
                  onChange={handleChange} 
                />
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">Font Weight</Label>
                  <Select value={selectedLayer.fontWeight || 'normal'} onValueChange={value => updateProperty('fontWeight', value)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Regular</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <PropertyInput 
                label="Font Family" 
                value={selectedLayer.fontFamily || 'Arial'} 
                name="fontFamily" 
                onChange={handleChange} 
                placeholder="Arial, sans-serif"
              />
              
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-700">Text Align</Label>
                <Select value={selectedLayer.textAlign || 'left'} onValueChange={value => updateProperty('textAlign', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ColorInput 
                label="Text Color" 
                value={selectedLayer.fill} 
                onChange={e => updateProperty('fill', e.target.value)} 
              />
            </div>
          </PropertySection>
        )}

        {/* Image Properties */}
        {selectedLayer.type === 'image' && (
          <PropertySection title="Image" icon={ImageIcon}>
            <PropertyInput 
              label="Image URL" 
              value={selectedLayer.src || ''} 
              name="src" 
              onChange={handleChange} 
              placeholder="https://example.com/image.jpg"
            />
            <PropertyInput 
              label="Border Radius" 
              value={selectedLayer.borderRadius || 0} 
              name="borderRadius" 
              type="number" 
              onChange={handleChange} 
            />
          </PropertySection>
        )}
        
        {/* Shape Properties */}
        {(selectedLayer.type === 'rect' || selectedLayer.type === 'circle') && (
          <PropertySection title="Fill & Stroke" icon={Palette}>
            <ColorInput 
              label="Fill Color" 
              value={selectedLayer.fill} 
              onChange={e => updateProperty('fill', e.target.value)} 
            />
            {selectedLayer.type === 'rect' && (
              <PropertyInput 
                label="Border Radius" 
                value={selectedLayer.borderRadius || 0} 
                name="borderRadius" 
                type="number" 
                onChange={handleChange} 
              />
            )}
            <PropertyInput 
              label="Box Shadow" 
              value={selectedLayer.boxShadow || ''} 
              name="boxShadow" 
              onChange={handleChange} 
              placeholder="0 4px 8px rgba(0,0,0,0.1)"
            />
          </PropertySection>
        )}
        
        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDeselect}
            className="w-full"
          >
            Done Editing
          </Button>
        </div>
      </div>
    </div>
  );
}
