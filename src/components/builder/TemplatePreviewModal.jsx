import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TemplatePreviewModal({ isOpen, onClose, template, onUseTemplate }) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto bg-slate-100 rounded-lg border">
          <img src={template.thumbnail} alt={`Preview of ${template.name}`} className="w-full object-cover" />
        </div>
        <div className="flex-shrink-0 pt-4 flex justify-end">
            <Button onClick={() => onUseTemplate(template)} size="lg">Use This Template</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}