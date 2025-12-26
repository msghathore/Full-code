import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Phone, Mail, DollarSign, FileText, Plus, X, Upload, Trash2, Search, ShieldAlert, Users, UserPlus, Heart, Sparkles, Gift, PartyPopper, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { verifyStaffPassword } from '@/lib/adminAuth';
import { getSchedulingRecommendation, SchedulingRecommendation, checkGroupCapacity } from '@/lib/smartGroupScheduling';

// Booking type selection
type BookingType = 'select' | 'individual' | 'group';

// Group type options
const GROUP_TYPES = [
  { value: 'bridal_party', label: 'Bridal Party', icon: Heart, color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { value: 'birthday', label: 'Birthday Party', icon: Gift, color: 'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-white/30' },
  { value: 'girls_day', label: "Girls' Day Out", icon: Sparkles, color: 'bg-white/10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] border-white/30' },
  { value: 'corporate', label: 'Corporate Event', icon: Users, color: 'bg-slate-50 text-black border-slate-200' },
  { value: 'other', label: 'Other Group', icon: PartyPopper, color: 'bg-green-100 text-green-600 border-green-200' },
];

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

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
  const { userRole } = useStaffAuth();

  // Booking type selection state
  const [bookingType, setBookingType] = useState<BookingType>('select');

  // Group booking form state
  const [groupFormData, setGroupFormData] = useState({
    group_name: '',
    group_type: 'bridal_party',
    lead_name: '',
    lead_email: '',
    lead_phone: '',
    total_members: 2,
    booking_date: format(selectedDate, 'yyyy-MM-dd'),
    start_time: selectedTime,
    scheduling_type: 'parallel',
    payment_type: 'single',
    special_requests: '',
  });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Smart scheduling state
  const [schedulingRecommendation, setSchedulingRecommendation] = useState<SchedulingRecommendation | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState<{
    hasCapacity: boolean;
    availableStaff: number;
    message: string;
  } | null>(null);

  // Track the original status when editing - only admin can change from 'completed'
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);

  // Admin password verification for changing completed appointments
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [formData, setFormData] = useState({
    service_id: '',
    appointment_date: format(selectedDate, 'yyyy-MM-dd'),
    appointment_time: selectedTime,
    staff_id: selectedStaffId || '',
    status: 'confirmed',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    total_amount: 0,
    deposit_due: 0,
    notes: '',
    repeat: 'off'
  });

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showCreateCustomerForm, setShowCreateCustomerForm] = useState(false);

  // Status options - must match database enum values
  const statusOptions = [
    { value: 'requested', label: 'Requested' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'ready_to_start', label: 'Ready to Start' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'no_show', label: 'No Show' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Repeat options
  const repeatOptions = [
    { value: 'off', label: 'Off' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
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

  // Customer search function with debounce
  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      setCustomerResults(data || []);
      setShowCustomerDropdown(true);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerSearchTerm.length >= 2) {
        searchCustomers(customerSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchTerm, searchCustomers]);

  // Fetch smart scheduling recommendation and auto-apply the best option silently
  useEffect(() => {
    const fetchRecommendation = async () => {
      if (bookingType !== 'group' || !groupFormData.booking_date || !groupFormData.start_time || groupFormData.total_members < 2) {
        setSchedulingRecommendation(null);
        setCapacityInfo(null);
        return;
      }

      setIsLoadingRecommendation(true);
      try {
        // Get scheduling recommendation
        const recommendation = await getSchedulingRecommendation({
          booking_date: groupFormData.booking_date,
          start_time: groupFormData.start_time,
          total_members: groupFormData.total_members,
          service_duration_minutes: 60, // Default service duration
        });
        setSchedulingRecommendation(recommendation);

        // Get capacity info
        const capacity = await checkGroupCapacity(
          groupFormData.booking_date,
          groupFormData.start_time,
          groupFormData.total_members
        );
        setCapacityInfo(capacity);

        // Auto-apply the fastest/best scheduling type silently
        if (recommendation.recommended_type && recommendation.recommended_type !== groupFormData.scheduling_type) {
          setGroupFormData(prev => ({ ...prev, scheduling_type: recommendation.recommended_type }));
        }
      } catch (error) {
        console.error('Error fetching scheduling recommendation:', error);
      } finally {
        setIsLoadingRecommendation(false);
      }
    };

    // Debounce the fetch
    const timer = setTimeout(fetchRecommendation, 300);
    return () => clearTimeout(timer);
  }, [bookingType, groupFormData.booking_date, groupFormData.start_time, groupFormData.total_members]);

  // Handle customer selection from dropdown
  const handleSelectCustomer = (customer: Customer) => {
    // Split name into first and last name
    const nameParts = (customer.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setFormData(prev => ({
      ...prev,
      first_name: firstName,
      last_name: lastName,
      email: customer.email || '',
      phone: customer.phone ? formatPhoneNumber(customer.phone) : ''
    }));
    setCustomerSearchTerm('');
    setShowCustomerDropdown(false);
    setCustomerResults([]);
  };

  // Handle creating a new customer
  const handleCreateNewCustomer = async () => {
    if (!formData.first_name.trim()) {
      toast({
        title: "Error",
        description: "First name is required to create a customer",
        variant: "destructive",
      });
      return;
    }

    try {
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: fullName,
          email: formData.email || null,
          phone: formData.phone || null,
          loyalty_points: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Customer Created",
        description: `${fullName} has been added to the system.`,
      });

      setShowCreateCustomerForm(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Reset booking type to selection screen (unless editing)
      if (!appointmentToEdit) {
        setBookingType('select');
      } else {
        setBookingType('individual'); // Editing goes straight to individual form
      }

      // Reset group form data
      setGroupFormData({
        group_name: '',
        group_type: 'bridal_party',
        lead_name: '',
        lead_email: '',
        lead_phone: '',
        total_members: 2,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTime,
        scheduling_type: 'parallel',
        payment_type: 'single',
        special_requests: '',
      });
      setIsCreatingGroup(false);

      // Reset customer search state
      setCustomerSearchTerm('');
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      setShowCreateCustomerForm(false);

      if (appointmentToEdit) {
        console.log('📝 Edit mode - appointmentToEdit:', appointmentToEdit);
        // Capture original status for admin-only restriction on changing from 'completed'
        setOriginalStatus(appointmentToEdit.status || null);

        // Normalize time format to HH:mm (remove seconds if present)
        let normalizedTime = appointmentToEdit.start_time || selectedTime;
        if (normalizedTime && normalizedTime.includes(':')) {
          const timeParts = normalizedTime.split(':');
          normalizedTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
        }
        console.log('📝 Normalized time:', normalizedTime, 'from:', appointmentToEdit.start_time);

        // Split client_name into first and last name
        const clientName = appointmentToEdit.client_name || '';
        const nameParts = clientName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Editing mode - populate with existing appointment data
        setFormData({
          service_id: appointmentToEdit.service_id || '',
          appointment_date: appointmentToEdit.appointment_date || format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: normalizedTime,
          staff_id: appointmentToEdit.staff_id || selectedStaffId || '',
          status: appointmentToEdit.status || 'confirmed',
          first_name: firstName,
          last_name: lastName,
          phone: appointmentToEdit.phone || '',
          email: appointmentToEdit.email || '',
          total_amount: appointmentToEdit.price || 0,
          deposit_due: appointmentToEdit.deposit_due || 0,
          notes: appointmentToEdit.notes || '',
          repeat: appointmentToEdit.repeat || 'off'
        });
      } else {
        // Creating mode - reset to defaults
        setOriginalStatus(null);
        setFormData({
          service_id: services.length > 0 ? services[0].id : '',
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          staff_id: selectedStaffId || '',
          status: 'confirmed',
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          total_amount: services.length > 0 ? services[0].price : 0,
          deposit_due: services.length > 0 ? services[0].price * 0.5 : 0,
          notes: '',
          repeat: 'off'
        });
      }
      setErrors({});
      // Reset admin password modal state
      setShowAdminPasswordModal(false);
      setAdminPassword('');
      setPendingStatusChange(null);
    }
  }, [isOpen, selectedDate, selectedTime, selectedStaffId, services, appointmentToEdit]);

  // Verify admin password for status change authorization
  const handleAdminPasswordVerify = async () => {
    if (!adminPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPassword(true);
    try {
      // Get admin staff members to verify password
      const { data: adminStaff, error } = await supabase
        .from('staff')
        .select('id, password_hash, password_salt, temp_password, role')
        .eq('role', 'admin');

      if (error) throw error;

      let isValidAdmin = false;
      for (const admin of adminStaff || []) {
        // Check temp_password first (plain text)
        if (admin.temp_password && admin.temp_password === adminPassword) {
          isValidAdmin = true;
          break;
        }
        // Check hashed password
        if (admin.password_hash && admin.password_salt) {
          const isValid = await verifyStaffPassword(adminPassword, admin.password_hash, admin.password_salt);
          if (isValid) {
            isValidAdmin = true;
            break;
          }
        }
        // Legacy: check if password_hash is plain text
        if (admin.password_hash && admin.password_hash === adminPassword) {
          isValidAdmin = true;
          break;
        }
      }

      if (isValidAdmin && pendingStatusChange) {
        // Admin verified - apply the status change
        setFormData(prev => ({ ...prev, status: pendingStatusChange }));
        toast({
          title: "Authorized",
          description: "Admin verified. Status change allowed.",
        });
        setShowAdminPasswordModal(false);
        setAdminPassword('');
        setPendingStatusChange(null);
      } else {
        toast({
          title: "Invalid Password",
          description: "The admin password is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying admin password:', error);
      toast({
        title: "Error",
        description: "Failed to verify password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle status change attempt
  const handleStatusChange = (value: string) => {
    // Check if trying to change from 'completed' to another status
    if (originalStatus === 'completed' && value !== 'completed' && userRole !== 'admin') {
      // Non-admin trying to change completed status - show password modal
      setPendingStatusChange(value);
      setShowAdminPasswordModal(true);
      return;
    }
    setFormData(prev => ({ ...prev, status: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
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
      // Get the duration of the new appointment from the selected service
      const selectedService = services.find(s => s.id === formData.service_id);
      const newDuration = selectedService?.duration_minutes || 60;

      // Parse the new appointment time
      const [newHours, newMinutes] = formData.appointment_time.split(':').map(Number);
      const newStartMinutes = newHours * 60 + newMinutes;
      const newEndMinutes = newStartMinutes + newDuration;

      // Check for OVERLAPPING appointments (not just exact time match)
      if (!appointmentToEdit) {
        // Only check for new appointments (not when editing)
        const { data: existingAppointments, error: conflictError } = await supabase
          .from('appointments')
          .select('id, full_name, appointment_time, services(duration_minutes)')
          .eq('staff_id', formData.staff_id)
          .eq('appointment_date', formData.appointment_date)
          .neq('status', 'cancelled');

        if (conflictError) {
          console.error('Error checking for conflicts:', conflictError);
        }

        // Check for overlapping time ranges
        const overlappingAppointment = existingAppointments?.find(apt => {
          const [existingHours, existingMinutes] = (apt.appointment_time || '').split(':').map(Number);
          const existingStartMinutes = existingHours * 60 + existingMinutes;
          const existingDuration = apt.services?.duration_minutes || 60;
          const existingEndMinutes = existingStartMinutes + existingDuration;

          // Check if time ranges overlap
          // Overlap occurs if: newStart < existingEnd AND newEnd > existingStart
          return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
        });

        if (overlappingAppointment) {
          const conflictingClient = overlappingAppointment.full_name || 'another client';
          toast({
            title: "Time Slot Unavailable",
            description: `This time slot overlaps with an appointment for ${conflictingClient}. Please choose a different time.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        // When editing, check for conflicts excluding the current appointment
        const { data: existingAppointments, error: conflictError } = await supabase
          .from('appointments')
          .select('id, full_name, appointment_time, services(duration_minutes)')
          .eq('staff_id', formData.staff_id)
          .eq('appointment_date', formData.appointment_date)
          .neq('status', 'cancelled')
          .neq('id', appointmentToEdit.id);

        if (conflictError) {
          console.error('Error checking for conflicts:', conflictError);
        }

        // Check for overlapping time ranges
        const overlappingAppointment = existingAppointments?.find(apt => {
          const [existingHours, existingMinutes] = (apt.appointment_time || '').split(':').map(Number);
          const existingStartMinutes = existingHours * 60 + existingMinutes;
          const existingDuration = apt.services?.duration_minutes || 60;
          const existingEndMinutes = existingStartMinutes + existingDuration;

          // Check if time ranges overlap
          return newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;
        });

        if (overlappingAppointment) {
          const conflictingClient = overlappingAppointment.full_name || 'another client';
          toast({
            title: "Time Slot Unavailable",
            description: `This time slot overlaps with an appointment for ${conflictingClient}. Please choose a different time.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Combine first and last name for storage
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();

      const appointmentPayload = {
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        full_name: fullName,
        email: formData.email,
        phone: formData.phone,
        service_id: formData.service_id,
        staff_id: formData.staff_id,
        status: formData.status,
        total_amount: formData.total_amount,
        notes: formData.notes,
        payment_status: 'pending'
      };

      let data, error;

      if (appointmentToEdit) {
        // UPDATE existing appointment
        const result = await supabase
          .from('appointments')
          .update(appointmentPayload)
          .eq('id', appointmentToEdit.id)
          .select();
        data = result.data;
        error = result.error;
        console.log('Appointment updated successfully:', data);
      } else {
        // INSERT new appointment
        const result = await supabase
          .from('appointments')
          .insert(appointmentPayload)
          .select();
        data = result.data;
        error = result.error;
        console.log('Appointment created successfully:', data);
      }

      if (error) throw error;

      toast({
        title: appointmentToEdit ? "Appointment Updated" : "Appointment Created",
        description: `Appointment for ${formData.first_name} ${formData.last_name} has been ${appointmentToEdit ? 'updated' : 'scheduled'}.`,
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

  // Handle creating group booking
  const handleCreateGroupBooking = async () => {
    // Validate required fields
    if (!groupFormData.lead_name.trim()) {
      toast({
        title: "Error",
        description: "Lead name is required",
        variant: "destructive",
      });
      return;
    }
    if (!groupFormData.lead_email.trim()) {
      toast({
        title: "Error",
        description: "Lead email is required",
        variant: "destructive",
      });
      return;
    }
    if (groupFormData.total_members < 2) {
      toast({
        title: "Error",
        description: "Group must have at least 2 members",
        variant: "destructive",
      });
      return;
    }

    // Check if we have capacity (use smart scheduling info)
    if (capacityInfo && !capacityInfo.hasCapacity) {
      toast({
        title: "No Staff Available",
        description: "No staff members are available at this time. Please choose a different time slot.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingGroup(true);

    try {
      // Generate share code
      const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Calculate pricing
      const basePerPerson = 100; // Default base price, can be made dynamic
      const subtotal = basePerPerson * groupFormData.total_members;

      // Get discount based on group size
      let discountPercentage = 0;
      if (groupFormData.total_members >= 10) discountPercentage = 15;
      else if (groupFormData.total_members >= 6) discountPercentage = 10;
      else if (groupFormData.total_members >= 2) discountPercentage = 5;

      const discountAmount = (subtotal * discountPercentage) / 100;
      const totalAmount = subtotal - discountAmount;
      const depositRequired = totalAmount * 0.5;

      // Use the smart scheduling recommendation if available
      const schedulingType = schedulingRecommendation?.recommended_type || groupFormData.scheduling_type;
      const estimatedEndTime = schedulingRecommendation?.estimated_end_time || null;
      const totalDuration = schedulingRecommendation?.total_duration_minutes || null;

      const { data, error } = await supabase
        .from('group_bookings')
        .insert({
          group_name: groupFormData.group_name || `${groupFormData.lead_name}'s Group`,
          group_type: groupFormData.group_type,
          lead_name: groupFormData.lead_name,
          lead_email: groupFormData.lead_email,
          lead_phone: groupFormData.lead_phone || null,
          total_members: groupFormData.total_members,
          booking_date: groupFormData.booking_date,
          start_time: groupFormData.start_time,
          scheduling_type: schedulingType,
          payment_type: groupFormData.payment_type,
          special_requests: groupFormData.special_requests || null,
          share_code: shareCode,
          share_link_active: true,
          status: 'pending',
          subtotal_amount: subtotal,
          discount_percentage: discountPercentage,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          deposit_required: depositRequired,
          balance_due: totalAmount,
        })
        .select()
        .single();

      if (error) throw error;

      // Add lead as first member with smart scheduling assignment if available
      const leadSchedule = schedulingRecommendation?.member_schedule?.[0];
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_booking_id: data.id,
          member_name: groupFormData.lead_name,
          member_email: groupFormData.lead_email,
          member_phone: groupFormData.lead_phone || null,
          is_lead: true,
          status: 'pending',
          staff_id: leadSchedule?.staff_id || null,
          scheduled_time: leadSchedule?.start_time || groupFormData.start_time,
        });

      if (memberError) {
        console.error('Error adding lead as member:', memberError);
      }

      // Show success with scheduling info
      const scheduleInfo = schedulingRecommendation
        ? ` Scheduling: ${schedulingType} (${schedulingRecommendation.available_staff_count} staff available)`
        : '';

      toast({
        title: "Group Booking Created!",
        description: `Share code: ${shareCode}.${scheduleInfo} The group can now add members and select services.`,
      });

      onAppointmentCreated();
      onClose();
    } catch (error) {
      console.error('Error creating group booking:', error);
      toast({
        title: "Error",
        description: "Failed to create group booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingGroup(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-white border-0 rounded-lg shadow-xl ${bookingType === 'select' ? 'max-w-[600px]' : 'max-w-[900px]'} w-[95vw] max-h-[90vh] overflow-y-auto`} style={{ zIndex: 9999 }}>
        <DialogHeader className="pb-4 relative">
          <DialogTitle className="flex items-center gap-2 text-black">
            {bookingType === 'select' && <Plus className="h-5 w-5" />}
            {bookingType === 'individual' && <UserPlus className="h-5 w-5" />}
            {bookingType === 'group' && <Users className="h-5 w-5" />}
            {appointmentToEdit ? 'Edit Appointment' :
              bookingType === 'select' ? 'Create New Booking' :
              bookingType === 'individual' ? 'Individual Appointment' :
              'Group Booking'
            }
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {appointmentToEdit
              ? `Edit appointment for ${appointmentToEdit.client_name}`
              : bookingType === 'select'
                ? 'Choose the type of booking you want to create'
                : bookingType === 'individual'
                  ? `Schedule an individual appointment for ${format(selectedDate, 'MMM d, yyyy')}`
                  : `Create a group booking for ${format(selectedDate, 'MMM d, yyyy')}`
            }
          </DialogDescription>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* BOOKING TYPE SELECTION SCREEN */}
        {bookingType === 'select' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Individual Booking Option */}
              <button
                onClick={() => setBookingType('individual')}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-gray-500 hover:bg-slate-50 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-slate-100 transition-colors">
                  <UserPlus className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Individual</h3>
                <p className="text-sm text-gray-500 text-center">Single client appointment</p>
              </button>

              {/* Group Booking Option */}
              <button
                onClick={() => setBookingType('group')}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                  <Users className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Group</h3>
                <p className="text-sm text-gray-500 text-center">Bridal party, birthday, events</p>
              </button>
            </div>

            <div className="text-center text-sm text-gray-400">
              Select the type of booking to continue
            </div>
          </div>
        )}

        {/* GROUP BOOKING FORM */}
        {bookingType === 'group' && (
          <div className="space-y-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBookingType('select')}
              className="text-gray-500 hover:text-gray-700 -ml-2"
            >
              ← Back to selection
            </Button>

            {/* Group Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Group Type *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {GROUP_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = groupFormData.group_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setGroupFormData(prev => ({ ...prev, group_type: type.value }))}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `${type.color} border-current`
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isSelected ? '' : 'text-gray-600'}`} />
                      <span className={`text-xs font-medium text-center ${isSelected ? '' : 'text-gray-700'}`}>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Group Name
                </label>
                <Input
                  value={groupFormData.group_name}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, group_name: e.target.value }))}
                  placeholder="e.g., Sarah's Bridal Party"
                  className="bg-white text-black border-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Total Members *
                </label>
                <Input
                  type="number"
                  min="2"
                  max="20"
                  value={groupFormData.total_members}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, total_members: parseInt(e.target.value) || 2 }))}
                  className="bg-white text-black border-gray-300"
                />
                {groupFormData.total_members >= 2 && (
                  <p className="text-xs text-green-600 mt-1">
                    {groupFormData.total_members >= 10 ? '15%' : groupFormData.total_members >= 6 ? '10%' : '5%'} group discount applies!
                  </p>
                )}
              </div>
            </div>

            {/* Lead Contact Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Lead Contact (Organizer)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Name *
                  </label>
                  <Input
                    value={groupFormData.lead_name}
                    onChange={(e) => setGroupFormData(prev => ({ ...prev, lead_name: e.target.value }))}
                    placeholder="Full name"
                    className="bg-white text-black border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={groupFormData.lead_email}
                    onChange={(e) => setGroupFormData(prev => ({ ...prev, lead_email: e.target.value }))}
                    placeholder="email@example.com"
                    className="bg-white text-black border-gray-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Phone
                  </label>
                  <Input
                    value={groupFormData.lead_phone}
                    onChange={(e) => setGroupFormData(prev => ({ ...prev, lead_phone: formatPhoneNumber(e.target.value) }))}
                    placeholder="(555) 123-4567"
                    maxLength={14}
                    className="bg-white text-black border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Booking Date *
                </label>
                <Input
                  type="date"
                  value={groupFormData.booking_date}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, booking_date: e.target.value }))}
                  className="bg-white text-black border-gray-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Start Time *
                </label>
                <Select
                  value={groupFormData.start_time}
                  onValueChange={(value) => setGroupFormData(prev => ({ ...prev, start_time: value }))}
                >
                  <SelectTrigger className="bg-white text-black border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-48" style={{ zIndex: 99999 }}>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot.value} value={slot.value} className="text-black">
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Type Option */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Payment Type
              </label>
              <Select
                value={groupFormData.payment_type}
                onValueChange={(value) => setGroupFormData(prev => ({ ...prev, payment_type: value }))}
              >
                <SelectTrigger className="bg-white text-black border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white" style={{ zIndex: 99999 }}>
                  <SelectItem value="single" className="text-black">Single (lead pays all)</SelectItem>
                  <SelectItem value="split" className="text-black">Split (each member pays)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Special Requests
              </label>
              <Textarea
                value={groupFormData.special_requests}
                onChange={(e) => setGroupFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                placeholder="Any special requirements, themes, or notes..."
                className="bg-white text-black border-gray-300 resize-none"
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
              <Button
                onClick={() => setBookingType('select')}
                variant="outline"
                className="px-6 h-10 border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={isCreatingGroup}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateGroupBooking}
                className="px-6 h-10 bg-pink-600 hover:bg-pink-700 text-white"
                disabled={isCreatingGroup}
              >
                {isCreatingGroup ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Create Group Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* INDIVIDUAL APPOINTMENT FORM (existing form) */}
        {bookingType === 'individual' && (
        <div className="space-y-4">
          {/* Back button (only when not editing) */}
          {!appointmentToEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBookingType('select')}
              className="text-gray-500 hover:text-gray-700 -ml-2"
            >
              ← Back to selection
            </Button>
          )}
          {/* Row 1: Service with Staff | Appointment Note | Customer */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Service with Staff *
              </label>
              <Select
                value={formData.service_id}
                onValueChange={handleServiceChange}
                disabled={isLoadingServices}
              >
                <SelectTrigger className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.service_id ? 'border-red-500' : ''
                  }`}>
                  <SelectValue placeholder={isLoadingServices ? "Loading services..." : "Select service & staff"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" style={{ zIndex: 99999 }}>
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

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Appointment Note
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests, allergies, preferences..."
                className="bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 resize-none"
                rows={2}
              />
            </div>

            {/* Customer Search & Name Fields */}
            <div className="space-y-2">
              {/* Customer Search */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  <Search className="h-4 w-4 inline mr-1" />
                  Search Existing Customer
                </label>
                <Input
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  placeholder="Type to search by name or email..."
                  className="bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500"
                />
                {isSearching && (
                  <div className="absolute right-3 top-9">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                  </div>
                )}

                {/* Customer Search Dropdown */}
                {showCustomerDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {customerResults.length > 0 ? (
                      <>
                        {customerResults.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b last:border-b-0 text-black transition-colors"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">
                              {customer.email && <span>{customer.email}</span>}
                              {customer.email && customer.phone && <span> • </span>}
                              {customer.phone && <span>{customer.phone}</span>}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-green-50 text-green-700 font-medium border-t flex items-center gap-2"
                          onClick={() => {
                            setShowCustomerDropdown(false);
                            setShowCreateCustomerForm(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Create New Customer
                        </button>
                      </>
                    ) : customerSearchTerm.length >= 2 && !isSearching ? (
                      <div className="p-3">
                        <div className="text-gray-500 text-sm mb-2">No customers found matching "{customerSearchTerm}"</div>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-green-50 text-green-700 font-medium rounded flex items-center gap-2 border border-green-200"
                          onClick={() => {
                            // Pre-fill the name from search term
                            const nameParts = customerSearchTerm.trim().split(' ');
                            setFormData(prev => ({
                              ...prev,
                              first_name: nameParts[0] || '',
                              last_name: nameParts.slice(1).join(' ') || ''
                            }));
                            setShowCustomerDropdown(false);
                            setShowCreateCustomerForm(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Create "{customerSearchTerm}" as New Customer
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Create Customer Notice */}
              {showCreateCustomerForm && (
                <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700 font-medium">Creating new customer - fill in details below</span>
                    <button
                      type="button"
                      onClick={() => setShowCreateCustomerForm(false)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* First Name & Last Name Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">First Name *</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="First name"
                    className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.first_name ? 'border-red-500' : ''}`}
                  />
                  {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Last Name *</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Last name"
                    className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.last_name ? 'border-red-500' : ''}`}
                  />
                  {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Date | Time | Staff Member */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date *
              </label>
              <Input
                value={formData.appointment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                type="date"
                className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.appointment_date ? 'border-red-500' : ''
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
                <SelectTrigger className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.appointment_time ? 'border-red-500' : ''
                  }`}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 max-h-48" style={{ zIndex: 99999 }}>
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
                <SelectTrigger className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.staff_id ? 'border-red-500' : ''
                  }`}>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" style={{ zIndex: 99999 }}>
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

          {/* Row 3: Price | Duration | Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Price *
              </label>
              <Input
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.total_amount ? 'border-red-500' : ''
                  }`}
              />
              {errors.total_amount && (
                <p className="mt-1 text-xs text-red-600">{errors.total_amount}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Duration
              </label>
              <Input
                value={services.find(s => s.id === formData.service_id)?.duration_minutes || ''}
                readOnly
                placeholder="Auto-filled from service"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Status
                {originalStatus === 'completed' && userRole !== 'admin' && (
                  <span className="text-xs text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] ml-2">
                    <ShieldAlert className="h-3 w-3 inline mr-1" />
                    Requires admin password to change
                  </span>
                )}
              </label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200" style={{ zIndex: 99999 }}>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value} className="text-black">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Deposit Due | Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Deposit Due
              </label>
              <Input
                value={formData.deposit_due}
                onChange={(e) => setFormData(prev => ({ ...prev, deposit_due: parseFloat(e.target.value) || 0 }))}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Amount
              </label>
              <Input
                value={formData.total_amount}
                readOnly
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
          </div>

          {/* Row 5: Repeat buttons (full width) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Repeat:
            </label>
            <div className="flex gap-2">
              {repeatOptions.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={formData.repeat === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, repeat: option.value }))}
                  className={formData.repeat === option.value
                    ? "bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
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
                className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.phone ? 'border-red-500' : ''
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
                className={`bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 ${errors.email ? 'border-red-500' : ''
                  }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Small file upload area */}
          <div className="space-y-1">
            <Input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="bg-white text-black border-gray-300 focus:border-gray-500 focus:ring-slate-500 text-sm"
            />
            {uploadedFiles.length > 0 && (
              <div className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-1 rounded text-xs">
                    <span className="text-gray-700 truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 h-4 w-4 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons for Individual Form */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            {!appointmentToEdit && (
              <Button
                onClick={() => setBookingType('select')}
                variant="outline"
                className="px-6 h-10 border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 h-10 border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 h-10 bg-black hover:bg-slate-800 text-white"
              disabled={isLoading || isLoadingServices}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  {appointmentToEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {appointmentToEdit ? 'Update Appointment' : 'Create Appointment'}
                </>
              )}
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>

      {/* Admin Password Modal */}
      <Dialog open={showAdminPasswordModal} onOpenChange={(open) => {
        if (!open) {
          setShowAdminPasswordModal(false);
          setAdminPassword('');
          setPendingStatusChange(null);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-white" style={{ zIndex: 100000 }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <ShieldAlert className="h-5 w-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              Admin Authorization Required
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Changing the status of a completed appointment requires admin authorization.
              Please enter an admin password to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Admin Password
              </label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-white text-black border-gray-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminPasswordVerify();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdminPasswordModal(false);
                  setAdminPassword('');
                  setPendingStatusChange(null);
                }}
                disabled={isVerifyingPassword}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminPasswordVerify}
                disabled={isVerifyingPassword || !adminPassword.trim()}
                className="bg-black hover:bg-slate-800 text-white"
              >
                {isVerifyingPassword ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </>
                ) : (
                  'Authorize'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAppointmentDialog;
