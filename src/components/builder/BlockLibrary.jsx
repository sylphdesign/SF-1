import React, { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const BLOCK_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'headers', name: 'Headers' },
  { id: 'content', name: 'Content' },
  { id: 'credibility', name: 'Credibility' },
  { id: 'conversion', name: 'Conversion' }
];

export default function BlockLibrary({ blocks = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Ensure blocks is always an array
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  const filteredBlocks = safeBlocks.filter(block => 
    (block.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeTab === 'all' || block.category === activeTab)
  );

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Blocks</h2>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search blocks..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-10"
          />
        </div>
      </div>

      <div className="px-2 py-1 border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {BLOCK_CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={activeTab === cat.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(cat.id)}
              className="text-xs whitespace-nowrap h-8"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <Droppable droppableId="block-library" isDropDisabled={true}>
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className="flex-1 overflow-y-auto p-2 space-y-2"
          >
            {filteredBlocks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-center text-gray-400">
                <div>
                  <div className="text-2xl mb-2">📦</div>
                  <p className="text-sm">No blocks available</p>
                </div>
              </div>
            ) : (
              filteredBlocks.map((block, index) => {
                const globalIndex = safeBlocks.findIndex(b => b.id === block.id);
                return (
                  <Draggable key={block.id} draggableId={block.id} index={globalIndex}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`cursor-grab hover:shadow-md transition-all duration-200 bg-gray-50 border-gray-200 ${
                          snapshot.isDragging ? 'shadow-xl rotate-2 scale-105' : ''
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl flex-shrink-0">{block.icon}</span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-gray-800 truncate">
                                {block.name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {block.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                )
              })
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}