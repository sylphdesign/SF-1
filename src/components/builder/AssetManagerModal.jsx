import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Upload, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import _ from 'lodash';

export default function AssetManagerModal({ isOpen, onClose, onSelectImage }) {
  const [orgAssets, setOrgAssets] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [stockQuery, setStockQuery] = useState('business');
  const [stockImages, setStockImages] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentOrgId, setCurrentOrgId] = useState(null);

  const fileInputRef = React.useRef(null);

  const fetchOrgAssets = useCallback(async () => {
    try {
      const user = await User.me();
      if (!user.current_organization_id) return;
      
      setCurrentOrgId(user.current_organization_id);
      
      // Get organization and its assets
      const orgs = await Organization.list();
      const currentOrg = orgs.find(o => o.id === user.current_organization_id);
      
      if (currentOrg && currentOrg.settings && currentOrg.settings.advanced && currentOrg.settings.advanced.imageAssets) {
        setOrgAssets(currentOrg.settings.advanced.imageAssets);
      } else {
        setOrgAssets([]);
      }
    } catch (error) {
      console.error("Could not fetch organization assets:", error);
    }
  }, []);

  const searchStockPhotos = useCallback(async (query) => {
    if (!query) return;
    setIsSearching(true);
    // This is a workaround since we cannot use a real API key on the frontend.
    // In a real app, this would be a backend call.
    // We generate predictable but varied URLs from Unsplash.
    const images = Array.from({ length: 15 }).map((_, i) => ({
      id: `${query}-${i}`,
      src: {
        medium: `https://source.unsplash.com/400x300/?${query}&sig=${Math.random()}`,
        large: `https://source.unsplash.com/1600x900/?${query}&sig=${Math.random()}`
      },
      photographer: 'Unsplash'
    }));
    setStockImages(images);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchOrgAssets();
      searchStockPhotos(stockQuery);
    }
  }, [isOpen, fetchOrgAssets, searchStockPhotos, stockQuery]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentOrgId) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      // Update organization's imageAssets
      const orgs = await Organization.list();
      const currentOrg = orgs.find(o => o.id === currentOrgId);
      
      if (currentOrg) {
        const updatedSettings = {
          ...currentOrg.settings,
          advanced: {
            ...currentOrg.settings.advanced,
            imageAssets: _.uniq([...(currentOrg.settings.advanced?.imageAssets || []), file_url])
          }
        };
        
        await Organization.update(currentOrgId, { settings: updatedSettings });
        setOrgAssets(updatedSettings.advanced.imageAssets);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("There was an error uploading your file.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderAssetGrid = (assets, onSelect, isLoading, loadingText) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2">{loadingText}</span>
        </div>
      );
    }
    if (assets.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-center text-gray-500">
           <div>
            <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
            <p>No images found.</p>
            <p className="text-xs text-gray-400 mt-1">Assets are scoped to your organization.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {assets.map((asset, index) => (
          <button key={index} className="aspect-square relative group" onClick={() => onSelect(asset)}>
            <img src={asset.src?.medium || asset} alt="" className="w-full h-full object-cover rounded-lg bg-gray-100" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <span className="text-white text-xs font-bold">Select</span>
            </div>
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Asset Manager</DialogTitle>
          <DialogDescription>Upload your own assets or select a stock photo. Assets are scoped to your organization.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="my-assets" className="flex-grow flex flex-col">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="my-assets">Organization Assets</TabsTrigger>
            <TabsTrigger value="stock-photos">Stock Photos</TabsTrigger>
          </TabsList>
          <TabsContent value="my-assets" className="flex-grow overflow-y-auto p-4">
             <div className="flex justify-end mb-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Button onClick={handleUploadClick} disabled={isUploading || !currentOrgId}>
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload
              </Button>
            </div>
            {renderAssetGrid(orgAssets, (url) => onSelectImage(url), false)}
          </TabsContent>
          <TabsContent value="stock-photos" className="flex-grow overflow-y-auto p-4">
             <form onSubmit={(e) => { e.preventDefault(); searchStockPhotos(stockQuery); }} className="flex gap-2 mb-4">
               <Input 
                 placeholder="Search for photos..."
                 value={stockQuery}
                 onChange={(e) => setStockQuery(e.target.value)}
               />
               <Button type="submit" disabled={isSearching}>
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
               </Button>
             </form>
             {renderAssetGrid(stockImages, (asset) => onSelectImage(asset.src.large), isSearching, "Searching...")}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}