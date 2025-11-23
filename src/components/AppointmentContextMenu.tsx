import React, { useState, useRef, useEffect } from 'react';
import {
  Edit,
  FileText,
  FolderOpen,
  RotateCcw,
  Printer,
  Trash2,
  Move,
  Upload,
  Check,
  X,
  Clock,
  User,
  CheckCircle,
  XCircle,
  CalendarX,
  PlayCircle,
  DollarSign,
  CheckSquare,
  MoreHorizontal,
  Calendar,
  Settings
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AppointmentContextMenuProps {
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
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit?: (appointment: any) => void;
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  onNotes?: (appointment: any) => void;
  onForms?: (appointment: any) => void;
  onRebook?: (appointment: any) => void;
  onPrint?: (appointment: any) => void;
  onDelete?: (appointment: any) => void;
  onMove?: (appointment: any) => void;
  onUpload?: (appointment: any) => void;
  onCheckout?: (appointment: any) => void;
}

// Status options with color swatches and icons
const STATUS_OPTIONS = [
  { value: 'accepted', label: 'Accept', color: 'bg-blue-400', icon: Check },
  { value: 'denied', label: 'Deny', color: 'bg-red-500', icon: X },
  { value: 'confirmed', label: 'Confirm', color: 'bg-green-500', icon: CheckCircle },
  { value: 'show', label: 'Show', color: 'bg-green-400', icon: User },
  { value: 'no_show', label: 'No-Show', color: 'bg-gray-400', icon: XCircle },
  { value: 'ready_to_start', label: 'Ready to Start', color: 'bg-teal-400', icon: PlayCircle },
  { value: 'in_progress', label: 'Service in Progress', color: 'bg-blue-500', icon: Settings },
  { value: 'cancelled', label: 'Cancel', color: 'bg-red-600', icon: X }
];

// First level menu options
const FIRST_LEVEL_OPTIONS = [
  { label: 'Change Status', icon: RotateCcw, hasSubmenu: true, action: 'status' },
  { label: 'Edit', icon: Edit, action: 'edit' },
  { label: 'Notes', icon: FileText, action: 'notes' },
  { label: 'Forms', icon: FolderOpen, action: 'forms' },
  { label: 'Rebook', icon: Calendar, action: 'rebook' },
  { label: 'Print Ticket', icon: Printer, action: 'print' },
  { label: 'Delete', icon: Trash2, action: 'delete', danger: true },
  { label: 'Move', icon: Move, action: 'move' },
  { label: 'Upload File', icon: Upload, action: 'upload' }
];

const AppointmentContextMenu: React.FC<AppointmentContextMenuProps> = ({
  appointment,
  staffMember,
  isOpen,
  position,
  onClose,
  onEdit,
  onStatusChange,
  onNotes,
  onForms,
  onRebook,
  onPrint,
  onDelete,
  onMove,
  onUpload,
  onCheckout
}) => {
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout>();

  // Update menu position to ensure it stays within viewport
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = position.x;
      let adjustedY = position.y;
      
      // Adjust horizontal position if menu goes off-screen
      if (adjustedX + menuRect.width > viewportWidth) {
        adjustedX = position.x - menuRect.width - 200; // Show to the left
      }
      
      // Adjust vertical position if menu goes off-screen
      if (adjustedY + menuRect.height > viewportHeight) {
        adjustedY = position.y - menuRect.height;
      }
      
      setMenuPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isOpen, position]);

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
        setShowStatusSubmenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract customer name and format date/time
  const customerName = appointment.client_name.split('(')[0].trim();
  const appointmentDate = format(parseISO(appointment.start_time), 'MMM d, yyyy');
  const appointmentTime = format(parseISO(appointment.start_time), 'h:mm a');

  const handleFirstLevelAction = (action: string) => {
    switch (action) {
      case 'status':
        setShowStatusSubmenu(true);
        break;
      case 'edit':
        onEdit?.(appointment);
        onClose();
        break;
      case 'notes':
        onNotes?.(appointment);
        onClose();
        break;
      case 'forms':
        onForms?.(appointment);
        onClose();
        break;
      case 'rebook':
        onRebook?.(appointment);
        onClose();
        break;
      case 'print':
        onPrint?.(appointment);
        onClose();
        break;
      case 'delete':
        onDelete?.(appointment);
        onClose();
        break;
      case 'move':
        onMove?.(appointment);
        onClose();
        break;
      case 'upload':
        onUpload?.(appointment);
        onClose();
        break;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange?.(appointment.id, newStatus);
    setShowStatusSubmenu(false);
    onClose();
  };

  const handleMouseEnterStatus = () => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    setShowStatusSubmenu(true);
  };

  const handleMouseLeaveStatus = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setShowStatusSubmenu(false);
    }, 150);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      
      {/* Main Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[280px]"
        style={{
          left: menuPosition.x,
          top: menuPosition.y
        }}
      >
        {/* Header Section */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {customerName}
            </h3>
            <h4 className="text-base font-medium text-gray-800 truncate">
              {appointment.service_name}
            </h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {appointmentDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {appointmentTime}
              </span>
            </div>
          </div>
        </div>

        {/* First Level Options */}
        <div className="py-1">
          {FIRST_LEVEL_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const isStatusOption = option.action === 'status';
            
            return (
              <button
                key={option.action}
                className={`w-full px-2 py-1 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors rounded ${
                  option.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                }`}
                onClick={() => handleFirstLevelAction(option.action)}
                onMouseEnter={isStatusOption ? handleMouseEnterStatus : undefined}
                onMouseLeave={isStatusOption ? handleMouseLeaveStatus : undefined}
              >
                <IconComponent className="h-3 w-3 flex-shrink-0" />
                <span className="flex-1 text-xs">{option.label}</span>
                {isStatusOption && (
                  <MoreHorizontal className="h-3 w-3 opacity-60" />
                )}
              </button>
            );
          })}
        </div>

        {/* Status Submenu */}
        {showStatusSubmenu && (
          <div
            className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]"
            onMouseEnter={() => setShowStatusSubmenu(true)}
            onMouseLeave={() => setShowStatusSubmenu(false)}
          >
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <h5 className="text-sm font-semibold text-gray-900">Change Status</h5>
            </div>
            {STATUS_OPTIONS.map((status) => {
              const StatusIcon = status.icon;
              const isCurrentStatus = appointment.status === status.value;
              
              return (
                <button
                  key={status.value}
                  className={`w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    isCurrentStatus ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                  onClick={() => handleStatusChange(status.value)}
                >
                  <div className={`w-3 h-3 rounded-full ${status.color} flex-shrink-0`} />
                  <StatusIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{status.label}</span>
                  {isCurrentStatus && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Checkout Button */}
        <div className="px-4 pt-2 pb-2 border-t border-gray-100">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              onCheckout?.(appointment);
              onClose();
            }}
          >
            <DollarSign className="h-4 w-4" />
            Checkout
          </button>
        </div>

        {/* Additional Info */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Staff: {staffMember.name}</span>
            {appointment.price && (
              <span className="font-medium text-gray-700">
                ${appointment.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentContextMenu;