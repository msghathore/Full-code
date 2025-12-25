import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Clock,
  MoreHorizontal,
  GripVertical
} from 'lucide-react';
import AppointmentContextMenu from './AppointmentContextMenu';
import { useToast } from '@/hooks/use-toast';
import { appointmentApi } from '@/services/api';
import { GRID_CONSTANTS } from '@/lib/gridConstants';
import { RETENTION_BADGES, PAYMENT_ICONS, ATTRIBUTE_ICONS, RetentionStatus, PaymentStatus } from '@/lib/appointmentBadges';
import { STATUS_COLORS } from '@/lib/colorConstants';

interface AppointmentPillProps {
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
    is_recurring?: boolean;
    payment_status?: 'paid' | 'pending' | 'refunded';
  };
  staffMember: {
    id: string;
    name: string;
    color: string;
  };
  onEdit?: (appointment: any) => void;
  onView?: (appointment: any) => void;
  onCheckIn?: (appointment: any) => void;
  onDelete?: (appointmentId: string) => void;
  onResize?: (appointmentId: string, newDuration: number) => void;
  onAppointmentUpdated?: () => void;
  style?: React.CSSProperties;
}

// Service duration mapping for fallback
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
  'Personal Task': 30,
  'Package Deal': 180
};

// Format time string to "9:00 AM" format
const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  // Handle HH:mm:ss or HH:mm format
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};

// Calculate end time from start time and duration
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  if (!startTime) return '';
  const parts = startTime.split(':');
  if (parts.length < 2) return '';

  let hours = parseInt(parts[0], 10);
  let minutes = parseInt(parts[1], 10);

  minutes += durationMinutes;
  hours += Math.floor(minutes / 60);
  minutes = minutes % 60;
  hours = hours % 24;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Status color mapping
// Status color map - now imported from centralized constants
const STATUS_COLOR_MAP = STATUS_COLORS;

// Status icon mapping
const STATUS_ICON_MAP = {
  'requested': Clock,
  'accepted': UserCheck,
  'confirmed': CheckCircle,
  'no_show': XCircle,
  'ready_to_start': PlayCircle,
  'in_progress': PlayCircle,
  'completed': CheckCircle,
  'cancelled': XCircle,
  'pending': Clock,
  'personal_task': CalendarX
};

