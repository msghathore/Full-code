import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Clock, Settings, Calendar, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { updateStaffWorkingHours, getStaffWorkingHours } from '@/services/slotActionServices';

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  staffId: string;
  staffMemberName: string;
  onSuccess?: () => void;
}

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  staffId,
  staffMemberName,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing working hours when modal opens
  React.useEffect(() => {
    if (isOpen && staffId) {
      loadWorkingHours();
    }
  }, [isOpen, staffId]);

  const loadWorkingHours = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getStaffWorkingHours(
        staffId,
        format(selectedDate, 'yyyy-MM-dd')
      );

      if (error) throw error;

      if (data) {
        setFormData({
          startTime: data.start_time,
          endTime: data.end_time,
          isAvailable: data.is_available
        });
      }
    } catch (error) {
      console.error('Error loading working hours:', error);
      // Keep default values if no existing data
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate times
    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await updateStaffWorkingHours(
        staffId,
        format(selectedDate, 'yyyy-MM-dd'),
        formData.startTime,
        formData.endTime,
        formData.isAvailable
      );

      if (error) throw error;

      const status = formData.isAvailable ? 'updated' : 'marked as unavailable';
      toast({
        title: "Working Hours Updated",
        description: `${staffMemberName}'s working hours for ${format(selectedDate, 'MMM d')} have been ${status}.`,
        duration: 5000,
      });

      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating working hours:', error);
      toast({
        title: "Error",
        description: "Failed to update working hours. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset to default values
      setFormData({
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      });
      onClose();
    }
  };

  // Calculate duration
  const calculateDuration = () => {
    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white border-gray-200 max-w-md w-[95vw] mx-auto rounded-xl shadow-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black text-lg font-medium">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
              <Settings className="h-3 w-3 text-white" />
            </div>
            Edit Working Hours
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Update {staffMemberName}'s working hours for {format(selectedDate, 'MMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Availability Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Available for appointments</span>
            </div>
            <Switch
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {formData.isAvailable && (
            <>
              {/* Start Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Start Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger className="pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 max-h-48">
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time} className="text-black">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  End Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Select
                    value={formData.endTime}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
                    disabled={isSubmitting || isLoading}
                  >
                    <SelectTrigger className="pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 max-h-48">
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time} className="text-black">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration Display */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">
                    Total Duration: {calculateDuration()}
                  </span>
                </div>
              </div>

              {/* Quick Time Presets */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Quick Presets
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, startTime: '09:00', endTime: '17:00' }))}
                    className="text-xs"
                    disabled={isSubmitting || isLoading}
                  >
                    9 AM - 5 PM
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, startTime: '08:00', endTime: '16:00' }))}
                    className="text-xs"
                    disabled={isSubmitting || isLoading}
                  >
                    8 AM - 4 PM
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, startTime: '10:00', endTime: '18:00' }))}
                    className="text-xs"
                    disabled={isSubmitting || isLoading}
                  >
                    10 AM - 6 PM
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, startTime: '12:00', endTime: '20:00' }))}
                    className="text-xs"
                    disabled={isSubmitting || isLoading}
                  >
                    12 PM - 8 PM
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Summary */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Date:</span>
                <span className="font-medium">{format(selectedDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Staff:</span>
                <span className="font-medium">{staffMemberName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span className={`font-medium ${formData.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {formData.isAvailable && (
                <div className="flex justify-between items-center">
                  <span>Hours:</span>
                  <span className="font-medium">
                    {formData.startTime} - {formData.endTime} ({calculateDuration()})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-10 text-sm border-gray-300 text-black hover:bg-gray-50 active:bg-gray-100"
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 text-sm bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Hours
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};