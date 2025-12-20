import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Info, Check, User, Scissors, Users, Plus, Trash2, Zap, Loader2, ShoppingCart, ChevronUp, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { BOOKING_TIME_SLOTS } from '@/lib/businessConstants';

interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
  availableStaff: number;
}

type BookingMode = 'stylist' | 'service' | 'group' | null;

interface GroupMember {
  id: string;
  service: string;
  name: string;
  phone: string;
}

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('booking-current-step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [bookingMode, setBookingMode] = useState<BookingMode>(() => {
    const saved = localStorage.getItem('booking-mode');
    return (saved as BookingMode) || null;
  });
  const [date, setDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem('booking-date');
    return saved ? new Date(saved) : new Date();
  });
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    const saved = localStorage.getItem('booking-selected-services');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedStaff, setSelectedStaff] = useState(() => {
    return localStorage.getItem('booking-selected-staff') || '';
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    return localStorage.getItem('booking-selected-time') || '';
  });
  const [fullName, setFullName] = useState(() => {
    return localStorage.getItem('booking-full-name') || '';
  });
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('booking-phone') || '';
  });
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('booking-notes') || '';
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Group booking states
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(() => {
    const saved = localStorage.getItem('booking-group-members');
    return saved ? JSON.parse(saved) : [{ id: '1', service: '', name: '', phone: '' }];
  });
  const [autoStaffSelection, setAutoStaffSelection] = useState(() => {
    const saved = localStorage.getItem('booking-auto-staff');
    return saved ? saved === 'true' : true;
  });
  const [groupStaffSelections, setGroupStaffSelections] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('booking-group-staff');
    return saved ? JSON.parse(saved) : {};
  });

  // Time slots state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (!phoneNumber) return '';
    if (phoneNumber.length <= 3) return `(${phoneNumber}`;
    else if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    else return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Persist booking state to localStorage
  useEffect(() => {
    localStorage.setItem('booking-current-step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (bookingMode) localStorage.setItem('booking-mode', bookingMode);
  }, [bookingMode]);

  useEffect(() => {
    if (date) localStorage.setItem('booking-date', date.toISOString());
  }, [date]);

  useEffect(() => {
    localStorage.setItem('booking-selected-services', JSON.stringify(selectedServices));
  }, [selectedServices]);

  useEffect(() => {
    localStorage.setItem('booking-selected-staff', selectedStaff);
  }, [selectedStaff]);

  useEffect(() => {
    localStorage.setItem('booking-selected-time', selectedTime);
  }, [selectedTime]);

  useEffect(() => {
    localStorage.setItem('booking-full-name', fullName);
  }, [fullName]);

  useEffect(() => {
    localStorage.setItem('booking-phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('booking-notes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('booking-group-members', JSON.stringify(groupMembers));
  }, [groupMembers]);

  useEffect(() => {
    localStorage.setItem('booking-auto-staff', autoStaffSelection.toString());
  }, [autoStaffSelection]);

  useEffect(() => {
    localStorage.setItem('booking-group-staff', JSON.stringify(groupStaffSelections));
  }, [groupStaffSelections]);

  const steps = bookingMode === 'group' ? [
    { title: 'Add People & Services', description: 'Add group members and select their services' },
    { title: 'Date & Time', description: 'Select appointment date and time' },
    { title: 'Contact Info', description: 'Provide lead contact details' },
    { title: 'Review & Confirm', description: 'Review group booking and confirm' },
  ] : [
    { title: 'Choose Services', description: 'Select one or more services' },
    { title: 'Date & Time', description: 'Select appointment date and time' },
    { title: 'Contact Info', description: 'Provide your contact details' },
    { title: 'Review & Confirm', description: 'Review your booking details and confirm' },
  ];

  const validateStep = () => {
    if (currentStep === 0) {
      if (!bookingMode) {
        toast({
          title: "Selection Required",
          description: "Please choose a booking type to continue.",
          variant: "destructive",
        });
        return false;
      }
      if (bookingMode === 'stylist' && !selectedStaff) {
        toast({
          title: "Stylist Required",
          description: "Please select a stylist before proceeding.",
          variant: "destructive",
        });
        return false;
      }
      if (bookingMode === 'stylist' && selectedServices.length === 0) {
        toast({
          title: "Service Required",
          description: "Please select at least one service before proceeding.",
          variant: "destructive",
        });
        return false;
      }
      if (bookingMode === 'service' && selectedServices.length === 0) {
        toast({
          title: "Service Required",
          description: "Please select at least one service before proceeding.",
          variant: "destructive",
        });
        return false;
      }
      if (bookingMode === 'group') {
        const validMembers = groupMembers.filter(m => m.service);
        if (validMembers.length === 0) {
          toast({
            title: "Service Required",
            description: "Please select at least one service for your group.",
            variant: "destructive",
          });
          return false;
        }
        if (validMembers.length < 2) {
          toast({
            title: "Minimum 2 People Required",
            description: "Group booking requires at least 2 people. Please use individual booking for single appointments.",
            variant: "destructive",
          });
          return false;
        }
      }
    } else if (currentStep === 1 && (!date || !selectedTime)) {
      toast({
        title: "Date & Time Required",
        description: "Please select a date and time before proceeding.",
        variant: "destructive",
      });
      return false;
    } else if (currentStep === 2 && isGuest && (!fullName.trim() || !phone.trim())) {
      toast({
        title: "Contact Info Required",
        description: "Please provide your full name and phone number before proceeding.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (!validateStep()) return;
      setCurrentStep(currentStep + 1);
      // Scroll to top of page when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setIsGuest(false);
        } else {
          setIsGuest(true);
        }

        await Promise.all([fetchServices(), fetchStaff()]);
      } catch (error) {
        console.error('Error initializing booking page:', error);
        setIsGuest(true);
        setDataLoading(false);
      }
    };
    init();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } else {
      const dataWithVirtual = data?.some(s => s.name === 'Virtual Consultation')
        ? data
        : [...(data || []), {
            id: 'virtual-1',
            name: 'Virtual Consultation',
            price: 50,
            description: 'Online video consultation with our experts',
            category: 'consultation',
            duration_minutes: 60,
            is_active: true,
            created_at: new Date().toISOString(),
            image_url: '/images/virtual-consultation.jpg'
          }];
      setServices(dataWithVirtual);
    }

    const serviceParam = searchParams.get('service');
    if (serviceParam) setSelectedServices([serviceParam]);

    setDataLoading(false);
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, first_name, last_name, name, role, color, avatar, status')
        .neq('status', 'offline')
        .order('name');

      if (error) throw error;

      const transformedStaff = (data || []).map(s => ({
        id: s.id,
        name: s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.name,
        role: s.role || 'Stylist',
        color: s.color || '#6b7280',
        avatar: s.avatar || '/images/client-1.jpg'
      }));

      setStaff(transformedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Fetch available time slots based on date and existing appointments
  const fetchAvailableTimeSlots = useCallback(async (selectedDate: Date) => {
    if (!selectedDate) return;

    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Get all appointments for the selected date
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('appointment_time, staff_id, services(duration_minutes)')
        .eq('appointment_date', dateStr)
        .not('status', 'in', '("cancelled","no_show")');

      if (error) throw error;

      // Get total staff count for availability calculation
      const { data: activeStaff } = await supabase
        .from('staff')
        .select('id')
        .neq('status', 'offline');

      const totalStaff = activeStaff?.length || 1;

      // Business hours from centralized constants
      const businessHours = BOOKING_TIME_SLOTS;

      // Count booked staff per time slot
      const bookedSlots: Record<string, Set<string>> = {};

      appointments?.forEach(apt => {
        const aptTime = apt.appointment_time?.substring(0, 5); // "HH:MM"
        if (aptTime && apt.staff_id) {
          if (!bookedSlots[aptTime]) {
            bookedSlots[aptTime] = new Set();
          }
          bookedSlots[aptTime].add(apt.staff_id);
        }
      });

      // Calculate availability for each slot
      const slots: TimeSlot[] = businessHours.map(slot => {
        const bookedStaffCount = bookedSlots[slot.time]?.size || 0;
        const availableStaffCount = totalStaff - bookedStaffCount;

        // For group bookings, check if enough staff available
        const requiredStaff = bookingMode === 'group'
          ? groupMembers.filter(m => m.service).length
          : 1;

        return {
          time: slot.time,
          display: slot.display,
          available: availableStaffCount >= requiredStaff,
          availableStaff: availableStaffCount
        };
      });

      // Filter out past times if today
      const now = new Date();
      const isToday = format(now, 'yyyy-MM-dd') === dateStr;

      const filteredSlots = isToday
        ? slots.filter(slot => {
            const [hours, mins] = slot.time.split(':').map(Number);
            const slotDate = new Date(selectedDate);
            slotDate.setHours(hours, mins, 0, 0);
            return slotDate > now;
          })
        : slots;

      // Sort slots chronologically (morning to evening)
      const sortedSlots = [...filteredSlots].sort((a, b) => {
        const [aHours, aMins] = a.time.split(':').map(Number);
        const [bHours, bMins] = b.time.split(':').map(Number);
        return (aHours * 60 + aMins) - (bHours * 60 + bMins);
      });

      setTimeSlots(sortedSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Fallback to default slots
      setTimeSlots([
        { time: '09:00', display: '9:00 AM', available: true, availableStaff: 1 },
        { time: '10:00', display: '10:00 AM', available: true, availableStaff: 1 },
        { time: '11:00', display: '11:00 AM', available: true, availableStaff: 1 },
        { time: '13:00', display: '1:00 PM', available: true, availableStaff: 1 },
        { time: '14:00', display: '2:00 PM', available: true, availableStaff: 1 },
        { time: '15:00', display: '3:00 PM', available: true, availableStaff: 1 },
      ]);
    } finally {
      setSlotsLoading(false);
    }
  }, [bookingMode, groupMembers]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (date && currentStep === 1) {
      fetchAvailableTimeSlots(date);
    }
  }, [date, currentStep, fetchAvailableTimeSlots]);

  // Group booking helper functions
  const addGroupMember = () => {
    const newId = (groupMembers.length + 1).toString();
    setGroupMembers([...groupMembers, { id: newId, service: '', name: '', phone: '' }]);
  };

  const removeGroupMember = (id: string) => {
    if (groupMembers.length > 1) {
      setGroupMembers(groupMembers.filter(m => m.id !== id));
      const newStaffSelections = { ...groupStaffSelections };
      delete newStaffSelections[id];
      setGroupStaffSelections(newStaffSelections);
    }
  };

  const updateGroupMember = (id: string, field: keyof GroupMember, value: string) => {
    setGroupMembers(groupMembers.map(m =>
      m.id === id ? { ...m, [field]: field === 'phone' ? formatPhoneNumber(value) : value } : m
    ));
  };

  const updateGroupStaffSelection = (memberId: string, staffId: string) => {
    setGroupStaffSelections({ ...groupStaffSelections, [memberId]: staffId });
  };

  // Calculate group total and discount
  const calculateGroupTotal = () => {
    const validMembers = groupMembers.filter(m => m.service);
    const subtotal = validMembers.reduce((sum, m) => {
      const service = services.find(s => s.id === m.service);
      return sum + (service?.price || 0);
    }, 0);

    // Group discount: 5% for 2 people, 10% for 3+, 15% for 5+
    const count = validMembers.length;
    let discountPercent = 0;
    if (count >= 5) discountPercent = 15;
    else if (count >= 3) discountPercent = 10;
    else if (count >= 2) discountPercent = 5;

    const discount = subtotal * (discountPercent / 100);
    return { subtotal, discount, total: subtotal - discount, discountPercent, memberCount: count };
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === steps.length - 1) {
      if (bookingMode === 'group') {
        // Group booking checkout
        const { subtotal, discount, total, discountPercent, memberCount } = calculateGroupTotal();
        const validMembers = groupMembers.filter(m => m.service);

        navigate('/booking/checkout', {
          state: {
            bookingDetails: {
              booking_type: 'group',
              group_members: validMembers.map(m => ({
                service_id: m.service,
                service_name: services.find(s => s.id === m.service)?.name,
                service_price: services.find(s => s.id === m.service)?.price,
                member_name: m.name,
                member_phone: m.phone,
                staff_id: autoStaffSelection ? null : groupStaffSelections[m.id],
                staff_name: autoStaffSelection ? 'Auto-assigned' : staff.find(s => s.id === groupStaffSelections[m.id])?.name,
              })),
              appointment_date: date?.toISOString().split('T')[0],
              appointment_time: selectedTime,
              customer_name: fullName,
              customer_phone: phone,
              notes: notes,
              is_guest: isGuest,
              user_id: user?.id,
              subtotal,
              discount,
              discount_percent: discountPercent,
              total_price: total,
              member_count: memberCount,
              auto_staff: autoStaffSelection,
            },
          },
        });
      } else {
        // Individual booking checkout (supports multiple services)
        if (selectedServices.length === 0 || !date || !selectedTime) {
          toast({
            title: "Error",
            description: "Please select at least one service, date, and time before proceeding to checkout.",
            variant: "destructive",
          });
          return;
        }

        // Get all selected services data
        const selectedServicesData = selectedServices.map(id => services.find(s => s.id === id)).filter(Boolean);
        const totalPrice = calculateServicesTotal();
        const totalDuration = calculateServicesDuration();

        navigate('/booking/checkout', {
          state: {
            bookingDetails: {
              booking_type: bookingMode,
              // For multiple services, pass array
              services: selectedServicesData.map(s => ({
                id: s.id,
                name: s.name,
                price: s.price,
                duration: s.duration_minutes
              })),
              // Keep single service fields for backward compatibility
              service_id: selectedServices[0],
              service_name: selectedServicesData.map(s => s?.name).join(', '),
              service_price: totalPrice,
              total_duration: totalDuration,
              staff_id: bookingMode === 'stylist' ? selectedStaff : null,
              staff_name: bookingMode === 'stylist' ? staff.find(s => s.id === selectedStaff)?.name : null,
              appointment_date: date.toISOString().split('T')[0],
              appointment_time: selectedTime,
              customer_name: fullName,
              customer_phone: phone,
              notes: notes,
              is_guest: isGuest,
              user_id: user?.id,
            },
          },
        });
      }
    } else {
      nextStep();
    }
  };

  // Reset selections when changing booking mode
  const handleModeSelect = (mode: BookingMode) => {
    setBookingMode(mode);
    setSelectedServices([]);
    setSelectedStaff('');
    if (mode === 'group') {
      setGroupMembers([{ id: '1', service: '', name: '', phone: '' }]);
      setAutoStaffSelection(true);
      setGroupStaffSelections({});
    }
  };

  // Toggle service selection (multi-select)
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Calculate total price for selected services
  const calculateServicesTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  // Calculate total duration for selected services
  const calculateServicesDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration_minutes || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navigation />

      <div className="px-4 md:px-8 pt-20 pb-12">
        <div className="container mx-auto max-w-7xl min-h-[50vh]">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow">
              BOOK APPOINTMENT
            </h1>
          </div>

          {/* Step Indicator - Clickable with validation */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="flex items-center space-x-2 md:space-x-4">
              {steps.map((step, index) => {
                // Check if step is accessible (all previous steps completed)
                const canAccessStep = (targetStep: number): boolean => {
                  // Can always go back to previous steps
                  if (targetStep <= currentStep) return true;

                  // Check if all steps before target are valid
                  for (let i = 0; i < targetStep; i++) {
                    if (i === 0) {
                      // Step 0: Must have booking mode and selections
                      if (!bookingMode) return false;
                      if (bookingMode === 'stylist' && (!selectedStaff || selectedServices.length === 0)) return false;
                      if (bookingMode === 'service' && selectedServices.length === 0) return false;
                      if (bookingMode === 'group' && groupMembers.filter(m => m.service).length < 2) return false;
                    }
                    if (i === 1) {
                      // Step 1: Must have date and time
                      if (!date || !selectedTime) return false;
                    }
                    if (i === 2) {
                      // Step 2: Must have contact info if guest
                      if (isGuest && (!fullName.trim() || !phone.trim())) return false;
                    }
                  }
                  return true;
                };

                const isAccessible = canAccessStep(index);

                return (
                  <div key={index} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (index < currentStep) {
                          // Going back - always allowed
                          setCurrentStep(index);
                        } else if (index > currentStep && isAccessible) {
                          // Going forward - only if validated
                          setCurrentStep(index);
                        } else if (index > currentStep && !isAccessible) {
                          // Show toast for what's missing
                          toast({
                            title: "Complete previous steps",
                            description: "Please fill in the required information before proceeding.",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex flex-col items-center group"
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-semibold transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-white text-black shadow-lg shadow-white/30 cursor-pointer hover:scale-110'
                          : isAccessible
                            ? 'bg-white/40 text-white cursor-pointer hover:bg-white/60 hover:scale-105'
                            : 'bg-white/20 text-white/60 cursor-pointer hover:bg-white/30'
                      }`}>
                        {index < currentStep ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : index + 1}
                      </div>
                      <span className={`text-xs md:text-sm mt-2 text-center max-w-16 md:max-w-20 leading-tight ${
                        index <= currentStep
                          ? 'text-white font-medium'
                          : isAccessible
                            ? 'text-white/80'
                            : 'text-white/60'
                      }`}>
                        {step.title}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="flex flex-col items-center mx-2 md:mx-4">
                        <div className={`w-8 md:w-12 h-0.5 transition-all duration-700 ${index < currentStep ? 'bg-white shadow-sm' : 'bg-white/20'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleBooking} className="w-full">
            {currentStep === 0 && (
              <div className="frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-6">
                {dataLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-24 w-full bg-white/10" />
                  </div>
                ) : (
                  <>
                    {/* Booking Mode Selection */}
                    <div>
                      <label className="text-sm text-white/70 mb-3 block tracking-wider">HOW WOULD YOU LIKE TO BOOK?</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Choose by Staff */}
                        <button
                          type="button"
                          onClick={() => handleModeSelect('stylist')}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                            bookingMode === 'stylist'
                              ? 'bg-white text-black border-white shadow-lg shadow-white/20'
                              : 'bg-transparent text-white border-white/30 hover:border-white/50 hover:bg-white/5'
                          }`}
                        >
                          <User className={`h-8 w-8 mb-3 ${bookingMode === 'stylist' ? 'text-black' : 'text-white'}`} strokeWidth={1.5} />
                          <div className={`font-semibold text-lg ${bookingMode === 'stylist' ? 'text-black' : 'text-white'}`}>Choose by Staff</div>
                          <div className={`text-sm mt-1 ${bookingMode === 'stylist' ? 'text-black/60' : 'text-white/60'}`}>
                            Pick your favorite staff first
                          </div>
                        </button>

                        {/* Choose by Service */}
                        <button
                          type="button"
                          onClick={() => handleModeSelect('service')}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                            bookingMode === 'service'
                              ? 'bg-white text-black border-white shadow-lg shadow-white/20'
                              : 'bg-transparent text-white border-white/30 hover:border-white/50 hover:bg-white/5'
                          }`}
                        >
                          <Scissors className={`h-8 w-8 mb-3 ${bookingMode === 'service' ? 'text-black' : 'text-white'}`} strokeWidth={1.5} />
                          <div className={`font-semibold text-lg ${bookingMode === 'service' ? 'text-black' : 'text-white'}`}>Choose by Service</div>
                          <div className={`text-sm mt-1 ${bookingMode === 'service' ? 'text-black/60' : 'text-white/60'}`}>
                            Select the service you need
                          </div>
                        </button>

                        {/* Group Booking */}
                        <button
                          type="button"
                          onClick={() => handleModeSelect('group')}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                            bookingMode === 'group'
                              ? 'bg-white text-black border-white shadow-lg shadow-white/20'
                              : 'bg-transparent text-white border-white/30 hover:border-white/50 hover:bg-white/5'
                          }`}
                        >
                          <Users className={`h-8 w-8 mb-3 ${bookingMode === 'group' ? 'text-black' : 'text-white'}`} strokeWidth={1.5} />
                          <div className={`font-semibold text-lg ${bookingMode === 'group' ? 'text-black' : 'text-white'}`}>Group Booking</div>
                          <div className={`text-sm mt-1 ${bookingMode === 'group' ? 'text-black/60' : 'text-white/60'}`}>
                            Book for multiple people
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Staff Mode - Show Staff List and Services side by side */}
                    {bookingMode === 'stylist' && (
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT YOUR STAFF</label>
                          <div className="bg-black border border-white/30 rounded max-h-[400px] overflow-y-auto">
                            {staff.length > 0 ? (
                              staff.map(s => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setSelectedStaff(s.id)}
                                  className={`w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 ${selectedStaff === s.id ? 'bg-white/20 text-white' : 'text-white/80'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    {selectedStaff === s.id && <Check className="h-4 w-4 text-green-400 flex-shrink-0" />}
                                    <div
                                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                      style={{ backgroundColor: s.color }}
                                    >
                                      {s.name?.charAt(0)}
                                    </div>
                                    <div className="font-medium">{s.name}</div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center text-white/50">No staff available</div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT SERVICES (choose multiple)</label>
                          <div className={`bg-black border border-white/30 rounded max-h-[400px] overflow-y-auto ${!selectedStaff ? 'opacity-50 pointer-events-none' : ''}`}>
                            {services.length > 0 ? (
                              services.map(service => (
                                <button
                                  key={service.id}
                                  type="button"
                                  onClick={() => toggleServiceSelection(service.id)}
                                  className={`w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 ${selectedServices.includes(service.id) ? 'bg-white/20 text-white' : 'text-white/80'}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 flex items-center gap-2">
                                      {selectedServices.includes(service.id) && <Check className="h-4 w-4 text-green-400 flex-shrink-0" />}
                                      <div>
                                        <div className="font-medium">{service.name}</div>
                                        <div className="text-sm text-white/60">${service.price} • {service.duration_minutes} min</div>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-white/50">No services available</div>
                              )}
                            </div>
                          {selectedServices.length > 0 && (
                            <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex justify-between text-white text-sm">
                                <span>{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected</span>
                                <span className="font-semibold">${calculateServicesTotal().toFixed(2)} • {calculateServicesDuration()} min</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Service Mode - Show Services List (Multiple Selection) */}
                    {bookingMode === 'service' && (
                      <div>
                        <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT SERVICES (choose multiple)</label>
                        <div className="bg-black border border-white/30 rounded max-h-[400px] overflow-y-auto">
                          {services.length > 0 ? (
                            services.map(service => (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => toggleServiceSelection(service.id)}
                                className={`w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 ${selectedServices.includes(service.id) ? 'bg-white/20 text-white' : 'text-white/80'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 flex items-center gap-2">
                                    {selectedServices.includes(service.id) && <Check className="h-4 w-4 text-green-400 flex-shrink-0" />}
                                    <div>
                                      <div className="font-medium">{service.name}</div>
                                      <div className="text-sm text-white/60">${service.price} • {service.duration_minutes} min</div>
                                    </div>
                                  </div>
                                  {service.description && (
                                    <Info className="h-4 w-4 text-white/60 hover:text-white" title="Service details available" />
                                  )}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-white/50">No services available</div>
                          )}
                        </div>
                        {selectedServices.length > 0 && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex justify-between text-white text-sm">
                              <span>{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected</span>
                              <span className="font-semibold">${calculateServicesTotal().toFixed(2)} • {calculateServicesDuration()} min</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Group Mode - Add People & Services */}
                    {bookingMode === 'group' && (
                      <>
                        {/* Auto Staff Toggle */}
                        <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-white/20">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-400" />
                            <div>
                              <div className="text-white text-sm font-medium">Fastest Booking</div>
                              <div className="text-white/80 text-xs">Auto-assign stylists for quickest availability</div>
                            </div>
                          </div>
                          <Switch
                            checked={autoStaffSelection}
                            onCheckedChange={setAutoStaffSelection}
                          />
                        </div>

                        {/* Group Members */}
                        <div className="space-y-4">
                          <label className="text-sm text-white block tracking-wider">GROUP MEMBERS</label>

                          {groupMembers.map((member, index) => (
                            <div key={member.id} className="bg-black rounded-lg p-4 border border-white/20 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">Person {index + 1} {index === 0 && '(You)'}</span>
                                {groupMembers.length > 1 && index > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGroupMember(member.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              {/* Service Selection */}
                              <div>
                                <label className="text-xs text-white block mb-1">Service *</label>
                                <select
                                  value={member.service}
                                  onChange={(e) => updateGroupMember(member.id, 'service', e.target.value)}
                                  className="w-full bg-black border border-white/30 rounded p-2 text-white text-sm focus:outline-none focus:border-white/60 [&>option]:bg-black [&>option]:text-white"
                                  style={{ backgroundColor: '#000000' }}
                                >
                                  <option value="" className="bg-black text-white/70">Select a service...</option>
                                  {services.map(s => (
                                    <option key={s.id} value={s.id} className="bg-black text-white">{s.name} - ${s.price}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Staff Selection (if not auto) */}
                              {!autoStaffSelection && (
                                <div>
                                  <label className="text-xs text-white block mb-1">Preferred Stylist</label>
                                  <select
                                    value={groupStaffSelections[member.id] || ''}
                                    onChange={(e) => updateGroupStaffSelection(member.id, e.target.value)}
                                    className="w-full bg-black border border-white/30 rounded p-2 text-white text-sm focus:outline-none focus:border-white/60 [&>option]:bg-black [&>option]:text-white"
                                    style={{ backgroundColor: '#000000' }}
                                  >
                                    <option value="" className="bg-black text-white/70">Any available stylist</option>
                                    {staff.map(s => (
                                      <option key={s.id} value={s.id} className="bg-black text-white">{s.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Add Another Person */}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addGroupMember}
                            className="w-full border-dashed border-white/30 text-white/70 hover:text-white hover:bg-white/5"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Another Person
                          </Button>
                        </div>

                        {/* Group Total */}
                        {groupMembers.some(m => m.service) && (
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            {(() => {
                              const { subtotal, discount, total, discountPercent, memberCount } = calculateGroupTotal();
                              return (
                                <>
                                  <div className="flex justify-between text-white text-sm mb-1">
                                    <span>Subtotal ({memberCount} {memberCount === 1 ? 'person' : 'people'})</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                  </div>
                                  {discountPercent > 0 && (
                                    <div className="flex justify-between text-green-400 text-sm mb-1">
                                      <span>Group Discount ({discountPercent}%)</span>
                                      <span>-${discount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-white font-medium text-lg pt-2 border-t border-white/10">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <Button type="button" onClick={prevStep} disabled={currentStep === 0} variant="outline" className="opacity-50 cursor-not-allowed">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <Button type="button" onClick={nextStep} className="luxury-button-hover" disabled={!bookingMode}>
                    Next Step <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-4">
                {/* Show parallel booking info for groups */}
                {bookingMode === 'group' && (
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 p-2 rounded">
                    <Zap className="h-4 w-4" />
                    <span>All services happen simultaneously for fastest experience</span>
                  </div>
                )}

                {/* Horizontal layout: Calendar on left, Time slots on right */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Calendar Section */}
                  <div className="flex-shrink-0">
                    <div className="bg-black border border-white/30 rounded-lg p-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="rounded-md border-0 bg-transparent text-white [&_[data-selected]]:bg-white [&_[data-selected]]:text-black [&_[data-selected]]:rounded-lg [&_[data-selected]]:font-semibold"
                        classNames={{
                          day_outside: "text-white/50 hover:text-white hover:bg-white/10",
                          day_today: "bg-white text-black font-semibold shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-md",
                          day: "hover:bg-white/10 focus:bg-white/20 rounded-md transition-all duration-200",
                        }}
                      />
                      <div className="text-center mt-2 text-sm text-white/70">Select your appointment date</div>
                    </div>
                  </div>

                  {/* Time Slots Section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <Clock className="h-4 w-4" />
                      <span>Available Times</span>
                    </div>
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                        <span className="ml-2 text-white/50">Loading availability...</span>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1">
                        {timeSlots.map(slot => (
                          <Button
                            key={slot.time}
                            type="button"
                            onClick={() => slot.available && setSelectedTime(slot.display)}
                            variant={selectedTime === slot.display ? "default" : "outline"}
                            disabled={!slot.available}
                            className={`py-2 px-3 text-sm ${
                              !slot.available
                                ? 'opacity-40 cursor-not-allowed line-through'
                                : selectedTime === slot.display
                                  ? 'bg-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.6)] border-white hover:bg-white hover:text-black'
                                  : 'micro-hover-scale'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <span className={selectedTime === slot.display ? 'text-black' : ''}>{slot.display}</span>
                              {slot.available && slot.availableStaff <= 2 && (
                                <span className={`text-xs ${selectedTime === slot.display ? 'text-black/70' : 'text-yellow-400'}`}>
                                  {slot.availableStaff} left
                                </span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/50">
                        No available slots for this date. Please select another date.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <Button type="button" onClick={prevStep} variant="outline" className="luxury-button-hover">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <Button type="button" onClick={nextStep} className="luxury-button-hover">
                    Next Step <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-4">
                {/* Horizontal layout for contact fields */}
                <div className="flex flex-col md:flex-row gap-6">
                  {isGuest ? (
                    <>
                      <div className="flex-1">
                        <label htmlFor="guest-fullname" className="text-sm text-white/70 mb-2 block tracking-wider">
                          {bookingMode === 'group' ? 'LEAD BOOKER NAME' : 'FULL NAME'}
                        </label>
                        <Input
                          id="guest-fullname"
                          name="fullname"
                          type="text"
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="bg-black border-white/30 text-white placeholder:text-white/50 input-focus-glow"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="guest-phone" className="text-sm text-white/70 mb-2 block tracking-wider">PHONE NUMBER</label>
                        <Input
                          id="guest-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="(555) 000-0000 - We'll text confirmation"
                          className="bg-black border-white/30 text-white placeholder:text-white/50 input-focus-glow"
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <label htmlFor="user-email" className="text-sm text-white/70 mb-2 block tracking-wider">CONTACT EMAIL</label>
                        <Input
                          id="user-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={user?.email || 'Not available'}
                          placeholder="your@email.com"
                          className="bg-black border-white/30 text-white placeholder:text-white/50 input-focus-glow"
                          disabled
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="user-phone" className="text-sm text-white/70 mb-2 block tracking-wider">PHONE (Optional)</label>
                        <Input
                          id="user-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="(555) 000-0000"
                          className="bg-black border-white/30 text-white placeholder:text-white/50 input-focus-glow"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex-1">
                    <label htmlFor="special-requests" className="text-sm text-white/70 mb-2 block tracking-wider">SPECIAL REQUESTS</label>
                    <Textarea
                      id="special-requests"
                      name="special-requests"
                      autoComplete="off"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requirements..."
                      className="bg-black border-white/30 text-white placeholder:text-white/50 min-h-[80px] input-focus-glow"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <Button type="button" onClick={prevStep} variant="outline" className="luxury-button-hover">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <Button type="button" onClick={nextStep} className="luxury-button-hover">
                    Next Step <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-4">
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-serif luxury-glow mb-4">
                    {bookingMode === 'group' ? 'Group Booking Summary' : 'Booking Summary'}
                  </h3>
                </div>

                {/* Horizontal layout for review */}
                <div className="flex flex-col md:flex-row gap-6">
                  {bookingMode === 'group' ? (
                    // Group Booking Summary - Left side
                    <div className="flex-1 space-y-3">
                      {/* Group Members */}
                      <div className="space-y-2">
                        {groupMembers.filter(m => m.service).map((member, index) => {
                          const service = services.find(s => s.id === member.service);
                          const staffMember = !autoStaffSelection && groupStaffSelections[member.id]
                            ? staff.find(s => s.id === groupStaffSelections[member.id])
                            : null;
                          return (
                            <div key={member.id} className="flex justify-between items-center py-2 border-b border-white/10">
                              <div>
                                <span className="text-white">{member.name || `Person ${index + 1}`}</span>
                                <div className="text-sm text-white/80">
                                  {service?.name}
                                  {staffMember && ` • ${staffMember.name}`}
                                  {autoStaffSelection && ' • Auto-assigned'}
                                </div>
                              </div>
                              <span className="text-white">${service?.price}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Date & Time */}
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white">Date:</span>
                        <span className="text-white">{date ? date.toLocaleDateString() : 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white">Time:</span>
                        <span className="text-white">{selectedTime || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white">Scheduling:</span>
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Zap className="h-3 w-3" /> All services simultaneous
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Individual Booking Summary - Left side
                    <div className="flex-1 space-y-3">
                      {/* Services List */}
                      <div className="py-2 border-b border-white/10">
                        <span className="text-white/70 block mb-2">Services:</span>
                        {selectedServices.length > 0 ? (
                          <div className="space-y-1">
                            {selectedServices.map(serviceId => {
                              const service = services.find(s => s.id === serviceId);
                              return (
                                <div key={serviceId} className="flex justify-between text-white text-sm">
                                  <span>{service?.name}</span>
                                  <span>${service?.price} • {service?.duration_minutes} min</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-white">Not selected</span>
                        )}
                      </div>
                      {bookingMode === 'stylist' && selectedStaff && (
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="text-white/70">Staff:</span>
                          <span className="text-white">{staff.find(s => s.id === selectedStaff)?.name || 'Not selected'}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Date:</span>
                        <span className="text-white">{date ? date.toLocaleDateString() : 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Time:</span>
                        <span className="text-white">{selectedTime || 'Not selected'}</span>
                      </div>
                    </div>
                  )}

                  {/* Right side - Totals and Actions */}
                  <div className="flex-1 space-y-4">
                    {bookingMode === 'group' ? (
                      (() => {
                        const { subtotal, discount, total, discountPercent, memberCount } = calculateGroupTotal();
                        return (
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="flex justify-between text-white text-sm mb-1">
                              <span>Subtotal ({memberCount} {memberCount === 1 ? 'person' : 'people'})</span>
                              <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {discountPercent > 0 && (
                              <div className="flex justify-between text-green-400 text-sm mb-1">
                                <span>Group Discount ({discountPercent}%)</span>
                                <span>-${discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-white font-medium text-lg pt-2 border-t border-white/10">
                              <span>Total</span>
                              <span>${total.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="bg-white/5 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center text-white">
                          <span className="text-white/70">Total Duration:</span>
                          <span>{calculateServicesDuration()} min</span>
                        </div>
                        <div className="flex justify-between items-center text-white font-medium text-lg pt-2 border-t border-white/10">
                          <span>Total Price:</span>
                          <span>${calculateServicesTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
                        {bookingMode === 'group' ? 'Proceed to Group Checkout' : 'Complete Booking'}
                      </Button>
                      <div className="text-center text-white/60 text-sm mt-4">
                        {bookingMode === 'group'
                          ? '50% deposit required to confirm group booking'
                          : 'Your booking will be confirmed shortly'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <Button type="button" onClick={prevStep} variant="outline" className="luxury-button-hover">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
