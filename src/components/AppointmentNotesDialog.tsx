import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  staff_id: string;
  status: string;
  full_name: string;
  phone?: string;
  email?: string;
  total_amount?: number;
  notes?: string;
}

interface AppointmentNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSaveNotes: (appointmentId: string, notes: string) => Promise<void>;
}

const AppointmentNotesDialog: React.FC<AppointmentNotesDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  onSaveNotes
}) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Populate notes when appointment changes
  useEffect(() => {
    if (appointment) {
      setNotes(appointment.notes || '');
    }
  }, [appointment]);

  const handleSave = async () => {
    if (!appointment) return;

    setIsLoading(true);

    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      await onSaveNotes(appointment.id, notes.trim());
      
      // Success is handled by the parent component via toast
      onClose();
    } catch (error) {
      console.error('Error saving notes:', error);
      // Error is handled by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      // Reset notes to original value when canceling
      setNotes(appointment?.notes || '');
      onClose();
    }
  };

  if (!appointment) return null;

  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="bg-white border-gray-200 max-w-lg w-[95vw] rounded-xl shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black text-lg font-semibold">
            <FileText className="h-5 w-5 text-black" />
            Appointment Notes
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm leading-relaxed">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{appointment.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(appointment.appointment_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatTime(appointment.appointment_time)} • {appointment.service_name}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Notes for this appointment
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this appointment, special requests, allergies, preferences..."
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg text-sm resize-none focus:border-gray-500 focus:ring-slate-500 bg-white text-black placeholder:text-gray-500"
              disabled={isLoading}
            />
            <div className="mt-2 text-xs text-gray-500">
              {notes.length} characters
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-10 text-sm border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 bg-white"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-10 text-sm bg-black hover:bg-slate-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Save Notes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentNotesDialog;