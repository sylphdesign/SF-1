import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Upload, Search, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function UploadsPanel({ onAddElement }) {
  const [organizationAssets, setOrganizationAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadOrganizationAssets();
  }, []);

  const loadOrganizationAssets = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (!user.current_organization_id) {
        setOrganizationAssets([]);
        return;
      }
      
      setCurrentOrgId(user.current_organization_id);
      
      const orgs = await Organization.list();
      const currentOrg = orgs.find(o => o.id === user.current_organization_id);
      
      if (currentOrg?.settings?.advanced?.imageAssets) {
        setOrganizationAssets(currentOrg.settings.advanced.imageAssets);
      } else {
        setOrganizationAssets([]);
      }
    } catch (error) {
      console.error("Failed to load organization assets:", error);
      setOrganizationAssets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentOrgId) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      // Add to organization's assets
      const orgs = await Organization.list();
      const currentOrg = orgs.find(o => o.id === currentOrgId);
      
      if (currentOrg) {
        const updatedAssets = [...(currentOrg.settings?.advanced?.imageAssets || []), file_url];
        const updatedSettings = {
          ...currentOrg.settings,
          advanced: {
            ...currentOrg.settings?.advanced,
            imageAssets: updatedAssets
          }
        };
        
        await Organization.update(currentOrgId, { settings: updatedSettings });
        setOrganizationAssets(updatedAssets);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageClick = (imageUrl) => {
    if (onAddElement) {
      onAddElement({
        type: 'image',
        content: { src: imageUrl },
        styles: {
          width: 200,
          height: 200,
          objectFit: 'cover'
        }
      });
    }
  };

  const filteredAssets = organizationAssets.filter(asset =>
    asset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Organization Assets</h3>
        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept="image/*"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !currentOrgId}
            className="w-full"
            variant="outline"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
            <p className="text-sm">No assets found</p>
            <p className="text-xs text-gray-400">
              {organizationAssets.length === 0 ? "Upload images or refresh from your website in Settings" : "Try a different search term"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredAssets.map((asset, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => handleImageClick(asset)}
              >
                <CardContent className="p-2">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                    <img
                      src={asset}
                      alt={`Asset ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to Use
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}