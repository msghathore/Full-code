import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format, addDays, addWeeks, addMonths, parseISO } from 'date-fns';
import { CalendarDays, Clock, User, Phone, Mail, Repeat, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createMultipleAppointments, checkMultipleAvailability } from '@/services/slotActionServices';
import { serviceApi, Service } from '@/services/api';

interface MultipleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime: string;
  staffId: string;
  staffMemberName: string;
  onSuccess?: () => void;
}

interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every X days/weeks/months
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
}

export const MultipleBookingModal: React.FC<MultipleBookingModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  staffId,
  staffMemberName,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    customerPhone: '',
    customerEmail: '',
    service: '',
    notes: '',
    recurrence: {
      enabled: false,
      type: 'weekly' as RecurrencePattern['type'],
      interval: 1,
      occurrences: 4,
      daysOfWeek: [] as number[],
      endDate: undefined as Date | undefined, // Add endDate here
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availability, setAvailability] = useState<{ timeSlot: string; available: boolean }[]>([]);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  React.useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await serviceApi.getAll();
      if (error) {
        toast({
          title: "Error fetching services",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setServices(data || []);
        console.log('[DEBUG] Fetched services:', data);
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  // Calculate recurrence dates
  const calculateRecurrenceDates = (): Date[] => {
    if (!formData.recurrence.enabled) return [selectedDate];
    
    const dates: Date[] = [selectedDate];
    const { type, interval, occurrences, endDate } = formData.recurrence;
    const maxOccurrences = occurrences || (endDate ? 50 : 4); // Fallback if no occurrences specified
    
    for (let i = 1; i < maxOccurrences; i++) {
      let nextDate: Date;
      
      switch (type) {
        case 'daily':
          nextDate = addDays(selectedDate, i * interval);
          break;
        case 'weekly':
          nextDate = addWeeks(selectedDate, i * interval);
          break;
        case 'monthly':
          nextDate = addMonths(selectedDate, i * interval);
          break;
        default:
          nextDate = addDays(selectedDate, i);
      }
      
      if (endDate && nextDate > endDate) break;
      dates.push(nextDate);
    }
    
    return dates;
  };

  // Generate available time slots for each date
  const checkAvailability = async () => {
    const dates = calculateRecurrenceDates();
    const timeSlots = dates.map(() => selectedTime);
    
    try {
      const { data, error } = await checkMultipleAvailability(
        staffId,
        format(selectedDate, 'yyyy-MM-dd'),
        [selectedTime]
      );
      
      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.customerPhone.trim() || !formData.service) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.recurrence.enabled) {
      const dates = calculateRecurrenceDates();
      if (dates.length === 0) {
        toast({
          title: "Invalid Recurrence",
          description: "Please configure a valid recurrence pattern.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Find the selected service
      const selectedService = services.find(s => s.id === formData.service);
      if (!selectedService) {
        toast({
          title: "Service Not Found",
          description: "The selected service could not be found. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // In a real application, you would create or retrieve the customer here.
      // For now, we'll use a placeholder or a simple creation logic.
      // For this fix, we'll assume a customer ID is available or created.
      const customerId = 'placeholder-customer-id'; // Replace with actual customer creation/retrieval logic

      const dates = calculateRecurrenceDates();
      const appointments = dates.map(date => ({
        staffId,
        customerId: customerId,
        serviceId: selectedService.id,
        date: format(date, 'yyyy-MM-dd'),
        time: selectedTime,
        amount: selectedService.price,
        notes: formData.notes.trim() || undefined
      }));

      const { data, error } = await createMultipleAppointments(appointments);

      if (error) throw error;

      toast({
        title: "Multiple Appointments Created",
        description: `${appointments.length} appointments have been scheduled for ${format(selectedDate, 'MMM d')} at ${selectedTime}.`,
        duration: 5000,
      });

      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        customerPhone: '',
        customerEmail: '',
        service: '',
        notes: '',
        recurrence: {
          enabled: false,
          type: 'weekly',
          interval: 1,
          occurrences: 4,
          daysOfWeek: []
        }
      });
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating multiple appointments:', error);
      toast({
        title: "Error",
        description: "Failed to create appointments. Please check availability and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: '',
        lastName: '',
        customerPhone: '',
        customerEmail: '',
        service: '',
        notes: '',
        recurrence: {
          enabled: false,
          type: 'weekly',
          interval: 1,
          occurrences: 4,
          daysOfWeek: []
        }
      });
      onClose();
    }
  };

  const dates = calculateRecurrenceDates();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white border-gray-200 max-w-lg w-[95vw] mx-auto rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black text-lg font-medium">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-3 w-3 text-white" />
            </div>
            Multiple Appointments
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            Schedule recurring appointments with {staffMemberName} starting {format(selectedDate, 'MMM d, yyyy')} at {selectedTime}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Customer Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-xs font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  className="h-9 text-sm bg-white border-gray-300 focus:border-white focus:ring-white text-black placeholder:text-gray-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  className="h-9 text-sm bg-white border-gray-300 focus:border-white focus:ring-white text-black placeholder:text-gray-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerPhone" className="text-xs font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(123) 456-7890"
                className="h-9 text-sm bg-white border-gray-300 focus:border-white focus:ring-white text-black placeholder:text-gray-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="customerEmail" className="text-xs font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="customer@email.com"
                className="h-9 text-sm bg-white border-gray-300 focus:border-white focus:ring-white text-black placeholder:text-gray-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Service Selection
            </h3>
            
            <div>
              <Label htmlFor="service" className="text-xs font-medium text-gray-700">
                Select Service <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.service}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-9 bg-white border-gray-300 focus:border-white focus:ring-white">
                  <SelectValue placeholder="Choose a service" className="text-sm" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {console.log('[DEBUG] Services for SelectContent:', services)}
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id} className="text-black">
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurrence"
                checked={formData.recurrence.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, enabled: checked as boolean }
                }))}
                disabled={isSubmitting}
              />
              <Label htmlFor="recurrence" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Recurring Appointments
              </Label>
            </div>

            {formData.recurrence.enabled && (
              <div className="ml-6 space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Frequency</Label>
                    <Select
                      value={formData.recurrence.type}
                      onValueChange={(value: RecurrencePattern['type']) => setFormData(prev => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, type: value }
                      }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-8 bg-white border-gray-300">
                        <SelectValue className="text-xs" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="daily" className="text-black text-xs">Daily</SelectItem>
                        <SelectItem value="weekly" className="text-black text-xs">Weekly</SelectItem>
                        <SelectItem value="monthly" className="text-black text-xs">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Every</Label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.recurrence.interval}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recurrence: { ...prev.recurrence, interval: parseInt(e.target.value) || 1 }
                      }))}
                      className="h-8 text-xs bg-white border-gray-300"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs font-medium text-gray-700">Occurrences</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.recurrence.occurrences}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence: { ...prev.recurrence, occurrences: parseInt(e.target.value) || 4 }
                    }))}
                    className="h-8 text-xs bg-white border-gray-300"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Preview of dates */}
                <div>
                  <Label className="text-xs font-medium text-gray-700">Preview</Label>
                  <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                    {dates.slice(0, 5).map(date => format(date, 'MMM d, yyyy')).join(', ')}
                    {dates.length > 5 && ` +${dates.length - 5} more`}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Additional Notes
            </h3>
            
            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-gray-700">
                Special Requests
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests or notes..."
                className="min-h-[60px] bg-white border-gray-300 focus:border-white focus:ring-white text-black placeholder:text-gray-500 resize-none"
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
              className="flex-1 h-10 text-sm border-gray-300 text-black hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 text-sm bg-white hover:bg-white/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Create {dates.length} Appointment{dates.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};