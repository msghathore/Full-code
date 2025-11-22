import React from 'react';
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
    appointment_time: string;
    staff_id: string;
    status: string;
    full_name: string;
    phone?: string;
    email?: string;
    total_amount?: number;
    notes?: string;
    // Service duration in minutes (to be calculated or fetched)
    duration_minutes?: number;
    // Attribute flags
    is_recurring?: boolean;
    is_bundle?: boolean;
    is_house_call?: boolean;
    has_note?: boolean;
    form_required?: boolean;
    deposit_paid?: boolean;
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

  // Dynamic height calculation - COMPRESSED for maximum density
  // Base height: 30px for 15-minute intervals (reduced from 40px)
  // Formula: (duration_minutes / 15) * base_height
  const BASE_HEIGHT_PX = 30; // This corresponds to 15-minute interval (compressed)
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
  const customerName = appointment.full_name.split(' ')[0] + ' ' + 
    appointment.full_name.split(' ').slice(1).join(' ').split('(')[0].trim();

  return (
    <div
      className={`
        relative overflow-hidden border-2 rounded cursor-move
        transition-all duration-200 hover:shadow-md
        ${statusStyle.bgClass} ${statusStyle.borderClass} ${statusStyle.textClass}
      `}
      style={{
        height: `${calculatedHeight}px`,
        minHeight: '30px' // Compressed minimum touch target
      }}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggable
    >
      {/* Internal padding for content - ULTRA COMPRESSED */}
      <div className="p-0.5 h-full flex flex-col justify-between relative">
        
        {/* Top content - Customer Name (Primary focus) - COMPRESSED */}
        <div className="flex-shrink-0">
          <div className="text-xs font-medium leading-tight truncate pr-6">
            {customerName}
          </div>
        </div>

        {/* Bottom content - Service Name (Secondary focus) - COMPRESSED */}
        <div className="flex-shrink-0">
          <div className="text-3xs leading-tight truncate opacity-85">
            {appointment.service_name}
          </div>
        </div>

        {/* Status icon in top-right corner - COMPRESSED */}
        <div className="absolute top-0.5 right-0.5 opacity-80">
          <StatusIcon size={8} className="currentColor" />
        </div>

        {/* Attribute icons in bottom-right corner - COMPRESSED */}
        {activeAttributes.length > 0 && (
          <div className="absolute bottom-0.5 right-0.5 flex flex-wrap gap-0">
            {activeAttributes.slice(0, 3).map(([key, config], index) => {
              const IconComponent = config.icon;
              return (
                <IconComponent
                  key={key}
                  size={7}
                  className={`${config.color} opacity-75`}
                />
              );
            })}
            {activeAttributes.length > 3 && (
              <span className="text-3xs opacity-60">+{activeAttributes.length - 3}</span>
            )}
          </div>
        )}

        {/* Additional info for larger pills (60+ minutes) - COMPRESSED */}
        {serviceDuration >= 60 && (
          <div className="absolute bottom-0.5 left-1 text-3xs opacity-60">
            {serviceDuration}min
          </div>
        )}

      </div>
    </div>
  );
};

export default DynamicAppointmentPill;