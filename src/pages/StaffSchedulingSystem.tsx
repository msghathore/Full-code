import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Calendar,
  Clock,
  Users,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  PlayCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  UserPlus,
  Zap,
  Crown,
  MessageSquare,
  CreditCard,
  Smartphone,
  Wifi,
  WifiOff,
  HelpCircle,
  Package,
  Plus,
  Minus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CalendarPlus,
  CalendarDays,
  Timer,
  CalendarX,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { staffApi, appointmentApi, customerApi, serviceApi, inventoryApi, StaffMember, Appointment, Customer, Service, InventoryItem } from '@/services/api';

// Import new modal components for slot actions
import { WaitlistModal } from '@/components/WaitlistModal';
import { PersonalTaskModal } from '@/components/PersonalTaskModal';
import { MultipleBookingModal } from '@/components/MultipleBookingModal';
import { EditShiftModal } from '@/components/EditShiftModal';
import { SlotActionMenu } from '@/components/SlotActionMenu';

// Live time line constants
const LIVE_TIME_LINE_COLOR = '#FFD700'; // Gold color
const SCHEDULE_START_HOUR = 8; // 8:00 AM
const PIXELS_PER_MINUTE = 2; // Adjust based on your time scale

type StaffMember = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'senior' | 'junior';
  specialty: string | null;
  avatar?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  access_level: 'full' | 'limited' | 'basic' | 'admin' | 'manager';
  color: string; // Staff-specific color identifier
};

type StaffColor = {
  id: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  lightBackground: string;
  lightBorder: string;
  lightText: string;
};

type Appointment = {
  id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  staff_id: string;
  status: 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  full_name: string;
  phone?: string;
  email?: string;
  total_amount?: number;
  notes?: string;
};

type TimeSlot = {
  time: string;
  hour: number;
  minute: number;
  display: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: number;
  supplier: string;
  last_restocked: string;
  expiration_date?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
};

// Generate time slots from 8 AM to 12 AM (16 hours) in 15-minute intervals (12-hour format)
const generateTimeSlots = (): TimeSlot[] => {
  const slots = [];
  for (let hour = 8; hour <= 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const displayHour = hour === 24 ? 0 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour12 = displayHour === 0 ? 12 : displayHour;
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        hour,
        minute,
        display: `${displayHour12}:${minute.toString().padStart(2, '0')} ${ampm}`
      });
    }
  }
  return slots;
};

// Accessibility-compliant color palette for staff members
const STAFF_COLORS: StaffColor[] = [
  {
    id: 'blue',
    color: '#3B82F6',
    backgroundColor: '#3B82F6',
    borderColor: '#1D4ED8',
    textColor: '#FFFFFF',
    lightBackground: '#DBEAFE',
    lightBorder: '#3B82F6',
    lightText: '#1E40AF'
  },
  {
    id: 'emerald',
    color: '#10B981',
    backgroundColor: '#10B981',
    borderColor: '#047857',
    textColor: '#FFFFFF',
    lightBackground: '#D1FAE5',
    lightBorder: '#10B981',
    lightText: '#065F46'
  },
  {
    id: 'purple',
    color: '#8B5CF6',
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
    textColor: '#FFFFFF',
    lightBackground: '#EDE9FE',
    lightBorder: '#8B5CF6',
    lightText: '#5B21B6'
  },
  {
    id: 'pink',
    color: '#EC4899',
    backgroundColor: '#EC4899',
    borderColor: '#BE185D',
    textColor: '#FFFFFF',
    lightBackground: '#FCE7F3',
    lightBorder: '#EC4899',
    lightText: '#9D174D'
  },
  {
    id: 'orange',
    color: '#F97316',
    backgroundColor: '#F97316',
    borderColor: '#EA580C',
    textColor: '#FFFFFF',
    lightBackground: '#FFEDD5',
    lightBorder: '#F97316',
    lightText: '#9A3412'
  },
  {
    id: 'teal',
    color: '#14B8A6',
    backgroundColor: '#14B8A6',
    borderColor: '#0F766E',
    textColor: '#FFFFFF',
    lightBackground: '#CCFBF1',
    lightBorder: '#14B8A6',
    lightText: '#115E59'
  },
  {
    id: 'red',
    color: '#EF4444',
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    textColor: '#FFFFFF',
    lightBackground: '#FEE2E2',
    lightBorder: '#EF4444',
    lightText: '#991B1B'
  },
  {
    id: 'indigo',
    color: '#6366F1',
    backgroundColor: '#6366F1',
    borderColor: '#4F46E5',
    textColor: '#FFFFFF',
    lightBackground: '#E0E7FF',
    lightBorder: '#6366F1',
    lightText: '#3730A3'
  }
];

// Optimized color configuration with caching
const colorCache = new Map<string, StaffColor>();
const getStaffColorConfig = (colorId: string): StaffColor => {
  // Check cache first for performance
  if (colorCache.has(colorId)) {
    return colorCache.get(colorId)!;
  }
  
  // Find color configuration
const color = STAFF_COLORS.find(c => c.id === colorId) || STAFF_COLORS[0];
  
  // Cache the result
  colorCache.set(colorId, color);
  return color;
};

// Clear color cache (for real-time synchronization)
const clearColorCache = () => {
  colorCache.clear();
};

// Batch color configuration for multiple staff members
const getBatchStaffColors = (staffMembers: StaffMember[]): Map<string, StaffColor> => {
  const result = new Map<string, StaffColor>();
  staffMembers.forEach(staff => {
    if (!colorCache.has(staff.color)) {
const colorConfig = STAFF_COLORS.find(c => c.id === staff.color) || STAFF_COLORS[0];
      colorCache.set(staff.color, colorConfig);
    }
    result.set(staff.id, colorCache.get(staff.color)!);
  });
  return result;
};

const validateColorUniqueness = (newColorId: string, existingColors: string[]): boolean => {
  return !existingColors.includes(newColorId);
};

const assignUniqueColor = (staffId: string, existingColors: string[]): string => {
  for (const color of STAFF_COLORS) {
    if (validateColorUniqueness(color.id, existingColors)) {
      return color.id;
    }
  }
  // If all colors are taken, use a hash-based assignment
  const hash = staffId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return STAFF_COLORS[Math.abs(hash) % STAFF_COLORS.length].id;
};

// Mock staff data with assigned colors
const mockStaff: StaffMember[] = [
  { id: 'EMP001', name: 'Sarah Johnson', username: 'sarah', password: 'staff2024', role: 'senior', specialty: 'Hair Styling', status: 'available', access_level: 'admin', color: 'blue' },
  { id: 'EMP002', name: 'Mike Chen', username: 'mike', password: 'staff2024', role: 'senior', specialty: 'Nails', status: 'busy', access_level: 'manager', color: 'emerald' },
  { id: 'EMP003', name: 'Emma Davis', username: 'emma', password: 'staff2024', role: 'junior', specialty: 'Massage', status: 'available', access_level: 'full', color: 'purple' },
  { id: 'EMP004', name: 'Alex Rivera', username: 'alex', password: 'staff2024', role: 'junior', specialty: 'Facials', status: 'break', access_level: 'basic', color: 'pink' }
];

