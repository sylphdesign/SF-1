
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Unlock, Type, Image, Square, Circle, Group, GripVertical } from 'lucide-react';

const layerIcons = {
  text: Type,
  image: Image,
  rect: Square,
  circle: Circle,
  group: Group,
};

const LayerItem = ({ layer, isSelected, onLayerSelect, onToggleVisibility, onToggleLock }) => {
  const Icon = layerIcons[layer.type] || Square;
  
  return (
    <div
      onClick={(e) => {
          e.stopPropagation();
          onLayerSelect([layer.id], e.shiftKey);
      }}
      className={`flex items-center p-2 rounded-md transition-colors cursor-pointer ${
        isSelected ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
      } ${layer.isLocked ? 'opacity-70' : ''}`}
    >
      <GripVertical className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
      <Icon className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
      <span className="text-sm text-gray-800 flex-1 truncate">{layer.name || `Untitled ${layer.type}`}</span>
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock(layer.id);
        }}
      >
        {layer.isLocked ? <Lock className="w-4 h-4 text-gray-500" /> : <Unlock className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(layer.id);
        }}
      >
        {layer.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
      </Button>
    </div>
  );
};

export default function LayersPanel({ layers, selectedLayerIds, onLayerSelect, onToggleVisibility, onToggleLock, onReorder }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Layers</h2>
        <p className="text-sm text-gray-500">Drag to reorder layers on the canvas.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <DragDropContext onDragEnd={onReorder}>
          <Droppable droppableId="layers-panel">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                {[...layers].reverse().map((layer, index) => { // Reverse to show top layer first
                    const originalIndex = layers.length - 1 - index;
                    return (
                        <Draggable key={layer.id} draggableId={layer.id} index={originalIndex}>
                            {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <LayerItem
                                layer={layer}
                                isSelected={selectedLayerIds.includes(layer.id)}
                                onLayerSelect={onLayerSelect}
                                onToggleVisibility={onToggleVisibility}
                                onToggleLock={onToggleLock}
                                />
                            </div>
                            )}
                        </Draggable>
                    )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
