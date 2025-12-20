// Centralized Configuration for Appointment Status & Legend System
// This file ensures the Legend and Calendar stay perfectly in sync

import { 
  RefreshCw, 
  Layers, 
  Car, 
  Home, 
  StickyNote, 
  FileText,
  LucideIcon 
} from 'lucide-react';

// STATUS_COLORS: Maps enum values to Hex codes for visual consistency
export const STATUS_COLORS = {
  REQUESTED: '#D1C4E9',      // Light Purple
  ACCEPTED: '#90CAF9',       // Light Blue  
  CONFIRMED: '#EF9A9A',      // Salmon/Red
  NO_SHOW: '#D32F2F',        // Dark Red
  READY_TO_START: '#1976D2', // Dark Blue
  IN_PROGRESS: '#388E3C',    // Green
  COMPLETE: '#4CAF50',       // Bright Green
  PERSONAL_TASK: '#D7CCC8'   // Tan/Brown
} as const;

// ATTRIBUTE_ICONS: Maps boolean flags to specific Lucide-React icons
export const ATTRIBUTE_ICONS = {
  is_recurring: RefreshCw,      // Recurring -> RefreshCw
  is_bundle: Layers,            // Bundle -> Layers
  is_house_call: Car,           // House Call -> Car (alternative: Home)
  has_note: StickyNote,         // Note -> StickyNote
  form_required: FileText,      // Form Required -> FileText
  deposit_paid: Home           // Deposit Paid -> Home (alternative: CreditCard)
} as const;

// Type definitions for better TypeScript support
export type AppointmentStatusType = keyof typeof STATUS_COLORS;
export type AppointmentAttribute = keyof typeof ATTRIBUTE_ICONS;

// Extended Appointment interface to include new fields
export interface ExtendedAppointment {
  id: string;
  status_type: AppointmentStatusType;
  is_recurring: boolean;
  is_bundle: boolean;
  is_house_call: boolean;
  has_note: boolean;
  form_required: boolean;
  deposit_paid: boolean;
  // Original appointment fields
  service_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  staff_id?: string;
  status?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  total_amount?: number;
  notes?: string;
}

// Helper Function: Core logic to calculate appointment styles
export const getAppointmentStyles = (appointment: ExtendedAppointment) => {
  // Get background color based on status_type
  const backgroundColor = STATUS_COLORS[appointment.status_type] || STATUS_COLORS.REQUESTED;
  
  // Collect active icons based on boolean flags
  const icons: LucideIcon[] = [];
  
  // Check each boolean attribute and add corresponding icon if true
  Object.entries(ATTRIBUTE_ICONS).forEach(([attribute, iconComponent]) => {
    const attributeKey = attribute as AppointmentAttribute;
    if (appointment[attributeKey]) {
      icons.push(iconComponent);
    }
  });
  
  return {
    backgroundColor,
    icons,
    statusLabel: getStatusLabel(appointment.status_type),
    borderColor: adjustColorBrightness(backgroundColor, -20),
    textColor: getOptimalTextColor(backgroundColor)
  };
};

// Helper function to get readable status labels
export const getStatusLabel = (status: AppointmentStatusType): string => {
  const labels = {
    REQUESTED: 'Requested',
    ACCEPTED: 'Accepted', 
    CONFIRMED: 'Confirmed',
    NO_SHOW: 'No Show',
    READY_TO_START: 'Ready to Start',
    IN_PROGRESS: 'In Progress',
    COMPLETE: 'Complete',
    PERSONAL_TASK: 'Personal Task'
  };
  return labels[status] || 'Unknown';
};

// Helper function to calculate optimal text color (black or white) based on background
export const getOptimalTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);
  
  // Calculate luminance (simplified version)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Helper function to adjust color brightness
export const adjustColorBrightness = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
};

// Configuration for legend display
export const LEGEND_CONFIG = {
  statusColors: [
    { status: 'REQUESTED', label: 'Requested', color: STATUS_COLORS.REQUESTED },
    { status: 'ACCEPTED', label: 'Accepted', color: STATUS_COLORS.ACCEPTED },
    { status: 'CONFIRMED', label: 'Confirmed', color: STATUS_COLORS.CONFIRMED },
    { status: 'NO_SHOW', label: 'No Show', color: STATUS_COLORS.NO_SHOW },
    { status: 'READY_TO_START', label: 'Ready to Start', color: STATUS_COLORS.READY_TO_START },
    { status: 'IN_PROGRESS', label: 'In Progress', color: STATUS_COLORS.IN_PROGRESS },
    { status: 'COMPLETE', label: 'Complete', color: STATUS_COLORS.COMPLETE },
    { status: 'PERSONAL_TASK', label: 'Personal Task', color: STATUS_COLORS.PERSONAL_TASK }
  ],
  attributeIcons: [
    { attribute: 'is_recurring', label: 'Recurring Appointment', icon: ATTRIBUTE_ICONS.is_recurring },
    { attribute: 'is_bundle', label: 'Bundle Service', icon: ATTRIBUTE_ICONS.is_bundle },
    { attribute: 'is_house_call', label: 'House Call', icon: ATTRIBUTE_ICONS.is_house_call },
    { attribute: 'has_note', label: 'Has Note', icon: ATTRIBUTE_ICONS.has_note },
    { attribute: 'form_required', label: 'Form Required', icon: ATTRIBUTE_ICONS.form_required },
    { attribute: 'deposit_paid', label: 'Deposit Paid', icon: ATTRIBUTE_ICONS.deposit_paid }
  ]
};

// Validation function to ensure data integrity
export const validateAppointmentData = (appointment: any): appointment is ExtendedAppointment => {
  const requiredFields = ['id', 'status_type'];
  const booleanFields = ['is_recurring', 'is_bundle', 'is_house_call', 'has_note', 'form_required', 'deposit_paid'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!appointment[field]) return false;
  }
  
  // Check status_type is valid
  if (!Object.keys(STATUS_COLORS).includes(appointment.status_type)) return false;
  
  // Check boolean fields
  for (const field of booleanFields) {
    if (typeof appointment[field] !== 'boolean') return false;
  }
  
  return true;
};

// Utility function to migrate old appointment data to new format
export const migrateAppointmentData = (oldAppointment: any): ExtendedAppointment => {
  return {
    ...oldAppointment,
    status_type: mapOldStatusToNew(oldAppointment.status),
    is_recurring: oldAppointment.is_recurring || false,
    is_bundle: oldAppointment.is_bundle || false,
    is_house_call: oldAppointment.is_house_call || false,
    has_note: oldAppointment.has_note || false,
    form_required: oldAppointment.form_required || false,
    deposit_paid: oldAppointment.deposit_paid || false
  };
};

// Helper function to map old status values to new enum
const mapOldStatusToNew = (oldStatus: string): AppointmentStatusType => {
  const statusMapping: { [key: string]: AppointmentStatusType } = {
    'confirmed': 'CONFIRMED',
    'arrived': 'READY_TO_START', 
    'in-progress': 'IN_PROGRESS',
    'completed': 'COMPLETE',
    'cancelled': 'REQUESTED',
    'no-show': 'NO_SHOW'
  };
  
  return statusMapping[oldStatus?.toLowerCase()] || 'REQUESTED';
};