// Mock appointments data - Comprehensive booking data to show busy calendar
const mockAppointments: Appointment[] = [
  // Early morning appointments
  {
    id: '1',
    service_name: 'Hair Cut & Style',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '08:30',
    staff_id: 'EMP001',
    status: 'confirmed',
    full_name: 'Sarah Parker',
    phone: '+1-555-0101',
    email: 'sarah.p@email.com',
    total_amount: 65,
    notes: 'Regular cut, prefers layered style'
  },
  {
    id: '2',
    service_name: 'Manicure',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '09:00',
    staff_id: 'EMP002',
    status: 'confirmed',
    full_name: 'Lisa Johnson',
    phone: '+1-555-0102',
    email: 'lisa.j@email.com',
    total_amount: 40,
    notes: 'Classic red polish'
  },

  // Morning appointments
  {
    id: '3',
    service_name: 'Hair Cut & Style',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '10:00',
    staff_id: 'EMP001',
    status: 'confirmed',
    full_name: 'John Doe',
    phone: '+1-555-0123',
    email: 'john@example.com',
    total_amount: 75,
    notes: 'Prefers short hair, classic style'
  },
  {
    id: '4',
    service_name: 'Massage',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '10:30',
    staff_id: 'EMP003',
    status: 'arrived',
    full_name: 'Emily Davis',
    phone: '+1-555-0124',
    email: 'emily.d@email.com',
    total_amount: 85,
    notes: 'Deep tissue massage'
  },
  {
    id: '5',
    service_name: 'Nail Polish Change',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '11:00',
    staff_id: 'EMP002',
    status: 'confirmed',
    full_name: 'Maria Garcia',
    phone: '+1-555-0125',
    total_amount: 25,
    notes: 'Quick change to French tips'
  },

  // Mid-morning appointments
  {
    id: '6',
    service_name: 'Facial Treatment',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '11:30',
    staff_id: 'EMP004',
    status: 'confirmed',
    full_name: 'Amanda Wilson',
    phone: '+1-555-0126',
    email: 'amanda.w@email.com',
    total_amount: 120,
    notes: 'Hydrating facial treatment'
  },
  {
    id: '7',
    service_name: 'Hair Color',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '11:30',
    staff_id: 'EMP001',
    status: 'in-progress',
    full_name: 'Jennifer Brown',
    phone: '+1-555-0127',
    email: 'jen.brown@email.com',
    total_amount: 150,
    notes: 'Brown to blonde highlights'
  },

  // Lunch time appointments
  {
    id: '8',
    service_name: 'Eyebrow Wax',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '12:00',
    staff_id: 'EMP004',
    status: 'confirmed',
    full_name: 'Rachel Green',
    phone: '+1-555-0128',
    total_amount: 30,
    notes: 'Quick eyebrow cleanup'
  },
  {
    id: '9',
    service_name: 'Manicure',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '12:30',
    staff_id: 'EMP002',
    status: 'confirmed',
    full_name: 'Sophie Turner',
    phone: '+1-555-0129',
    email: 'sophie.t@email.com',
    total_amount: 45,
    notes: 'Gel manicure with art'
  },

  // Afternoon appointments
  {
    id: '10',
    service_name: 'Massage',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '13:00',
    staff_id: 'EMP003',
    status: 'confirmed',
    full_name: 'David Kim',
    phone: '+1-555-0130',
    total_amount: 90,
    notes: 'Sports massage'
  },
  {
    id: '11',
    service_name: 'Hair Cut & Style',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '13:30',
    staff_id: 'EMP001',
    status: 'confirmed',
    full_name: 'Megan Fox',
    phone: '+1-555-0131',
    email: 'meg.fox@email.com',
    total_amount: 70,
    notes: 'Bob cut trim'
  },
  {
    id: '12',
    service_name: 'Facial Treatment',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '14:00',
    staff_id: 'EMP004',
    status: 'in-progress',
    full_name: 'Bob Wilson',
    phone: '+1-555-0132',
    total_amount: 95,
    notes: 'First time customer'
  },
  {
    id: '13',
    service_name: 'Pedicure',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '14:00',
    staff_id: 'EMP002',
    status: 'confirmed',
    full_name: 'Carol White',
    phone: '+1-555-0133',
    email: 'carol.w@email.com',
    total_amount: 55,
    notes: 'Spa pedicure with massage'
  },

  // Mid-afternoon appointments
  {
    id: '14',
    service_name: 'Hair Color',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '14:30',
    staff_id: 'EMP001',
    status: 'confirmed',
    full_name: 'Kelly Clarkson',
    phone: '+1-555-0134',
    total_amount: 165,
    notes: 'Root touch-up'
  },
  {
    id: '15',
    service_name: 'Massage',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '15:00',
    staff_id: 'EMP003',
    status: 'confirmed',
    full_name: 'Michael Jordan',
    phone: '+1-555-0135',
    total_amount: 100,
    notes: 'Relaxation massage'
  },
  {
    id: '16',
    service_name: 'Waxing - Legs',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '15:00',
    staff_id: 'EMP004',
    status: 'confirmed',
    full_name: 'Jessica Alba',
    phone: '+1-555-0136',
    email: 'jessica.a@email.com',
    total_amount: 60,
    notes: 'Full leg waxing'
  },

  // Late afternoon appointments
  {
    id: '17',
    service_name: 'Highlights',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '15:30',
    staff_id: 'EMP001',
    status: 'confirmed',
    full_name: 'Taylor Swift',
    phone: '+1-555-0137',
    email: 'taylor.s@email.com',
    total_amount: 180,
    notes: 'Platinum blonde highlights'
  },
  {
    id: '18',
    service_name: 'Manicure',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '16:00',
    staff_id: 'EMP002',
    status: 'confirmed',
    full_name: 'Selena Gomez',
    phone: '+1-555-0138',
    total_amount: 50,
    notes: 'French manicure with Rhinestones'
  },
  {
    id: '19',
    service_name: 'Facial Treatment',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '16:30',
    staff_id: 'EMP004',
    status: 'confirmed',
    full_name: 'Angelina Jolie',
    phone: '+1-555-0139',
    email: 'angelina.j@email.com',
    total_amount: 130,
    notes: 'Anti-aging facial'
  },

  // Evening appointments
  {
    id: '20',
    service_name: 'Hair Cut & Style',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '17:00',
    staff_id: 'EMP001',
    status: 'confirmed',
    full_name: 'Brad Pitt',
    phone: '+1-555-0140',
    total_amount: 55,
    notes: 'Quick trim'
  },
  {
    id: '21',
    service_name: 'Massage',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '17:30',
    staff_id: 'EMP003',
    status: 'confirmed',
    full_name: 'Tom Cruise',
    phone: '+1-555-0141',
    total_amount: 95,
    notes: 'Deep tissue massage'
  },
  {
    id: '22',
    service_name: 'Manicure',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '18:00',
    staff_id: 'EMP002',
    status: 'confirmed',
    full_name: 'Emma Watson',
    phone: '+1-555-0142',
    email: 'emma.w@email.com',
    total_amount: 45,
    notes: 'Classic manicure'
  },
  {
    id: '23',
    service_name: 'Facial Treatment',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '18:30',
    staff_id: 'EMP004',
    status: 'confirmed',
    full_name: 'Scarlett Johansson',
    phone: '+1-555-0143',
    total_amount: 110,
    notes: 'Cleansing facial'
  }
];