// Resize handle component
const ResizeHandle: React.FC<{
  onResize: (deltaMinutes: number) => void;
  disabled?: boolean;
}> = ({ onResize, disabled }) => {
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = 0; // We'll calculate based on mouse movement

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      // Convert pixels to minutes using grid constants
      const deltaMinutes = Math.round((deltaY / GRID_CONSTANTS.SLOT_HEIGHT_PX) * GRID_CONSTANTS.MINUTES_PER_SLOT);
      if (Math.abs(deltaMinutes) >= 15) { // Only update every 15 minutes
        onResize(deltaMinutes);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize transition-colors ${isResizing ? 'bg-slate-800' : 'hover:bg-slate-200'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      onMouseDown={disabled ? undefined : handleMouseDown}
      style={{
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '2px'
      }}
    >
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-1 flex flex-col items-center justify-center">
        <GripVertical size={8} className="text-gray-600 opacity-60" />
        <GripVertical size={8} className="text-gray-600 opacity-60 -mt-0.5" />
      </div>
    </div>
  );
};

export const AppointmentPill: React.FC<AppointmentPillProps> = ({
  appointment,
  staffMember,
  onEdit,
  onView,
  onCheckIn,
  onDelete,
  onResize,
  onAppointmentUpdated,
  style
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number; pillRect?: DOMRect }>({ x: 0, y: 0 });

  // Note: Native HTML5 drag is handled by DraggableAppointment wrapper in ScheduleGrid
  // Do NOT use react-dnd useDrag here as it conflicts with the native implementation
  const isDragging = false; // Managed by parent component

  // Handle click to open context menu
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    // Position menu to the right of the appointment pill
    setContextMenuPosition({
      x: rect.right + 8, // 8px gap from right edge
      y: rect.top,
      pillRect: rect // Pass full rect for arrow positioning
    });
    setContextMenuOpen(true);
  };

  // Close context menu
  const handleContextMenuClose = () => {
    setContextMenuOpen(false);
  };

  // Unified action handler for context menu
  const handleContextMenuAction = async (action: string, appointment: any) => {
    switch (action) {
      case 'edit':
        onEdit?.(appointment);
        break;
      case 'change-status':
        // Status submenu is handled separately
        break;
      case 'status-accept':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to accepted`,
        });
        onAppointmentUpdated?.();
        break;
      case 'status-deny':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to denied`,
        });
        onAppointmentUpdated?.();
        break;
      case 'status-confirm':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to confirmed`,
        });
        onAppointmentUpdated?.();
        break;
      case 'status-show':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to show`,
        });
        onAppointmentUpdated?.();
        break;
      case 'status-no-show':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to no-show`,
        });
        onAppointmentUpdated?.();
        break;
      case 'status-ready':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to ready to start`,
        });
        onAppointmentUpdated?.();
        break;
      case 'status-progress':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to in progress`,
        });
        onAppointmentUpdated?.();
        break;
      case 'status-cancel':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to cancelled`,
        });
        onAppointmentUpdated?.();
        break;
      case 'notes':
        toast({
          title: "Notes View",
          description: `Opening notes for ${appointment.client_name}`,
        });
        break;
      case 'view-forms':
        toast({
          title: "Forms",
          description: `Viewing forms for ${appointment.client_name}`,
        });
        break;
      case 'rebook':
        toast({
          title: "Rebook",
          description: `Creating new appointment for ${appointment.client_name}`,
        });
        break;
      case 'print-ticket':
        window.print();
        toast({
          title: "Print",
          description: `Printing ticket for ${appointment.client_name}`,
        });
        break;
      case 'delete':
        // Confirmation is handled by the parent component via a proper UI Dialog
        if (onDelete) {
          onDelete(appointment.id);
        } else {
          // Fallback to direct API call if no parent callback (still needs confirm here if used standalone)
          if (window.confirm(`Are you sure you want to delete the appointment for ${appointment.client_name}?`)) {
            try {
              await appointmentApi.delete(appointment.id);
              toast({
                title: "Appointment Deleted",
                description: `Successfully deleted appointment for ${appointment.client_name}`,
              });
            } catch (error) {
              console.error('Failed to delete appointment:', error);
              toast({
                title: "Delete Failed",
                description: `Could not delete appointment`,
                variant: "destructive",
              });
            }
          }
        }
        break;
      case 'move':
        toast({
          title: "Move",
          description: `Moving appointment for ${appointment.client_name}`,
        });
        break;
      case 'upload-file':
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            toast({
              title: "File Uploaded",
              description: `File "${file.name}" attached to appointment`,
            });
          }
        };
        input.click();
        break;
      case 'checkout':
        navigate('/staff/checkout', {
          state: {
            appointmentData: {
              appointmentId: appointment.id,
              serviceName: appointment.service_name,
              servicePrice: appointment.price,
              staffId: appointment.staff_id,
              customerName: appointment.client_name,
              appointmentTime: appointment.start_time
            }
          }
        });
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Calculate service duration
  const serviceDuration = appointment.duration_minutes ||
    SERVICE_DURATIONS[appointment.service_name] || 60;

  // Dynamic height calculation using grid constants
  const calculatedHeight = GRID_CONSTANTS.getSlotHeight(serviceDuration);

  // Get status styling
  const statusStyle = STATUS_COLOR_MAP[appointment.status as keyof typeof STATUS_COLOR_MAP] ||
    STATUS_COLOR_MAP['pending'];

  // Get status icon
  const StatusIcon = STATUS_ICON_MAP[appointment.status as keyof typeof STATUS_ICON_MAP] || Clock;

  // Handle resize
  const handleResize = (deltaMinutes: number) => {
    if (!onResize) return;

    const newDuration = Math.max(15, appointment.duration_minutes + deltaMinutes);
    console.log('Resizing appointment:', {
      appointmentId: appointment.id,
      oldDuration: appointment.duration_minutes,
      newDuration,
      delta: deltaMinutes
    });

    onResize(appointment.id, newDuration);
  };

  // Extract customer name
  const customerName = appointment.client_name.split(' ')[0] + ' ' +
    appointment.client_name.split(' ').slice(1).join(' ').split('(')[0].trim();

  return (
    <>
      <div
        className={`
          relative overflow-hidden border rounded-sm cursor-move select-none
          transition-all duration-150 hover:shadow-sm group
          ${statusStyle.bgClass} ${statusStyle.borderClass} ${statusStyle.textClass}
          ${isDragging ? 'shadow-xl ring-2 ring-slate-400 ring-offset-1' : ''}
        `}
        style={{
          height: '100%', // Fill parent container - height controlled by ScheduleGrid
          minHeight: `${GRID_CONSTANTS.SLOT_HEIGHT_PX}px`,
          maxWidth: '100%',
          width: 'calc(100% - 0px)',
          borderRadius: '2px',
          overflow: 'hidden',
          boxSizing: 'border-box',
          zIndex: isDragging ? 30 : 'auto',
          ...style
        }}
        onClick={handleClick}
      >
        {/* Internal padding with width constraints - Readable text sizing */}
        <div className="p-0.5 h-full flex flex-col justify-between relative" style={{ width: '100%' }}>

          {/* Top content - Customer Name */}
          <div className="flex-shrink-0 px-1.5 pt-1 flex items-center justify-between">
            <div className="text-[13px] font-semibold leading-tight truncate pr-4 flex-1 min-w-0">
              {customerName}
            </div>
            {/* Action buttons - visible on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
              <button
                className="text-[10px] px-1.5 py-0.5 bg-white bg-opacity-90 rounded hover:bg-opacity-100 text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(appointment);
                }}
              >
                Edit
              </button>
            </div>
          </div>

          {/* Middle content - Service Name and Price */}
          <div className="flex-shrink-0 px-1.5 py-0.5 flex items-center justify-between">
            <div className="text-[11px] leading-tight truncate flex-1 min-w-0 mr-2 opacity-95">
              {appointment.service_name}
            </div>
            {appointment.price && (
              <div className="text-[10px] font-medium opacity-90 flex-shrink-0">
                ${appointment.price.toFixed(0)}
              </div>
            )}
          </div>

          {/* Bottom content - Status and time */}
          <div className="flex-shrink-0 px-1.5 pb-1 flex items-center justify-between">
            <div className="text-[10px] opacity-85 flex-1 min-w-0 truncate">
              {formatTime(appointment.start_time)} - {appointment.end_time ? formatTime(appointment.end_time) : calculateEndTime(appointment.start_time, serviceDuration)}
            </div>
            <StatusIcon size={12} className="currentColor opacity-90 flex-shrink-0" />
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

            {appointment.payment_status && PAYMENT_ICONS[appointment.payment_status as PaymentStatus] && (
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
              <div title={ATTRIBUTE_ICONS.recurring.tooltip}>
                {React.createElement(ATTRIBUTE_ICONS.recurring.icon, {
                  className: `w-3 h-3 ${ATTRIBUTE_ICONS.recurring.color}`
                })}
              </div>
            )}

            {appointment.notes && (
              <div title={ATTRIBUTE_ICONS.has_note.tooltip}>
                {React.createElement(ATTRIBUTE_ICONS.has_note.icon, {
                  className: `w-3 h-3 ${ATTRIBUTE_ICONS.has_note.color}`
                })}
              </div>
            )}
          </div>


          {/* Resize handle - only show for longer appointments */}
          {serviceDuration >= 30 && (
            <ResizeHandle
              onResize={handleResize}
              disabled={isDragging}
            />
          )}

        </div>
      </div>

      {/* Context Menu - Only render when open */}
      {contextMenuOpen && (
        <AppointmentContextMenu
          appointment={appointment}
          onAction={handleContextMenuAction}
          onClose={handleContextMenuClose}
          position={contextMenuPosition}
        />
      )}
    </>
  );
};

export default AppointmentPill;
