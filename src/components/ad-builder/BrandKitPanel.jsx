import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Palette, Type, Upload, Save, Wand2, Loader2 } from "lucide-react";
import _ from 'lodash';

const FONT_OPTIONS = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: "'Times New Roman', serif", label: 'Times New Roman' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: 'Courier New, monospace', label: 'Courier New' },
];

const DEFAULT_SETTINGS = { 
  branding: { logoUrl: '' }, 
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#6366f1',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headingFont: "'Georgia', serif",
    bodyFont: "'Helvetica', sans-serif"
  } 
};

export default function BrandKitPanel({ onApplyBrandKit }) {
  const [organization, setOrganization] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const loadOrganization = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (user.current_organization_id) {
        const orgs = await Organization.list();
        const currentOrg = orgs.find(o => o.id === user.current_organization_id);
        if (currentOrg) {
          setOrganization(currentOrg);
          setSettings(_.defaultsDeep(currentOrg.settings, DEFAULT_SETTINGS));
        }
      }
    } catch (error) {
      console.error("Could not load organization settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => _.set(_.cloneDeep(prev), `${category}.${key}`, value));
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleSettingChange('branding', 'logoUrl', file_url);
    } catch (error) {
      console.error("Logo upload failed:", error);
      alert("There was an error uploading your logo.");
    } finally {
      setIsUploading(false);
    }
  };

  const saveBrandKit = async () => {
    if (!organization) return;
    setIsSaving(true);
    try {
      await Organization.update(organization.id, { settings });
      alert('Brand kit saved successfully!');
    } catch (error) {
      console.error("Error saving brand kit:", error);
      alert('Error saving brand kit.');
    } finally {
      setIsSaving(false);
    }
  };

  const applyBrandKitToCanvas = () => {
    if (settings.theme && settings.branding) {
        onApplyBrandKit({
            ...settings.theme,
            logoUrl: settings.branding.logoUrl,
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Organization Brand Kit</h2>
        <p className="text-sm text-gray-600">Define your brand for consistent designs across all ads and pages.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Brand Logo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Brand Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="mt-2 flex items-center gap-3">
                {settings.branding?.logoUrl && (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                    <img src={settings.branding.logoUrl} alt="Brand logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {settings.branding?.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </>
                  )}
                </Button>
              </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Brand Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {Object.entries({
              primaryColor: 'Primary',
              secondaryColor: 'Secondary',
              accentColor: 'Accent',
              textColor: 'Text',
            }).map(([key, label]) => (
              <div key={key}>
                <Label className="text-xs font-medium text-gray-700">{label}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={settings.theme?.[key] || ''}
                    onChange={(e) => handleSettingChange('theme', key, e.target.value)}
                    className="w-10 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={settings.theme?.[key] || ''}
                    onChange={(e) => handleSettingChange('theme', key, e.target.value)}
                    className="flex-1 h-8 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Brand Typography */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Heading Font</Label>
              <Select
                value={settings.theme?.headingFont}
                onValueChange={(value) => handleSettingChange('theme', 'headingFont', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Body Font</Label>
              <Select
                value={settings.theme?.bodyFont}
                onValueChange={(value) => handleSettingChange('theme', 'bodyFont', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
      </div>

       <div className="p-4 border-t border-gray-200 space-y-3">
          <Button
            onClick={applyBrandKitToCanvas}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Apply Brand to Canvas
          </Button>

          <Button
            onClick={saveBrandKit}
            variant="outline"
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Brand Kit
              </>
            )}
          </Button>
        </div>
    </div>
  );
}