// Mock inventory data - Extensive mock data for better testing
const mockInventory: InventoryItem[] = [
  // Hair Care Products
  {
    id: '1',
    name: 'Professional Shampoo - Moisturizing',
    category: 'Hair Care',
    current_stock: 25,
    min_stock_level: 10,
    max_stock_level: 50,
    unit_cost: 15.99,
    supplier: 'Beauty Supply Co.',
    last_restocked: '2024-11-15',
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Hair Dye - Dark Brown 4.0',
    category: 'Hair Color',
    current_stock: 3,
    min_stock_level: 5,
    max_stock_level: 20,
    unit_cost: 8.50,
    supplier: 'Color Masters',
    last_restocked: '2024-11-10',
    status: 'low-stock'
  },
  {
    id: '3',
    name: 'Hair Dye - Jet Black 1.0',
    category: 'Hair Color',
    current_stock: 8,
    min_stock_level: 5,
    max_stock_level: 20,
    unit_cost: 8.50,
    supplier: 'Color Masters',
    last_restocked: '2024-11-10',
    status: 'in-stock'
  },
  {
    id: '4',
    name: 'Hair Dye - Golden Blonde 8.3',
    category: 'Hair Color',
    current_stock: 0,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 9.99,
    supplier: 'Color Masters',
    last_restocked: '2024-11-05',
    status: 'out-of-stock'
  },
  {
    id: '5',
    name: 'Hair Conditioner - Repair',
    category: 'Hair Care',
    current_stock: 18,
    min_stock_level: 8,
    max_stock_level: 30,
    unit_cost: 12.75,
    supplier: 'Beauty Supply Co.',
    last_restocked: '2024-11-18',
    status: 'in-stock'
  },
  {
    id: '6',
    name: 'Hair Treatment Mask',
    category: 'Hair Care',
    current_stock: 4,
    min_stock_level: 6,
    max_stock_level: 15,
    unit_cost: 18.99,
    supplier: 'Beauty Supply Co.',
    last_restocked: '2024-11-12',
    status: 'low-stock'
  },

  // Nail Care Products
  {
    id: '7',
    name: 'Nail Polish - Classic Red',
    category: 'Nail Care',
    current_stock: 0,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 6.99,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-05',
    status: 'out-of-stock'
  },
  {
    id: '8',
    name: 'Nail Polish - French White',
    category: 'Nail Care',
    current_stock: 12,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 6.99,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-12',
    status: 'in-stock'
  },
  {
    id: '9',
    name: 'Nail Polish - Midnight Black',
    category: 'Nail Care',
    current_stock: 8,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 7.50,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-12',
    status: 'in-stock'
  },
  {
    id: '10',
    name: 'Nail Top Coat - Glossy',
    category: 'Nail Care',
    current_stock: 2,
    min_stock_level: 4,
    max_stock_level: 12,
    unit_cost: 5.99,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-08',
    status: 'low-stock'
  },
  {
    id: '11',
    name: 'Nail Base Coat',
    category: 'Nail Care',
    current_stock: 6,
    min_stock_level: 4,
    max_stock_level: 12,
    unit_cost: 5.99,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-15',
    status: 'in-stock'
  },
  {
    id: '12',
    name: 'Nail File - 180/240 Grit',
    category: 'Nail Care',
    current_stock: 24,
    min_stock_level: 10,
    max_stock_level: 30,
    unit_cost: 2.50,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-14',
    status: 'in-stock'
  },
  {
    id: '13',
    name: 'Acrylic Nail Tips',
    category: 'Nail Care',
    current_stock: 45,
    min_stock_level: 20,
    max_stock_level: 60,
    unit_cost: 3.25,
    supplier: 'Nail Art Supplies',
    last_restocked: '2024-11-10',
    status: 'in-stock'
  },

  // Spa and Skincare Products
  {
    id: '14',
    name: 'Massage Oil - Lavender',
    category: 'Spa',
    current_stock: 15,
    min_stock_level: 8,
    max_stock_level: 25,
    unit_cost: 12.50,
    supplier: 'Essential Oils Co.',
    last_restocked: '2024-11-20',
    expiration_date: '2025-06-15',
    status: 'in-stock'
  },
  {
    id: '15',
    name: 'Massage Oil - Eucalyptus',
    category: 'Spa',
    current_stock: 7,
    min_stock_level: 8,
    max_stock_level: 25,
    unit_cost: 12.50,
    supplier: 'Essential Oils Co.',
    last_restocked: '2024-11-16',
    expiration_date: '2025-06-15',
    status: 'low-stock'
  },
  {
    id: '16',
    name: 'Face Cleansing Foam',
    category: 'Skincare',
    current_stock: 12,
    min_stock_level: 6,
    max_stock_level: 20,
    unit_cost: 14.99,
    supplier: 'Skincare Solutions',
    last_restocked: '2024-11-17',
    expiration_date: '2025-08-20',
    status: 'in-stock'
  },
  {
    id: '17',
    name: 'Moisturizing Face Cream',
    category: 'Skincare',
    current_stock: 3,
    min_stock_level: 6,
    max_stock_level: 20,
    unit_cost: 22.50,
    supplier: 'Skincare Solutions',
    last_restocked: '2024-11-09',
    expiration_date: '2025-09-10',
    status: 'low-stock'
  },
  {
    id: '18',
    name: 'Anti-Aging Serum',
    category: 'Skincare',
    current_stock: 0,
    min_stock_level: 4,
    max_stock_level: 12,
    unit_cost: 35.00,
    supplier: 'Skincare Solutions',
    last_restocked: '2024-10-28',
    expiration_date: '2025-07-05',
    status: 'out-of-stock'
  },
  {
    id: '19',
    name: 'Sugar Scrub - Vanilla',
    category: 'Spa',
    current_stock: 9,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 8.75,
    supplier: 'Essential Oils Co.',
    last_restocked: '2024-11-13',
    expiration_date: '2025-05-30',
    status: 'in-stock'
  },
  {
    id: '20',
    name: 'Body Lotion - Shea Butter',
    category: 'Spa',
    current_stock: 16,
    min_stock_level: 8,
    max_stock_level: 25,
    unit_cost: 9.99,
    supplier: 'Essential Oils Co.',
    last_restocked: '2024-11-19',
    expiration_date: '2025-08-15',
    status: 'in-stock'
  },

  // Cleaning and Sanitizing
  {
    id: '21',
    name: 'Barbicide Disinfectant',
    category: 'Sanitation',
    current_stock: 5,
    min_stock_level: 3,
    max_stock_level: 10,
    unit_cost: 12.99,
    supplier: 'Professional Supplies',
    last_restocked: '2024-11-14',
    status: 'in-stock'
  },
  {
    id: '22',
    name: 'Hand Sanitizer - 70% Alcohol',
    category: 'Sanitation',
    current_stock: 2,
    min_stock_level: 6,
    max_stock_level: 15,
    unit_cost: 4.50,
    supplier: 'Professional Supplies',
    last_restocked: '2024-11-06',
    status: 'low-stock'
  },
  {
    id: '23',
    name: 'Disinfectant Wipes',
    category: 'Sanitation',
    current_stock: 8,
    min_stock_level: 5,
    max_stock_level: 20,
    unit_cost: 3.99,
    supplier: 'Professional Supplies',
    last_restocked: '2024-11-15',
    status: 'in-stock'
  },

  // Waxing and Hair Removal
  {
    id: '24',
    name: 'Hot Wax - Hard Formula',
    category: 'Waxing',
    current_stock: 3,
    min_stock_level: 4,
    max_stock_level: 12,
    unit_cost: 18.75,
    supplier: 'Hair Removal Co.',
    last_restocked: '2024-11-07',
    status: 'low-stock'
  },
  {
    id: '25',
    name: 'Wax Strips',
    category: 'Waxing',
    current_stock: 15,
    min_stock_level: 8,
    max_stock_level: 25,
    unit_cost: 6.50,
    supplier: 'Hair Removal Co.',
    last_restocked: '2024-11-16',
    status: 'in-stock'
  },
  {
    id: '26',
    name: 'Pre-Wax Cleansing Oil',
    category: 'Waxing',
    current_stock: 7,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 8.25,
    supplier: 'Hair Removal Co.',
    last_restocked: '2024-11-11',
    status: 'in-stock'
  },

  // Tinting and Makeup
  {
    id: '27',
    name: 'Eyebrow Tint - Dark Brown',
    category: 'Tinting',
    current_stock: 4,
    min_stock_level: 3,
    max_stock_level: 10,
    unit_cost: 15.99,
    supplier: 'Tint Solutions',
    last_restocked: '2024-11-12',
    expiration_date: '2025-10-20',
    status: 'in-stock'
  },
  {
    id: '28',
    name: 'Eyelash Tint - Black',
    category: 'Tinting',
    current_stock: 1,
    min_stock_level: 3,
    max_stock_level: 10,
    unit_cost: 16.50,
    supplier: 'Tint Solutions',
    last_restocked: '2024-11-08',
    expiration_date: '2025-10-15',
    status: 'low-stock'
  },
  {
    id: '29',
    name: 'Brow Gel - Clear',
    category: 'Tinting',
    current_stock: 0,
    min_stock_level: 2,
    max_stock_level: 8,
    unit_cost: 12.99,
    supplier: 'Tint Solutions',
    last_restocked: '2024-11-01',
    expiration_date: '2025-09-25',
    status: 'out-of-stock'
  },

  // Equipment and Tools
  {
    id: '30',
    name: 'Nail Drill Bits - Coarse',
    category: 'Equipment',
    current_stock: 8,
    min_stock_level: 5,
    max_stock_level: 15,
    unit_cost: 11.99,
    supplier: 'Professional Tools Inc.',
    last_restocked: '2024-11-13',
    status: 'in-stock'
  },
  {
    id: '31',
    name: 'UV Nail Lamp Bulbs',
    category: 'Equipment',
    current_stock: 6,
    min_stock_level: 4,
    max_stock_level: 12,
    unit_cost: 9.50,
    supplier: 'Professional Tools Inc.',
    last_restocked: '2024-11-10',
    status: 'in-stock'
  },
  {
    id: '32',
    name: 'Cuticle Pushers - Stainless Steel',
    category: 'Equipment',
    current_stock: 14,
    min_stock_level: 8,
    max_stock_level: 20,
    unit_cost: 4.25,
    supplier: 'Professional Tools Inc.',
    last_restocked: '2024-11-15',
    status: 'in-stock'
  },
  {
    id: '33',
    name: 'Nail Brushes - Detail Work',
    category: 'Equipment',
    current_stock: 3,
    min_stock_level: 6,
    max_stock_level: 15,
    unit_cost: 7.99,
    supplier: 'Professional Tools Inc.',
    last_restocked: '2024-11-09',
    status: 'low-stock'
  },

  // Additional Salon Supplies
  {
    id: '34',
    name: 'Salon Towels - White',
    category: 'Salon Supplies',
    current_stock: 22,
    min_stock_level: 15,
    max_stock_level: 40,
    unit_cost: 2.75,
    supplier: 'Salon Essentials',
    last_restocked: '2024-11-14',
    status: 'in-stock'
  },
  {
    id: '35',
    name: 'Capes - Professional Black',
    category: 'Salon Supplies',
    current_stock: 7,
    min_stock_level: 5,
    max_stock_level: 12,
    unit_cost: 24.99,
    supplier: 'Salon Essentials',
    last_restocked: '2024-11-11',
    status: 'in-stock'
  },
  {
    id: '36',
    name: 'Color Mixing Bowls',
    category: 'Salon Supplies',
    current_stock: 2,
    min_stock_level: 4,
    max_stock_level: 10,
    unit_cost: 6.50,
    supplier: 'Salon Essentials',
    last_restocked: '2024-11-05',
    status: 'low-stock'
  }
];

