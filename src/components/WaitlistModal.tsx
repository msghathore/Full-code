import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar, Clock, User, Phone, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addToWaitlist } from '@/services/slotActionServices';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime: string;
  staffId: string;
  staffMemberName: string;
  onSuccess?: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  staffId,
  staffMemberName,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both customer name and phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await addToWaitlist(
        staffId,
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime,
        formData.customerName.trim(),
        formData.customerPhone.trim(),
        formData.notes.trim() || undefined
      );

      if (error) throw error;

      toast({
        title: "Added to Waitlist",
        description: `${formData.customerName} has been added to the waitlist for ${format(selectedDate, 'MMM d')} at ${selectedTime}.`,
        duration: 5000,
      });

      // Reset form and close modal
      setFormData({ customerName: '', customerPhone: '', notes: '' });
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding to waitlist:', error);
      const errorMessage = error.message || "Failed to add customer to waitlist. Please try again.";
      
      // Check if the error object contains a more specific message from the service layer
      if (error.originalError) {
        console.error('Original Service Error:', error.originalError);
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ customerName: '', customerPhone: '', notes: '' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white border-gray-200 max-w-md w-[95vw] mx-auto rounded-xl shadow-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black text-lg font-medium">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
              <Clock className="h-3 w-3 text-white" />
            </div>
            Add to Waitlist
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Add a customer to the waitlist for {staffMemberName} on {format(selectedDate, 'MMM d, yyyy')} at {selectedTime}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
              Customer Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                className="pl-10 h-10 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-black placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(123) 456-7890"
                className="pl-10 h-10 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-black placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes <span className="text-gray-500 font-normal">(Optional)</span>
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests or notes..."
                className="pl-10 min-h-[80px] bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-black placeholder:text-gray-500 resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-10 text-sm border-gray-300 text-black hover:bg-gray-50 active:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 text-sm bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Add to Waitlist
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};