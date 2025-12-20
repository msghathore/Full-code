import React from 'react';
import { GRID_CONSTANTS } from '@/lib/gridConstants';
import { RETENTION_BADGES, PAYMENT_ICONS, ATTRIBUTE_ICONS as BADGE_ATTRIBUTE_ICONS, RetentionStatus, PaymentStatus } from '@/lib/appointmentBadges';
import { useDrag } from 'react-dnd';
import {
  Repeat,
  Home,
  FileText,
  DollarSign,
  CheckCircle,
  UserCheck,
  PlayCircle,
  XCircle,
  CalendarX,
  Clock
} from 'lucide-react';
import { DRAG_TYPES, DragAppointmentData } from '@/lib/dragTypes';
import { STATUS_COLORS } from '@/lib/colorConstants';

interface DynamicAppointmentPillProps {
  appointment: {
    id: string;
    service_name: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    staff_id: string;
    status: string;
    client_name: string;
    price?: number;
    notes?: string;
    // Attribute flags
    is_recurring?: boolean;
    payment_status?: 'paid' | 'pending' | 'refunded';
  };
  staffMember?: {
    id: string;
    name: string;
    color: string;
  };
  onClick?: (event: React.MouseEvent) => void;
  // Removed onDragStart/onDragEnd as they're handled by react-dnd
  originalAppointment?: {
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
  };
}

// Service duration mapping (you can replace this with real data from your backend)
const SERVICE_DURATIONS: { [key: string]: number } = {
  'Hair Cut & Style': 60,
  'Manicure': 30,
  'Pedicure': 45,
  'Facial Treatment': 75,
  'Massage': 60,
  'Hair Color': 120,
  'Highlights': 90,
  'Waxing': 30,
  'Eyebrow Wax': 15,
  'Nail Polish Change': 20,
  'Personal Task': 30, // Default personal task duration
  'Package Deal': 180 // Longest service for testing
};

// Status color mapping based on specification
// Status color map - now imported from centralized constants (fixed inconsistency)
const STATUS_COLOR_MAP = STATUS_COLORS;

// Attribute icon mapping
const ATTRIBUTE_ICONS = {
  'recurring': { icon: Repeat, color: 'text-violet-600' },
  'house_call': { icon: Home, color: 'text-green-600' },
  'has_note': { icon: FileText, color: 'text-yellow-600' },
  'deposit_paid': { icon: DollarSign, color: 'text-green-600' },
  'form_required': { icon: FileText, color: 'text-orange-600' },
  'is_bundle': { icon: CheckCircle, color: 'text-purple-600' }
};

// Status icon mapping
const STATUS_ICON_MAP = {
  'requested': Clock,
  'accepted': UserCheck,
  'confirmed': CheckCircle,
  'no_show': XCircle,
  'ready_to_start': PlayCircle,
  'in_progress': PlayCircle,
  'complete': CheckCircle,
  'personal_task': CalendarX
};