const StaffSchedulingSystem = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  // Check for saved authentication and appointments on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('staffAuth');
    if (savedAuth) {
      try {
        const { staffMember } = JSON.parse(savedAuth);
        const foundStaff = mockStaff.find(s => s.id === staffMember.id);
        if (foundStaff) {
          setCurrentStaff(foundStaff);
          setIsAuthenticated(true);
          setTheme('light');
          navigate('/staff');
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('staffAuth');
      }
    }

    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem('staffAppointments');
    if (savedAppointments) {
      try {
        const appointments = JSON.parse(savedAppointments);
        setAppointments(appointments);
      } catch (error) {
        console.error('Error parsing saved appointments:', error);
        localStorage.removeItem('staffAppointments');
      }
    }
  }, []);

  // Data state - Start with empty appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  
  // Real-time line state
  const [currentTime, setCurrentTime] = useState(new Date());
  const PIXELS_PER_15_MINUTES = 40; // Deduced from min-h-[40px] on line 1952
  const PIXELS_PER_MINUTE = PIXELS_PER_15_MINUTES / 15;
  
  // Auto-logout timer state
  const [tenSecondWarningShown, setTenSecondWarningShown] = useState(false);
  const [lastActivity, setLastActivity] = useState(new Date());
  const lastActivityRef = useRef(new Date()); // Keep ref in sync with state
  const sessionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Booking functionality state
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<{staffId: string, time: string, staffMember: StaffMember} | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{staffId: string, time: string} | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{staffId: string, time: string} | null>(null);
  const [showSlotPopover, setShowSlotPopover] = useState(false);
  const [slotPopoverPosition, setSlotPopoverPosition] = useState<{x: number, y: number, position: string, cellCenterY: number} | null>(null);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    customerPhone: '',
    customerEmail: '',
    service: '',
    notes: ''
  });
  const [selectedFilterService, setSelectedFilterService] = useState<string>('All');
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<string | null>(null);

  // Popover positioning constants
  const ARROW_HALF_SIZE = 6; // Half of 12px arrow size
  const POPOVER_WIDTH = 320; // Width of the popover
  const POPOVER_HEIGHT = 300; // Approximate height of the popover
  const GAP = 8; // Gap between cell and popover

  // Slot Action Modal State - FIXED: Added persistent modal data to prevent state loss
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showPersonalTaskModal, setShowPersonalTaskModal] = useState(false);
  const [showMultipleBookingModal, setShowMultipleBookingModal] = useState(false);
  const [showEditShiftModal, setShowEditShiftModal] = useState(false);
  
  // FIXED: Persistent modal data to maintain context when popover closes
  const [modalData, setModalData] = useState<{
    staffId: string;
    staffMemberName: string;
    selectedDate: Date;
    selectedTime: string;
  } | null>(null);

  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Derived list of all unique services from appointments
  const allServices = useMemo(() => {
    const services = new Set<string>(['All']);
    mockAppointments.forEach(apt => services.add(apt.service_name));
    return Array.from(services).sort();
  }, []);

  // Filtered staff list based on selected service
  const filteredStaff = useMemo(() => {
    if (selectedFilterService === 'All') {
      return staff;
    }
    
    // Find staff who have at least one appointment for the selected service on the current day
    const staffIdsWithService = new Set<string>();
    appointments.forEach(apt => {
      if (apt.service_name === selectedFilterService && apt.appointment_date === format(selectedDate, 'yyyy-MM-dd')) {
        staffIdsWithService.add(apt.staff_id);
      }
    });
    
    // Fallback: If no appointments for that service today, check staff specialty (less accurate but better than showing nothing)
    if (staffIdsWithService.size === 0) {
      return staff.filter(s => s.specialty?.includes(selectedFilterService.replace(' - ', ''))); // Simple check for specialty match
    }
    
    return staff.filter(s => staffIdsWithService.has(s.id));
  }, [staff, appointments, selectedDate, selectedFilterService]);

  // Real-time validation states
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isBooking, setIsBooking] = useState(false);

  // Auto-refresh every minute
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, 60000); // 60 seconds = 1 minute

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Effect to update current time for the live line
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds for better real-time feel
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle clicks outside popover and escape key
  useEffect(() => {
    if (!showSlotPopover) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-slot-popover]') && !target.closest('.slot-clickable')) {
        console.log('[DEBUG] Clicking outside - closing popover');
        closeSlotPopover();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('[DEBUG] Escape key pressed - closing popover');
        closeSlotPopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSlotPopover]);

  // Real-time validation effect
  useEffect(() => {
    const errors: {[key: string]: string} = {};
    
    if (bookingForm.firstName && !validateName(bookingForm.firstName)) {
      errors.firstName = 'Please enter a valid first name';
    }
    if (bookingForm.lastName && !validateName(bookingForm.lastName)) {
      errors.lastName = 'Please enter a valid last name';
    }
    if (bookingForm.customerPhone && !validatePhone(bookingForm.customerPhone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (bookingForm.customerEmail && !validateEmail(bookingForm.customerEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
  }, [bookingForm]);

  // Combined session management (countdown + logout check)
  const manageSession = () => {
    const now = new Date();
    const currentLastActivity = lastActivityRef.current; // Use ref to avoid closure issues
    const elapsedMs = now.getTime() - currentLastActivity.getTime();
    
    // Debug logging to track exactly what's happening
    console.log(`[DEBUG] === SESSION CHECK ===`);
    console.log(`[DEBUG] Last activity time (ref): ${currentLastActivity.toISOString()}`);
    console.log(`[DEBUG] Current time: ${now.toISOString()}`);
    console.log(`[DEBUG] Elapsed time: ${elapsedMs}ms (${(elapsedMs/1000).toFixed(1)} seconds)`);
    console.log(`[DEBUG] Timeout threshold: 60000ms (60 seconds)`);
    console.log(`[DEBUG] Will logout?: ${elapsedMs >= 60000 ? 'YES' : 'NO'}`);
    
    if (elapsedMs >= 300 * 1000) { // 300 seconds (5 minutes)
      console.log(`[DEBUG] 🚨 AUTO-LOGOUT TRIGGERED after ${elapsedMs}ms (${(elapsedMs/1000).toFixed(1)} seconds)`);
      console.log(`[DEBUG] About to call logout() - isAuthenticated: ${isAuthenticated}`);
      
      // Show 10-second warning before logout
      if (!tenSecondWarningShown) {
        console.log(`[DEBUG] Showing 10-second warning popup`);
        setTenSecondWarningShown(true);
        toast({
          title: "Session Expiring",
          description: "You will be automatically logged out in 10 seconds due to inactivity.",
          variant: "destructive",
        });
      }
      
      logout();
      console.log(`[DEBUG] logout() called`);
    } else {
      console.log(`[DEBUG] ✅ Still active - ${Math.ceil((300000 - elapsedMs)/1000)} seconds until timeout`);
    }
  };

  // Start session management
  const startSessionManagement = () => {
    console.log('[DEBUG] Starting Staff session management interval');
    manageSession(); // Run once immediately
    sessionIntervalRef.current = setInterval(manageSession, 1000); // Check every second
    console.log('[DEBUG] Staff session interval started:', sessionIntervalRef.current);
  };

  // Activity tracking for automatic logout
  const trackActivity = (eventType) => {
    const prevLastActivity = lastActivityRef.current;
    const newActivityTime = new Date();
    const elapsedBeforeReset = newActivityTime.getTime() - prevLastActivity.getTime();
    
    console.log(`[DEBUG] 🚀 ACTIVITY DETECTED: ${eventType || 'unknown'}`);
    console.log(`[DEBUG] Previous activity time: ${prevLastActivity.toISOString()}`);
    console.log(`[DEBUG] New activity time: ${newActivityTime.toISOString()}`);
    console.log(`[DEBUG] Time since last activity: ${elapsedBeforeReset}ms (${(elapsedBeforeReset/1000).toFixed(1)} seconds)`);
    
    // Update both state and ref
    setLastActivity(newActivityTime);
    lastActivityRef.current = newActivityTime;
    setTenSecondWarningShown(false); // Reset warning state
    
    console.log(`[DEBUG] ✅ Timer system reset - 60 seconds until next timeout`);
  };

  // Enhanced auto-logout timer logic with debug logging
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('[DEBUG] Staff Dashboard authenticated, setting up session management');
    
    // Start session management
    startSessionManagement();

    console.log('[DEBUG] Setting up activity event listeners...');
    
    // MANY more event types for comprehensive detection (keyboard events removed to avoid interference)
    const events = [
      'mousedown', 'mousemove', 'mouseup', 'click', 'dblclick',
      'scroll', 'wheel', 'mousewheel', 'DOMMouseScroll',
      'touchstart', 'touchmove', 'touchend',
      'focus', 'blur', 'change', 'input'
    ];
    
    console.log(`[DEBUG] Adding ${events.length} event listeners...`);
    events.forEach((event, index) => {
      console.log(`[DEBUG] Adding listener ${index + 1}: ${event}`);
      document.addEventListener(event, (e) => trackActivity(event));
      window.addEventListener(event, (e) => trackActivity(event));
    });
    
    console.log('[DEBUG] All activity listeners setup complete');

    return () => {
      console.log('[DEBUG] Cleaning up activity event listeners...');
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
      // Remove activity event listeners
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
        window.removeEventListener(event, trackActivity);
      });
      console.log('[DEBUG] Activity listeners cleanup complete');
    };
  }, [isAuthenticated]);

  // Note: Original timer logic removed - using new session management system

  // Authenticate staff member
  const authenticate = () => {
    const foundStaff = staff.find(s => s.id === employeeId);
    if (foundStaff) {
      setCurrentStaff(foundStaff);
      setIsAuthenticated(true);
      setTheme('light');
      navigate('/staff'); // Navigate to dashboard on successful login
      setEmployeeId('');
      
      // Save authentication state to localStorage
      localStorage.setItem('staffAuth', JSON.stringify({
        staffMember: foundStaff,
        timestamp: Date.now()
      }));
      
      toast({
        title: "Access Granted",
        description: `Welcome ${foundStaff.name}!`,
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid employee ID",
        variant: "destructive",
      });
    }
  };

  // Logout function
  const logout = () => {
    console.log(`[DEBUG] logout() called - starting logout process`);
    console.log(`[DEBUG] Current isAuthenticated: ${isAuthenticated}`);
    
    localStorage.removeItem('staffAuth');
    console.log(`[DEBUG] localStorage cleared`);
    
    setCurrentStaff(null);
    console.log(`[DEBUG] setCurrentStaff(null) called`);
    
    setIsAuthenticated(false);
    console.log(`[DEBUG] setIsAuthenticated(false) called`);
    
    setEmployeeId('');
    console.log(`[DEBUG] setEmployeeId('') called`);
    
    // Reset warning state for next session
    setTenSecondWarningShown(false);
    console.log(`[DEBUG] setTenSecondWarningShown(false) called`);
    
    setTheme('dark');

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    console.log(`[DEBUG] Logout process completed`);
  };

  // Batch update for performance with real-time synchronization
  const batchUpdateStatus = (appointmentIds: string[], newStatus: string) => {
    try {
      // Clear color cache for real-time sync
      clearColorCache();
      
      // Batch update appointments
      setAppointments(prev => {
        const updatedAppointments = prev.map(apt =>
          appointmentIds.includes(apt.id)
            ? { ...apt, status: newStatus as any }
            : apt
        );
        // Save to localStorage for persistence
        localStorage.setItem('staffAppointments', JSON.stringify(updatedAppointments));
        return updatedAppointments;
      });

      toast({
        title: "Success",
        description: `${appointmentIds.length} appointment(s) updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Update appointment status
  const updateStatus = async (appointmentId: string, newStatus: string) => {
    batchUpdateStatus([appointmentId], newStatus);
  };

  // Real-time color synchronization manager
  const synchronizeColors = useCallback(() => {
    // Clear cache and re-populate with current staff colors
    clearColorCache();
    
    // Batch process all staff colors for performance
    const staffColorMap = getBatchStaffColors(staff);
    
    // Log synchronization for debugging
    console.log('Color synchronization completed:', staffColorMap.size, 'staff members processed');
    
    return staffColorMap;
  }, [staff]);
  
  // Function to calculate top position for the live line
  const calculateLiveLineTop = useCallback(() => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Calculate minutes past 8:00 AM (SCHEDULE_START_HOUR)
    const minutesSinceStart = (currentHour - SCHEDULE_START_HOUR) * 60 + currentMinute;
    
    if (minutesSinceStart < 0) {
      // Time is before 8:00 AM, position above schedule start (e.g., -1 hour offset)
      return -60 * PIXELS_PER_MINUTE;
    }
    
    const topPosition = minutesSinceStart * PIXELS_PER_MINUTE;
    
    // Limit to a reasonable max scroll range if needed, but for now, return calculated value
    return topPosition;
  }, [currentTime]);

  // Initialize color synchronization on component mount
  useEffect(() => {
    synchronizeColors();
  }, [synchronizeColors]);

  // Auto-synchronize colors when staff data changes
  useEffect(() => {
    if (staff.length > 0) {
      synchronizeColors();
    }
  }, [staff, synchronizeColors]);

  // Get appointments for specific staff and time slot
  const getAppointmentsForSlot = (staffId: string, date: Date, time: string) => {
    return appointments.filter(apt => 
      apt.staff_id === staffId && 
      apt.appointment_date === format(date, 'yyyy-MM-dd') && 
      apt.appointment_time === time
    );
  };

  // Get staff-based appointment styling (colors based on assigned staff member)
  const getAppointmentStyling = (appointment: Appointment, staffMember: StaffMember) => {
    // Get a color based on the service type
    const serviceColors: {[key: string]: {backgroundColor: string, borderColor: string, textColor: string}} = {
      'Hair Cut & Style': { backgroundColor: '#DBEAFE', borderColor: '#3B82F6', textColor: '#1E40AF' },
      'Manicure': { backgroundColor: '#FCE7F3', borderColor: '#EC4899', textColor: '#9D174D' },
      'Pedicure': { backgroundColor: '#FDE68A', borderColor: '#F59E0B', textColor: '#78350F' },
      'Facial Treatment': { backgroundColor: '#D1FAE5', borderColor: '#10B981', textColor: '#065F46' },
      'Massage': { backgroundColor: '#E0E7FF', borderColor: '#6366F1', textColor: '#3730A3' },
      'Hair Color': { backgroundColor: '#FBCFE8', borderColor: '#DB2777', textColor: '#831843' },
      'Highlights': { backgroundColor: '#FFE4E6', borderColor: '#F43F5E', textColor: '#831843' },
      'Waxing': { backgroundColor: '#FED7AA', borderColor: '#EA580C', textColor: '#9A3412' },
      'Eyebrow Wax': { backgroundColor: '#FEF3C7', borderColor: '#D97706', textColor: '#78350F' },
      'Nail Polish Change': { backgroundColor: '#FAE8FF', borderColor: '#A855F7', textColor: '#581C87' }
    };

    // Default to blue if service not found
    const defaultColor = { backgroundColor: '#DBEAFE', borderColor: '#3B82F6', textColor: '#1E40AF' };
    const serviceColor = serviceColors[appointment.service_name] || defaultColor;
    
    return {
      backgroundColor: serviceColor.backgroundColor,
      borderColor: serviceColor.borderColor,
      textColor: serviceColor.textColor,
      icon: getStatusIcon(appointment.status),
      label: appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')
    };
  };

  // Function to move an appointment to a different staff member
  const handleMoveAppointment = (appointmentId: string, newStaffId: string, newTime: string) => {
    setAppointments(prev => {
      const updatedAppointments = prev.map(apt => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            staff_id: newStaffId,
            appointment_time: newTime
          };
        }
        return apt;
      });
      
      // Save to localStorage for persistence
      localStorage.setItem('staffAppointments', JSON.stringify(updatedAppointments));
      return updatedAppointments;
    });
    
    toast({
      title: "Appointment Moved",
      description: "The appointment has been moved successfully.",
    });
  };

  // Get status icon for appointment
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return CheckCircle;
      case 'arrived':
        return UserCheck;
      case 'in-progress':
        return PlayCircle;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  // Get status badge configuration (for list views)
  const getStatusConfig = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          bgColor: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Confirmed'
        };
      case 'arrived':
        return {
          bgColor: 'bg-green-100 text-green-800 border-green-300',
          label: 'Arrived'
        };
      case 'in-progress':
        return {
          bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          label: 'In Progress'
        };
      case 'completed':
        return {
          bgColor: 'bg-purple-100 text-purple-800 border-purple-300',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          bgColor: 'bg-red-100 text-red-800 border-red-300',
          label: 'Cancelled'
        };
      default:
        return {
          bgColor: 'bg-gray-100 text-gray-800 border-gray-300',
          label: 'Pending'
        };
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 1 : 7;
    const newDate = direction === 'prev' 
      ? addDays(selectedDate, -days)
      : addDays(selectedDate, days);
    setSelectedDate(newDate);
  };

  // Check-in functions
  const handleCheckIn = (appointment: Appointment) => {
    updateStatus(appointment.id, 'arrived');
  };

  const handleStartService = (appointment: Appointment) => {
    updateStatus(appointment.id, 'in-progress');
  };

  const handleCompleteService = (appointment: Appointment) => {
    updateStatus(appointment.id, 'completed');
  };

  // Delete appointment function
  const deleteAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      setAppointments(prev => {
        const updatedAppointments = prev.filter(apt => apt.id !== appointmentId);
        // Save to localStorage for persistence
        localStorage.setItem('staffAppointments', JSON.stringify(updatedAppointments));
        return updatedAppointments;
      });
      
      setSelectedAppointment(null);
      toast({
        title: "Appointment Deleted",
        description: "The appointment has been successfully removed.",
      });
    }
  };

  // Emergency coverage
  const handleEmergencyCoverage = () => {
    const availableStaff = staff.filter(s => s.status === 'available' && s.role === 'senior');
    if (availableStaff.length > 0) {
      toast({
        title: "Emergency Coverage",
        description: `${availableStaff[0].name} is available for backup`,
      });
    } else {
      toast({
        title: "No Backup Available",
        description: "All senior staff are currently busy",
        variant: "destructive",
      });
    }
  };

  // Inventory management functions
  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, current_stock: newStock }
        : item
    ));
    
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      toast({
        title: "Stock Updated",
        description: `${item.name} stock: ${newStock}`,
      });
    }
  };

  const getInventoryStatus = (item: InventoryItem) => {
    if (item.current_stock === 0) return { color: 'bg-red-500', label: 'Out of Stock' };
    if (item.current_stock <= item.min_stock_level) return { color: 'bg-yellow-500', label: 'Low Stock' };
    return { color: 'bg-green-500', label: 'In Stock' };
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.current_stock * item.unit_cost), 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.current_stock <= item.min_stock_level);
  };

  // Enhanced validation functions
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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string) => {
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-\']{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!bookingForm.firstName.trim() || !validateName(bookingForm.firstName)) {
      errors.push("Valid first name is required");
    }
    if (!bookingForm.lastName.trim() || !validateName(bookingForm.lastName)) {
      errors.push("Valid last name is required");
    }
    if (!bookingForm.service) {
      errors.push("Please select a service");
    }
    if (!bookingForm.customerPhone.trim() || !validatePhone(bookingForm.customerPhone)) {
      errors.push("Valid phone number is required");
    }
    if (!bookingForm.customerEmail.trim() || !validateEmail(bookingForm.customerEmail)) {
      errors.push("Valid email address is required");
    }
    
    return errors;
  };

  // Booking functionality
  const handleEmptySlotClick = (staffId: string, time: string, staffMember: StaffMember, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedSlot({ staffId, time });
    setSelectedBookingSlot({ staffId, time, staffMember });
    
    // Calculate popover position with smart side positioning
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    
    // Calculate exact center of the clicked cell
    const cellCenterY = rect.top + (rect.height / 2);
    
    // Default position to the right
    let position = 'right';
    let x = rect.right + GAP;
    
    // Set popover top edge (y) so its center aligns with cellCenterY
    let y = cellCenterY - ARROW_HALF_SIZE;
    
    // Edge detection - if not enough space on the right, flip to the left
    if (x + POPOVER_WIDTH > viewportWidth) {
      position = 'left';
      x = rect.left - POPOVER_WIDTH - GAP;
      
      // Adjust Y to keep popover in view if it's near edges, but maintain cell center alignment for the arrow
      y = Math.max(ARROW_HALF_SIZE + 10, Math.min(y, window.innerHeight - POPOVER_HEIGHT - 10 - ARROW_HALF_SIZE));
    }
    
    setSlotPopoverPosition({ x, y, position, cellCenterY });
    setShowSlotPopover(true);
  };

  // FIXED: Enhanced slot action handler with proper state management
  const handleSlotActionClick = (action: string) => {
    console.log('[DEBUG] Slot action clicked:', action);
    
    if (!selectedBookingSlot) {
      console.log('[DEBUG] No selected booking slot found');
      return;
    }
    
    console.log('[DEBUG] Current selected booking slot:', selectedBookingSlot);
    
    // Store modal data BEFORE closing popover to maintain context
    const modalContextData = {
      staffId: selectedBookingSlot.staffId,
      staffMemberName: selectedBookingSlot.staffMember.name,
      selectedDate: selectedDate,
      selectedTime: selectedBookingSlot.time
    };
    
    console.log('[DEBUG] Setting modal data:', modalContextData);
    setModalData(modalContextData);
    
    // Close popover first
    console.log('[DEBUG] Closing slot popover');
    closeSlotPopover();
    
    // Use setTimeout to ensure state updates are processed before opening modal
    setTimeout(() => {
      console.log('[DEBUG] Opening modal for action:', action);
      
      switch (action) {
        case 'new-appointment':
          setBookingForm({
            firstName: '',
            lastName: '',
            customerPhone: '',
            customerEmail: '',
            service: '',
            notes: ''
          });
          setShowBookingDialog(true);
          break;
        case 'new-multiple-appointments':
          console.log('[DEBUG] Setting showMultipleBookingModal to true');
          setShowMultipleBookingModal(true);
          break;
        case 'add-waitlist':
          console.log('[DEBUG] Setting showWaitlistModal to true');
          setShowWaitlistModal(true);
          break;
        case 'personal-task':
          console.log('[DEBUG] Setting showPersonalTaskModal to true');
          setShowPersonalTaskModal(true);
          break;
        case 'edit-working-hours':
          console.log('[DEBUG] Setting showEditShiftModal to true');
          setShowEditShiftModal(true);
          break;
      }
    }, 50); // Small delay to ensure state updates are processed
  };

  const closeSlotPopover = () => {
    console.log('[DEBUG] Closing slot popover');
    setShowSlotPopover(false);
    setSlotPopoverPosition(null);
    setSelectedSlot(null);
    // Don't clear selectedBookingSlot immediately - let modal use it
  };

  const handleBookingSubmit = async () => {
    // Enhanced validation
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Please correct the following errors:",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    // Show loading state
    setIsBooking(true);

    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generate appointment ID
      const appointmentId = `APT-${Date.now()}`;
      
      // Determine amount based on service
      const serviceAmounts: { [key: string]: number } = {
        'Hair Cut & Style': 65,
        'Manicure': 40,
        'Pedicure': 55,
        'Facial Treatment': 120,
        'Massage': 85,
        'Hair Color': 150,
        'Highlights': 180,
        'Waxing': 60,
        'Eyebrow Wax': 30,
        'Nail Polish Change': 25
      };
      
      const appointmentAmount = serviceAmounts[bookingForm.service] || 75;

      const newAppointment: Appointment = {
        id: appointmentId,
        service_name: bookingForm.service,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedBookingSlot.time,
        staff_id: selectedBookingSlot.staffId,
        status: 'confirmed',
        full_name: `${bookingForm.firstName.trim()} ${bookingForm.lastName.trim()}`,
        phone: bookingForm.customerPhone.trim(),
        email: bookingForm.customerEmail.trim(),
        total_amount: appointmentAmount,
        notes: bookingForm.notes.trim()
      };

      // Add to appointments
      setAppointments(prev => {
        const updatedAppointments = [...prev, newAppointment];
        // Save to localStorage for persistence
        localStorage.setItem('staffAppointments', JSON.stringify(updatedAppointments));
        return updatedAppointments;
      });
      
      // Reset form and close dialog
      setShowBookingDialog(false);
      setSelectedBookingSlot(null);
      setBookingForm({
        firstName: '',
        lastName: '',
        customerPhone: '',
        customerEmail: '',
        service: '',
        notes: ''
      });
      setValidationErrors({});
      
      // Enhanced success feedback
      toast({
        title: "✅ Appointment Booked Successfully!",
        description: `${bookingForm.firstName.trim()} ${bookingForm.lastName.trim()} scheduled for ${formatTime(selectedBookingSlot.time)} with ${selectedBookingSlot.staffMember.name}`,
        duration: 5000,
      });

      // Show additional confirmation
      setTimeout(() => {
        toast({
          title: "📧 Confirmation Sent",
          description: "Customer will receive a confirmation email shortly.",
          duration: 4000,
        });
      }, 1000);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking the appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Close dialog function
  const closeBookingDialog = () => {
    setShowBookingDialog(false);
    setSelectedBookingSlot(null);
    setBookingForm({
      firstName: '',
      lastName: '',
      customerPhone: '',
      customerEmail: '',
      service: '',
      notes: ''
    });
  };

  const handleSlotHover = (staffId: string, time: string) => {
    setHoveredSlot({ staffId, time });
  };

  const handleSlotLeave = () => {
    setHoveredSlot(null);
  };

  const isSlotAvailable = (staffId: string, time: string) => {
    const existingAppointments = getAppointmentsForSlot(staffId, selectedDate, time);
    return existingAppointments.length === 0;
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="border border-gray-200 rounded-lg p-8 w-full max-w-md shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-light text-black mb-2">
              Zavira
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access the scheduling system
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Employee ID"
                autoFocus={true}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    authenticate();
                  }
                }}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 text-center text-lg"
              />
            </div>
            <Button
              onClick={authenticate}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  authenticate();
                }
              }}
              className="w-full bg-white border border-gray-300 text-black hover:bg-gray-50 text-sm py-2 rounded-md"
            >
              Sign In
            </Button>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">
                Demo: EMP001, EMP002, EMP003, EMP004
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>

      <div className="min-h-screen bg-gray-50 text-black">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-light text-black">
                  Zavira
                </h1>
                <p className="text-sm text-gray-500">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{currentStaff?.name}</span>
                  <span className="text-xs text-gray-400">{currentStaff?.role}</span>
                </div>
                
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with proper bottom padding for fixed navigation */}
        <div className="content-with-footer">
          {/* Header with navigation - Always Visible */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-black">Schedule & Bookings</h2>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Service Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select
                    value={selectedFilterService}
                    onValueChange={setSelectedFilterService}
                  >
                    <SelectTrigger className="h-9 bg-white border-gray-300 focus:border-black focus:ring-black w-[180px]">
                      <SelectValue placeholder="Filter by Service" className="text-sm" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 max-h-48">
                      {allServices.map(service => (
                        <SelectItem key={service} value={service} className="text-black text-sm">
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigateDate('prev')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => setSelectedDate(new Date())}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Today
                  </Button>
                  
                  <Button
                    onClick={() => navigateDate('next')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Top Navigation Tabs - Always Visible */}
          <div className="px-6 py-3 border-b border-gray-50 bg-white">
            <div className="flex items-center gap-4">
              {[
                { id: 'schedule', label: 'Schedule', icon: Calendar, color: '#3B82F6' },
                { id: 'customer', label: 'Customer', icon: Users, color: '#10B981' },
                { id: 'booking', label: 'Bookings', icon: Clock, color: '#8B5CF6' },
                { id: 'inventory', label: 'Inventory', icon: Package, color: '#F59E0B' },
                { id: 'staff', label: 'Staff', icon: UserCheck, color: '#EF4444' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: activeTab === tab.id ? tab.color + '10' : 'transparent',
                    border: `1px solid ${activeTab === tab.id ? tab.color : '#e5e7eb'}`,
                    borderRadius: '6px',
                    color: activeTab === tab.id ? tab.color : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  <tab.icon style={{
                    width: '16px',
                    height: '16px',
                    color: activeTab === tab.id ? tab.color : '#6b7280'
                  }} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'schedule' && (
            <div className="bg-white">
              <div className="px-4 py-6">
                <div className="overflow-auto relative">
                    {/* LIVE TIME CHECKER LINE */}
                    <div
                      className="absolute left-0 right-0 z-50 pointer-events-none transition-all duration-300 ease-linear"
                      style={{
                        top: calculateLiveLineTop(),
                        height: '3px', // Thickness of the line
                        backgroundColor: LIVE_TIME_LINE_COLOR,
                        boxShadow: `0 0 8px 1px ${LIVE_TIME_LINE_COLOR}` // Shiny effect
                      }}
                    >
                      {/* Optional: Time indicator next to the line (for better visibility) */}
                      <div
                        className="absolute left-0 top-[-10px] transform -translate-x-full p-1 rounded text-xs font-bold text-white pointer-events-none"
                        style={{
                          backgroundColor: LIVE_TIME_LINE_COLOR,
                          boxShadow: `0 0 5px 1px ${LIVE_TIME_LINE_COLOR}`,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {format(currentTime, 'h:mm a')}
                      </div>
                    </div>
                    
                    {/* Staff Header Row */}
                    <div className="flex border-b border-gray-100 mb-4 relative z-10">
                    <div className="w-24 flex-shrink-0 border-r-2 border-gray-200">
                      <div className="p-3 font-medium text-gray-600 text-sm">Time</div>
                    </div>
                    {filteredStaff.map(staffMember => {
                      return (
                        <div key={staffMember.id} className="flex-1 min-w-[140px] border-l border-gray-100 p-3 relative">
                          <div className="text-sm font-medium text-black flex items-center">
                            {staffMember.name.split(' ')[0]}
                            <div className="group relative ml-2">
                              <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                              <div className="invisible group-hover:visible absolute left-0 top-6 w-48 bg-white shadow-lg rounded-md border border-gray-200 p-2 z-20">
                                <div className="text-xs font-medium text-black mb-1">Services</div>
                                <div className="text-xs text-gray-600">{staffMember.specialty}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{staffMember.role}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time Slots as Rows - Now showing all 15-min slots */}
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <div
                      key={timeIndex}
                      className="flex border-b-2 border-gray-200 min-h-[40px] relative"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedAppointmentId) {
                          const targetStaffId = e.currentTarget.dataset.staffId;
                          if (targetStaffId) {
                            handleMoveAppointment(draggedAppointmentId, targetStaffId, timeSlot.time);
                            setDraggedAppointmentId(null);
                          }
                        }
                      }}
                    >
                      {/* Horizontal lines to divide 15-min intervals */}
                      <div className="absolute left-0 right-0 top-1/2 border-t-2 border-gray-300 opacity-70"></div>
                      
                      {/* Time Display */}
                      <div className="w-24 flex-shrink-0 p-2 border-r-2 border-gray-200 bg-gray-50 relative z-10">
                        <div className="text-xs font-medium text-gray-600">
                          {timeSlot.minute === 0 ? formatTime(timeSlot.time) : ''}
                        </div>
                      </div>

                      {/* Staff Columns for this time slot */}
                      {filteredStaff.map(staffMember => {
                        const slotAppointments = getAppointmentsForSlot(
                          staffMember.id,
                          selectedDate,
                          timeSlot.time
                        );
                        
                        return (
                          <div
                            key={`${staffMember.id}-${timeIndex}`}
                            data-staff-id={staffMember.id}
                            className="flex-1 min-w-[140px] border-l-2 border-gray-200 p-1 relative bg-white"
                            onMouseEnter={() => handleSlotHover(staffMember.id, timeSlot.time)}
                            onMouseLeave={handleSlotLeave}
                          >
                            {/* Persistent Selection Style */}
                            {selectedSlot?.staffId === staffMember.id && selectedSlot?.time === timeSlot.time && (
                              <div className="absolute inset-0 bg-gray-200 opacity-50 rounded pointer-events-none z-0"></div>
                            )}
                            
                            {/* Show existing appointments with service-based colors */}
                            {slotAppointments.map(appointment => {
                              const staffMember = staff.find(s => s.id === appointment.staff_id);
                              const appointmentStyling = staffMember ? getAppointmentStyling(appointment, staffMember) : null;
                              
                              return (
                                <div
                                  key={appointment.id}
                                  draggable
                                  onDragStart={() => {
                                    setDraggedAppointmentId(appointment.id);
                                  }}
                                  onDragEnd={() => {
                                    setDraggedAppointmentId(null);
                                  }}
                                  onClick={() => {
                                    setSelectedSlot({ staffId: appointment.staff_id, time: appointment.appointment_time });
                                    setSelectedAppointment(appointment);
                                  }}
                                  className="p-1 rounded text-xs cursor-move border relative group"
                                  style={{
                                    backgroundColor: appointmentStyling?.backgroundColor,
                                    borderColor: appointmentStyling?.borderColor,
                                    color: appointmentStyling?.textColor
                                  }}
                                >
                                  <div className="font-medium truncate text-xs">
                                    {appointment.service_name || 'Service'}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {/* Show clickable booking area for empty slots */}
                            {slotAppointments.length === 0 && (
                              <div
                                className={`
                                  slot-clickable min-h-[38px] rounded border border-dashed border-gray-200
                                  flex items-center justify-center cursor-pointer transition-all duration-200
                                  hover:border-gray-400 hover:bg-gray-100
                                  ${hoveredSlot?.staffId === staffMember.id && hoveredSlot?.time === timeSlot.time
                                    ? 'border-gray-400 bg-gray-100'
                                    : ''
                                  }
                                  ${selectedSlot?.staffId === staffMember.id && selectedSlot?.time === timeSlot.time
                                    ? 'border-blue-400 bg-blue-50'
                                    : ''
                                  }
                                `}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('[DEBUG] Empty slot clicked:', { staffId: staffMember.id, time: timeSlot.time });
                                  handleEmptySlotClick(staffMember.id, timeSlot.time, staffMember, e);
                                  setSelectedSlot({ staffId: staffMember.id, time: timeSlot.time });
                                }}
                              >
                                <div className="text-center">
                                  <div className="text-gray-400 text-xs transition-colors">
                                    {hoveredSlot?.staffId === staffMember.id && hoveredSlot?.time === timeSlot.time
                                      ? 'Click for actions'
                                      : selectedSlot?.staffId === staffMember.id && selectedSlot?.time === timeSlot.time
                                      ? 'Selected'
                                      : timeSlot.display
                                    }
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Slot Action Popover */}
                            {showSlotPopover && selectedSlot?.staffId === staffMember.id && selectedSlot?.time === timeSlot.time && (
                              <div
                                data-slot-popover
                                className="absolute z-50 w-80 p-0 bg-white border border-gray-200 shadow-xl rounded-lg"
                                style={{
                                  position: 'fixed',
                                  left: slotPopoverPosition?.x ? `${slotPopoverPosition.x}px` : 'auto',
                                  top: slotPopoverPosition?.y ? `${slotPopoverPosition.y}px` : 'auto',
                                  zIndex: 1000
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Speech bubble arrow - positioned to point to exact cell center */}
                                {slotPopoverPosition?.position === 'right' && slotPopoverPosition.cellCenterY !== undefined ? (
                                  // Arrow on left side pointing to the clicked cell
                                  <div
                                    className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 -left-1"
                                    style={{
                                      top: `${ARROW_HALF_SIZE}px`, // Arrow center is at 6px from popover top edge
                                      transform: 'rotate(45deg)',
                                      boxShadow: '-1px 1px 0 0 #d1d5db'
                                    }}
                                  />
                                ) : slotPopoverPosition?.position === 'left' && slotPopoverPosition.cellCenterY !== undefined ? (
                                  // Arrow on right side pointing to the clicked cell
                                  <div
                                    className="absolute w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45 -right-1"
                                    style={{
                                      top: `${ARROW_HALF_SIZE}px`, // Arrow center is at 6px from popover top edge
                                      transform: 'rotate(45deg)',
                                      boxShadow: '1px -1px 0 0 #d1d5db'
                                    }}
                                  />
                                ) : null}
                                
                                <div className="p-1 relative">
                                  {/* Header with slot info */}
                                  <div className="text-xs text-gray-600 mb-2 px-2 py-1 bg-gray-50 rounded-t-lg">
                                    {selectedBookingSlot?.staffMember.name} • {formatTime(selectedBookingSlot?.time || '')}
                                  </div>
                                  
                                  {/* Menu options */}
                                  <div className="space-y-1">
                                    {/* Option 1: New Appointment */}
                                    <button
                                      onClick={() => handleSlotActionClick('new-appointment')}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                                        <CalendarPlus className="h-3 w-3 text-white" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-black">New Appointment</div>
                                        <div className="text-xs text-gray-500">Create a new appointment</div>
                                      </div>
                                    </button>

                                    {/* Option 2: New Multiple Appointments */}
                                    <button
                                      onClick={() => handleSlotActionClick('new-multiple-appointments')}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                                        <CalendarDays className="h-3 w-3 text-white" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-black">New Multiple Appointments</div>
                                        <div className="text-xs text-gray-500">Create multiple appointments</div>
                                      </div>
                                    </button>

                                    {/* Option 3: Add to Waitlist */}
                                    <button
                                      onClick={() => handleSlotActionClick('add-waitlist')}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                                        <Timer className="h-3 w-3 text-white" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-black">Add to Waitlist</div>
                                        <div className="text-xs text-gray-500">Add a customer to the waitlist</div>
                                      </div>
                                    </button>

                                    {/* Option 4: Personal Task */}
                                    <button
                                      onClick={() => handleSlotActionClick('personal-task')}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                                        <CalendarX className="h-3 w-3 text-white" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-black">Personal Task</div>
                                        <div className="text-xs text-gray-500">Add a personal task</div>
                                      </div>
                                    </button>

                                    {/* Option 5: Edit Working Hours */}
                                    <button
                                      onClick={() => handleSlotActionClick('edit-working-hours')}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                                        <Settings className="h-3 w-3 text-white" />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-black">Edit Working Hours</div>
                                        <div className="text-xs text-gray-500">Edit your calendar working hours</div>
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Inventory Tab Content */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 content-with-footer">
            <div className="container mx-auto">
              {/* Inventory Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                        <p className="text-2xl font-bold text-black">{inventory.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-black">{formatCurrency(getTotalInventoryValue())}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Low Stock</p>
                        <p className="text-2xl font-bold text-yellow-600">{getLowStockItems().length}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-600">
                          {inventory.filter(item => item.status === 'out-of-stock').length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Inventory Management</span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setLastRefresh(new Date())}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-black hover:bg-gray-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button className="bg-white border border-gray-300 text-black hover:bg-gray-50">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Current Stock</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Min Level</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item) => {
                          const status = getInventoryStatus(item);
                          return (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-medium text-black">{item.name}</div>
                                  <div className="text-sm text-gray-500">Supplier: {item.supplier}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{item.category}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-black">{item.current_stock}</span>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateInventoryStock(item.id, Math.max(0, item.current_stock - 1))}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateInventoryStock(item.id, item.current_stock + 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{item.min_stock_level}</td>
                              <td className="py-3 px-4">
                                <Badge className={`${status.color} text-white`}>
                                  {status.label}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-medium text-black">
                                {formatCurrency(item.current_stock * item.unit_cost)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                                    Reorder
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Customers Tab Content */}
        {activeTab === 'customer' && (
          <div className="bg-white p-6 content-with-footer">
            <div className="container mx-auto">
              {/* Customer Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Customer Management</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-black hover:bg-gray-50"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                      <Button className="bg-white border border-gray-300 text-black hover:bg-gray-50">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Customer
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Last Visit</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Total Visits</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Sarah Parker', phone: '+1-555-0101', email: 'sarah.p@email.com', lastVisit: '2024-11-19', visits: 15, status: 'Active', totalSpent: '$1,245' },
                          { name: 'John Doe', phone: '+1-555-0123', email: 'john@example.com', lastVisit: '2024-11-18', visits: 8, status: 'Active', totalSpent: '$640' },
                          { name: 'Jane Smith', phone: '+1-555-0124', email: 'jane@example.com', lastVisit: '2024-11-17', visits: 22, status: 'VIP', totalSpent: '$2,100' },
                          { name: 'Mike Johnson', phone: '+1-555-0125', email: 'mike.j@email.com', lastVisit: '2024-11-16', visits: 12, status: 'Active', totalSpent: '$890' },
                          { name: 'Emily Davis', phone: '+1-555-0126', email: 'emily.d@email.com', lastVisit: '2024-11-15', visits: 5, status: 'New', totalSpent: '$280' },
                          { name: 'Bob Wilson', phone: '+1-555-0127', email: 'bob.w@email.com', lastVisit: '2024-11-14', visits: 18, status: 'Active', totalSpent: '$1,560' }
                        ].map((customer, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {customer.name.split(' ').map(n => n).join('')}
                                  </span>
                                </div>
                                <span className="font-medium text-black">{customer.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                            <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                            <td className="py-3 px-4 text-gray-600">{format(new Date(customer.lastVisit), 'MMM d, yyyy')}</td>
                            <td className="py-3 px-4 text-gray-600">{customer.visits}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                customer.status === 'VIP' ? 'bg-purple-100 text-purple-800' :
                                customer.status === 'New' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {customer.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                                  View
                                </Button>
                                <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                                  Book
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Bookings Tab Content */}
        {activeTab === 'booking' && (
          <div className="bg-white p-6 content-with-footer">
            <div className="container mx-auto">
              {/* Bookings Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                        <p className="text-2xl font-bold text-black">{appointments.length}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {appointments.filter(a => a.status === 'confirmed').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {appointments.filter(a => a.status === 'in-progress' || a.status === 'arrived').length}
                        </p>
                      </div>
                      <PlayCircle className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completed Today</p>
                        <p className="text-2xl font-bold text-green-600">
                          {appointments.filter(a => a.status === 'completed').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bookings Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Today's Bookings</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-black hover:bg-gray-50"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button className="bg-white border border-gray-300 text-black hover:bg-gray-50">
                        <Plus className="h-4 w-4 mr-2" />
                        New Booking
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Staff</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => {
                          const staffMember = staff.find(s => s.id === appointment.staff_id);
                          const statusConfig = getStatusConfig(appointment.status);
                          return (
                            <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-black">{formatTime(appointment.appointment_time)}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {/* Staff color indicator */}
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getStaffColorConfig(staffMember?.color || 'blue').color }}
                                  ></div>
                                  <div>
                                    <div className="font-medium text-black">{appointment.full_name}</div>
                                    <div className="text-sm text-gray-500">{appointment.phone}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{appointment.service_name}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">{staffMember?.name}</span>
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getStaffColorConfig(staffMember?.color || 'blue').color }}
                                  ></div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-medium text-black">{formatCurrency(appointment.total_amount)}</td>
                              <td className="py-3 px-4">
                                <Badge className={statusConfig.bgColor}>
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => setSelectedAppointment(appointment)}
                                  >
                                    Details
                                  </Button>
                                  {appointment.status === 'confirmed' && (
                                    <Button
                                      size="sm"
                                      className="text-white"
                                      style={{ backgroundColor: getStaffColorConfig(staffMember?.color || 'blue').color }}
                                      onClick={() => handleCheckIn(appointment)}
                                    >
                                      Check In
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Staff Tab Content */}
        {activeTab === 'staff' && (
          <div className="bg-white p-6 content-with-footer">
            <div className="container mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Staff Management</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-black hover:bg-gray-50"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                      <Button className="bg-white border border-gray-300 text-black hover:bg-gray-50">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Staff
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Staff Member</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Specialty</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Today's Schedule</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((member) => (
                          <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                  style={{ backgroundColor: getStaffColorConfig(member.color).color }}
                                >
                                  {member.name.split(' ').map(n => n).join('')}
                                </div>
                                <span className="font-medium text-black">{member.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 capitalize">{member.role}</td>
                            <td className="py-3 px-4 text-gray-600">{member.specialty}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                member.status === 'available' ? 'bg-green-100 text-green-800' :
                                member.status === 'busy' ? 'bg-red-100 text-red-800' :
                                member.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {member.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {appointments.filter(apt => apt.staff_id === member.id).length} appointments
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                                  View
                                </Button>
                                <Button size="sm" variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Appointment Detail Dialog */}
        {selectedAppointment && (
          <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
            <DialogContent className="bg-white border-gray-200 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-black">
                  <Calendar className="h-5 w-5" />
                  Appointment Details
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {selectedAppointment.full_name} • {formatTime(selectedAppointment.appointment_time)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service</label>
                    <p className="text-black">{selectedAppointment.service_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-black">{formatCurrency(selectedAppointment.total_amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Staff</label>
                    <p className="text-black">{staff.find(s => s.id === selectedAppointment.staff_id)?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="text-black capitalize">{selectedAppointment.status}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedAppointment.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${selectedAppointment.phone}`} className="text-blue-600 hover:underline">
                        {selectedAppointment.phone}
                      </a>
                    </div>
                  )}
                  {selectedAppointment.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${selectedAppointment.email}`} className="text-blue-600 hover:underline">
                        {selectedAppointment.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-black bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <div className="flex-1">
                    {selectedAppointment.status === 'confirmed' && (
                      <Button
                        onClick={() => handleCheckIn(selectedAppointment)}
                        className="bg-green-600 hover:bg-gray-100 hover:text-black text-white"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Check In
                      </Button>
                    )}
                    {selectedAppointment.status === 'arrived' && (
                      <Button
                        onClick={() => handleStartService(selectedAppointment)}
                        className="bg-blue-600 hover:bg-gray-100 hover:text-black text-white"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Service
                      </Button>
                    )}
                    {selectedAppointment.status === 'in-progress' && (
                      <Button
                        onClick={() => handleCompleteService(selectedAppointment)}
                        className="bg-purple-600 hover:bg-gray-100 hover:text-black text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Service
                      </Button>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => deleteAppointment(selectedAppointment.id)}
                    className="bg-red-600 hover:bg-gray-100 hover:text-black text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Help Dialog */}
        {showHelp && (
          <Dialog open={showHelp} onOpenChange={setShowHelp}>
            <DialogContent className="bg-white border-gray-200 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-black">Staff Dashboard Guide</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Quick reference for using the scheduling system
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Color Legend */}
                <div>
                  <h3 className="font-semibold text-black mb-3">Status Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-black">Available</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-black">Busy</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-black">On Break</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-black">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-400 rounded"></div>
                      <span className="text-black">Arrived</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                      <span className="text-black">In Progress</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-black">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-black mb-3">How to Use</h3>
                  <ul className="space-y-2 text-sm text-black">
                    <li>• <strong>Click appointments</strong> to see details</li>
                    <li>• <strong>Hover over appointments</strong> for quick actions</li>
                    <li>• <strong>Use navigation buttons</strong> to change dates</li>
                    <li>• <strong>Check status updates</strong> in real-time</li>
                    <li>• <strong>Emergency coverage</strong> for staff backup</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Enhanced & Spacious Booking Dialog */}
        {showBookingDialog && selectedBookingSlot && (
          <Dialog open={showBookingDialog} onOpenChange={closeBookingDialog}>
            <DialogContent className="bg-white border-gray-200 max-w-sm w-[95vw] sm:max-w-md mx-auto rounded-xl shadow-2xl p-5 custom-scrollbar">
              <DialogHeader className="pb-4">
                <DialogTitle className="flex items-center gap-2 text-black text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Book New Appointment
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-xs leading-relaxed">
                  {selectedBookingSlot.staffMember.name} • {formatTime(selectedBookingSlot.time)} • {format(selectedDate, 'MMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Customer Information
                  </h3>
                  
                  {/* Name Fields - Side by side with better spacing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={bookingForm.firstName}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                        className={`h-9 text-sm bg-white border-gray-300 focus:border-black focus:ring-black text-black placeholder:text-gray-500 ${
                          validationErrors.firstName ? 'border-red-500' : ''
                        }`}
                      />
                      {validationErrors.firstName && (
                        <p className="mt-1 text-xs text-red-600 leading-tight">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={bookingForm.lastName}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                        className={`h-9 text-sm bg-white border-gray-300 focus:border-black focus:ring-black text-black placeholder:text-gray-500 ${
                          validationErrors.lastName ? 'border-red-500' : ''
                        }`}
                      />
                      {validationErrors.lastName && (
                        <p className="mt-1 text-xs text-red-600 leading-tight">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Service Selection
                  </h3>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Select Service <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={bookingForm.service}
                      onValueChange={(value) => setBookingForm(prev => ({ ...prev, service: value }))}
                    >
                      <SelectTrigger className="h-9 bg-white border-gray-300 focus:border-black focus:ring-black">
                        <SelectValue placeholder="Choose a service" className="text-sm" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 max-h-48">
                        <SelectItem value="Hair Cut & Style" className="text-black text-sm">Hair Cut & Style - $65</SelectItem>
                        <SelectItem value="Manicure" className="text-black text-sm">Manicure - $40</SelectItem>
                        <SelectItem value="Pedicure" className="text-black text-sm">Pedicure - $55</SelectItem>
                        <SelectItem value="Facial Treatment" className="text-black text-sm">Facial Treatment - $120</SelectItem>
                        <SelectItem value="Massage" className="text-black text-sm">Massage - $85</SelectItem>
                        <SelectItem value="Hair Color" className="text-black text-sm">Hair Color - $150</SelectItem>
                        <SelectItem value="Highlights" className="text-black text-sm">Highlights - $180</SelectItem>
                        <SelectItem value="Waxing" className="text-black text-sm">Waxing - $60</SelectItem>
                        <SelectItem value="Eyebrow Wax" className="text-black text-sm">Eyebrow Wax - $30</SelectItem>
                        <SelectItem value="Nail Polish Change" className="text-black text-sm">Nail Polish Change - $25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Contact Information <span className="text-red-500">*</span>
                  </h3>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Phone Number
                    </label>
                    <Input
                      value={bookingForm.customerPhone}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setBookingForm(prev => ({ ...prev, customerPhone: formatted }));
                      }}
                      placeholder="(123) 456-7890"
                      maxLength={14}
                      className={`h-9 text-sm bg-white border-gray-300 focus:border-black focus:ring-black text-black placeholder:text-gray-500 ${
                        validationErrors.phone ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-xs text-red-600 leading-tight">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Email Address
                    </label>
                    <Input
                      value={bookingForm.customerEmail}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="customer@email.com"
                      type="email"
                      className={`h-9 text-sm bg-white border-gray-300 focus:border-black focus:ring-black text-black placeholder:text-gray-500 ${
                        validationErrors.email ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-xs text-red-600 leading-tight">{validationErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Additional Notes <span className="text-gray-500 font-normal text-xs">(Optional)</span>
                  </h3>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Special Requests & Notes
                    </label>
                    <textarea
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any special requests, allergies, preferences..."
                      className="w-full p-3 border border-gray-300 rounded text-sm resize-none focus:border-black focus:ring-black bg-white text-black placeholder:text-gray-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons - Back inside dialog */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={closeBookingDialog}
                  variant="outline"
                  className="flex-1 h-10 text-sm border-gray-300 text-black hover:bg-gray-100 active:bg-gray-200 bg-white"
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookingSubmit}
                  className="flex-1 h-10 text-sm bg-green-600 hover:bg-gray-100 hover:text-black text-white"
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Slot Action Modals - FIXED: Using persistent modal data */}
        {modalData && (
          <>
            {/* Waitlist Modal */}
            <WaitlistModal
              isOpen={showWaitlistModal}
              onClose={() => {
                setShowWaitlistModal(false);
                setModalData(null);
                setSelectedBookingSlot(null);
              }}
              selectedDate={modalData.selectedDate}
              selectedTime={modalData.selectedTime}
              staffId={modalData.staffId}
              staffMemberName={modalData.staffMemberName}
              onSuccess={() => {
                // Refresh data or show success state
                toast({
                  title: "Waitlist Updated",
                  description: "Customer has been added to the waitlist successfully.",
                });
              }}
            />

            {/* Personal Task Modal */}
            <PersonalTaskModal
              isOpen={showPersonalTaskModal}
              onClose={() => {
                setShowPersonalTaskModal(false);
                setModalData(null);
                setSelectedBookingSlot(null);
              }}
              selectedDate={modalData.selectedDate}
              selectedTime={modalData.selectedTime}
              staffId={modalData.staffId}
              staffMemberName={modalData.staffMemberName}
              onSuccess={() => {
                toast({
                  title: "Personal Task Created",
                  description: "Your personal task has been scheduled successfully.",
                });
              }}
            />

            {/* Multiple Booking Modal */}
            <MultipleBookingModal
              isOpen={showMultipleBookingModal}
              onClose={() => {
                console.log('[DEBUG] MultipleBookingModal closing');
                setShowMultipleBookingModal(false);
                setModalData(null);
                setSelectedBookingSlot(null);
              }}
              selectedDate={modalData.selectedDate}
              selectedTime={modalData.selectedTime}
              staffId={modalData.staffId}
              staffMemberName={modalData.staffMemberName}
              onSuccess={() => {
                toast({
                  title: "Multiple Appointments Created",
                  description: "All appointments have been scheduled successfully.",
                });
              }}
            />

            {/* Edit Shift Modal */}
            <EditShiftModal
              isOpen={showEditShiftModal}
              onClose={() => {
                setShowEditShiftModal(false);
                setModalData(null);
                setSelectedBookingSlot(null);
              }}
              selectedDate={modalData.selectedDate}
              staffId={modalData.staffId}
              staffMemberName={modalData.staffMemberName}
              onSuccess={() => {
                toast({
                  title: "Working Hours Updated",
                  description: "Your working hours have been updated successfully.",
                });
              }}
            />
          </>
        )}
      </div>
    </div>

    {/* Custom scrollbar for black/white theme */}
    <style>
      {`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #374151 #f9fafb;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1f2937;
        }
      `}
    </style>
    </TooltipProvider>
  );
};

export default StaffSchedulingSystem;