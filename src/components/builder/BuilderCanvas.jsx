
import React, { forwardRef } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Trash2, Move } from "lucide-react";
import BlockRenderer from "./BlockRenderer";

const BuilderCanvas = forwardRef(({ blocks, activeSelection, onBlockSelect, onElementSelect, onBlockDelete, deviceMode, theme }, ref) => {
  const getDeviceClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-sm mx-auto shadow-2xl';
      case 'tablet':
        return 'max-w-2xl mx-auto shadow-2xl';
      default:
        return 'w-full';
    }
  };
  
  return (
    <div className="flex-1 bg-gray-100 p-4 overflow-y-auto max-h-full" ref={ref}>
      <style>
        {theme ? `
          .canvas-theme-wrapper {
            --primary-color: ${theme.primaryColor};
            --secondary-color: ${theme.secondaryColor};
            --background-color: ${theme.backgroundColor};
            --text-color: ${theme.textColor};
            --heading-font: ${theme.headingFont};
            --body-font: ${theme.bodyFont};
          }
        ` : ''}
      </style>
      <div className={`transition-all duration-300 ${getDeviceClass()} canvas-theme-wrapper`}>
        <Droppable droppableId="canvas">
          {(provided, snapshot) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className={`min-h-full bg-white transition-all duration-300 ${
                deviceMode === 'desktop' ? '' : 'rounded-lg overflow-hidden'
              } ${
                snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
              }`}
              onClick={() => onBlockSelect(null)} // Deselect when clicking canvas background
            >
              {blocks.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-center text-gray-400 border-2 border-gray-200 border-dashed rounded-lg m-4">
                  <div>
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="text-xl font-semibold mb-2">Start Building Your Page</h3>
                    <p className="text-gray-500">Drag blocks from the library to get started</p>
                  </div>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`group relative transition-all duration-200 ${
                          activeSelection?.blockId === block.id && !activeSelection?.elementKey
                            ? 'ring-2 ring-blue-500 ring-offset-2' 
                            : 'hover:ring-1 hover:ring-blue-300'
                        } ${
                          snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105' : ''
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onBlockSelect(block.id);
                        }}
                      >
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <Button
                            {...provided.dragHandleProps}
                            size="sm"
                            variant="secondary"
                            className="p-2 h-8 w-8 bg-gray-800 hover:bg-gray-700 text-white"
                          >
                            <Move className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="p-2 h-8 w-8 bg-red-600 hover:bg-red-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBlockDelete(block.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <BlockRenderer 
                          block={block} 
                          deviceMode={deviceMode}
                          onElementSelect={onElementSelect}
                          activeSelection={activeSelection}
                        />
                        
                        {activeSelection?.blockId === block.id && !activeSelection.elementKey && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                              {block.type.replace(/_/g, ' ').toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
});

BuilderCanvas.displayName = 'BuilderCanvas';
export default BuilderCanvas;
