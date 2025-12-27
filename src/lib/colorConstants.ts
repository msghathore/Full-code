/**
 * Centralized Color Constants
 * Single source of truth for all colors used in the application
 */

// Staff Color Palette - Maps color names to hex values
export const STAFF_COLORS = {
  blue: '#3B82F6',      // Tailwind blue-500
  emerald: '#10B981',   // Tailwind emerald-500
  purple: '#6B7280',    // Changed from violet to gray
  pink: '#6B7280',      // Changed from pink to gray
  orange: '#FFFFFF',    // Changed to white for brand guidelines
  red: '#EF4444',       // Tailwind red-500
  teal: '#14B8A6',      // Tailwind teal-500
  indigo: '#6366F1',    // Tailwind indigo-500
  yellow: '#EAB308',    // Tailwind yellow-500
  green: '#22C55E',     // Tailwind green-500
  gray: '#6B7280',      // Tailwind gray-500 (default fallback)
} as const;

export type StaffColorName = keyof typeof STAFF_COLORS;

/**
 * Get staff color hex value from color name
 * @param colorName - The color name from the database
 * @returns The hex color value
 */
export const getStaffColor = (colorName: string | undefined): string => {
  if (!colorName) return STAFF_COLORS.gray;

  // Check if it's already a hex color
  if (colorName.startsWith('#')) return colorName;

  // Look up in the color map
  const color = STAFF_COLORS[colorName.toLowerCase() as StaffColorName];
  return color || STAFF_COLORS.gray;
};

// SIMPLIFIED Appointment Status Color Mappings - ESSENTIAL STATUSES ONLY
// Reduced from 10 to 6 core statuses for clarity
export const STATUS_COLORS = {
  // Waiting statuses (amber/yellow)
  requested: {
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-600',
    textClass: 'text-white',
    hex: '#F59E0B',
    label: 'Requested'
  },
  pending: {
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-600',
    textClass: 'text-white',
    hex: '#F59E0B',
    label: 'Pending'
  },

  // Active statuses (green)
  confirmed: {
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-600',
    textClass: 'text-white',
    hex: '#10B981',
    label: 'Confirmed'
  },
  ready_to_start: {
    bgClass: 'bg-emerald-600',
    borderClass: 'border-emerald-700',
    textClass: 'text-white',
    hex: '#059669',
    label: 'Ready to Start'
  },
  in_progress: {
    bgClass: 'bg-emerald-700',
    borderClass: 'border-emerald-800',
    textClass: 'text-white',
    hex: '#047857',
    label: 'In Progress'
  },

  // Completed status (blue)
  completed: {
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-600',
    textClass: 'text-white',
    hex: '#3B82F6',
    label: 'Completed'
  },

  // Paid status (indigo - NEW)
  paid: {
    bgClass: 'bg-indigo-600',
    borderClass: 'border-indigo-700',
    textClass: 'text-white',
    hex: '#4F46E5',
    label: 'Paid'
  },

  // Negative statuses (red/gray)
  cancelled: {
    bgClass: 'bg-red-500',
    borderClass: 'border-red-600',
    textClass: 'text-white',
    hex: '#EF4444',
    label: 'Cancelled'
  },
  no_show: {
    bgClass: 'bg-gray-500',
    borderClass: 'border-gray-600',
    textClass: 'text-white',
    hex: '#6B7280',
    label: 'No Show'
  },

  // Special (personal task)
  personal_task: {
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-700',
    textClass: 'text-white',
    hex: '#9333EA',
    label: 'Personal Task'
  },

  // Deprecated statuses (mapped to core statuses for backward compatibility)
  accepted: {
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-600',
    textClass: 'text-white',
    hex: '#10B981',
    label: 'Accepted'
  },
} as const;

export type AppointmentStatus = keyof typeof STATUS_COLORS;

/**
 * Get status colors for an appointment
 * @param status - The appointment status
 * @returns Object containing bgClass, borderClass, textClass, and hex values
 */
export const getStatusColors = (status: string) => {
  const statusLower = status.toLowerCase().replace(' ', '_') as AppointmentStatus;
  return STATUS_COLORS[statusLower] || STATUS_COLORS.pending;
};

// Payment Status Colors
export const PAYMENT_STATUS_COLORS = {
  paid: {
    bgClass: 'bg-white/10',
    textClass: 'text-white',
    badgeClass: 'bg-white'
  },
  pending: {
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    badgeClass: 'bg-yellow-500'
  },
  failed: {
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    badgeClass: 'bg-red-500'
  },
  refunded: {
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    badgeClass: 'bg-gray-500'
  },
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS_COLORS;

/**
 * Get payment status colors
 * @param status - The payment status
 * @returns Object containing color classes
 */
export const getPaymentStatusColors = (status: string) => {
  const statusLower = status.toLowerCase() as PaymentStatus;
  return PAYMENT_STATUS_COLORS[statusLower] || PAYMENT_STATUS_COLORS.pending;
};

// Badge/Priority Colors
export const BADGE_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-slate-50 text-slate-800',
  default: 'bg-gray-100 text-gray-800',
} as const;

// Export color options for dropdown/select components
export const STAFF_COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', hex: STAFF_COLORS.blue },
  { value: 'emerald', label: 'Emerald', hex: STAFF_COLORS.emerald },
  { value: 'purple', label: 'Purple', hex: STAFF_COLORS.purple },
  { value: 'pink', label: 'Pink', hex: STAFF_COLORS.pink },
  { value: 'orange', label: 'Orange', hex: STAFF_COLORS.orange },
  { value: 'red', label: 'Red', hex: STAFF_COLORS.red },
  { value: 'teal', label: 'Teal', hex: STAFF_COLORS.teal },
  { value: 'indigo', label: 'Indigo', hex: STAFF_COLORS.indigo },
  { value: 'yellow', label: 'Yellow', hex: STAFF_COLORS.yellow },
  { value: 'green', label: 'Green', hex: STAFF_COLORS.green },
] as const;
