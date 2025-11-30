import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Phone, Mail, DollarSign, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  name: string;
  specialty?: string;
}

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface CreateAppointmentDialogProps {
   isOpen: boolean;
   onClose: () => void;
   staff: StaffMember[];
   selectedDate: Date;
   selectedTime?: string;
   selectedStaffId?: string;
   appointmentToEdit?: any;
   onAppointmentCreated: () => void;
}

const CreateAppointmentDialog: React.FC<CreateAppointmentDialogProps> = ({
  isOpen,
  onClose,
  staff,
  selectedDate,
  selectedTime = '09:00',
  selectedStaffId,
  appointmentToEdit,
  onAppointmentCreated
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    service_id: '',
    appointment_date: format(selectedDate, 'yyyy-MM-dd'),
    appointment_time: selectedTime,
    staff_id: selectedStaffId || '',
    status: 'confirmed',
    full_name: '',
    phone: '',
    email: '',
    total_amount: 0,
    notes: ''
  });

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Status options
  const statusOptions = [
    { value: 'requested', label: 'Requested' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'ready_to_start', label: 'Ready to Start' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
    { value: 'no_show', label: 'No Show' }
  ];

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const displayHour = hour === 24 ? 0 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour12 = displayHour === 0 ? 12 : displayHour;
        slots.push({
          value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          label: `${displayHour12}:${minute.toString().padStart(2, '0')} ${ampm}`
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, duration_minutes, price')
          .order('name');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive",
        });
      } finally {
        setIsLoadingServices(false);
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen, toast]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        // Editing mode - populate with existing appointment data
        setFormData({
          service_id: appointmentToEdit.service_id || '',
          appointment_date: appointmentToEdit.appointment_date || format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: appointmentToEdit.start_time || selectedTime,
          staff_id: appointmentToEdit.staff_id || selectedStaffId || '',
          status: appointmentToEdit.status || 'confirmed',
          full_name: appointmentToEdit.client_name || '',
          phone: '',
          email: '',
          total_amount: appointmentToEdit.price || 0,
          notes: appointmentToEdit.notes || ''
        });
      } else {
        // Creating mode - reset to defaults
        setFormData({
          service_id: services.length > 0 ? services[0].id : '',
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          staff_id: selectedStaffId || '',
          status: 'confirmed',
          full_name: '',
          phone: '',
          email: '',
          total_amount: services.length > 0 ? services[0].price : 0,
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, selectedDate, selectedTime, selectedStaffId, services, appointmentToEdit]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.service_id) {
      newErrors.service_id = 'Service is required';
    }
    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Date is required';
    }
    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Time is required';
    }
    if (!formData.staff_id) {
      newErrors.staff_id = 'Staff member is required';
    }
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Customer name is required';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }
    if (formData.total_amount <= 0) {
      newErrors.total_amount = 'Amount must be greater than 0';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (123) 456-7890';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setFormData(prev => ({
      ...prev,
      service_id: serviceId,
      total_amount: service?.price || 0
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Insert appointment into Supabase
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          service_id: formData.service_id,
          staff_id: formData.staff_id,
          status: formData.status,
          total_amount: formData.total_amount,
          notes: formData.notes,
          payment_status: 'pending'
        })
        .select();

      if (error) throw error;

      console.log('Appointment created successfully:', data);

      toast({
        title: "Appointment Created",
        description: `Appointment for ${formData.full_name} has been scheduled.`,
      });

      onAppointmentCreated();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: "Error",
        description: "Failed to save appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length >= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    } else if (phoneNumber.length >= 3) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length > 0) {
      return `(${phoneNumber}`;
    }
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black">
            <Plus className="h-5 w-5" />
            {appointmentToEdit ? 'Edit Appointment' : 'Create New Appointment'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {appointmentToEdit
              ? `Edit appointment for ${appointmentToEdit.client_name}`
              : `Schedule a new appointment for ${format(selectedDate, 'MMM d, yyyy')}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Customer Name *
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter customer name"
                  className={`bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.full_name ? 'border-red-500' : ''
                  }`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Service *
                </label>
                <Select
                  value={formData.service_id}
                  onValueChange={handleServiceChange}
                  disabled={isLoadingServices}
                >
                  <SelectTrigger className={`bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.service_id ? 'border-red-500' : ''
                  }`}>
                    <SelectValue placeholder={isLoadingServices ? "Loading services..." : "Select service"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id} className="text-black">
                        {service.name} - ${service.price} ({service.duration_minutes}min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number *
                </label>
                <Input
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(123) 456-7890"
                  maxLength={14}
                  className={`bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address *
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@email.com"
                  type="email"
                  className={`bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Appointment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date *
                </label>
                <Input
                  value={formData.appointment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                  type="date"
                  className={`bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.appointment_date ? 'border-red-500' : ''
                  }`}
                />
                {errors.appointment_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.appointment_date}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Time *
                </label>
                <Select value={formData.appointment_time} onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_time: value }))}>
                  <SelectTrigger className={`bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.appointment_time ? 'border-red-500' : ''
                  }`}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 max-h-48">
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.value} value={slot.value} className="text-black">
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.appointment_time && (
                  <p className="mt-1 text-xs text-red-600">{errors.appointment_time}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Staff Member *
                </label>
                <Select value={formData.staff_id} onValueChange={(value) => setFormData(prev => ({ ...prev, staff_id: value }))}>
                  <SelectTrigger className={`bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.staff_id ? 'border-red-500' : ''
                  }`}>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {staff.map(member => (
                      <SelectItem key={member.id} value={member.id} className="text-black">
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.staff_id && (
                  <p className="mt-1 text-xs text-red-600">{errors.staff_id}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Status
                </label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value} className="text-black">
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Amount *
                </label>
                <Input
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.total_amount ? 'border-red-500' : ''
                  }`}
                />
                {errors.total_amount && (
                  <p className="mt-1 text-xs text-red-600">{errors.total_amount}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Additional Notes
            </h3>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Special Requests & Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests, allergies, preferences..."
                className="bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-10 border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading || isLoadingServices}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {appointmentToEdit ? 'Update Appointment' : 'Create Appointment'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAppointmentDialog;