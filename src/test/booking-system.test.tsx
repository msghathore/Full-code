import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Booking from '@/pages/Booking';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-appointment-notifications', () => ({
  useAppointmentNotifications: () => ({
    scheduleReminder: vi.fn(),
    scheduleConfirmation: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-google-calendar-availability', () => ({
  useGoogleCalendarAvailability: () => ({
    availability: {
      slots: [
        { time: '09:00', available: true },
        { time: '10:30', available: true },
        { time: '12:00', available: false },
        { time: '13:30', available: true },
      ],
      isLoading: false,
      googleCalendarConnected: false,
    },
    getAvailableSlots: () => [{ time: '09:00', available: true }],
    getTimeAgo: () => '2 minutes ago',
    refreshAvailability: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

// Mock UI components
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ selected, onSelect }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onSelect(new Date())}>Select Date</button>
    </div>
  ),
}));

const TestBooking = () => (
  <BrowserRouter>
    <Booking />
  </BrowserRouter>
);

describe('Booking System Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Booking Form Rendering', () => {
    it('should render booking form successfully', async () => {
      render(<TestBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('BOOK APPOINTMENT')).toBeInTheDocument();
      });
    });

    it('should display step indicator with 4 steps', async () => {
      render(<TestBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Choose Service')).toBeInTheDocument();
        expect(screen.getByText('Date & Time')).toBeInTheDocument();
        expect(screen.getByText('Contact Info')).toBeInTheDocument();
        expect(screen.getByText('Review & Confirm')).toBeInTheDocument();
      });
    });

    it('should show service selection options', async () => {
      render(<TestBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Choose Service')).toBeInTheDocument();
      });
    });
  });

  describe('Form Navigation', () => {
    it('should allow navigation through booking steps', async () => {
      render(<TestBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Next Step')).toBeInTheDocument();
      });
      
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Date & Time')).toBeInTheDocument();
      });
    });

    it('should show Previous button on step 2 and beyond', async () => {
      render(<TestBooking />);
      
      await waitFor(() => {
        const nextButton = screen.getByText('Next Step');
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
      });
    });
  });

  describe('Service Selection', () => {
    it('should toggle between service and staff selection modes', async () => {
      render(<TestBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('Choose by Service')).toBeInTheDocument();
        expect(screen.getByText('Choose by Stylist')).toBeInTheDocument();
      });
      
      const staffButton = screen.getByText('Choose by Stylist');
      fireEvent.click(staffButton);
      
      await waitFor(() => {
        expect(screen.getByText('SELECT STYLIST')).toBeInTheDocument();
      });
    });
  });

  describe('Contact Information Form', () => {
    it('should show guest booking form when not authenticated', async () => {
      render(<TestBooking />);
      
      // Navigate to contact step
      await waitFor(() => {
        const nextButton = screen.getByText('Next Step');
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        const nextButton = screen.getByText('Next Step');
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('FULL NAME')).toBeInTheDocument();
        expect(screen.getByText('PHONE NUMBER')).toBeInTheDocument();
      });
    });

    it('should accept guest booking information', async () => {
      render(<TestBooking />);
      
      // Navigate to contact step
      await waitFor(() => {
        const nextButton = screen.getByText('Next Step');
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        const nextButton = screen.getByText('Next Step');
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Your full name');
        const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000 - We\'ll text confirmation');
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
        
        expect(nameInput).toHaveValue('John Doe');
        expect(phoneInput).toHaveValue('+1234567890');
      });
    });
  });

  describe('Date and Time Selection', () => {
    it('should display calendar and time slots', async () => {
      render(<TestBooking />);
      
      // Navigate to date/time step
      await waitFor(() => {
        const nextButton = screen.getByText('Next Step');
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
      });
    });

    it('should allow time slot selection', async () => {
      render(<TestBooking />);
      
      // Navigate to date/time step
      await waitFor(() => {
        const nextButton = screen.getByText('Next Step');
        fireEvent.click(nextButton);
      });
      
      await waitFor(() => {
        // Should show available time slots
        const timeSlots = screen.getAllByText(/^\d{2}:\d{2}$/);
        expect(timeSlots.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Booking Confirmation', () => {
    it('should show booking summary on final step', async () => {
      render(<TestBooking />);
      
      // Navigate to confirmation step
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const nextButton = screen.getByText('Next Step');
          fireEvent.click(nextButton);
        });
      }
      
      await waitFor(() => {
        expect(screen.getByText('Booking Summary')).toBeInTheDocument();
        expect(screen.getByText('Service:')).toBeInTheDocument();
        expect(screen.getByText('Date:')).toBeInTheDocument();
        expect(screen.getByText('Time:')).toBeInTheDocument();
      });
    });

    it('should handle booking submission', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: [{ id: 'test-id', status: 'pending' }],
        error: null,
      });
      
      const mockFrom = vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
      } as any);
      
      render(<TestBooking />);
      
      // Navigate to confirmation step and submit
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const nextButton = screen.getByText('Next Step');
          fireEvent.click(nextButton);
        });
      }
      
      await waitFor(() => {
        const confirmButton = screen.getByText('CONFIRM BOOKING');
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show validation errors for required fields', async () => {
      render(<TestBooking />);
      
      // Try to submit without filling required fields
      for (let i = 0; i < 3; i++) {
        await waitFor(() => {
          const nextButton = screen.getByText('Next Step');
          fireEvent.click(nextButton);
        });
      }
      
      await waitFor(() => {
        const confirmButton = screen.getByText('CONFIRM BOOKING');
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        // Should show error toast or validation message
        expect(screen.getByText(/error/i) || screen.getByText(/required/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI Responsiveness', () => {
    it('should adapt to mobile view', async () => {
      // Mock mobile hook
      vi.mocked(vi.mocked(require('@/hooks/use-mobile').useIsMobile)).mockReturnValue(true);
      
      render(<TestBooking />);
      
      await waitFor(() => {
        expect(screen.getByText('BOOK APPOINTMENT')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading States', () => {
    it('should show loading states while fetching data', async () => {
      render(<TestBooking />);
      
      // Should show skeleton loaders initially
      await waitFor(() => {
        const skeletons = screen.getAllByTestId('skeleton');
        expect(skeletons.length).toBeGreaterThan(0);
      }, { timeout: 1000 });
    });
  });
});