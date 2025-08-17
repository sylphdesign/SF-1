import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Square,
  Brush,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus
} from "lucide-react";

import BlockLibrary from "./BlockLibrary";
import BrandKitPanel from '../ad-builder/BrandKitPanel';

const MAIN_TOOLBAR_ITEMS = [
  { id: 'blocks', icon: Square, label: 'Blocks' },
  { id: 'pages', icon: FileText, label: 'Pages' },
  { id: 'brandkit', icon: Brush, label: 'Brand Kit' },
  { id: 'uploads', icon: Upload, label: 'Uploads' }
];

const PagesPanel = ({ funnelPages, currentPageIndex, onPageSwitch, onAddPage }) => (
  <div className="p-4 h-full bg-white">
    <h3 className="text-sm font-semibold mb-4">Pages</h3>
    
    {funnelPages && funnelPages.length > 0 ? (
      <div className="space-y-4">
        <Select 
          value={currentPageIndex?.toString()} 
          onValueChange={(value) => onPageSwitch(parseInt(value, 10))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {funnelPages.map((page, index) => (
              <SelectItem key={index} value={index.toString()}>
                Page {index + 1}: {page.title || `Untitled Page ${index + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button onClick={onAddPage} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add New Page
        </Button>
        
        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Current:</strong> Page {(currentPageIndex || 0) + 1}</p>
          <p><strong>Total:</strong> {funnelPages.length} pages</p>
        </div>
      </div>
    ) : (
      <div className="text-center text-gray-500">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
        <p className="text-sm">Single page mode</p>
        <p className="text-xs mt-2">Multi-page funnels will show page controls here.</p>
      </div>
    )}
  </div>
);

const UploadsPanel = ({ onOpenAssetManager }) => (
    <div className="p-4 h-full bg-white text-center">
        <h3 className="text-sm font-semibold mb-4">Uploads</h3>
        <p className="text-xs text-gray-500 mb-4">Manage your uploaded images and assets.</p>
        <Button onClick={onOpenAssetManager}>Open Asset Manager</Button>
    </div>
);

const SettingsPanel = () => (
    <div className="p-4 h-full bg-white">
        <h3 className="text-sm font-semibold mb-2">Page Settings</h3>
        <p className="text-xs text-gray-500">SEO, custom code, and other page settings will be available here.</p>
    </div>
);

export default function BuilderSidebar({ 
  onApplyBrandKit, 
  onOpenAssetManager, 
  universalBlocks = [],
  // Multi-page props
  funnelPages,
  currentPageIndex,
  onPageSwitch,
  onAddPage
}) {
  const [activeTab, setActiveTab] = useState('blocks');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderPanelContent = () => {
    if (isCollapsed) return null;

    switch(activeTab) {
      case 'blocks':
        return <BlockLibrary blocks={universalBlocks} />;
      case 'pages':
        return <PagesPanel 
          funnelPages={funnelPages}
          currentPageIndex={currentPageIndex}
          onPageSwitch={onPageSwitch}
          onAddPage={onAddPage}
        />;
      case 'brandkit':
        return <BrandKitPanel onApplyBrandKit={onApplyBrandKit} />;
      case 'uploads':
        return <UploadsPanel onOpenAssetManager={onOpenAssetManager} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <BlockLibrary blocks={universalBlocks} />;
    }
  }

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