import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Phone, Mail, DollarSign, FileText } from 'lucide-react';
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

interface StaffMember {
  id: string;
  name: string;
  specialty?: string;
}

interface EditAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  staff: StaffMember[];
  onSave: (updatedAppointment: Appointment) => void;
}

const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  staff,
  onSave
}) => {
  const [formData, setFormData] = useState({
    service_name: '',
    appointment_date: '',
    appointment_time: '',
    staff_id: '',
    status: '',
    full_name: '',
    phone: '',
    email: '',
    total_amount: 0,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Service options with prices
  const serviceOptions = [
    { value: 'Hair Cut & Style', price: 65 },
    { value: 'Manicure', price: 40 },
    { value: 'Pedicure', price: 55 },
    { value: 'Facial Treatment', price: 120 },
    { value: 'Massage', price: 85 },
    { value: 'Hair Color', price: 150 },
    { value: 'Highlights', price: 180 },
    { value: 'Waxing', price: 60 },
    { value: 'Eyebrow Wax', price: 30 },
    { value: 'Nail Polish Change', price: 25 }
  ];

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

  // Generate time slots (same as in StaffSchedulingSystem)
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

  // Populate form when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        service_name: appointment.service_name || '',
        appointment_date: appointment.appointment_date || '',
        appointment_time: appointment.appointment_time || '',
        staff_id: appointment.staff_id || '',
        status: appointment.status || 'confirmed',
        full_name: appointment.full_name || '',
        phone: appointment.phone || '',
        email: appointment.email || '',
        total_amount: appointment.total_amount || 0,
        notes: appointment.notes || ''
      });
    }
    setErrors({});
  }, [appointment]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service is required';
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

  const handleServiceChange = (serviceName: string) => {
    const service = serviceOptions.find(s => s.value === serviceName);
    setFormData(prev => ({
      ...prev,
      service_name: serviceName,
      total_amount: service?.price || 0
    }));
  };

  const handleSave = async () => {
    if (!appointment || !validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedAppointment: Appointment = {
        ...appointment,
        service_name: formData.service_name,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        staff_id: formData.staff_id,
        status: formData.status,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        total_amount: formData.total_amount,
        notes: formData.notes
      };

      onSave(updatedAppointment);
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
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

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-black">
            <FileText className="h-5 w-5" />
            Edit Appointment
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update appointment details for {appointment.full_name} • {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
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
                  className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
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
                <Select value={formData.service_name} onValueChange={handleServiceChange}>
                  <SelectTrigger className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
                    errors.service_name ? 'border-red-500' : ''
                  }`}>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {serviceOptions.map(service => (
                      <SelectItem key={service.value} value={service.value} className="text-black">
                        {service.value} - ${service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.service_name}</p>
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
                  className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
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
                  className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
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
                  className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
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
                  <SelectTrigger className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
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
                  <SelectTrigger className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
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
                  <SelectTrigger className="bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500">
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
                  className={`bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${
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
                className="bg-white border-gray-300 focus:border-gray-500 focus:ring-slate-500 resize-none"
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
            className="flex-1 h-10 bg-black hover:bg-slate-800 text-white"
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
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentDialog;