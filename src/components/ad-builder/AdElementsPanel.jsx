import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Type, Image, Square, Circle, Plus, Search, Star, Heart, Zap } from "lucide-react";

const ELEMENT_TYPES = [
  {
    type: 'text',
    name: 'Heading',
    icon: Type,
    template: {
      type: 'text',
      text: 'Add a heading',
      fontSize: 48,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fill: '#000000',
      width: 300,
      height: 60,
      textAlign: 'center'
    }
  },
  {
    type: 'text',
    name: 'Subheading',
    icon: Type,
    template: {
      type: 'text',
      text: 'Add a subheading',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fill: '#666666',
      width: 250,
      height: 30,
      textAlign: 'center'
    }
  },
  {
    type: 'text',
    name: 'Body text',
    icon: Type,
    template: {
      type: 'text',
      text: 'Add a little bit of body text',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fill: '#333333',
      width: 200,
      height: 20,
      textAlign: 'left'
    }
  }
];

const SHAPE_TYPES = [
  {
    type: 'rect',
    name: 'Rectangle',
    icon: Square,
    template: {
      type: 'rect',
      width: 200,
      height: 100,
      fill: '#3b82f6',
      borderRadius: 8
    }
  },
  {
    type: 'circle',
    name: 'Circle',
    icon: Circle,
    template: {
      type: 'circle',
      radius: 50,
      fill: '#ef4444'
    }
  },
  {
    type: 'rect',
    name: 'Button',
    icon: Square,
    template: {
      type: 'rect',
      width: 150,
      height: 45,
      fill: '#3b82f6',
      borderRadius: 6
    }
  }
];

const QUICK_ACTIONS = [
  {
    name: 'Logo Placeholder',
    template: {
      type: 'image',
      src: 'https://via.placeholder.com/120x120/e5e7eb/6b7280?text=LOGO',
      width: 120,
      height: 120
    }
  },
  {
    name: 'Product Image',
    template: {
      type: 'image',
      src: 'https://via.placeholder.com/300x300/f3f4f6/6b7280?text=Product',
      width: 300,
      height: 300
    }
  }
];

export default function AdElementsPanel({ onAddElement }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Elements</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search elements..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Text Elements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Text
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ELEMENT_TYPES.map((element, index) => {
              const IconComponent = element.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-10 hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => onAddElement(element.template)}
                >
                  <IconComponent className="w-4 h-4 mr-3 text-blue-600" />
                  {element.name}
                </Button>
              );
            })}
            
            {/* Add Text Button */}
            <Button
              variant="outline"
              className="w-full h-12 border-dashed border-2 hover:border-blue-300 hover:bg-blue-50"
              onClick={() => onAddElement({
                type: 'text',
                text: 'Click to edit',
                fontSize: 32,
                fontFamily: 'Arial',
                fill: '#000000',
                width: 200,
                height: 40,
                textAlign: 'center'
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add text
            </Button>
          </CardContent>
        </Card>

        {/* Shapes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <Square className="w-4 h-4 mr-2" />
              Shapes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {SHAPE_TYPES.map((shape, index) => {
                const IconComponent = shape.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-16 flex flex-col items-center justify-center hover:bg-purple-50"
                    onClick={() => onAddElement(shape.template)}
                  >
                    <IconComponent className="w-6 h-6 text-purple-600 mb-1" />
                    <span className="text-xs">{shape.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <Image className="w-4 h-4 mr-2" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_ACTIONS.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-10 hover:bg-green-50 hover:text-green-700"
                onClick={() => onAddElement(action.template)}
              >
                <Image className="w-4 h-4 mr-3 text-green-600" />
                {action.name}
              </Button>
            ))}
            
            <Button
              variant="outline"
              className="w-full h-12 border-dashed border-2 hover:border-green-300 hover:bg-green-50"
              onClick={() => onAddElement({
                type: 'image',
                src: 'https://via.placeholder.com/200x200/e5e7eb/6b7280?text=Image',
                width: 200,
                height: 200
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload image
            </Button>
          </CardContent>
        </Card>

        {/* Quick Add Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-10 hover:bg-yellow-50 hover:text-yellow-700"
              onClick={() => onAddElement({
                type: 'text',
                text: 'LIMITED TIME OFFER!',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#dc2626',
                width: 300,
                height: 30,
                textAlign: 'center'
              })}
            >
              🔥 Urgency Banner
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 hover:bg-yellow-50 hover:text-yellow-700"
              onClick={() => onAddElement({
                type: 'text',
                text: '⭐⭐⭐⭐⭐ 5 Stars',
                fontSize: 20,
                fontFamily: 'Arial',
                fill: '#f59e0b',
                width: 200,
                height: 25,
                textAlign: 'center'
              })}
            >
              ⭐ Star Rating
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 hover:bg-yellow-50 hover:text-yellow-700"
              onClick={() => onAddElement({
                type: 'rect',
                width: 120,
                height: 40,
                fill: '#f59e0b',
                borderRadius: 20
              })}
            >
              🏷️ Price Badge
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}