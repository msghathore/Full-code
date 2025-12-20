import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { verifyStaffPassword } from '@/lib/adminAuth';
import { useToast } from '@/hooks/use-toast';

interface AppointmentContextMenuProps {
  onAction: (action: string, appointment: any) => void;
  onClose: () => void;
  appointment?: any; // Appointment data to pass to action handler
  position?: { x: number; y: number; pillRect?: DOMRect }; // Position from parent component
}

const AppointmentContextMenu: React.FC<AppointmentContextMenuProps> = ({
  onAction,
  onClose,
  appointment,
  position
}) => {
  const { userRole } = useStaffAuth();
  const { toast } = useToast();
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);

  // Admin password verification state
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [pendingStatusAction, setPendingStatusAction] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const [submenuOnLeft, setSubmenuOnLeft] = useState(false);
  const [menuOnLeft, setMenuOnLeft] = useState(false);
  const [arrowTop, setArrowTop] = useState(20);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusItemRef = useRef<HTMLButtonElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate viewport-aware menu position
  useEffect(() => {
    if (!position || !menuRef.current) return;

    const menuWidth = 280; // min-w-[280px]
    const menuHeight = 450; // Approximate menu height
    const padding = 10;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get pill rect for precise positioning
    const pillRect = position.pillRect;

    // Position to the right of the appointment pill
    let left = position.x; // Already has 8px offset from pill
    let onLeft = false;

    // Check if menu would go off right edge
    if (left + menuWidth > viewportWidth - padding) {
      // Position to the left of the pill instead
      if (pillRect) {
        left = pillRect.left - menuWidth - 8;
      } else {
        left = position.x - menuWidth - 16;
      }
      onLeft = true;
    }

    // Ensure not off left edge
    if (left < padding) {
      left = padding;
    }

    // Calculate vertical position - align with pill top
    let top = position.y;
    if (top + menuHeight > viewportHeight - padding) {
      top = viewportHeight - menuHeight - padding;
    }
    if (top < padding) {
      top = padding;
    }

    // Calculate arrow position to point at the center of the pill
    let arrow = 20; // Default
    if (pillRect) {
      const pillCenterY = pillRect.top + pillRect.height / 2;
      arrow = Math.max(16, Math.min(menuHeight - 30, pillCenterY - top));
    }

    setMenuPosition({ left, top });
    setMenuOnLeft(onLeft);
    setArrowTop(arrow);

    // Determine if submenu should appear on left
    const submenuWidth = 220;
    const spaceOnRight = viewportWidth - (left + menuWidth);
    setSubmenuOnLeft(spaceOnRight < submenuWidth + padding);
  }, [position]);

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

  // Status submenu items with color mappings - VIBRANT BOLD COLORS matching colorConstants.ts
  const statusSubmenuItems = [
    { label: 'Accept', action: 'status-accept', color: 'bg-sky-500' },
    { label: 'Deny', action: 'status-deny', color: 'bg-slate-500' },
    { label: 'Confirm', action: 'status-confirm', color: 'bg-emerald-500' },
    { label: 'Show', action: 'status-show', color: 'bg-emerald-500' },
    { label: 'No-Show', action: 'status-no-show', color: 'bg-slate-500' },
    { label: 'Ready to Start Service', action: 'status-ready', color: 'bg-cyan-500' },
    { label: 'Service in Progress', action: 'status-progress', color: 'bg-violet-500' },
    { label: 'Cancel', action: 'status-cancel', color: 'bg-rose-500' }
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

  // Clear any pending hide timeout
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Delayed hide for smooth submenu interaction
  const scheduleHide = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setShowStatusSubmenu(false);
    }, 150); // 150ms delay allows user to move to submenu
  }, [clearHideTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearHideTimeout();
  }, [clearHideTimeout]);

  const handleMainMenuClick = (action: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setShowStatusSubmenu(!showStatusSubmenu);
    } else {
      onAction(action, appointment);
      onClose();
    }
  };

  // Map action strings to actual status values
  const actionToStatusMap: Record<string, string> = {
    'status-accept': 'accepted',
    'status-deny': 'cancelled',
    'status-confirm': 'confirmed',
    'status-show': 'confirmed',
    'status-no-show': 'no_show',
    'status-ready': 'ready_to_start',
    'status-progress': 'in_progress',
    'status-cancel': 'cancelled'
  };

  // Verify admin password for status change authorization
  const handleAdminPasswordVerify = async () => {
    if (!adminPassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPassword(true);
    try {
      // Get admin staff members to verify password
      const { data: adminStaff, error } = await supabase
        .from('staff')
        .select('id, password_hash, password_salt, temp_password, role')
        .eq('role', 'admin');

      if (error) throw error;

      let isValidAdmin = false;
      for (const admin of adminStaff || []) {
        // Check temp_password first (plain text)
        if (admin.temp_password && admin.temp_password === adminPassword) {
          isValidAdmin = true;
          break;
        }
        // Check hashed password
        if (admin.password_hash && admin.password_salt) {
          const isValid = await verifyStaffPassword(adminPassword, admin.password_hash, admin.password_salt);
          if (isValid) {
            isValidAdmin = true;
            break;
          }
        }
        // Legacy: check if password_hash is plain text
        if (admin.password_hash && admin.password_hash === adminPassword) {
          isValidAdmin = true;
          break;
        }
      }

      if (isValidAdmin && pendingStatusAction) {
        // Admin verified - proceed with status change
        toast({
          title: "Authorized",
          description: "Admin verified. Status change allowed.",
        });
        setShowAdminPasswordModal(false);
        setAdminPassword('');
        // Execute the pending status change
        await executeStatusChange(pendingStatusAction);
        setPendingStatusAction(null);
      } else {
        toast({
          title: "Invalid Password",
          description: "The admin password is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying admin password:', error);
      toast({
        title: "Error",
        description: "Failed to verify password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Execute the actual status change in database
  const executeStatusChange = async (action: string) => {
    const newStatus = actionToStatusMap[action];

    if (newStatus && appointment?.id) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appointment.id).select();

        if (error) {
          console.error('Error updating appointment status:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.error('No rows updated - status change may not have been applied');
          return;
        }

        console.log('Status updated successfully:', { appointmentId: appointment.id, newStatus, data });
      } catch (err) {
        console.error('Failed to update status:', err);
      }
    }

    onAction(action, { ...appointment, status: actionToStatusMap[action] });
    onClose();
  };

  const handleStatusClick = async (action: string) => {
    // Check if appointment is completed and user is not admin
    if (appointment?.status === 'completed' && userRole !== 'admin') {
      // Show admin password modal
      setPendingStatusAction(action);
      setShowAdminPasswordModal(true);
      return;
    }

    // Admin or non-completed appointment - proceed directly
    await executeStatusChange(action);
  };

  const handleMouseEnterStatus = () => {
    clearHideTimeout();
    setShowStatusSubmenu(true);
  };

  const handleMouseLeaveStatus = () => {
    scheduleHide();
  };

  const handleSubmenuEnter = () => {
    clearHideTimeout();
  };

  const handleSubmenuLeave = () => {
    scheduleHide();
  };

  // Render context menu in a portal to escape stacking context issues
  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-transparent" style={{ zIndex: 9990 }} onClick={onClose} />

      {/* Main Context Menu */}
      <div
        ref={menuRef}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[280px]"
        style={{
          zIndex: 9995,
          left: `${menuPosition.left}px`,
          top: `${menuPosition.top}px`
        }}
      >
        {/* Pointer Arrow - points horizontally toward the appointment */}
        <div
          className={`absolute w-3 h-3 bg-white transform ${
            menuOnLeft
              ? 'border-r border-t border-gray-200 rotate-45 -right-1.5'
              : 'border-l border-b border-gray-200 -rotate-45 -left-1.5'
          }`}
          style={{ top: `${arrowTop}px` }}
        />
        
        {/* Menu Items */}
        <div className="pt-2 relative">
          {mainMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isStatusItem = item.action === 'change-status';

            return (
              <button
                key={item.action}
                ref={isStatusItem ? statusItemRef : undefined}
                className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-800'
                } ${isStatusItem && showStatusSubmenu ? 'bg-gray-100' : ''}`}
                onClick={() => handleMainMenuClick(item.action, item.hasSubmenu || false)}
                onMouseEnter={isStatusItem ? handleMouseEnterStatus : undefined}
                onMouseLeave={isStatusItem ? handleMouseLeaveStatus : undefined}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronRight className={`h-4 w-4 transition-colors ${showStatusSubmenu ? 'text-blue-500' : 'text-gray-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Status Submenu */}
        {showStatusSubmenu && (
          <>
            {/* Invisible bridge area to prevent hover gap issue */}
            <div
              className={`absolute ${submenuOnLeft ? 'right-full pr-3' : 'left-full pl-3'} top-0 w-6 h-full`}
              onMouseEnter={handleSubmenuEnter}
              onMouseLeave={handleSubmenuLeave}
            />
            <div
              ref={submenuRef}
              className={`absolute ${submenuOnLeft ? 'right-full' : 'left-full'} bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[220px]`}
              style={{
                zIndex: 9996,
                top: '8px',
                marginLeft: submenuOnLeft ? undefined : '12px',
                marginRight: submenuOnLeft ? '12px' : undefined
              }}
              onMouseEnter={handleSubmenuEnter}
              onMouseLeave={handleSubmenuLeave}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Submenu Pointer Arrow - points back to main menu */}
              <div
                className={`absolute w-3 h-3 bg-white transform ${
                  submenuOnLeft
                    ? 'border-r border-t border-gray-200 rotate-45 -right-1.5'
                    : 'border-l border-b border-gray-200 -rotate-45 -left-1.5'
                }`}
                style={{ top: '14px' }}
              />

              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <h5 className="text-sm font-semibold text-gray-900">Change Status</h5>
              </div>
              {statusSubmenuItems.map((statusItem) => {
                return (
                  <button
                    key={statusItem.action}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors text-gray-800"
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
          </>
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

      {/* Admin Password Modal */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowAdminPasswordModal(false);
            setAdminPassword('');
            setPendingStatusAction(null);
          }} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">Admin Authorization Required</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Changing the status of a completed appointment requires admin authorization.
              Please enter an admin password to proceed.
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminPasswordVerify();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAdminPasswordModal(false);
                  setAdminPassword('');
                  setPendingStatusAction(null);
                }}
                disabled={isVerifyingPassword}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminPasswordVerify}
                disabled={isVerifyingPassword || !adminPassword.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isVerifyingPassword ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </>
                ) : (
                  'Authorize'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default AppointmentContextMenu;