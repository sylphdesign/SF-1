import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  Zap, 
  FileText, 
  Layers,
  Sparkles 
} from "lucide-react";

export default function FunnelPreviewModal({ funnel, onClose, onUse }) {
  if (!funnel) return null;

  const getBlockTypeIcon = (blockType) => {
    // Simple mapping of block types to icons
    const iconMap = {
      'hero_image_split': '🎯',
      'big_promise': '💫',
      'checklist_feature': '✅',
      'empathy': '💔',
      'authority': '👑',
      'social_proof': '⭐',
      'optin_form': '✉️',
      'countdown_cta': '⏱️',
      'urgency': '⏳',
      'faq': '❓',
    };
    return iconMap[blockType] || '📦';
  };

  return (
    <Dialog open={!!funnel} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Layers className="w-6 h-6 text-blue-600" />
                {funnel.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  {funnel.pages?.length || 0} Pages
                </Badge>
                <Badge variant="secondary">
                  {funnel.category?.replace('_', ' ') || 'General'}
                </Badge>
                {funnel.category === 'ai_generated' && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
              {funnel.description && (
                <p className="text-gray-600 mt-2">{funnel.description}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-6">
            {funnel.pages?.map((page, pageIndex) => (
              <Card key={pageIndex} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Page {pageIndex + 1}: {page.page_name}
                  </CardTitle>
                  {page.page_description && (
                    <p className="text-sm text-gray-600">{page.page_description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {page.page_blocks?.map((block, blockIndex) => (
                      <div
                        key={blockIndex}
                        className="bg-gray-50 rounded-lg p-3 text-center border"
                      >
                        <div className="text-2xl mb-1">
                          {getBlockTypeIcon(block.type)}
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                          {block.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    {page.page_blocks?.length || 0} blocks
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onUse(funnel)} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="w-4 h-4 mr-2" />
            Use This Funnel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}