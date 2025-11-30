import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PlaceholderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const PlaceholderDialog: React.FC<PlaceholderDialogProps> = ({
  isOpen,
  onClose,
  title,
  message
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-black">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceholderDialog;