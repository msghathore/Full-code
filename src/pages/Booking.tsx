import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Info, Check, User, Scissors, Users, Plus, Trash2, Zap, Loader2, ShoppingCart, ChevronUp, X, RotateCcw, Sparkles, Edit, CreditCard, Search, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from '@/components/ui/switch';
import { format, differenceInHours, isPast, startOfDay } from 'date-fns';
import { FadeInUp, MagneticButton, scrollToTop, SuccessConfettiAnimation, SparkleAnimation } from '@/components/animations';
import { SquarePaymentForm } from '@/components/SquarePaymentForm';
import { Separator } from '@/components/ui/separator';
import EmailService from '@/lib/email-service';
import { ValueBreakdown } from '@/components/PriceAnchoring';
import { BookingUpsells } from '@/components/BookingUpsells';
import { getActivePromo, applyPromoToTotal, markPromoAsUsed, canCombineWithGroupDiscount, type PromoOffer } from '@/lib/promos';

// Booking session expiration time (24 hours)
const BOOKING_EXPIRATION_HOURS = 24;

// Helper to check if booking data is expired
const isBookingExpired = (): boolean => {
  const savedTimestamp = localStorage.getItem('booking-timestamp');
  if (!savedTimestamp) return false;

  const savedDate = new Date(savedTimestamp);
  const hoursDiff = differenceInHours(new Date(), savedDate);
  return hoursDiff >= BOOKING_EXPIRATION_HOURS;
};

// Helper to check if saved date is in the past
const isSavedDatePast = (): boolean => {
  const savedDate = localStorage.getItem('booking-date');
  if (!savedDate) return false;

  const date = new Date(savedDate);
  return isPast(startOfDay(date)) && startOfDay(date) < startOfDay(new Date());
};

// Helper to clear all booking data from localStorage
const clearBookingData = () => {
  const bookingKeys = [
    'booking-current-step',
    'booking-mode',
    'booking-date',
    'booking-selected-services',
    'booking-selected-staff',
    'booking-selected-time',
    'booking-full-name',
    'booking-phone',
    'booking-notes',
    'booking-group-members',
    'booking-auto-staff',
    'booking-group-staff',
    'booking-timestamp',
    'booking-selected-package',
    'booking-package-discount'
  ];
  bookingKeys.forEach(key => localStorage.removeItem(key));
};

// Helper to check if there's saved booking progress
const hasSavedBookingProgress = (): boolean => {
  const step = localStorage.getItem('booking-current-step');
  const mode = localStorage.getItem('booking-mode');
  return (step !== null && parseInt(step, 10) > 0) || mode !== null;
};

// Step transition animation variants
const stepVariants = {
  initial: { opacity: 0, x: 50, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.98,
    transition: { duration: 0.2 }
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    boxShadow: '0 20px 40px rgba(255, 255, 255, 0.1)',
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  }),
};

interface TimeSlot {
  time: string;
  display: string;
  available: boolean;
  availableStaff: number;
}

type BookingMode = 'stylist' | 'service' | 'group' | null;

interface GroupMember {
  id: string;
  services: string[];
  name: string;
  phone: string;
}

const Booking = () => {
  // Refs for smooth scrolling
  const staffSelectionRef = useRef<HTMLDivElement>(null);
  const serviceSelectionRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const groupActionsRef = useRef<HTMLDivElement>(null);
  const isNavigatingFromEdit = useRef(false);

  // Check for expired or invalid booking data on mount
  const [isResuming, setIsResuming] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  // Payment processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Promo state - check for active offers from localStorage
  const [activePromo, setActivePromo] = useState<PromoOffer | null>(() => getActivePromo());

  const [currentStep, setCurrentStep] = useState(() => {
    // Check if data is expired or date is past
    if (isBookingExpired() || isSavedDatePast()) {
      clearBookingData();
      return 0;
    }
    const saved = localStorage.getItem('booking-current-step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [bookingMode, setBookingMode] = useState<BookingMode>(() => {
    if (isBookingExpired() || isSavedDatePast()) return null;
    const saved = localStorage.getItem('booking-mode');
    return (saved as BookingMode) || null;
  });
  const [date, setDate] = useState<Date | undefined>(() => {
    if (isBookingExpired() || isSavedDatePast()) return new Date();
    const saved = localStorage.getItem('booking-date');
    return saved ? new Date(saved) : new Date();
  });
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    if (isBookingExpired() || isSavedDatePast()) return [];
    const saved = localStorage.getItem('booking-selected-services');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedStaff, setSelectedStaff] = useState(() => {
    if (isBookingExpired() || isSavedDatePast()) return '';
    return localStorage.getItem('booking-selected-staff') || '';
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    if (isBookingExpired() || isSavedDatePast()) return '';
    return localStorage.getItem('booking-selected-time') || '';
  });
  const [fullName, setFullName] = useState(() => {
    if (isBookingExpired() || isSavedDatePast()) return '';
    return localStorage.getItem('booking-full-name') || '';
  });
  const [phone, setPhone] = useState(() => {
    if (isBookingExpired() || isSavedDatePast()) return '';
    return localStorage.getItem('booking-phone') || '';
  });
  const [notes, setNotes] = useState(() => {
    if (isBookingExpired() || isSavedDatePast()) return '';
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

  // Promo code and package state (must be declared before useEffects that reference them)
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(() => {
    const saved = localStorage.getItem('booking-selected-package');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [packageDiscount, setPackageDiscount] = useState<number>(() => {
    const saved = localStorage.getItem('booking-package-discount');
    return saved ? parseFloat(saved) : 0;
  });

  // Service discounts map: serviceId -> discount metadata
  const [serviceDiscounts, setServiceDiscounts] = useState<Record<string, {
    type: 'upsell';
    percentage: number;
    originalPrice: number;
    discountedPrice: number;
    reason: string;
  }>>({});

  // Check if resuming a previous booking session on mount
  useEffect(() => {
    const hadProgress = hasSavedBookingProgress();
    const wasExpired = isBookingExpired();
    const wasDatePast = isSavedDatePast();

    if (wasExpired || wasDatePast) {
      // Show toast for expired/past booking
      if (wasExpired) {
        toast({
          title: "Session Expired",
          description: "Your previous booking session has expired. Starting fresh.",
        });
      } else if (wasDatePast) {
        toast({
          title: "Date Passed",
          description: "Your previously selected date has passed. Please select a new date.",
        });
      }
    } else if (hadProgress && currentStep > 0) {
      // Show resume banner with animation
      setIsResuming(true);
      setShowResumeBanner(true);

      // Auto-hide banner after 5 seconds
      const timer = setTimeout(() => {
        setShowResumeBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Check for exit intent offer on mount
  useEffect(() => {
    const exitEmail = localStorage.getItem('exit_intent_email');
    if (exitEmail) {
      // Auto-apply WELCOME20 promo code
      setPromoCode('WELCOME20');
      // Set the full name email field if available
      setFullName(exitEmail);

      // Auto-validate the promo code
      setTimeout(() => {
        validatePromoCode('WELCOME20');
      }, 500);

      // Remove from localStorage after applying
      localStorage.removeItem('exit_intent_email');
    }
  }, []);

  // Check for package selection from URL params
  useEffect(() => {
    const packageSlug = searchParams.get('package');
    if (packageSlug) {
      // First check if there's a new package from GrandSlamOffers
      let pkgData = localStorage.getItem('selectedPackage');

      // If not, check if package was already persisted to booking storage
      if (!pkgData) {
        pkgData = localStorage.getItem('booking-selected-package');
      }

      if (pkgData) {
        try {
          const pkg = JSON.parse(pkgData);

          // Only update state if package isn't already set
          if (!selectedPackage || selectedPackage.id !== pkg.id) {
            setSelectedPackage(pkg);
            setPackageDiscount(pkg.discounted_price);

            // Persist package to booking localStorage
            localStorage.setItem('booking-selected-package', JSON.stringify(pkg));
            localStorage.setItem('booking-package-discount', pkg.discounted_price.toString());

            // Auto-select booking mode as 'service'
            if (!bookingMode) {
              setBookingMode('service');
            }

            toast({
              title: `${pkg.name} Package Selected! 🎁`,
              description: `Save $${pkg.savings_amount.toFixed(0)}! Services will be added to your booking.`,
              duration: 5000,
            });
          }

          // Clear temporary package from localStorage if it exists
          localStorage.removeItem('selectedPackage');
        } catch (error) {
          console.error('Error parsing package data:', error);
        }
      }
    }
  }, [searchParams]);

  // Persist package state to localStorage whenever it changes
  useEffect(() => {
    if (selectedPackage) {
      localStorage.setItem('booking-selected-package', JSON.stringify(selectedPackage));
    } else {
      localStorage.removeItem('booking-selected-package');
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (packageDiscount > 0) {
      localStorage.setItem('booking-package-discount', packageDiscount.toString());
    } else {
      localStorage.removeItem('booking-package-discount');
    }
  }, [packageDiscount]);

  // Start new booking function
  const handleStartNewBooking = () => {
    clearBookingData();
    setCurrentStep(0);
    setBookingMode(null);
    setDate(new Date());
    setSelectedServices([]);
    setSelectedStaff('');
    setSelectedTime('');
    setFullName('');
    setPhone('');
    setNotes('');
    setGroupMembers([{ id: '1', services: [], name: '', phone: '' }]);
    setAutoStaffSelection(true);
    setGroupStaffSelections({});
    setIsResuming(false);
    setShowResumeBanner(false);

    toast({
      title: "Fresh Start",
      description: "Starting a new booking. All previous selections cleared.",
    });

    scrollToTop();
  };

  // Group booking states
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(() => {
    const saved = localStorage.getItem('booking-group-members');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old format (service string) to new format (services array)
      return parsed.map((m: any) => ({
        ...m,
        services: m.services || (m.service ? [m.service] : [])
      }));
    }
    return [{ id: '1', services: [], name: '', phone: '' }];
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

  // Service search state
  const [serviceSearch, setServiceSearch] = useState('');

  // Filter services based on search query
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.description?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Smooth scroll helper function - optimized for mobile
  const smoothScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (ref.current) {
          // Get element position
          const elementTop = ref.current.getBoundingClientRect().top;
          const offsetPosition = elementTop + window.pageYOffset - 350; // 350px from top for better visibility

          // Scroll to position
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 600); // Increased timeout for animations to complete
    });
  };

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

  // Save timestamp whenever any booking data changes (for 24-hour expiration)
  useEffect(() => {
    // Only save timestamp if there's actual booking progress
    if (bookingMode || selectedServices.length > 0 || selectedStaff || selectedTime || currentStep > 0) {
      localStorage.setItem('booking-timestamp', new Date().toISOString());
    }
  }, [bookingMode, selectedServices, selectedStaff, selectedTime, date, currentStep, fullName, phone, notes, groupMembers]);

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
        const validMembers = groupMembers.filter(m => m.services.length > 0);
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
      scrollToTop();
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

    // Check for mode parameter in URL and set booking mode
    const modeParam = searchParams.get('mode');
    if (modeParam === 'group' || modeParam === 'stylist' || modeParam === 'service') {
      setBookingMode(modeParam as BookingMode);
    }

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

      // Business hours: 9 AM to 11:30 PM
      const businessHours = [
        { time: '09:00', display: '9:00 AM' },
        { time: '09:30', display: '9:30 AM' },
        { time: '10:00', display: '10:00 AM' },
        { time: '10:30', display: '10:30 AM' },
        { time: '11:00', display: '11:00 AM' },
        { time: '11:30', display: '11:30 AM' },
        { time: '12:00', display: '12:00 PM' },
        { time: '12:30', display: '12:30 PM' },
        { time: '13:00', display: '1:00 PM' },
        { time: '13:30', display: '1:30 PM' },
        { time: '14:00', display: '2:00 PM' },
        { time: '14:30', display: '2:30 PM' },
        { time: '15:00', display: '3:00 PM' },
        { time: '15:30', display: '3:30 PM' },
        { time: '16:00', display: '4:00 PM' },
        { time: '16:30', display: '4:30 PM' },
        { time: '17:00', display: '5:00 PM' },
        { time: '17:30', display: '5:30 PM' },
        { time: '18:00', display: '6:00 PM' },
        { time: '18:30', display: '6:30 PM' },
        { time: '19:00', display: '7:00 PM' },
        { time: '19:30', display: '7:30 PM' },
        { time: '20:00', display: '8:00 PM' },
        { time: '20:30', display: '8:30 PM' },
        { time: '21:00', display: '9:00 PM' },
        { time: '21:30', display: '9:30 PM' },
        { time: '22:00', display: '10:00 PM' },
        { time: '22:30', display: '10:30 PM' },
        { time: '23:00', display: '11:00 PM' },
        { time: '23:30', display: '11:30 PM' },
      ];

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
          ? groupMembers.filter(m => m.services.length > 0).length
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
      // Scroll to time slots when date is selected
      smoothScrollTo(timeSlotsRef);
    }
  }, [date, currentStep, fetchAvailableTimeSlots]);

  // Scroll to next button when services are selected (step 1)
  useEffect(() => {
    if (currentStep === 0 && selectedServices.length > 0 && !isNavigatingFromEdit.current) {
      smoothScrollTo(nextButtonRef);
    }
    // Reset the flag after the effect runs
    if (isNavigatingFromEdit.current) {
      isNavigatingFromEdit.current = false;
    }
  }, [selectedServices, currentStep, bookingMode]);

  // Handler for time slot selection - updates state and scrolls to next button
  const handleTimeSelect = (timeDisplay: string) => {
    setSelectedTime(timeDisplay);
    // Scroll to next button after time selection
    setTimeout(() => {
      if (nextButtonRef.current) {
        nextButtonRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  // Scroll to calendar when entering step 2
  useEffect(() => {
    if (currentStep === 1) {
      smoothScrollTo(calendarRef);
    }
  }, [currentStep]);

  // Scroll to services when staff is selected in stylist mode
  useEffect(() => {
    if (currentStep === 0 && bookingMode === 'stylist' && selectedStaff) {
      smoothScrollTo(serviceSelectionRef);
    }
  }, [selectedStaff, currentStep, bookingMode]);

  // Group booking helper functions
  const addGroupMember = () => {
    const newId = (groupMembers.length + 1).toString();
    setGroupMembers([...groupMembers, { id: newId, services: [], name: '', phone: '' }]);
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

  // Toggle service selection for a group member
  const toggleGroupMemberService = (memberId: string, serviceId: string) => {
    setGroupMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      const hasService = m.services.includes(serviceId);
      const newServices = hasService
        ? m.services.filter(s => s !== serviceId)
        : [...m.services, serviceId];

      // If adding a service to any person, scroll to show Add Another Person and Next button
      if (!hasService && newServices.length > 0) {
        setTimeout(() => {
          if (groupActionsRef.current) {
            groupActionsRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 100);
      }

      return {
        ...m,
        services: newServices
      };
    }));
  };

  // Calculate total for a single group member's services
  const calculateMemberTotal = (member: GroupMember) => {
    return member.services.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
  };

  // Calculate total duration for a single group member's services
  const calculateMemberDuration = (member: GroupMember) => {
    return member.services.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service?.duration_minutes || 0);
    }, 0);
  };

  const updateGroupStaffSelection = (memberId: string, staffId: string) => {
    setGroupStaffSelections({ ...groupStaffSelections, [memberId]: staffId });
  };

  // Calculate group total and discount
  const calculateGroupTotal = () => {
    const validMembers = groupMembers.filter(m => m.services.length > 0);
    const subtotalBeforeDiscounts = validMembers.reduce((sum, m) => {
      // Sum all services for this member
      const memberTotal = m.services.reduce((memberSum, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return memberSum + (service?.price || 0);
      }, 0);
      return sum + memberTotal;
    }, 0);

    // Group discount: 5% for 2 people, 10% for 3+, 15% for 5+
    const count = validMembers.length;
    let groupDiscountPercent = 0;
    if (count >= 5) groupDiscountPercent = 15;
    else if (count >= 3) groupDiscountPercent = 10;
    else if (count >= 2) groupDiscountPercent = 5;

    const groupDiscount = subtotalBeforeDiscounts * (groupDiscountPercent / 100);
    const subtotalAfterGroupDiscount = subtotalBeforeDiscounts - groupDiscount;

    // Apply promo discount (if it can combine with group discount)
    let promoDiscount = 0;
    let finalTotal = subtotalAfterGroupDiscount;

    if (activePromo) {
      if (canCombineWithGroupDiscount(activePromo)) {
        // Apply promo to already-discounted price (for referral codes)
        const promoResult = applyPromoToTotal(subtotalAfterGroupDiscount, activePromo);
        promoDiscount = promoResult.discount;
        finalTotal = promoResult.total;
      } else {
        // Use either group discount OR promo discount, whichever is better
        const promoResult = applyPromoToTotal(subtotalBeforeDiscounts, activePromo);
        if (promoResult.discount > groupDiscount) {
          // Promo is better - use it instead of group discount
          promoDiscount = promoResult.discount;
          finalTotal = promoResult.total;
          return {
            subtotal: subtotalBeforeDiscounts,
            discount: 0,
            total: finalTotal,
            discountPercent: 0,
            memberCount: count,
            promoDiscount,
            promo: activePromo
          };
        }
      }
    }

    return {
      subtotal: subtotalBeforeDiscounts,
      discount: groupDiscount,
      total: finalTotal,
      discountPercent: groupDiscountPercent,
      memberCount: count,
      promoDiscount,
      promo: activePromo
    };
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 4 now handles payment directly, so just advance through steps
    if (currentStep < steps.length - 1) {
      nextStep();
    }
    // Step 4 (Review & Pay) is handled by SquarePaymentForm's onPaymentSuccess
  };

  // Reset selections when changing booking mode
  const handleModeSelect = (mode: BookingMode) => {
    setBookingMode(mode);
    setSelectedServices([]);
    setSelectedStaff('');
    if (mode === 'group') {
      setGroupMembers([{ id: '1', services: [], name: '', phone: '' }]);
      setAutoStaffSelection(true);
      setGroupStaffSelections({});
      smoothScrollTo(serviceSelectionRef); // Scroll to service selection for group
    } else if (mode === 'stylist') {
      smoothScrollTo(staffSelectionRef); // Scroll to staff selection
    } else if (mode === 'service') {
      smoothScrollTo(serviceSelectionRef); // Scroll to service selection
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
    // If package is selected, use package discounted price
    if (selectedPackage && packageDiscount > 0) {
      return packageDiscount;
    }

    // Otherwise, calculate subtotal with upsell discounts
    const subtotal = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      if (!service) return total;

      // Check if this service has an upsell discount
      const serviceDiscount = serviceDiscounts[serviceId];
      if (serviceDiscount) {
        return total + serviceDiscount.discountedPrice;
      }

      return total + service.price;
    }, 0);

    // Apply promo code discount if available
    if (promoCode && appliedPromo) {
      if (appliedPromo.discount_type === 'percentage') {
        return subtotal * (1 - appliedPromo.discount_value / 100);
      } else if (appliedPromo.discount_type === 'fixed_amount') {
        return Math.max(0, subtotal - appliedPromo.discount_value);
      }
    }

    // Apply legacy promo discount if available
    if (activePromo) {
      const result = applyPromoToTotal(subtotal, activePromo);
      return result.total;
    }

    return subtotal;
  };

  // Calculate subtotal without discounts (for display purposes)
  const calculateServicesSubtotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  // Validate and apply promo code
  const validatePromoCode = async (code: string) => {
    if (!code || code.trim() === '') {
      toast({
        title: "Invalid Code",
        description: "Please enter a promo code.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid Code",
          description: "This promo code doesn't exist or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: "Expired Code",
          description: "This promo code has expired.",
          variant: "destructive",
        });
        return;
      }

      // Check usage limit
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        toast({
          title: "Code Fully Used",
          description: "This promo code has reached its usage limit.",
          variant: "destructive",
        });
        return;
      }

      // Check minimum purchase amount
      const subtotal = calculateServicesSubtotal();
      if (data.min_purchase_amount && subtotal < data.min_purchase_amount) {
        toast({
          title: "Minimum Not Met",
          description: `This code requires a minimum purchase of $${data.min_purchase_amount.toFixed(2)}.`,
          variant: "destructive",
        });
        return;
      }

      // Apply the promo code
      setAppliedPromo(data);
      toast({
        title: "Promo Code Applied! 🎉",
        description: `${data.code} - ${data.description || 'Discount applied'}`,
      });
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate promo discount amount
  const calculateServicesPromoDiscount = () => {
    if (!activePromo) return 0;
    const subtotal = calculateServicesSubtotal();
    const result = applyPromoToTotal(subtotal, activePromo);
    return result.discount;
  };

  // Calculate total duration for selected services
  const calculateServicesDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration_minutes || 0);
    }, 0);
  };

  // Payment success handler
  const handlePaymentSuccess = async (paymentResult: any) => {
    setIsProcessing(true);

    try {
      console.log('💰 Payment successful, saving appointment...');

      const customerEmail = user?.email || '';
      const customerName = fullName || user?.user_metadata?.full_name || '';
      const customerPhone = phone || '';

      if (bookingMode === 'group') {
        // Handle group booking
        const { subtotal, discount, total } = calculateGroupTotal();
        const validMembers = groupMembers.filter(m => m.services.length > 0);

        // Create appointments for each group member with error handling
        const createdAppointments = [];
        try {
          for (const member of validMembers) {
            const memberServices = member.services.map(sid => services.find(s => s.id === sid)?.name).filter(Boolean).join(', ');
            const appointmentData = {
              service_id: member.services[0], // Primary service
              appointment_date: date?.toISOString().split('T')[0],
              appointment_time: selectedTime,
              status: 'confirmed',
              payment_status: 'paid',
              payment_intent_id: paymentResult.paymentId,
              total_amount: calculateMemberTotal(member),
              deposit_amount: calculateMemberTotal(member) * 0.5,
              notes: `${notes || ''}${member.services.length > 1 ? `\n\nAll services: ${memberServices}` : ''}`.trim(),
              full_name: member.name || customerName,
              email: customerEmail,
              phone: member.phone || customerPhone,
              user_id: user?.id,
              staff_id: autoStaffSelection ? null : groupStaffSelections[member.id],
            };

            const { data, error } = await supabase.from('appointments').insert(appointmentData).select().single();
            if (error) throw error;
            createdAppointments.push(data);
          }
        } catch (error) {
          // If any appointment creation fails, show error
          console.error('Failed to create group appointments:', error);
          throw new Error('Failed to create all group appointments. Please contact support.');
        }
      } else {
        // Handle individual booking
        const selectedServicesData = selectedServices.map(id => services.find(s => s.id === id)).filter(Boolean);
        const allServiceNames = selectedServicesData.map(s => s?.name).join(', ');

        const appointmentData = {
          service_id: selectedServices[0],
          appointment_date: date?.toISOString().split('T')[0],
          appointment_time: selectedTime,
          status: 'confirmed',
          payment_status: 'paid',
          payment_intent_id: paymentResult.paymentId,
          total_amount: calculateServicesTotal(),
          deposit_amount: calculateServicesTotal() * 0.5,
          notes: `${notes || ''}${selectedServices.length > 1 ? `\n\nAll services: ${allServiceNames}` : ''}`.trim(),
          full_name: customerName,
          email: customerEmail,
          phone: customerPhone,
          user_id: user?.id,
          staff_id: bookingMode === 'stylist' ? selectedStaff : null,
        };

        const { data: appointment, error } = await supabase
          .from('appointments')
          .insert(appointmentData)
          .select()
          .single();

        if (error) throw error;

        // Award loyalty points
        if (user?.id && calculateServicesTotal() > 0) {
          try {
            const pointsToAward = Math.floor(calculateServicesTotal());
            await supabase.from('loyalty_transactions').insert({
              user_id: user.id,
              points_change: pointsToAward,
              transaction_type: 'earned',
              description: `Earned from booking`,
              reference_id: appointment.id
            });
          } catch (e) {
            console.warn('Failed to award loyalty points:', e);
          }
        }
      }

      // Send confirmation email
      let emailSent = false;
      if (customerEmail) {
        try {
          const selectedServicesData = selectedServices.map(id => services.find(s => s.id === id)).filter(Boolean);
          await EmailService.sendAppointmentConfirmation({
            customerEmail,
            customerName,
            serviceName: selectedServicesData.map(s => s?.name).join(', '),
            appointmentDate: date?.toISOString().split('T')[0] || '',
            appointmentTime: selectedTime,
            staffName: 'Your Stylist'
          });
          emailSent = true;
        } catch (e) {
          console.warn('Email sending failed:', e);
          // Show warning toast for email failure
          toast({
            title: "Email Not Sent",
            description: "Your booking is confirmed, but we couldn't send the confirmation email. Please save your appointment details.",
            variant: "default",
          });
        }
      }

      setPaymentCompleted(true);
      clearBookingData();

      toast({
        title: "Booking Confirmed! 🎉",
        description: "Your appointment has been scheduled successfully.",
      });
    } catch (error: any) {
      console.error('Error completing booking:', error);
      toast({
        title: "Booking Error",
        description: error.message || "There was an error completing your booking.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  // Show success page after payment
  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 pt-20 relative overflow-hidden">
          <div className="absolute top-20 left-1/4 opacity-60">
            <SparkleAnimation className="w-12 h-12" />
          </div>
          <div className="absolute top-32 right-1/4 opacity-50">
            <SparkleAnimation className="w-8 h-8" />
          </div>
          <div className="max-w-md w-full relative z-10">
            <div className="frosted-glass border border-white/10 rounded-lg p-8 text-center">
              <div className="w-32 h-32 mx-auto mb-4">
                <SuccessConfettiAnimation className="w-full h-full" />
              </div>
              <h1 className="text-2xl font-serif luxury-glow mb-4 text-white">
                Booking Confirmed!
              </h1>
              <div className="space-y-3 text-white/80 mb-6">
                <p><strong>Date:</strong> {date?.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Total:</strong> ${bookingMode === 'group' ? calculateGroupTotal().total.toFixed(2) : calculateServicesTotal().toFixed(2)}</p>
              </div>
              <p className="text-white/60 text-sm mb-6">
                A confirmation email has been sent with all the details.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full luxury-button-hover"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navigation />

      <div className="px-4 md:px-8 pt-20 pb-12 overflow-x-hidden">
        <div className="container mx-auto max-w-7xl min-h-[50vh]">
          <FadeInUp>
            <div className="text-center mb-6 md:mb-8">
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                BOOK APPOINTMENT
              </motion.h1>
            </div>
          </FadeInUp>

          {/* Resume Banner - Shows when continuing a previous booking */}
          <AnimatePresence>
            {showResumeBanner && isResuming && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="mb-6 flex justify-center"
              >
                <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/30 rounded-xl px-6 py-4 flex items-center gap-4 backdrop-blur-sm">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Sparkles className="w-5 h-5 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-white font-medium text-sm md:text-base drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                      Welcome back! We've saved your booking progress.
                    </p>
                    <p className="text-white/70 text-xs md:text-sm mt-0.5">
                      Continue where you left off or start fresh
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResumeBanner(false)}
                    className="text-white/60 hover:text-white transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start New Booking Button - Shows when resuming and on step > 0 */}
          {isResuming && currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex justify-center mb-6"
            >
              <MagneticButton>
                <Button
                  onClick={handleStartNewBooking}
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 group"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ x: -2 }}
                  >
                    <RotateCcw className="w-4 h-4 group-hover:rotate-[-180deg] transition-transform duration-500" />
                    <span>Start New Booking</span>
                  </motion.div>
                </Button>
              </MagneticButton>
            </motion.div>
          )}

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
                      if (bookingMode === 'group' && groupMembers.filter(m => m.services.length > 0).length < 2) return false;
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
                          if (index === 0) {
                            isNavigatingFromEdit.current = true;
                          }
                          setCurrentStep(index);
                          scrollToTop();
                        } else if (index > currentStep && isAccessible) {
                          // Going forward - only if validated
                          setCurrentStep(index);
                          scrollToTop();
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
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all duration-300 ${
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
                        <div className={`w-4 sm:w-6 md:w-12 h-0.5 transition-all duration-700 ${index < currentStep ? 'bg-white shadow-sm' : 'bg-white/20'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full">
            <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-6"
              >
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
                        <div className="flex-1" ref={staffSelectionRef}>
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

                        <div className="flex-1" ref={serviceSelectionRef}>
                          <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT SERVICES (choose multiple)</label>

                          {/* Service Search Box */}
                          <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input
                              type="text"
                              placeholder="Search services..."
                              value={serviceSearch}
                              onChange={(e) => setServiceSearch(e.target.value)}
                              className="pl-10 bg-black border-white/30 text-white placeholder:text-white/50"
                              disabled={!selectedStaff}
                            />
                            {serviceSearch && (
                              <button
                                type="button"
                                onClick={() => setServiceSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className={`bg-black border border-white/30 rounded max-h-[400px] overflow-y-auto ${!selectedStaff ? 'opacity-50 pointer-events-none' : ''}`}>
                            {filteredServices.length > 0 ? (
                              filteredServices.map(service => (
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
                                <div className="p-4 text-center text-white/50">
                                  {serviceSearch ? 'No services match your search' : 'No services available'}
                                </div>
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

                          {/* Upsells - Stylist Mode */}
                          {selectedServices.length > 0 && (
                            <div className="mt-6">
                              <BookingUpsells
                                selectedServiceIds={selectedServices}
                                onAddService={(serviceData) => {
                                  if (!selectedServices.includes(serviceData.serviceId)) {
                                    setSelectedServices([...selectedServices, serviceData.serviceId]);

                                    // Store discount metadata if provided
                                    if (serviceData.discount) {
                                      setServiceDiscounts(prev => ({
                                        ...prev,
                                        [serviceData.serviceId]: serviceData.discount!
                                      }));
                                    }
                                  }
                                }}
                                services={services}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Service Mode - Show Services List (Multiple Selection) */}
                    {bookingMode === 'service' && (
                      <div ref={serviceSelectionRef}>
                        <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT SERVICES (choose multiple)</label>

                        {/* Service Search Box */}
                        <div className="relative mb-3">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                          <Input
                            type="text"
                            placeholder="Search services..."
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className="pl-10 bg-black border-white/30 text-white placeholder:text-white/50"
                          />
                          {serviceSearch && (
                            <button
                              type="button"
                              onClick={() => setServiceSearch('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="bg-black border border-white/30 rounded max-h-[400px] overflow-y-auto">
                          {filteredServices.length > 0 ? (
                            filteredServices.map(service => (
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
                            <div className="p-4 text-center text-white/50">
                              {serviceSearch ? 'No services match your search' : 'No services available'}
                            </div>
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

                        {/* Upsells - Service Mode */}
                        {selectedServices.length > 0 && (
                          <div className="mt-6">
                            <BookingUpsells
                              selectedServiceIds={selectedServices}
                              onAddService={(serviceData) => {
                                if (!selectedServices.includes(serviceData.serviceId)) {
                                  setSelectedServices([...selectedServices, serviceData.serviceId]);

                                  // Store discount metadata if provided
                                  if (serviceData.discount) {
                                    setServiceDiscounts(prev => ({
                                      ...prev,
                                      [serviceData.serviceId]: serviceData.discount!
                                    }));
                                  }
                                }
                              }}
                              services={services}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Group Mode - Add People & Services */}
                    {bookingMode === 'group' && (
                      <div ref={serviceSelectionRef}>
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

                              {/* Multi-Service Selection */}
                              <div>
                                <label className="text-xs text-white block mb-1">Services * (select multiple)</label>

                                {/* Service Search Box */}
                                <div className="relative mb-2">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/50" />
                                  <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={serviceSearch}
                                    onChange={(e) => setServiceSearch(e.target.value)}
                                    className="pl-8 text-xs h-8 bg-black border-white/30 text-white placeholder:text-white/50"
                                  />
                                  {serviceSearch && (
                                    <button
                                      type="button"
                                      onClick={() => setServiceSearch('')}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>

                                <div className="bg-black border border-white/30 rounded max-h-[200px] overflow-y-auto">
                                  {filteredServices.map(s => (
                                    <button
                                      key={s.id}
                                      type="button"
                                      onClick={() => toggleGroupMemberService(member.id, s.id)}
                                      className={`w-full text-left p-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 ${
                                        member.services.includes(s.id) ? 'bg-white/20 text-white' : 'text-white/80'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 flex items-center gap-2">
                                          {member.services.includes(s.id) && <Check className="h-4 w-4 text-green-400 flex-shrink-0" />}
                                          <div>
                                            <div className="font-medium">{s.name}</div>
                                            <div className="text-sm text-white/60">${s.price} • {s.duration_minutes} min</div>
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                                {member.services.length > 0 && (
                                  <div className="mt-2 p-2 bg-white/5 rounded text-xs text-white/80">
                                    <span className="font-medium">{member.services.length} service{member.services.length > 1 ? 's' : ''}</span>
                                    <span className="mx-1">•</span>
                                    <span>${calculateMemberTotal(member).toFixed(2)}</span>
                                    <span className="mx-1">•</span>
                                    <span>{calculateMemberDuration(member)} min</span>
                                  </div>
                                )}
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
                          <div ref={groupActionsRef}>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addGroupMember}
                              className="w-full border-dashed border-white/30 text-white/70 hover:text-white hover:bg-white/5"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Another Person
                            </Button>
                          </div>
                        </div>

                        {/* Group Total */}
                        {groupMembers.some(m => m.services.length > 0) && (
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
                      </div>
                    )}
                  </>
                )}

                <div ref={nextButtonRef} className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 pt-4 border-t border-white/10">
                  <Button type="button" onClick={prevStep} disabled={currentStep === 0} variant="outline" className="opacity-50 cursor-not-allowed w-full sm:w-auto">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <MagneticButton className="w-full sm:w-auto">
                    <Button type="button" onClick={nextStep} className="luxury-button-hover w-full" disabled={!bookingMode}>
                      Next Step <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </MagneticButton>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-4"
              >
                {/* Show parallel booking info for groups */}
                {bookingMode === 'group' && (
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 p-2 rounded">
                    <Zap className="h-4 w-4" />
                    <span>All services happen simultaneously for fastest experience</span>
                  </div>
                )}

                {/* Horizontal layout: Calendar on left, Time slots on right */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Calendar Section */}
                  <div ref={calendarRef} className="w-full lg:w-[55%] lg:max-w-[500px]">
                    <div className="bg-black border border-white/30 rounded-lg p-3 sm:p-4 md:p-5 w-full">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        className="w-full rounded-md border-0 bg-transparent text-white [&_[data-selected]]:bg-white [&_[data-selected]]:text-black [&_[data-selected]]:rounded-lg [&_[data-selected]]:font-semibold"
                        classNames={{
                          day_outside: "text-white/50 hover:text-white hover:bg-white/10",
                          day_today: "bg-white text-black font-semibold shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-md",
                          day: "hover:bg-white/10 focus:bg-white/20 rounded-md transition-all duration-200",
                        }}
                      />
                      <div className="text-center mt-3 text-sm text-white/70">Select your appointment date</div>
                    </div>
                  </div>

                  {/* Time Slots Section */}
                  <div ref={timeSlotsRef} className="flex-1 min-w-0 lg:min-w-[280px] space-y-3">
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pr-1">
                        {timeSlots.map(slot => (
                          <Button
                            key={slot.time}
                            type="button"
                            onClick={() => slot.available && handleTimeSelect(slot.display)}
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

                <div ref={nextButtonRef} className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 pt-4 border-t border-white/10">
                  <Button type="button" onClick={prevStep} variant="outline" className="luxury-button-hover w-full sm:w-auto">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <MagneticButton className="w-full sm:w-auto">
                    <Button type="button" onClick={nextStep} className="luxury-button-hover w-full">
                      Next Step <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </MagneticButton>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="frosted-glass border border-white/10 rounded-lg p-4 md:p-6 space-y-4"
              >
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

                <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 pt-4 border-t border-white/10">
                  <Button type="button" onClick={prevStep} variant="outline" className="luxury-button-hover w-full sm:w-auto">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                  </Button>
                  <MagneticButton className="w-full sm:w-auto">
                    <Button type="button" onClick={nextStep} className="luxury-button-hover w-full">
                      Next Step <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </MagneticButton>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4 sm:space-y-6"
              >
                <div className="text-center px-2">
                  <motion.h3
                    className="text-lg sm:text-xl md:text-2xl font-serif luxury-glow mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {bookingMode === 'group' ? 'Review & Pay' : 'Review & Pay'}
                  </motion.h3>
                  <p className="text-white/60 text-xs sm:text-sm">Please review your booking details and complete payment</p>
                </div>

                {/* Two-column layout: Summary on left, Payment on right */}
                <div className="grid md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 max-w-6xl mx-auto w-full px-0">
                  {/* Left Column - Booking Summary */}
                  <div className="frosted-glass border border-white/10 rounded-lg p-2.5 sm:p-4 md:p-6 space-y-2 sm:space-y-4 overflow-hidden">
                    <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg flex items-center justify-between">
                      Booking Summary
                    </h4>

                    {bookingMode === 'group' ? (
                      // Group Booking Summary
                      <div className="space-y-4">
                        {/* Services & Group Members with Edit */}
                        <div className="py-3 border-b border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/70 text-sm font-medium">Group Services</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                isNavigatingFromEdit.current = true;
                                setCurrentStep(0);
                                scrollToTop();
                              }}
                              className="text-slate-700 hover:text-white hover:bg-slate-700/10 h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <div className="space-y-2">
                        {groupMembers.filter(m => m.services.length > 0).map((member, index) => {
                          const memberServices = member.services.map(sid => services.find(s => s.id === sid)).filter(Boolean);
                          const staffMember = !autoStaffSelection && groupStaffSelections[member.id]
                            ? staff.find(s => s.id === groupStaffSelections[member.id])
                            : null;
                          return (
                            <div key={member.id} className="py-2 border-b border-white/10">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <span className="text-white font-medium">{member.name || `Person ${index + 1}`}</span>
                                  <div className="text-sm text-white/80 mt-1">
                                    {memberServices.map((s, i) => (
                                      <div key={s?.id} className="flex justify-between">
                                        <span>{s?.name}</span>
                                        <span className="text-white/60">${s?.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="text-xs text-white/60 mt-1">
                                    {staffMember ? staffMember.name : 'Auto-assigned'}
                                    <span className="mx-1">•</span>
                                    {calculateMemberDuration(member)} min total
                                  </div>
                                </div>
                                <span className="text-white font-medium ml-4">${calculateMemberTotal(member).toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                        </div>

                        {/* Date & Time with Edit */}
                        <div className="py-3 border-b border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/70 text-sm font-medium">Date & Time</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentStep(1);
                                scrollToTop();
                              }}
                              className="text-slate-700 hover:text-white hover:bg-slate-700/10 h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <div className="space-y-1 text-white text-sm">
                            <div className="flex justify-between">
                              <span>Date:</span>
                              <span>{date ? date.toLocaleDateString() : 'Not selected'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time:</span>
                              <span>{selectedTime || 'Not selected'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Info with Edit */}
                        <div className="py-3 border-b border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/70 text-sm font-medium">Contact Information</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentStep(2);
                                scrollToTop();
                              }}
                              className="text-slate-700 hover:text-white hover:bg-slate-700/10 h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <div className="space-y-1 text-white text-sm">
                            <div className="flex justify-between">
                              <span>Name:</span>
                              <span>{fullName || user?.user_metadata?.full_name || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Phone:</span>
                              <span>{phone || 'Not provided'}</span>
                            </div>
                            {user?.email && (
                              <div className="flex justify-between">
                                <span>Email:</span>
                                <span className="text-xs">{user.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Group Scheduling Info */}
                        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                          <p className="text-yellow-400 text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            All services happen simultaneously for fastest experience
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Individual Booking Summary
                      <div className="space-y-2 sm:space-y-4">
                        {/* Services List with Edit */}
                        <div className="py-2 sm:py-3 border-b border-white/10">
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span className="text-white/70 text-xs sm:text-sm font-medium">Services</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                isNavigatingFromEdit.current = true;
                                setCurrentStep(0);
                                scrollToTop();
                              }}
                              className="text-slate-700 hover:text-white hover:bg-slate-700/10 h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                        {selectedServices.length > 0 ? (
                          <div className="space-y-0.5 sm:space-y-1">
                            {selectedServices.map(serviceId => {
                              const service = services.find(s => s.id === serviceId);
                              return (
                                <div key={serviceId} className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                  <span className="truncate">{service?.name}</span>
                                  <span className="whitespace-nowrap text-white/80">${service?.price} • {service?.duration_minutes}m</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-white text-xs sm:text-sm">Not selected</span>
                        )}
                        </div>

                        {/* Staff (if stylist mode) */}
                        {bookingMode === 'stylist' && selectedStaff && (
                          <div className="py-2 sm:py-3 border-b border-white/10">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white/70 text-xs sm:text-sm font-medium">Stylist:</span>
                              <span className="text-white text-xs sm:text-sm truncate">{staff.find(s => s.id === selectedStaff)?.name || 'Not selected'}</span>
                            </div>
                          </div>
                        )}

                        {/* Date & Time with Edit */}
                        <div className="py-2 sm:py-3 border-b border-white/10">
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span className="text-white/70 text-xs sm:text-sm font-medium">Date & Time</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentStep(1);
                                scrollToTop();
                              }}
                              className="text-slate-700 hover:text-white hover:bg-slate-700/10 h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <div className="space-y-0.5 sm:space-y-1 text-white text-[11px] sm:text-sm">
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">Date:</span>
                              <span>{date ? date.toLocaleDateString() : 'Not selected'}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">Time:</span>
                              <span>{selectedTime || 'Not selected'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Info with Edit */}
                        <div className="py-2 sm:py-3 border-b border-white/10">
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span className="text-white/70 text-xs sm:text-sm font-medium">Contact Info</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentStep(2);
                                scrollToTop();
                              }}
                              className="text-slate-700 hover:text-white hover:bg-slate-700/10 h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Edit
                            </Button>
                          </div>
                          <div className="space-y-0.5 sm:space-y-1 text-white text-[11px] sm:text-sm">
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">Name:</span>
                              <span className="truncate max-w-[150px] sm:max-w-none">{fullName || user?.user_metadata?.full_name || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-white/70">Phone:</span>
                              <span>{phone || 'Not provided'}</span>
                            </div>
                            {user?.email && (
                              <div className="flex justify-between gap-2">
                                <span className="text-white/70">Email:</span>
                                <span className="text-[10px] sm:text-xs truncate max-w-[140px] sm:max-w-none">{user.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Payment */}
                  <div className="frosted-glass border border-white/10 rounded-lg p-2.5 sm:p-4 md:p-6 space-y-2 sm:space-y-4 overflow-hidden">
                    <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg flex items-center gap-2">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      Secure Payment
                    </h4>

                    {/* Enhanced Price Summary with Value Anchoring */}
                    {bookingMode === 'group' ? (
                      (() => {
                        const { subtotal, discount, total, discountPercent, memberCount, promoDiscount, promo } = calculateGroupTotal();
                        const depositAmount = total * 0.5;
                        const regularPrice = subtotal * 1.3; // 30% markup for regular price
                        const memberSavings = regularPrice - subtotal;

                        return (
                          <div className="space-y-3">
                            {/* Promo Banner - Show if active promo */}
                            {promo && (
                              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/50 rounded-lg p-3 animate-pulse">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{promo.icon}</span>
                                  <div className="flex-1">
                                    <p className="text-white font-bold text-xs drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                      {promo.description}
                                    </p>
                                    <p className="text-white/70 text-[10px]">Applied to your cart!</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Value Breakdown */}
                            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                <span className="text-white font-bold text-xs drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">MEMBER PRICING</span>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-white/60">
                                  <span>Regular Price:</span>
                                  <span className="line-through">${regularPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                                  <span>Member Price:</span>
                                  <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white text-[10px] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                  <span>You Save:</span>
                                  <span>${memberSavings.toFixed(2)} (23% OFF)</span>
                                </div>
                              </div>
                            </div>

                            {/* Standard Summary */}
                            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
                              <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                <span className="truncate text-white/70">Subtotal ({memberCount} {memberCount === 1 ? 'person' : 'people'})</span>
                                <span className="whitespace-nowrap font-medium">${subtotal.toFixed(2)}</span>
                              </div>
                              {discountPercent > 0 && (
                                <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                                  <span className="truncate">Group Discount ({discountPercent}%)</span>
                                  <span className="whitespace-nowrap">-${discount.toFixed(2)}</span>
                                </div>
                              )}
                              {promoDiscount > 0 && (
                                <div className="flex justify-between text-emerald-500 text-[11px] sm:text-sm gap-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                                  <span className="truncate font-semibold">{promo?.icon} {promo?.description}</span>
                                  <span className="whitespace-nowrap font-bold">-${promoDiscount.toFixed(2)}</span>
                                </div>
                              )}
                              <Separator className="bg-white/10 my-1 sm:my-2" />
                              <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                <span className="text-white/70">Total Price:</span>
                                <span className="whitespace-nowrap font-medium">${total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                <span className="text-white/70">Deposit (50%):</span>
                                <span className="whitespace-nowrap font-medium">${depositAmount.toFixed(2)}</span>
                              </div>
                              <Separator className="bg-white/10 my-1 sm:my-2" />
                              <div className="flex justify-between text-white font-semibold text-sm sm:text-lg gap-2">
                                <span>Due Today:</span>
                                <span className="text-white whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">${depositAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      (() => {
                        const subtotal = calculateServicesSubtotal();
                        const promoDiscount = calculateServicesPromoDiscount();
                        const totalPrice = calculateServicesTotal();
                        const depositAmount = totalPrice * 0.5;
                        const regularPrice = subtotal * 1.3; // 30% markup for regular price
                        const memberSavings = regularPrice - subtotal;

                        return (
                          <div className="space-y-3">
                            {/* Promo Banner - Show if active promo */}
                            {activePromo && (
                              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/50 rounded-lg p-3 animate-pulse">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{activePromo.icon}</span>
                                  <div className="flex-1">
                                    <p className="text-white font-bold text-xs drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                      {activePromo.description}
                                    </p>
                                    <p className="text-white/70 text-[10px]">Applied to your cart!</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Value Breakdown */}
                            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                                <span className="text-white font-bold text-xs drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">MEMBER PRICING</span>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-white/60">
                                  <span>Regular Price:</span>
                                  <span className="line-through">${regularPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                                  <span>Your Price:</span>
                                  <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white text-[10px] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                  <span>You Save:</span>
                                  <span>${memberSavings.toFixed(2)} (23% OFF)</span>
                                </div>
                              </div>
                            </div>

                            {/* Standard Summary */}
                            <div className="bg-white/5 rounded-lg p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
                              <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                <span className="text-white/70">Service Price:</span>
                                <span className="whitespace-nowrap font-medium">${subtotal.toFixed(2)}</span>
                              </div>
                              {promoDiscount > 0 && (
                                <div className="flex justify-between text-emerald-500 text-[11px] sm:text-sm gap-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                                  <span className="truncate font-semibold">{activePromo?.icon} {activePromo?.description}</span>
                                  <span className="whitespace-nowrap font-bold">-${promoDiscount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                <span className="text-white/70">Duration:</span>
                                <span className="whitespace-nowrap font-medium">{calculateServicesDuration()} min</span>
                              </div>
                              {promoDiscount > 0 && (
                                <>
                                  <Separator className="bg-white/10 my-1 sm:my-2" />
                                  <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                    <span className="text-white/70">Total After Discount:</span>
                                    <span className="whitespace-nowrap font-medium">${totalPrice.toFixed(2)}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between text-white text-[11px] sm:text-sm gap-2">
                                <span className="text-white/70">Deposit (50%):</span>
                                <span className="whitespace-nowrap font-medium">${depositAmount.toFixed(2)}</span>
                              </div>
                              <Separator className="bg-white/10 my-1 sm:my-2" />
                              <div className="flex justify-between text-white font-semibold text-sm sm:text-lg gap-2">
                                <span>Due Today:</span>
                                <span className="text-white whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">${depositAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Payment Note */}
                    <div className="bg-slate-800/10 border border-gray-500/20 rounded-lg p-2 sm:p-2.5 md:p-3">
                      <p className="text-white text-[10px] sm:text-xs leading-tight sm:leading-normal break-words">
                        💳 50% deposit now. Balance at appointment.
                      </p>
                    </div>

                    {/* Promo Code Input */}
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium">Have a Promo Code?</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="flex-1 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                          disabled={!!appliedPromo}
                        />
                        <Button
                          onClick={() => validatePromoCode(promoCode)}
                          disabled={!promoCode || !!appliedPromo}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          Apply
                        </Button>
                      </div>
                      {appliedPromo && (
                        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-sm font-medium">
                              {appliedPromo.code} applied - {appliedPromo.discount_type === 'percentage'
                                ? `${appliedPromo.discount_value}% off`
                                : `$${appliedPromo.discount_value} off`}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAppliedPromo(null);
                              setPromoCode('');
                            }}
                            className="text-emerald-400 hover:text-emerald-300 h-6 w-6 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Square Payment Form */}
                    {(() => {
                      const amount = bookingMode === 'group' ? calculateGroupTotal().total * 0.5 : calculateServicesTotal() * 0.5;
                      if (!amount || amount <= 0) {
                        return (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
                            ⚠️ Invalid payment amount. Please ensure services are selected.
                          </div>
                        );
                      }
                      return (
                        <SquarePaymentForm
                          amount={amount}
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentError={handlePaymentError}
                          description={bookingMode === 'group' ? 'Group booking deposit' : 'Appointment deposit'}
                          customerId={user?.id}
                          allowGuestCheckout={true}
                        />
                      );
                    })()}

                    {isProcessing && (
                      <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg">
                        <Loader2 className="h-6 w-6 animate-spin text-white mr-2" />
                        <span className="text-white">Processing your booking...</span>
                      </div>
                    )}

                    {/* Back Button */}
                    <div className="pt-4">
                      <Button
                        type="button"
                        onClick={prevStep}
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                        disabled={isProcessing}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Contact Info
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
