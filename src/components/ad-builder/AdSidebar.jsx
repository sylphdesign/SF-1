
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Square,
  Layers,
  Sparkles,
  Zap,
  Brush,
  Upload,
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import AdElementsPanel from './AdElementsPanel';
import LayersPanel from './LayersPanel';
import SmartLayoutPanel from './SmartLayoutPanel';
import DesignConsistencyPanel from './DesignConsistencyPanel';
import BrandKitPanel from './BrandKitPanel';
import UploadsPanel from './UploadsPanel';
import BackgroundPanel from './BackgroundPanel';
import SettingsPanel from './SettingsPanel';

const MAIN_TOOLBAR_ITEMS = [
  { id: 'elements', icon: Square, label: 'Elements' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'smartlayout', icon: Sparkles, label: 'Smart Layout' },
  { id: 'consistency', icon: Zap, label: 'Consistency' },
  { id: 'brandkit', icon: Brush, label: 'Brand Kit' },
  { id: 'uploads', icon: Upload, label: 'Uploads' },
  { id: 'background', icon: Palette, label: 'Background' }
];

export default function AdSidebar({ 
    onAddElement, 
    layers, 
    selectedLayerIds, 
    onLayerSelect, 
    onToggleVisibility, 
    onToggleLock, 
    onReorder,
    design,
    adType,
    onUpdateDesign,
    onApplyBrandKit,
    currentBrandKit,
    onBrandKitChange,
    frame,
    onUpdateFrame
}) {
  const [activeTab, setActiveTab] = useState('elements');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderPanelContent = () => {
    if (isCollapsed) return null;

    switch (activeTab) {
      case 'elements':
        return <AdElementsPanel onAddElement={onAddElement} />;
      case 'layers':
        return <LayersPanel
                  layers={layers}
                  selectedLayerIds={selectedLayerIds}
                  onLayerSelect={onLayerSelect}
                  onToggleVisibility={onToggleVisibility}
                  onToggleLock={onToggleLock}
                  onReorder={onReorder}
                />;
      case 'smartlayout':
        return <SmartLayoutPanel design={design} adType={adType} onUpdateDesign={onUpdateDesign} />;
      case 'consistency':
        return <DesignConsistencyPanel design={design} onUpdateDesign={onUpdateDesign} />;
      case 'brandkit':
        return <BrandKitPanel onApplyBrandKit={onApplyBrandKit} currentBrandKit={currentBrandKit} onBrandKitChange={onBrandKitChange} />;
      case 'uploads':
        return <UploadsPanel onAddElement={onAddElement} />;
      case 'background':
        return <BackgroundPanel frame={frame} onUpdateFrame={onUpdateFrame} />;
      case 'settings':
        return <SettingsPanel frame={frame} onUpdateFrame={onUpdateFrame} />;
      default:
        return <AdElementsPanel onAddElement={onAddElement} />;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isCollapsed) {
        setIsCollapsed(false);
    }
  };

  return (
    <div className="flex bg-white shadow-md z-10">
      {/* Vertical Toolbar */}
      <div className="flex flex-col justify-between border-r border-gray-200 py-4 px-2">
        {/* Main Tools */}
        <div className="flex flex-col">
          {MAIN_TOOLBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg mb-2 transition-all ${
                  activeTab === item.id && !isCollapsed
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => handleTabChange(item.id)}
                title={item.label}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Settings Button - Floating at bottom */}
        <div className="flex flex-col border-t border-gray-200 pt-4">
          <Button
            variant="ghost"
            className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg transition-all ${
              activeTab === 'settings' && !isCollapsed
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={() => handleTabChange('settings')}
            title="Settings"
          >
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </Button>
        </div>
      </div>

      {/* Collapsible Panel */}
      <div 
        className={`bg-white transition-all duration-300 ease-in-out border-r border-gray-200 overflow-y-auto ${
          isCollapsed ? 'w-0' : 'w-80'
        }`}
      >
        {renderPanelContent()}
      </div>
      
      {/* Collapse/Expand Handle */}
      <div className="bg-gray-50 flex items-center justify-center border-r border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-full w-6 rounded-none focus-visible:ring-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
