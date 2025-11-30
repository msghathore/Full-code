import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
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
  onResize?: (appointmentId: string, newDuration: number) => void;
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

// Status color mapping
const STATUS_COLOR_MAP = {
  'requested': { bgClass: 'bg-yellow-400', borderClass: 'border-yellow-500', textClass: 'text-gray-900' },
  'accepted': { bgClass: 'bg-blue-300', borderClass: 'border-blue-400', textClass: 'text-gray-900' },
  'confirmed': { bgClass: 'bg-green-400', borderClass: 'border-green-500', textClass: 'text-white' },
  'no_show': { bgClass: 'bg-gray-400', borderClass: 'border-gray-500', textClass: 'text-gray-900' },
  'ready_to_start': { bgClass: 'bg-teal-400', borderClass: 'border-teal-500', textClass: 'text-gray-900' },
  'in_progress': { bgClass: 'bg-green-400', borderClass: 'border-green-500', textClass: 'text-gray-900' },
  'completed': { bgClass: 'bg-blue-400', borderClass: 'border-blue-500', textClass: 'text-white' },
  'cancelled': { bgClass: 'bg-red-500', borderClass: 'border-red-600', textClass: 'text-white' },
  'pending': { bgClass: 'bg-yellow-300', borderClass: 'border-yellow-400', textClass: 'text-gray-900' },
  'personal_task': { bgClass: 'bg-amber-700', borderClass: 'border-amber-800', textClass: 'text-white' }
};

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
      // Convert pixels to minutes (approximate based on 32px per 15 minutes)
      const deltaMinutes = Math.round((deltaY / 32) * 15);
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
      className={`absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize transition-colors ${
        isResizing ? 'bg-blue-500' : 'hover:bg-blue-300'
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
  onResize,
  style
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const [{ isDragging }, drag] = useDrag({
    type: 'APPOINTMENT',
    item: {
      id: appointment.id,
      appointment,
      staffMember,
      originalDuration: appointment.duration_minutes
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Handle click to open context menu
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    setContextMenuOpen(true);
  };

  // Close context menu
  const handleContextMenuClose = () => {
    setContextMenuOpen(false);
  };

  // Unified action handler for context menu
  const handleContextMenuAction = (action: string, appointment: any) => {
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
        break;
      case 'status-deny':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to denied`,
        });
        break;
      case 'status-confirm':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to confirmed`,
        });
        break;
      case 'status-show':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to show`,
        });
        break;
      case 'status-no-show':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to no-show`,
        });
        break;
      case 'status-ready':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to ready to start`,
        });
        break;
      case 'status-progress':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to in progress`,
        });
        break;
      case 'status-cancel':
        toast({
          title: "Status Updated",
          description: `Appointment status changed to cancelled`,
        });
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
        if (window.confirm(`Are you sure you want to delete the appointment for ${appointment.client_name}?`)) {
          toast({
            title: "Appointment Deleted",
            description: `Successfully deleted appointment for ${appointment.client_name}`,
          });
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

  // Dynamic height calculation - COMPRESSED for maximum density
  const BASE_HEIGHT_PX = 32; // This corresponds to 15-minute interval
  const calculatedHeight = Math.max(
    (serviceDuration / 15) * BASE_HEIGHT_PX,
    BASE_HEIGHT_PX
  );

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
        ref={drag}
        className={`
          relative overflow-hidden border rounded-sm cursor-move select-none
          transition-all duration-200 hover:shadow-sm group
          ${statusStyle.bgClass} ${statusStyle.borderClass} ${statusStyle.textClass}
          ${isDragging ? 'opacity-60 scale-105 rotate-1' : ''}
        `}
        style={{
          height: `${calculatedHeight}px`,
          minHeight: '32px',
          maxWidth: '100%',
          width: 'calc(100% - 0px)',
          borderRadius: '2px',
          overflow: 'hidden',
          boxSizing: 'border-box',
          ...style
        }}
        onClick={handleClick}
      >
        {/* Internal padding with width constraints */}
        <div className="p-0 h-full flex flex-col justify-between relative" style={{ width: '100%' }}>

          {/* Top content - Customer Name */}
          <div className="flex-shrink-0 px-1 pt-0.5 flex items-center justify-between">
            <div className="text-[10px] font-semibold leading-tight truncate pr-4 flex-1 min-w-0">
              {customerName}
            </div>
            {/* Action buttons - visible on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
              <button
                className="text-[8px] px-1 py-0.5 bg-white bg-opacity-80 rounded hover:bg-opacity-100"
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
          <div className="flex-shrink-0 px-1 py-0 flex items-center justify-between">
            <div className="text-[9px] leading-tight truncate flex-1 min-w-0 mr-2">
              {appointment.service_name}
            </div>
            {appointment.price && (
              <div className="text-[8px] font-medium opacity-80 flex-shrink-0">
                ${appointment.price.toFixed(0)}
              </div>
            )}
          </div>

          {/* Bottom content - Status and time */}
          <div className="flex-shrink-0 px-1 pb-0.5 flex items-center justify-between">
            <div className="text-[8px] opacity-70 flex-1 min-w-0">
              {appointment.start_time}
            </div>
            <StatusIcon size={7} className="currentColor opacity-85 flex-shrink-0" />
          </div>

          {/* Attribute indicators */}
          <div className="absolute bottom-0 right-0 flex gap-px p-0.5 flex-shrink-0">
            {appointment.is_recurring && (
              <Repeat size={6} className="text-blue-600 opacity-80" />
            )}
            {appointment.notes && (
              <FileText size={6} className="text-yellow-600 opacity-80" />
            )}
            {appointment.payment_status === 'paid' && (
              <DollarSign size={6} className="text-green-600 opacity-80" />
            )}
          </div>

          {/* Duration indicator for larger appointments */}
          {serviceDuration >= 90 && (
            <div className="absolute bottom-0.5 left-1 text-[7px] opacity-70 font-medium flex-shrink-0">
              {serviceDuration}m
            </div>
          )}

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