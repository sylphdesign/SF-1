import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AdCampaignVersion } from '@/api/entities';
import { Clock, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function VersionHistory({ campaignId, currentDesign, onRestoreVersion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newVersionTitle, setNewVersionTitle] = useState('');

  const fetchVersions = useCallback(async () => {
    if (!campaignId) return;
    setIsLoading(true);
    try {
      const data = await AdCampaignVersion.filter({ campaign_id: campaignId }, '-created_date');
      setVersions(data);
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fetchVersions]);

  const handleCreateVersion = async () => {
    if (!campaignId || !newVersionTitle) {
      alert('Please provide a title for the version.');
      return;
    }
    setIsSaving(true);
    try {
      const latestVersion = versions[0];
      const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

      await AdCampaignVersion.create({
        campaign_id: campaignId,
        version_number: newVersionNumber,
        title: newVersionTitle,
        design: currentDesign,
        is_auto_saved: false,
      });
      setNewVersionTitle('');
      fetchVersions();
    } catch (error) {
      console.error("Error creating version:", error);
      alert('Failed to save version.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreClick = (version) => {
    if (window.confirm(`Are you sure you want to restore to version "${version.title}"? Your current canvas and undo history will be replaced.`)) {
      onRestoreVersion(version.design);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} disabled={!campaignId}>
        <Clock className="w-4 h-4 mr-2" />
        History
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              Create new versions to save your progress, or restore a previous version. This is separate from undo/redo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 my-4">
            <Input 
              placeholder="Name this version (e.g., V2 with new logo)" 
              value={newVersionTitle}
              onChange={(e) => setNewVersionTitle(e.target.value)}
              disabled={isSaving}
            />
            <Button onClick={handleCreateVersion} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Version
            </Button>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto space-y-2 pr-2">
            {isLoading ? <p>Loading history...</p> : 
              versions.length > 0 ? (
                versions.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-md border bg-gray-50">
                    <div>
                      <p className="font-semibold">{v.title}</p>
                      <p className="text-xs text-gray-500">
                        Saved on {format(new Date(v.created_date), 'MMM d, yyyy, h:mm a')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRestoreClick(v)}>Restore</Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No saved versions yet.</p>
              )
            }
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}