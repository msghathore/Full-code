import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppointmentNotifications } from '@/hooks/use-appointment-notifications';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { ChevronLeft, ChevronRight, RefreshCw, Clock, Calendar as CalendarIcon, Info, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileWalletPayment } from '@/components/MobileWalletPayment';
import { StripeProvider } from '@/components/StripeProvider';
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { ServiceRecommendations } from '@/components/ServiceRecommendations';
import { CalendarSync } from '@/components/CalendarSync';
import { useGoogleCalendarAvailability } from '@/hooks/use-google-calendar-availability';
import EmailService from '@/lib/email-service';

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('booking-current-step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [date, setDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem('booking-date');
    return saved ? new Date(saved) : new Date();
  });
  const [selectedService, setSelectedService] = useState(() => {
    return localStorage.getItem('booking-selected-service') || '';
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
  const [selectionMode, setSelectionMode] = useState<'service' | 'staff'>(() => {
    return (localStorage.getItem('booking-selection-mode') as 'service' | 'staff') || 'service';
  });
  const [serviceSearch, setServiceSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [showServiceInfo, setShowServiceInfo] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();
  const { scheduleReminder, scheduleConfirmation } = useAppointmentNotifications();
  const { availability, getAvailableSlots, getTimeAgo, refreshAvailability } = useGoogleCalendarAvailability(date, selectedStaff);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');

    // Don't format if empty
    if (!phoneNumber) return '';

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return `(${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  // Handle phone number input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Persist booking state to localStorage
  useEffect(() => {
    localStorage.setItem('booking-current-step', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    if (date) {
      localStorage.setItem('booking-date', date.toISOString());
    }
  }, [date]);

  useEffect(() => {
    localStorage.setItem('booking-selected-service', selectedService);
  }, [selectedService]);

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
    localStorage.setItem('booking-selection-mode', selectionMode);
  }, [selectionMode]);

  // Service-Staff mapping (using actual service UUIDs from database)
  const serviceStaffMapping: { [key: string]: string[] } = {
    'e73690f5-2298-4389-ba5d-96bb50b0d8f1': ['mock-staff-1'], // Hair Cut & Style
    '5eb132f2-2477-40cb-9bcf-b29779af2cdc': ['mock-staff-2'], // Hair Color
    '18ce1259-0794-473a-97c1-33dc5ef1eb93': ['mock-staff-3'], // Manicure
    'da9bb5f7-cb92-4fc5-94a6-6efc667145301': ['mock-staff-4'], // Tattoo
    '50991820-9300-437c-8a29-940ee57113f3': ['mock-staff-5'], // Piercing
    'eba9daa6-c55b-4fa3-ba87-0674bbd6d7719': ['mock-staff-6'], // Facial
    '2e37f523-aa3e9-4e40-a09a-5e16fcd6bd53': ['mock-staff-7'], // Massage
    'c86af1b9-3d9e-42ec-98cb-d2e3ee47edb8': ['mock-staff-8'], // Waxing
    '19f54e5c-f287-4ed6-a083-de86556698df1': ['mock-staff-9'], // Pedicure
  };

  // Staff-Service mapping (simplified for now since staff table doesn't exist)
  const staffServiceMapping: { [key: string]: string[] } = {
    'mock-staff-1': ['e73690f5-2298-4389-ba5d-96bb50b0d8f1'], // Hair Stylist
    'mock-staff-2': ['5eb132f2-2477-40cb-9bcf-b29779af2cdc'], // Color Specialist
    'mock-staff-3': ['18ce1259-0794-473a-97c1-33dc5ef1eb93'], // Nail Technician
    'mock-staff-4': ['da9bb5f7-cb92-4fc5-94a6-6efc667145301'], // Tattoo Artist
    'mock-staff-5': ['50991820-9300-437c-8a29-940ee57113f3'], // Piercing Specialist
    'mock-staff-6': ['eba9daa6-c55b-4fa3-ba87-0674bbd6d7719'], // Esthetician
    'mock-staff-7': ['2e37f523-aa3e9-4e40-a09a-5e16fcd6bd53'], // Massage Therapist
    'mock-staff-8': ['c86af1b9-3d9e-42ec-98cb-d2e3ee47edb8'], // Waxing Specialist
    'mock-staff-9': ['19f54e5c-f287-4ed6-a083-de86556698df1'], // Pedicure Specialist
  };

  const steps = [
    { title: selectionMode === 'service' ? 'Choose Service' : 'Choose Stylist', description: selectionMode === 'service' ? 'Select your desired service' : 'Select your preferred stylist' },
    { title: 'Date & Time', description: 'Select appointment date and time' },
    { title: 'Contact Info', description: 'Provide your contact details' },
    { title: 'Review & Confirm', description: 'Review your booking details and confirm' },
  ];

  // Handle service selection
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    
    if (selectionMode === 'service' && serviceId) {
      const availableStaffIds = serviceStaffMapping[serviceId] || [];
      if (availableStaffIds.length === 1) {
        // Auto-select if only one staff member available for this service
        setSelectedStaff(availableStaffIds[0]);
      }
    }
  };

  // Handle staff selection
  const handleStaffChange = (staffId: string) => {
    setSelectedStaff(staffId);
    
    if (selectionMode === 'staff' && staffId) {
      const availableServices = staffServiceMapping[staffId] || [];
      if (availableServices.length === 1) {
        // Auto-select if only one service available for this staff member
        setSelectedService(availableServices[0]);
      }
    }
  };

  // Auto-select today's date and earliest available time on component load
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    setDate(today);
    
    // Auto-select earliest available time after component loads
    setTimeout(() => {
      if (availability.slots.length > 0) {
        const availableSlots = availability.slots.filter(slot => slot.available);
        if (availableSlots.length > 0) {
          setSelectedTime(availableSlots[0].time);
        }
      }
    }, 500); // Delay to ensure availability data is loaded
  }, []);

  // Auto-select earliest available time when availability changes
  useEffect(() => {
    if (!selectedTime && availability.slots.length > 0) {
      const availableSlots = availability.slots.filter(slot => slot.available);
      if (availableSlots.length > 0) {
        setSelectedTime(availableSlots[0].time);
      }
    }
  }, [availability.slots, selectedTime]);

  // Handle date selection and auto-select shortest available time
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      
      // Auto-select the shortest available time after date change
      setTimeout(() => {
        if (availability.slots.length > 0) {
          const availableSlots = availability.slots.filter(slot => slot.available);
          if (availableSlots.length > 0) {
            // Select the earliest available time
            setSelectedTime(availableSlots[0].time);
          }
        }
      }, 100); // Small delay to ensure availability is loaded
    }
  };

  // Filter staff based on selection mode and search
  const getFilteredStaff = () => {
    let filtered = staff;

    // Filter by selection mode
    if (selectionMode === 'service' && selectedService) {
      const availableStaffIds = serviceStaffMapping[selectedService] || [];
      filtered = staff.filter(member => availableStaffIds.includes(member.id));
    }

    // Filter by search term
    if (staffSearch.trim()) {
      const searchLower = staffSearch.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.specialty?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  // Filter services based on selection mode and search
  const getFilteredServices = () => {
    let filtered = services;

    // Filter by selection mode
    if (selectionMode === 'staff' && selectedStaff) {
      const availableServices = staffServiceMapping[selectedStaff] || [];
      filtered = services.filter(service => availableServices.includes(service.id));
    }

    // Filter by search term
    if (serviceSearch.trim()) {
      const searchLower = serviceSearch.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };


  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      // Validation for each step
      if (currentStep === 0) {
        // Step 1: Service selection validation
        if (!selectedService) {
          toast({
            title: "Service Required",
            description: "Please select a service before proceeding.",
            variant: "destructive",
          });
          return;
        }
      } else if (currentStep === 1) {
        // Step 2: Date & Time validation
        if (!date || !selectedTime) {
          toast({
            title: "Date & Time Required",
            description: "Please select a date and time before proceeding.",
            variant: "destructive",
          });
          return;
        }
      } else if (currentStep === 2) {
        // Step 3: Contact Info validation
        if (isGuest) {
          if (!fullName.trim() || !phone.trim()) {
            toast({
              title: "Contact Info Required",
              description: "Please provide your full name and phone number before proceeding.",
              variant: "destructive",
            });
            return;
          }
        }
      }

      setCurrentStep(currentStep + 1);
      // Scroll to top of the booking section when changing steps
      setTimeout(() => {
        const bookingSection = document.querySelector('.pt-32');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top of the booking section when changing steps
      setTimeout(() => {
        const bookingSection = document.querySelector('.pt-32');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile) nextStep();
    },
    onSwipedRight: () => {
      if (isMobile) prevStep();
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  const handlePaymentSuccess = (paymentMethod: any) => {
    // Handle successful payment
    console.log('Payment successful:', paymentMethod);
    // Proceed with booking
    handleBooking({ preventDefault: () => {} } as any);
  };

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment failed",
      description: error.message || "There was an error processing your payment.",
      variant: "destructive",
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setIsGuest(false);
        } else {
          setIsGuest(true);
        }

        // Fetch services from database
        await fetchServices();
        await fetchStaff();
      } catch (error) {
        console.error('Error initializing booking page:', error);
        // Set defaults on error
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
      // Fallback mock services including virtual consultation
      const mockServices = [
        { id: '1', name: 'Hair Cut & Style', price: 75, description: 'Professional haircut and styling' },
        { id: '2', name: 'Hair Color', price: 120, description: 'Full hair coloring service' },
        { id: '3', name: 'Facial Treatment', price: 95, description: 'Deep cleansing facial' },
        { id: '4', name: 'Manicure', price: 45, description: 'Classic manicure service' },
        { id: '5', name: 'Massage', price: 85, description: 'Relaxing full body massage' },
        { id: '6', name: 'Virtual Consultation', price: 50, description: 'Online video consultation with our experts', is_virtual: true }
      ];
      setServices(mockServices);
    } else {
      // Add virtual consultation if not in database
      const hasVirtual = data?.some(s => s.name === 'Virtual Consultation');
      if (!hasVirtual) {
        data?.push({
          id: 'virtual-1',
          name: 'Virtual Consultation',
          price: 50,
          description: 'Online video consultation with our experts',
          category: 'consultation',
          duration_minutes: 60,
          is_active: true,
          created_at: new Date().toISOString(),
          image_url: '/images/virtual-consultation.jpg'
        });
      }
      setServices(data || []);
    }
  };

  const fetchStaff = async () => {
    console.log('🔍 DEBUG: Starting fetchStaff');
    try {
      console.log('🔍 DEBUG: Attempting to fetch staff from database');
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('status', 'available');

      if (error) {
        console.error('❌ ERROR: Error fetching staff from database:', error);
        console.log('🔄 DEBUG: Falling back to mock staff data');
        
        // Create mock staff data that matches our service-staff mapping
        const mockStaff = [
          { id: 'mock-staff-1', name: 'Sarah Johnson', specialty: 'Hair Stylist' },
          { id: 'mock-staff-2', name: 'Lisa Anderson', specialty: 'Color Specialist' },
          { id: 'mock-staff-3', name: 'Michael Chen', specialty: 'Nail Technician' },
          { id: 'mock-staff-4', name: 'Alex Rivera', specialty: 'Tattoo Artist' },
          { id: 'mock-staff-5', name: 'Jordan Taylor', specialty: 'Piercing Specialist' },
          { id: 'mock-staff-6', name: 'Emma Williams', specialty: 'Esthetician' },
          { id: 'mock-staff-7', name: 'David Martinez', specialty: 'Massage Therapist' },
          { id: 'mock-staff-8', name: 'Amanda Davis', specialty: 'Waxing Specialist' },
          { id: 'mock-staff-9', name: 'Rachel Green', specialty: 'Pedicure Specialist' },
        ];
        setStaff(mockStaff);
        console.log('✅ DEBUG: Mock staff data loaded:', mockStaff);
      } else {
        console.log('✅ DEBUG: Successfully fetched staff from database:', data);
        setStaff(data || []);
      }
    } catch (error) {
      console.error('❌ ERROR: Exception in fetchStaff:', error);
      console.log('🔄 DEBUG: Falling back to mock staff data due to exception');
      // Fallback to mock data on any error
      const mockStaff = [
        { id: 'mock-staff-1', name: 'Sarah Johnson', specialty: 'Hair Stylist' },
        { id: 'mock-staff-2', name: 'Lisa Anderson', specialty: 'Color Specialist' },
        { id: 'mock-staff-3', name: 'Michael Chen', specialty: 'Nail Technician' },
        { id: 'mock-staff-4', name: 'Alex Rivera', specialty: 'Tattoo Artist' },
        { id: 'mock-staff-5', name: 'Jordan Taylor', specialty: 'Piercing Specialist' },
        { id: 'mock-staff-6', name: 'Emma Williams', specialty: 'Esthetician' },
        { id: 'mock-staff-7', name: 'David Martinez', specialty: 'Massage Therapist' },
        { id: 'mock-staff-8', name: 'Amanda Davis', specialty: 'Waxing Specialist' },
        { id: 'mock-staff-9', name: 'Rachel Green', specialty: 'Pedicure Specialist' },
      ];
      setStaff(mockStaff);
      console.log('✅ DEBUG: Exception fallback - Mock staff data loaded:', mockStaff);
    }

    // Check for service parameter in URL
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      console.log('🔗 DEBUG: Service parameter found in URL:', serviceParam);
      setSelectedService(serviceParam);
    } else {
      console.log('🔗 DEBUG: No service parameter found in URL');
    }

    setDataLoading(false);
    console.log('✅ DEBUG: fetchStaff completed, dataLoading set to false');
  };

  // Only trigger booking when user actually clicks confirm (on step 4)
  const confirmBooking = async () => {
    console.log('📝 DEBUG: User clicked CONFIRM BOOKING button');

    const requiredFields = [date, selectedService, selectedTime];

    const missingFields = requiredFields.filter(field => !field);
    console.log('📋 DEBUG: Required fields check:', { requiredFields, missingFields, isGuest });

    if (missingFields.length > 0) {
      console.error('❌ ERROR: Missing required fields:', missingFields);
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log('⏳ DEBUG: Setting loading to true');
    setLoading(true);

    try {
      console.log('🔍 DEBUG: Processing booking data...');
      const selectedServiceData = services.find(s => s.id === selectedService);
      console.log('📦 DEBUG: Selected service data:', selectedServiceData);

      // Build booking data with ONLY the fields that definitely exist in the database
      const bookingData: any = {
        service_id: selectedService,
        appointment_date: date.toISOString().split('T')[0],
        appointment_time: selectedTime,
        status: 'pending',
        payment_status: 'pending'
      };

      // Only add fields that we know exist - keeping it minimal for guest booking
      if (notes?.trim()) bookingData.notes = notes;
      if (selectedServiceData?.price) {
        bookingData.total_amount = selectedServiceData.price;
        bookingData.deposit_amount = selectedServiceData.price * 0.2;
      }

      // REMOVED: staff_id field doesn't exist in database table
      // if (selectedStaff?.trim()) {
      //   bookingData.staff_id = selectedStaff;
      // }

      if (!isGuest && user) {
        bookingData.user_id = user.id;
        console.log('👤 DEBUG: User booking detected:', user.id);
      } else {
        console.log('👤 DEBUG: Guest booking detected');
      }

      console.log('💾 DEBUG: Prepared booking data (email removed):', JSON.stringify(bookingData, null, 2));

      // Try the insertion
      const { data: insertResult, error } = await supabase
        .from('appointments')
        .insert(bookingData)
        .select();

      if (error) {
        console.error('❌ DATABASE ERROR:', error);
        throw error;
      }

      console.log('✅ DEBUG: Booking successfully saved to database:', insertResult);

      // Send appointment confirmation email
      try {
        const customerEmail = EmailService.extractEmail({
          email: user?.email,
          fullName: fullName
        });
        const customerName = EmailService.extractCustomerName({
          fullName: fullName,
          user: user
        });

        if (customerEmail && selectedServiceData) {
          const staffMember = staff.find(s => s.id === selectedStaff);
          
          const emailResult = await EmailService.sendAppointmentConfirmation({
            customerEmail: customerEmail,
            customerName: customerName || undefined,
            serviceName: selectedServiceData.name,
            appointmentDate: date.toISOString().split('T')[0],
            appointmentTime: selectedTime,
            staffName: staffMember?.name
          });

          if (emailResult.success) {
            console.log('📧 Confirmation email sent successfully');
            toast({
              title: "✅ Booking Confirmed!",
              description: "Confirmation email sent to your inbox.",
              duration: 5000,
            });
          } else {
            console.warn('⚠️ Failed to send confirmation email:', emailResult.error);
          }
        }
      } catch (emailError) {
        console.warn('⚠️ Email sending failed (non-critical):', emailError);
        // Don't fail the booking if email fails
      }

      // Schedule notifications
      const notificationServiceData = services.find(s => s.id === selectedService);
      const appointmentDateTime = `${date.toISOString().split('T')[0]}T${selectedTime}`;

      console.log('🔔 DEBUG: Scheduling notifications...');
      scheduleConfirmation(
        `booking-${Date.now()}`,
        notificationServiceData?.name || 'Service',
        appointmentDateTime
      );

      scheduleReminder(
        `booking-${Date.now()}`,
        notificationServiceData?.name || 'Service',
        appointmentDateTime,
        24 // 24 hours before
      );

      console.log('🎉 DEBUG: Showing success toast...');
      toast({
        title: "Booking confirmed!",
        description: "Your appointment has been scheduled successfully.",
      });

      // Reset form (keep localStorage for user to see their booking history)
      console.log('🔄 DEBUG: Resetting form...');
      setSelectedService('');
      setSelectedStaff('');
      setSelectedTime('');
      setFullName('');
      setPhone('');
      setNotes('');
      setDate(new Date());
      setCurrentStep(0);

      console.log('✅ DEBUG: Booking process completed successfully');
    } catch (error: any) {
      console.error('❌ ERROR: Exception in confirmBooking:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing your booking.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 DEBUG: Setting loading to false');
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 DEBUG: Form submission detected - moving to next step or confirming');

    if (currentStep === steps.length - 1) {
      console.log('📝 DEBUG: User is on confirmation step - navigating to checkout');
      const selectedServiceData = services.find(s => s.id === selectedService);

      if (!selectedServiceData || !date || !selectedTime) {
        toast({
          title: "Error",
          description: "Please select a service, date, and time before proceeding to checkout.",
          variant: "destructive",
        });
        return;
      }

      navigate('/booking/checkout', {
        state: {
          bookingDetails: {
            service_id: selectedService,
            service_name: selectedServiceData.name,
            service_price: selectedServiceData.price,
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
    } else {
      console.log('📝 DEBUG: User moving to next step - no booking yet');
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navigation />

      {/* Sticky Booking Navigation */}
      {currentStep > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/10 p-4">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: steps.length }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                variant="cta"
                className="font-serif text-base md:text-lg tracking-wider"
              >
                {loading ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="px-4 md:px-8 pt-32 pb-24">
        <div className="container mx-auto max-w-6xl min-h-[70vh]">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4">
              BOOK APPOINTMENT
            </h1>
            <p className="text-muted-foreground text-base md:text-lg tracking-wider">
              {isGuest ? "Book as a guest - No account required" : "Reserve your luxurious experience"}
            </p>
          </div>

          {/* Selection Mode Toggle */}
          {currentStep === 0 && (
            <div className="flex justify-center mb-8">
              <div className="frosted-glass border border-white/10 rounded-lg p-2 inline-flex">
                <Button
                  type="button"
                  onClick={() => setSelectionMode('service')}
                  variant={selectionMode === 'service' ? 'default' : 'ghost'}
                  className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                    selectionMode === 'service'
                      ? 'bg-white text-black shadow-lg shadow-white/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Choose by Service
                </Button>
                <Button
                  type="button"
                  onClick={() => setSelectionMode('staff')}
                  variant={selectionMode === 'staff' ? 'default' : 'ghost'}
                  className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                    selectionMode === 'staff'
                      ? 'bg-white text-black shadow-lg shadow-white/30'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Choose by Stylist
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Step Indicator */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="flex items-center space-x-2 md:space-x-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-semibold transition-all duration-500 micro-hover-scale ${
                        index <= currentStep
                          ? 'bg-white text-black shadow-lg shadow-white/30'
                          : 'bg-white/20 text-white/60 hover:bg-white/30'
                      }`}
                    >
                      {index < currentStep ? (
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs md:text-sm mt-2 text-center max-w-16 md:max-w-20 leading-tight ${
                      index <= currentStep ? 'text-white font-medium' : 'text-white/60'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex flex-col items-center mx-2 md:mx-4">
                      <div
                        className={`w-8 md:w-12 h-0.5 transition-all duration-700 ${
                          index < currentStep ? 'bg-white shadow-sm' : 'bg-white/20'
                        }`}
                      />
                      <div className="text-xs text-white/40 mt-1">
                        {index < currentStep ? '✓' : ''}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>


          {/* Step Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif luxury-glow mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/70 text-sm md:text-base">
              {steps[currentStep].description}
            </p>
          </div>

          <form onSubmit={handleBooking}>
            <div {...swipeHandlers} className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentStep * 100}%)` }}
              >
                {/* Step 1: Service & Staff */}
                <div className="w-full flex-shrink-0 px-4 md:px-0">
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-1">
                    {dataLoading ? (
                      <div className="space-y-6">
                        <Skeleton className="h-4 w-32 mb-2 bg-white/10" />
                        <Skeleton className="h-12 w-full bg-white/10" />
                        <Skeleton className="h-4 w-32 mb-2 bg-white/10" />
                        <Skeleton className="h-12 w-full bg-white/10" />
                      </div>
                    ) : (
                      <>
                        {selectionMode === 'service' ? (
                          <div className="space-y-1">
                            <div>
                              <label className="text-sm text-white/70 mb-2 block tracking-wider">SEARCH SERVICES</label>
                              <Input
                                type="text"
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                placeholder="Search services..."
                                className="bg-black/50 border-white/20 text-white placeholder:text-white/30 input-focus-glow"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-white/70 mb-2 block tracking-wider">AVAILABLE SERVICES</label>
                              <div className="bg-black/50 border border-white/20 rounded max-h-60 overflow-y-auto">
                                {getFilteredServices().length > 0 ? (
                                  getFilteredServices().map(service => (
                                    <div key={service.id} className="border-b border-white/10 last:border-b-0">
                                      <button
                                        type="button"
                                        onClick={() => handleServiceChange(service.id)}
                                        className={`w-full text-left p-3 hover:bg-white/10 transition-colors ${
                                          selectedService === service.id ? 'bg-white/20 text-white' : 'text-white/80'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1 flex items-center gap-2">
                                            {selectedService === service.id && (
                                              <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                            )}
                                            <div>
                                              <div className="font-medium">{service.name}</div>
                                              <div className="text-sm text-white/60">${service.price}</div>
                                            </div>
                                          </div>
                                          {service.description && (
                                            <div
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setShowServiceInfo(showServiceInfo === service.id ? null : service.id);
                                              }}
                                              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
                                              title="Show service details"
                                            >
                                              <Info className="h-4 w-4 text-white/60 hover:text-white" />
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                      {showServiceInfo === service.id && service.description && (
                                        <div className="px-3 pb-3 text-xs text-white/70 bg-black/30 rounded-b">
                                          {service.description}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-white/50">
                                    No services found matching "{serviceSearch}"
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-white/50 mt-1">
                                We'll automatically assign the best available stylist for your service
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div>
                              <label className="text-sm text-white/70 mb-2 block tracking-wider">SEARCH STYLISTS</label>
                              <Input
                                type="text"
                                value={staffSearch}
                                onChange={(e) => setStaffSearch(e.target.value)}
                                placeholder="Search stylists..."
                                className="bg-black/50 border-white/20 text-white placeholder:text-white/30 input-focus-glow"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-white/70 mb-2 block tracking-wider">AVAILABLE STYLISTS</label>
                              <div className="bg-black/50 border border-white/20 rounded max-h-60 overflow-y-auto">
                                {getFilteredStaff().length > 0 ? (
                                  getFilteredStaff().map(member => (
                                    <button
                                      key={member.id}
                                      type="button"
                                      onClick={() => handleStaffChange(member.id)}
                                      className={`w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 ${
                                        selectedStaff === member.id ? 'bg-white/20 text-white' : 'text-white/80'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {selectedStaff === member.id && (
                                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                        )}
                                        <div>
                                          <div className="font-medium">{member.name}</div>
                                          <div className="text-sm text-white/60">{member.specialty}</div>
                                        </div>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="p-4 text-center text-white/50">
                                    No stylists found matching "{staffSearch}"
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-white/50 mt-1">
                                We'll automatically show services available with your selected stylist
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Auto-selection feedback */}
                        {selectionMode === 'service' && selectedService && selectedStaff && (
                          <div className="bg-white/10 border border-white/20 rounded p-3">
                            <p className="text-white text-sm">
                              ✅ {staff.find(s => s.id === selectedStaff)?.name} has been auto-selected for your {services.find(s => s.id === selectedService)?.name} appointment
                            </p>
                          </div>
                        )}

                        {selectionMode === 'staff' && selectedStaff && selectedService && (
                          <div className="bg-white/10 border border-white/20 rounded p-3">
                            <p className="text-white text-sm">
                              ✅ {services.find(s => s.id === selectedService)?.name} has been auto-selected for your appointment with {staff.find(s => s.id === selectedStaff)?.name}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* AI Service Recommendations */}
                    {selectedService && (
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <ServiceRecommendations
                          selectedService={selectedService}
                          userHistory={[]} // Could be populated from user booking history
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Date & Time */}
                <div className="w-full flex-shrink-0 px-4 md:px-0">
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-4 md:p-6">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-full flex justify-center">
                        <div className="bg-black/50 border border-white/20 rounded-lg p-4">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateChange}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0); // Start of today
                              return date < today;
                            }}
                            className="rounded-md border-0 bg-transparent text-white [&_[data-selected]]:bg-white [&_[data-selected]]:text-black [&_[data-selected]]:rounded-lg [&_[data-selected]]:font-semibold [&_[data-selected]]:shadow-lg"
                            classNames={{
                              day_outside: "text-white hover:text-white hover:bg-white/10",
                              day_today: "text-white hover:bg-white/10",
                              day: "hover:bg-white/10 focus:bg-white/20 rounded-md transition-all duration-200",
                            }}
                          />
                          <div className="text-center mt-2 text-sm text-white/70">
                            Select your appointment date
                          </div>
                        </div>
                      </div>

                      <div className="w-full space-y-1">
                        <div className="flex items-center justify-center gap-4 mb-1">
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Clock className="h-4 w-4" />
                            <span>Live Availability</span>
                            {availability.googleCalendarConnected && (
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 text-green-400" />
                                <span className="text-xs text-green-400">Google Calendar</span>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={refreshAvailability}
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-white"
                            disabled={availability.isLoading}
                          >
                            <RefreshCw className={`h-4 w-4 ${availability.isLoading ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                        <p className="text-xs text-white/50 text-center mb-2">
                          Last updated: {getTimeAgo()}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {availability.isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className="h-12 bg-white/10 rounded animate-pulse" />
                            ))
                          ) : availability.slots.length > 0 ? (
                            availability.slots.map(slot => (
                              <Button
                                key={slot.time}
                                type="button"
                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                disabled={!slot.available}
                                variant={selectedTime === slot.time ? "default" : slot.available ? "outline" : "ghost"}
                                className={`py-3 text-sm md:text-base micro-hover-scale ${
                                  !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {slot.time}
                                {!slot.available && <span className="ml-2 text-xs">×</span>}
                              </Button>
                            ))
                          ) : (
                            <div className="col-span-2 text-center text-white/60 py-4">
                              No time slots available for this date
                            </div>
                          )}
                        </div>
                        {availability.slots.some(slot => !slot.available) && (
                          <p className="text-xs text-white/50 text-center mt-2">
                            × = Not available
                          </p>
                        )}
                      </div>

                      {/* Navigation Buttons for Date & Time Step */}
                      {currentStep === 1 && (
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                          <Button
                            type="button"
                            onClick={prevStep}
                            variant="outline"
                            className="flex items-center gap-2 luxury-button-hover"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>

                          <Button
                            type="button"
                            onClick={nextStep}
                            className="flex items-center gap-2 luxury-button-hover"
                          >
                            Next Step
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: Contact Info */}
                <div className="w-full flex-shrink-0 px-4 md:px-0">
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-1">
                    {isGuest ? (
                      <>
                        <div>
                          <label className="text-sm text-white/70 mb-2 block tracking-wider">FULL NAME</label>
                          <Input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30 input-focus-glow"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm text-white/70 mb-2 block tracking-wider">PHONE NUMBER</label>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="(555) 000-0000 - We'll text confirmation"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30 input-focus-glow"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm text-white/70 mb-2 block tracking-wider">CONTACT EMAIL</label>
                          <Input
                            type="email"
                            value={user?.email || 'Not available'}
                            placeholder="your@email.com"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30 input-focus-glow"
                            disabled
                          />
                        </div>

                        <div>
                          <label className="text-sm text-white/70 mb-2 block tracking-wider">PHONE (Optional)</label>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="(555) 000-0000"
                            className="bg-black/50 border-white/20 text-white placeholder:text-white/30 input-focus-glow"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-sm text-white/70 mb-2 block tracking-wider">SPECIAL REQUESTS</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special requirements..."
                        className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[100px] input-focus-glow"
                      />
                    </div>

                    {/* Navigation Buttons for Contact Info Step */}
                    {currentStep === 2 && (
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="flex items-center gap-2 luxury-button-hover"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>

                        <Button
                          type="button"
                          onClick={nextStep}
                          className="flex items-center gap-2 luxury-button-hover"
                        >
                          Next Step
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 4: Confirm */}
                <div className="w-full flex-shrink-0 px-4 md:px-0">
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-1">
                    <div className="text-center">
                      <h3 className="text-xl md:text-2xl font-serif luxury-glow mb-1">Booking Summary</h3>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Service:</span>
                        <span className="text-white">
                          {services.find(s => s.id === selectedService)?.name || 'Not selected'}
                        </span>
                      </div>

                      {/* Staff information removed since we're not storing it in database */}

                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Date:</span>
                        <span className="text-white">
                          {date ? date.toLocaleDateString() : 'Not selected'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-white/70">Time:</span>
                        <span className="text-white">{selectedTime || 'Not selected'}</span>
                      </div>

                      {/* Guest contact details removed from display since we're not storing them */}
                    </div>

                    {/* Payment Section */}
                    <div className="border-t border-white/10 pt-3">
                      <h4 className="text-lg font-serif luxury-glow mb-2">Payment</h4>
                      <div className="space-y-6">
                        <Button
                          type="submit"
                          className="w-full bg-white text-black hover:bg-white/90"
                        >
                          Complete Booking
                        </Button>

                        <div className="text-center text-white/60 text-sm">
                          Your booking will be confirmed shortly
                        </div>
                      </div>

                      {/* Navigation Buttons for Review & Confirm Step */}
                      {currentStep === 3 && (
                        <div className="flex justify-center mt-3 pt-3 border-t border-white/10">
                          <Button
                            type="button"
                            onClick={prevStep}
                            variant="outline"
                            className="flex items-center gap-2 luxury-button-hover"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons - Only show for steps other than Date & Time, Contact Info, and Review & Confirm */}
            {currentStep === 0 && (
              <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto px-4 md:px-0">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="flex items-center gap-2 luxury-button-hover"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: steps.length }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 luxury-button-hover"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="cta"
                    className="font-serif text-base md:text-lg tracking-wider px-8 luxury-button-hover"
                  >
                    {loading ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
                  </Button>
                )}
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
