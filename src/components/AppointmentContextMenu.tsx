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
  CheckCircle,
  XCircle,
  CalendarX,
  PlayCircle,
  Check,
  X,
  ChevronRight
} from 'lucide-react';

interface AppointmentContextMenuProps {
  onAction: (action: string, appointment: any) => void;
  onClose: () => void;
  appointment?: any; // Appointment data to pass to action handler
  position?: { x: number; y: number }; // Position from parent component
}

const AppointmentContextMenu: React.FC<AppointmentContextMenuProps> = ({
  onAction,
  onClose,
  appointment,
  position
}) => {
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Main menu items
  const mainMenuItems = [
    { label: 'Change Status', icon: RotateCcw, action: 'change-status', hasSubmenu: true },
    { label: 'Edit', icon: Edit, action: 'edit' },
    { label: 'Notes', icon: FileText, action: 'notes' },
    { label: 'View Client Forms', icon: FolderOpen, action: 'view-forms' },
    { label: 'Rebook', icon: RotateCcw, action: 'rebook' },
    { label: 'Print Ticket', icon: Printer, action: 'print-ticket' },
    { label: 'Delete', icon: Trash2, action: 'delete', danger: true },
    { label: 'Move', icon: Move, action: 'move' },
    { label: 'Upload File', icon: Upload, action: 'upload-file' }
  ];

  // Status submenu items with color mappings
  const statusSubmenuItems = [
    { label: 'Accept', action: 'status-accept', color: 'bg-blue-300' },
    { label: 'Deny', action: 'status-deny', color: 'bg-gray-400' },
    { label: 'Confirm', action: 'status-confirm', color: 'bg-red-400' },
    { label: 'Show', action: 'status-show', color: 'bg-green-400' },
    { label: 'No-Show', action: 'status-no-show', color: 'bg-gray-400' },
    { label: 'Ready to Start Service', action: 'status-ready', color: 'bg-teal-400' },
    { label: 'Service in Progress', action: 'status-progress', color: 'bg-green-400' },
    { label: 'Cancel', action: 'status-cancel', color: 'bg-gray-400' }
  ];

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
        setShowStatusSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleMainMenuClick = (action: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setShowStatusSubmenu(!showStatusSubmenu);
    } else {
      onAction(action, appointment);
      onClose();
    }
  };

  const handleStatusClick = (action: string) => {
    onAction(action, appointment);
    onClose();
  };

  const handleMouseEnterStatus = () => {
    setShowStatusSubmenu(true);
  };

  const handleMouseLeaveStatus = () => {
    setShowStatusSubmenu(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      
      {/* Main Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[280px]"
        style={{
          left: Math.max(10, (position?.x || 0) - 140), // Center horizontally, keep within viewport
          top: Math.max(10, (position?.y || 0) - 20) // Position slightly above center
        }}
      >
        {/* Pointer Arrow */}
        <div
          className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 -top-1.5 left-4"
        />
        
        {/* Menu Items */}
        <div className="pt-2">
          {mainMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isStatusItem = item.action === 'change-status';
            
            return (
              <button
                key={item.action}
                className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-800'
                }`}
                onClick={() => handleMainMenuClick(item.action, item.hasSubmenu || false)}
                onMouseEnter={isStatusItem ? handleMouseEnterStatus : undefined}
                onMouseLeave={isStatusItem ? handleMouseLeaveStatus : undefined}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Status Submenu */}
        {showStatusSubmenu && (
          <div
            className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[220px] z-60"
            onMouseEnter={() => setShowStatusSubmenu(true)}
            onMouseLeave={() => setShowStatusSubmenu(false)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Submenu Pointer Arrow */}
            <div
              className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 -top-1.5 -left-1.5"
            />
            
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <h5 className="text-sm font-semibold text-gray-900">Change Status</h5>
            </div>
            {statusSubmenuItems.map((statusItem) => {
              return (
                <button
                  key={statusItem.action}
                  className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-800"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStatusClick(statusItem.action);
                  }}
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${statusItem.color}`} />
                  <span className="text-sm font-medium">{statusItem.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Checkout Button */}
        <div className="px-4 pt-2 pb-2 border-t border-gray-100 mt-2">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              onAction('checkout', appointment);
              onClose();
            }}
          >
            <CheckCircle className="h-4 w-4" />
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default AppointmentContextMenu;