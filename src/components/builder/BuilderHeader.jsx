import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Sparkles, 
  Undo, 
  Redo,
  History
} from "lucide-react";
import { createPageUrl } from "@/utils";
import VersionHistoryModal from "./VersionHistoryModal";

export default function BuilderHeader({ 
  pageData, 
  onPageDataChange, 
  onSave, 
  onPublish, 
  onAIGenerate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onRestoreVersion,
  onCreateVersion,
  blocks
}) {
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={createPageUrl("Pages")}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pages
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center space-x-3">
            <Input
              value={pageData.title}
              onChange={(e) => onPageDataChange({ ...pageData, title: e.target.value })}
              className="font-medium text-lg border-none shadow-none p-0 h-auto focus-visible:ring-0"
              placeholder="Untitled Page"
            />
            <Badge variant={pageData.status === 'published' ? 'default' : 'secondary'}>
              {pageData.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={onAIGenerate}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVersionHistory(true)}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button
            size="sm"
            onClick={onPublish}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <VersionHistoryModal 
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        pageId={pageData.id}
        onRestoreVersion={onRestoreVersion}
        onCreateVersion={onCreateVersion}
        currentBlocks={blocks}
      />
    </>
  );
}