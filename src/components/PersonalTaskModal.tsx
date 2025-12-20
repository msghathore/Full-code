import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar, Clock, CalendarX, Palette } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createPersonalTask } from '@/services/slotActionServices';

interface PersonalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime: string;
  staffId: string;
  staffMemberName: string;
  onSuccess?: () => void;
}

const TASK_COLORS = [
  { id: 'gray', name: 'Gray', value: '#6B7280', bg: '#F3F4F6', border: '#D1D5DB' },
  { id: 'slate', name: 'Slate', value: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
  { id: 'zinc', name: 'Zinc', value: '#52525B', bg: '#F4F4F5', border: '#D4D4D8' },
  { id: 'neutral', name: 'Neutral', value: '#525252', bg: '#F5F5F5', border: '#D6D6D6' },
  { id: 'stone', name: 'Stone', value: '#57534E', bg: '#FAFAF9', border: '#E7E5E4' },
];

export const PersonalTaskModal: React.FC<PersonalTaskModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  staffId,
  staffMemberName,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    description: '',
    duration: '60', // Default 60 minutes
    color: 'gray'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a task description.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await createPersonalTask(
        staffId,
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime,
        formData.description.trim(),
        parseInt(formData.duration)
      );

      if (error) throw error;

      toast({
        title: "Personal Task Created",
        description: `Task "${formData.description}" has been scheduled for ${format(selectedDate, 'MMM d')} at ${selectedTime}.`,
        duration: 5000,
      });

      // Reset form and close modal
      setFormData({ description: '', duration: '60', color: 'gray' });
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating personal task:', error);
      toast({
        title: "Error",
        description: "Failed to create personal task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ description: '', duration: '60', color: 'gray' });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white border-gray-200 max-w-md w-[95vw] mx-auto rounded-xl shadow-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black text-lg font-medium">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
              <CalendarX className="h-3 w-3 text-white" />
            </div>
            Add Personal Task
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Block time for a personal task on {format(selectedDate, 'MMM d, yyyy')} at {selectedTime} with {staffMemberName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Task Description <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CalendarX className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the personal task..."
                className="pl-10 min-h-[80px] bg-white border-gray-300 focus:border-gray-800 focus:ring-gray-800 text-black placeholder:text-gray-500 resize-none"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              Duration (minutes)
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Select 
                value={formData.duration} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="pl-10 h-10 bg-white border-gray-300 focus:border-gray-800 focus:ring-gray-800">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="15" className="text-black">15 minutes</SelectItem>
                  <SelectItem value="30" className="text-black">30 minutes</SelectItem>
                  <SelectItem value="45" className="text-black">45 minutes</SelectItem>
                  <SelectItem value="60" className="text-black">1 hour</SelectItem>
                  <SelectItem value="90" className="text-black">1.5 hours</SelectItem>
                  <SelectItem value="120" className="text-black">2 hours</SelectItem>
                  <SelectItem value="180" className="text-black">3 hours</SelectItem>
                  <SelectItem value="240" className="text-black">4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Color
            </Label>
            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-gray-400" />
              <div className="flex gap-2">
                {TASK_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.id }))}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-200
                      ${formData.color === color.id 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {TASK_COLORS.find(c => c.id === formData.color)?.name}
              </span>
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
              className="flex-1 h-10 text-sm bg-gray-800 hover:bg-gray-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CalendarX className="h-4 w-4 mr-2" />
                  Block Time
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};