export const DynamicAppointmentPill: React.FC<DynamicAppointmentPillProps> = ({
  appointment,
  staffMember,
  onClick,
  originalAppointment
}) => {
  // Calculate service duration (use provided duration or get from mapping)
  const serviceDuration = appointment.duration_minutes ||
    SERVICE_DURATIONS[appointment.service_name] || 60; // Default 60 minutes

  // Dynamic height calculation using grid constants
  const calculatedHeight = GRID_CONSTANTS.getSlotHeight(serviceDuration);

  // Get status styling
  const statusStyle = STATUS_COLOR_MAP[appointment.status as keyof typeof STATUS_COLOR_MAP] ||
    STATUS_COLOR_MAP['requested'];

  // Get status icon
  const StatusIcon = STATUS_ICON_MAP[appointment.status as keyof typeof STATUS_ICON_MAP] || Clock;

  // Collect active attribute icons
  const activeAttributes = Object.entries(ATTRIBUTE_ICONS).filter(([key]) => {
    const attrKey = key as keyof typeof appointment;
    return appointment[attrKey];
  });

  // Extract customer name (remove any extra info)
  const customerName = appointment.client_name?.split(' ')[0] + ' ' +
    (appointment.client_name?.split(' ').slice(1).join(' ').split('(')[0] || '').trim() || 'No Name';

  // Setup react-dnd drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPES.APPOINTMENT,
    item: {
      appointmentId: appointment.id,
      originalAppointment: originalAppointment || {
        id: appointment.id,
        service_name: appointment.service_name,
        appointment_date: '', // Will be set by parent
        appointment_time: appointment.start_time,
        staff_id: appointment.staff_id,
        status: appointment.status,
        full_name: appointment.client_name,
        price: appointment.price,
        notes: appointment.notes
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [appointment, originalAppointment]);

  return (
    <div
      ref={drag}
      className={`
        relative overflow-hidden border rounded-sm cursor-move
        transition-all duration-150 hover:shadow-sm
        ${statusStyle.bgClass} ${statusStyle.borderClass} ${statusStyle.textClass}
        ${isDragging ? 'opacity-75 shadow-xl ring-2 ring-violet-400 ring-offset-1' : ''}
      `}
      style={{
        height: `${calculatedHeight}px`,
        minHeight: `${GRID_CONSTANTS.SLOT_HEIGHT_PX}px`,
        borderRadius: '2px', // More rectangular, less rounded
        // Remove scale/rotate transforms that cause visual glitches between columns
        zIndex: isDragging ? 1000 : 'auto',
      }}
      onClick={(e) => onClick?.(e)}
    >
      {/* Internal padding - Readable text sizing */}
      <div className="p-0.5 h-full flex flex-col justify-between relative">

        {/* Top content - Customer Name (Primary focus) */}
        <div className="flex-shrink-0 px-1.5 pt-1">
          <div className="text-[13px] font-semibold leading-tight truncate pr-4">
            {customerName}
          </div>
        </div>

        {/* Middle/Bottom content - Service Name (Secondary focus) */}
        <div className="flex-shrink-0 px-1.5 pb-1">
          <div className="text-[11px] leading-tight truncate opacity-95">
            {appointment.service_name}
          </div>
        </div>

        {/* Status icon in top-right corner */}
        <div className="absolute top-1 right-1 opacity-85">
          <StatusIcon size={12} className="currentColor" />
        </div>

        {/* Bottom-left: Retention & Payment badges */}
        <div className="absolute bottom-1 left-1 flex gap-1 items-center z-10">
          {appointment.retention_status && RETENTION_BADGES[appointment.retention_status as RetentionStatus] && (
            <div
              className={`
                px-1.5 py-0.5 text-[9px] font-bold rounded border
                ${RETENTION_BADGES[appointment.retention_status as RetentionStatus].bgColor}
                ${RETENTION_BADGES[appointment.retention_status as RetentionStatus].textColor}
                ${RETENTION_BADGES[appointment.retention_status as RetentionStatus].borderColor}
              `}
              title={RETENTION_BADGES[appointment.retention_status as RetentionStatus].tooltip}
            >
              {RETENTION_BADGES[appointment.retention_status as RetentionStatus].label}
            </div>
          )}

          {appointment.payment_status && appointment.payment_status !== 'pending' && PAYMENT_ICONS[appointment.payment_status as PaymentStatus] && (
            <div
              className={`p-0.5 rounded-full ${PAYMENT_ICONS[appointment.payment_status as PaymentStatus].bgColor}`}
              title={PAYMENT_ICONS[appointment.payment_status as PaymentStatus].tooltip}
            >
              {React.createElement(PAYMENT_ICONS[appointment.payment_status as PaymentStatus].icon, {
                className: `w-3 h-3 ${PAYMENT_ICONS[appointment.payment_status as PaymentStatus].color}`
              })}
            </div>
          )}
        </div>

        {/* Top-right: Attribute icons */}
        <div className="absolute top-1 right-1 flex gap-0.5 z-10">
          {appointment.is_recurring && (
            <div title={BADGE_ATTRIBUTE_ICONS.recurring.tooltip}>
              {React.createElement(BADGE_ATTRIBUTE_ICONS.recurring.icon, {
                className: `w-3 h-3 ${BADGE_ATTRIBUTE_ICONS.recurring.color}`
              })}
            </div>
          )}

          {appointment.notes && (
            <div title={BADGE_ATTRIBUTE_ICONS.has_note.tooltip}>
              {React.createElement(BADGE_ATTRIBUTE_ICONS.has_note.icon, {
                className: `w-3 h-3 ${BADGE_ATTRIBUTE_ICONS.has_note.color}`
              })}
            </div>
          )}
        </div>

        {/* Duration indicator for larger pills (90+ minutes) */}
        {serviceDuration >= 90 && (
          <div className="absolute bottom-1.5 right-1.5 text-[10px] opacity-80 font-medium">
            {serviceDuration}m
          </div>
        )}

      </div>
    </div>
  );
};

export default DynamicAppointmentPill;