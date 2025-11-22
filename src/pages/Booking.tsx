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
import { ChevronLeft, ChevronRight, RefreshCw, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileWalletPayment } from '@/components/MobileWalletPayment';
import { StripeProvider } from '@/components/StripeProvider';
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { ServiceRecommendations } from '@/components/ServiceRecommendations';
import { CalendarSync } from '@/components/CalendarSync';
import { useGoogleCalendarAvailability } from '@/hooks/use-google-calendar-availability';

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'service' | 'staff'>('service');
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

  // Filter staff based on selection mode
  const getFilteredStaff = () => {
    if (selectionMode === 'service' && selectedService) {
      const availableStaffIds = serviceStaffMapping[selectedService] || [];
      return staff.filter(member => availableStaffIds.includes(member.id));
    }
    return staff;
  };

  // Filter services based on selection mode
  const getFilteredServices = () => {
    if (selectionMode === 'staff' && selectedStaff) {
      const availableServices = staffServiceMapping[selectedStaff] || [];
      return services.filter(service => availableServices.includes(service.id));
    }
    return services;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
        .eq('is_active', true);

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

      // Reset form
      console.log('🔄 DEBUG: Resetting form...');
      setSelectedService('');
      setSelectedStaff('');
      setSelectedTime('');
      setFullName('');
      setPhone('');
      setNotes('');
      setDate(new Date());

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

      navigate('/pos/checkout', {
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
    <div className="min-h-screen bg-black">
      <Navigation />

      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
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

          {/* Progress Bar */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
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
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-6 md:p-8 space-y-6">
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
                          <div>
                            <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT SERVICE</label>
                            <select
                              value={selectedService}
                              onChange={(e) => handleServiceChange(e.target.value)}
                              className="bg-black/50 border-white/20 text-white w-full p-3 rounded"
                              required
                            >
                              <option value="">Choose a service</option>
                              {services.map(service => (
                                <option key={service.id} value={service.id} className="text-white bg-black">
                                  {service.name} - ${service.price}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-white/50 mt-1">
                              We'll automatically assign the best available stylist for your service
                            </p>
                          </div>
                        ) : (
                          <div>
                            <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT STYLIST</label>
                            <select
                              value={selectedStaff}
                              onChange={(e) => handleStaffChange(e.target.value)}
                              className="bg-black/50 border-white/20 text-white w-full p-3 rounded"
                              required
                            >
                              <option value="">Choose your stylist</option>
                              {staff.map(member => (
                                <option key={member.id} value={member.id} className="text-white bg-black">
                                  {member.name} - {member.specialty}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-white/50 mt-1">
                              We'll automatically show services available with your selected stylist
                            </p>
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
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-6 md:p-8">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="w-full flex justify-center">
                        <div className="bg-black/50 border border-white/20 rounded-lg p-4">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateChange}
                            disabled={(date) => date < new Date()}
                            className="rounded-md border-0 bg-transparent text-white"
                          />
                          <div className="text-center mt-2 text-sm text-white/70">
                            Select your appointment date
                          </div>
                        </div>
                      </div>

                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-center gap-4 mb-4">
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
                    </div>
                  </div>
                </div>

                {/* Step 3: Contact Info */}
                <div className="w-full flex-shrink-0 px-4 md:px-0">
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-6 md:p-8 space-y-6">
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
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000 - We'll text confirmation"
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
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
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
                  </div>
                </div>

                {/* Step 4: Confirm */}
                <div className="w-full flex-shrink-0 px-4 md:px-0">
                  <div className="max-w-2xl mx-auto frosted-glass border border-white/10 rounded-lg p-6 md:p-8 space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl md:text-2xl font-serif luxury-glow mb-6">Booking Summary</h3>
                    </div>

                    <div className="space-y-4">
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
                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-lg font-serif luxury-glow mb-4">Payment</h4>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
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
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
