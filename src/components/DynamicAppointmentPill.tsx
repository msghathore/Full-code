import React from 'react';
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
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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
const STATUS_COLOR_MAP = {
  'requested': { bgClass: 'bg-yellow-400', borderClass: 'border-yellow-500', textClass: 'text-gray-900' },
  'accepted': { bgClass: 'bg-blue-300', borderClass: 'border-blue-400', textClass: 'text-gray-900' },
  'confirmed': { bgClass: 'bg-red-400', borderClass: 'border-red-500', textClass: 'text-white' },
  'no_show': { bgClass: 'bg-gray-400', borderClass: 'border-gray-500', textClass: 'text-gray-900' },
  'ready_to_start': { bgClass: 'bg-teal-400', borderClass: 'border-teal-500', textClass: 'text-gray-900' },
  'in_progress': { bgClass: 'bg-green-400', borderClass: 'border-green-500', textClass: 'text-gray-900' },
  'complete': { bgClass: 'bg-gray-600', borderClass: 'border-gray-700', textClass: 'text-white' },
  'personal_task': { bgClass: 'bg-amber-700', borderClass: 'border-amber-800', textClass: 'text-white' }
};

// Attribute icon mapping
const ATTRIBUTE_ICONS = {
  'recurring': { icon: Repeat, color: 'text-blue-600' },
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
  onDragStart,
  onDragEnd
}) => {
  // Calculate service duration (use provided duration or get from mapping)
  const serviceDuration = appointment.duration_minutes || 
    SERVICE_DURATIONS[appointment.service_name] || 60; // Default 60 minutes

  // Dynamic height calculation - STRICT VERTICAL COMPRESSION
  // Base height: 30px for 15-minute intervals (strict compression for 4-5 visible hours)
  // Formula: (duration_minutes / 15) * base_height
  const BASE_HEIGHT_PX = 30; // This corresponds to 15-minute interval (strictly compressed)
  const calculatedHeight = Math.max(
    (serviceDuration / 15) * BASE_HEIGHT_PX,
    BASE_HEIGHT_PX // Minimum height of 15-minute interval
  );

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

  return (
    <div
      className={`
        relative overflow-hidden border rounded-sm cursor-move
        transition-all duration-200 hover:shadow-sm
        ${statusStyle.bgClass} ${statusStyle.borderClass} ${statusStyle.textClass}
      `}
      style={{
        height: `${calculatedHeight}px`,
        minHeight: '30px', // Strict compression minimum touch target to match time slots
        borderRadius: '2px' // More rectangular, less rounded
      }}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggable
    >
      {/* Internal padding - ULTRA COMPRESSED for maximum content density */}
      <div className="p-0 h-full flex flex-col justify-between relative">

        {/* Top content - Customer Name (Primary focus) - ULTRA COMPRESSED */}
        <div className="flex-shrink-0 px-1 pt-0.5">
          <div className="text-[10px] font-semibold leading-tight truncate pr-4">
            {customerName}
          </div>
        </div>

        {/* Bottom content - Service Name (Secondary focus) - ULTRA COMPRESSED */}
        <div className="flex-shrink-0 px-1 pb-0.5">
          <div className="text-[9px] leading-tight truncate opacity-90">
            {appointment.service_name}
          </div>
        </div>

        {/* Status icon in top-right corner - ULTRA COMPRESSED */}
        <div className="absolute top-0 right-0 p-0.5 opacity-85">
          <StatusIcon size={7} className="currentColor" />
        </div>

        {/* Attribute icons in bottom-right corner - ULTRA COMPRESSED */}
        {activeAttributes.length > 0 && (
          <div className="absolute bottom-0 right-0 flex gap-px p-0.5">
            {activeAttributes.slice(0, 2).map(([key, config], index) => {
              const IconComponent = config.icon;
              return (
                <IconComponent
                  key={key}
                  size={6}
                  className={`${config.color} opacity-80`}
                />
              );
            })}
            {activeAttributes.length > 2 && (
              <span className="text-[7px] opacity-70 font-medium">+{activeAttributes.length - 2}</span>
            )}
          </div>
        )}

        {/* Duration indicator for larger pills (90+ minutes) - ULTRA COMPRESSED */}
        {serviceDuration >= 90 && (
          <div className="absolute bottom-0.5 left-1 text-[7px] opacity-70 font-medium">
            {serviceDuration}m
          </div>
        )}

      </div>
    </div>
  );
};

export default DynamicAppointmentPill;