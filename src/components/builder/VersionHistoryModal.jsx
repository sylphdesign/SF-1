import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  History, 
  Save, 
  RotateCcw, 
  Eye, 
  GitBranch, 
  Clock,
  User,
  Zap,
  Plus,
  MoreVertical,
  X
} from "lucide-react";
import { PageVersion } from "@/api/entities";
import { format } from "date-fns";

export default function VersionHistoryModal({ 
  isOpen,
  onClose,
  pageId, 
  currentBlocks, 
  onRestoreVersion,
  onCreateVersion 
}) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const [newVersionTitle, setNewVersionTitle] = useState("");
  const [newVersionDescription, setNewVersionDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pageId && isOpen) {
      loadVersions();
    }
  }, [pageId, isOpen]);

  const loadVersions = async () => {
    if (!pageId) return;
    
    setIsLoading(true);
    try {
      const pageVersions = await PageVersion.filter(
        { page_id: pageId }, 
        '-version_number', 
        50
      );
      setVersions(pageVersions);
    } catch (error) {
      console.error("Error loading versions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!pageId || !newVersionTitle.trim()) return;

    setIsSaving(true);
    try {
      const nextVersionNumber = Math.max(...versions.map(v => v.version_number), 0) + 1;
      
      const versionData = {
        page_id: pageId,
        version_number: nextVersionNumber,
        title: newVersionTitle.trim(),
        description: newVersionDescription.trim(),
        content: { blocks: currentBlocks },
        metadata: {
          block_count: currentBlocks.length,
          block_types: [...new Set(currentBlocks.map(b => b.type))],
          timestamp: new Date().toISOString()
        },
        is_auto_saved: false,
        created_by_action: "manual_save"
      };

      await PageVersion.create(versionData);
      
      if (onCreateVersion) {
        onCreateVersion(versionData);
      }
      
      setNewVersionTitle("");
      setNewVersionDescription("");
      setActiveTab("history"); // Switch to history tab after saving
      
      // Reload versions
      loadVersions();
      
    } catch (error) {
      console.error("Error saving version:", error);
      alert("Failed to save version. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (version) => {
    if (window.confirm(`Are you sure you want to restore to "${version.title}"? This will replace your current work.`)) {
      onRestoreVersion(version.content.blocks);
      onClose();
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'ai_generation': return <Zap className="w-4 h-4 text-purple-600" />;
      case 'template_import': return <GitBranch className="w-4 h-4 text-blue-600" />;
      case 'manual_save': return <Save className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'ai_generation': return 'bg-purple-100 text-purple-800';
      case 'template_import': return 'bg-blue-100 text-blue-800';
      case 'manual_save': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Version Control
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mb-4">
            <TabsTrigger value="history">Version History</TabsTrigger>
            <TabsTrigger value="save">Save Version</TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="flex-1 px-6 pb-6 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No versions saved yet</p>
                <p className="text-sm mt-2">Save your first version to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <Card key={version.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center">
                            {getActionIcon(version.created_by_action)}
                            <span className="ml-2">v{version.version_number}: {version.title}</span>
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="secondary" 
                              className={getActionColor(version.created_by_action)}
                            >
                              {version.created_by_action.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(version.created_date), 'MMM d, yyyy at h:mm a')}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRestoreVersion(version)}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Restore This Version
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {version.description && (
                        <p className="text-sm text-gray-600 mb-3">{version.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>{version.metadata?.block_count || 0} blocks</span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {version.created_by}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestoreVersion(version)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="save" className="flex-1 px-6 pb-6">
            <div className="space-y-6">
              <div className="text-center py-4">
                <Save className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Save Current Version</h3>
                <p className="text-gray-600">Create a snapshot of your current page state</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Version Title *</Label>
                  <Input
                    value={newVersionTitle}
                    onChange={(e) => setNewVersionTitle(e.target.value)}
                    placeholder="e.g., Hero section improvements"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newVersionDescription}
                    onChange={(e) => setNewVersionDescription(e.target.value)}
                    placeholder="Describe what changed in this version..."
                    className="mt-1"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2">Current State</h4>
                  <div className="text-sm text-gray-600">
                    <p>{currentBlocks?.length || 0} blocks</p>
                    <p>Last modified: {new Date().toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setActiveTab("history")}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveVersion}
                    disabled={!newVersionTitle.trim() || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Version
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}