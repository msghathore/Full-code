import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format, addMinutes, setHours, setMinutes, isSameDay, isToday, parseISO, differenceInMinutes } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Grid3X3,
  List,
  Users,
  Settings,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppointmentCard, { Appointment } from './AppointmentCard';
import AppointmentPill from '@/components/AppointmentPill';
import { getStaffColor as getStaffColorFromMap } from '@/lib/colorConstants';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar?: string;
}

interface ScheduleGridProps {
  selectedDate: Date;
  staff: StaffMember[];
  selectedStaff: string[];
  appointments: Appointment[];
  onDateChange: (date: Date) => void;
  onAppointmentEdit: (appointment: Appointment) => void;
  onAppointmentView: (appointment: Appointment) => void;
  onAppointmentCheckIn: (appointment: Appointment) => void;
  onAppointmentDelete?: (appointmentId: string) => void;
  onAppointmentUpdated?: () => void;
  onCreateAppointment: (staffId: string, time: string) => void;
  className?: string;
}

const TIME_SLOTS = Array.from({ length: 64 }, (_, i) => {
  const hours = Math.floor(i / 4) + 8; // Start from 8 AM
  const minutes = (i % 4) * 15;
  return `${(hours % 24).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

// Generate time labels every 30 minutes from 8:00 AM to 12:00 AM
// Format: Show AM/PM only on hour marks (8 AM, 9 AM), show just time for half hours (8:30, 9:30)
const HOUR_LABELS = Array.from({ length: 32 }, (_, i) => {
  const totalMinutes = 8 * 60 + (i * 30); // Start at 8:00 AM, increment by 30 minutes
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  // For on-the-hour times, show "8 AM" or "8 PM" (no minutes, include AM/PM)
  // For half-hour times, show just "8:30" (no AM/PM)
  if (minutes === 0) {
    return `${hours12} ${ampm}`;
  } else {
    return `${hours12}:${minutes.toString().padStart(2, '0')}`;
  }
});

// Global cleanup function to remove any orphaned drag elements
const cleanupDragElements = () => {
  // Remove any orphaned drag clones
  document.querySelectorAll('#drag-preview-clone').forEach(el => el.remove());

  // Clear global drag state
  (window as any).__dragAppointmentId = null;
  (window as any).__dragStaffId = null;
  (window as any).__dragTime = null;
  (window as any).__dragClickOffsetY = null;
  (window as any).__dragPillHeight = null;
  (window as any).__dragColor = null;

  if ((window as any).__dragCleanup) {
    (window as any).__dragCleanup();
    (window as any).__dragCleanup = null;
  }
};

// Native HTML5 Draggable Appointment Component
// Professional drag-and-drop with solid preview and proper visual feedback
const DraggableAppointment: React.FC<{
  appointment: Appointment;
  staffMember: StaffMember;
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onCheckIn?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  onDragStart?: (appointment: Appointment) => void;
  onDragEnd?: () => void;
  onAppointmentUpdated?: () => void;
  onDropOnAppointment?: (appointmentId: string, staffId: string, time: string) => void;
  gridStartY?: number;
  isDragging?: boolean;
  isAnyDragging?: boolean; // True when ANY appointment is being dragged
  style?: React.CSSProperties;
}> = ({ appointment, staffMember, onEdit, onView, onCheckIn, onDelete, onDragStart, onDragEnd, onAppointmentUpdated, isDragging, isAnyDragging, style }) => {
  const dragCloneRef = useRef<HTMLDivElement | null>(null);
  const clickOffsetRef = useRef({ x: 0, y: 0 });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragCloneRef.current) {
        dragCloneRef.current.remove();
        dragCloneRef.current = null;
      }
    };
  }, []);

  const handleDragStart = (e: React.DragEvent) => {
    // Clean up any previous drag state first
    cleanupDragElements();

    console.log('🎯 DRAG START:', appointment.id);

    // Calculate the offset from the top of the pill to where the user clicked
    const pillRect = e.currentTarget.getBoundingClientRect();
    const clickOffsetY = e.clientY - pillRect.top;
    const clickOffsetX = e.clientX - pillRect.left;
    const pillHeight = pillRect.height;
    const pillWidth = pillRect.width;

    // Store offsets in ref for the event listener
    clickOffsetRef.current = { x: clickOffsetX, y: clickOffsetY };

    // Get the actual color from the staff member or use a reliable default
    const appointmentColor = getStaffColorFromMap(staffMember.color) || staffMember.color || '#10b981';

    // Store drag state in a simple, reliable way
    (window as any).__dragAppointmentId = appointment.id;
    (window as any).__dragStaffId = staffMember.id;
    (window as any).__dragTime = appointment.start_time;
    (window as any).__dragClickOffsetY = clickOffsetY;
    (window as any).__dragPillHeight = pillHeight;
    (window as any).__dragColor = appointmentColor;

    // Set basic DataTransfer for browser compatibility
    e.dataTransfer.setData('text/appointment', appointment.id);
    e.dataTransfer.effectAllowed = 'move';

    // Create a SOLID drag preview clone (100% opacity, no browser transparency)
    const dragClone = document.createElement('div');
    dragClone.id = 'drag-preview-clone';
    dragClone.style.cssText = `
      position: fixed;
      width: ${pillWidth}px;
      height: ${pillHeight}px;
      background: ${appointmentColor};
      border: 2px solid ${appointmentColor};
      border-radius: 4px;
      opacity: 1;
      z-index: 99999;
      pointer-events: none;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2);
      transform: scale(1.02);
      padding: 8px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      left: ${e.clientX - clickOffsetX}px;
      top: ${e.clientY - clickOffsetY}px;
    `;

    // Add appointment content to the clone
    dragClone.innerHTML = `
      <div style="font-weight: 700; font-size: 13px; margin-bottom: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${appointment.client_name}</div>
      <div style="font-size: 11px; opacity: 0.95;">${appointment.service_name}</div>
      <div style="font-size: 10px; opacity: 0.85; margin-top: auto;">${appointment.start_time}</div>
    `;

    document.body.appendChild(dragClone);
    dragCloneRef.current = dragClone;

    // Use a tiny transparent image as the browser's ghost (we'll show our own)
    const transparentImg = new Image();
    transparentImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(transparentImg, 0, 0);

    // Update clone position on drag - use closure to capture offsets
    const offsetX = clickOffsetX;
    const offsetY = clickOffsetY;
    const updateClonePosition = (moveEvent: DragEvent) => {
      // Only update if we have valid coordinates (not 0,0 which happens at drag end)
      if (moveEvent.clientX > 0 && moveEvent.clientY > 0 && dragCloneRef.current) {
        dragCloneRef.current.style.left = `${moveEvent.clientX - offsetX}px`;
        dragCloneRef.current.style.top = `${moveEvent.clientY - offsetY}px`;
      }
    };

    document.addEventListener('drag', updateClonePosition);

    // Store the cleanup function
    (window as any).__dragCleanup = () => {
      document.removeEventListener('drag', updateClonePosition);
    };

    if (onDragStart) {
      onDragStart(appointment);
    }
  };

  const handleDragEnd = () => {
    console.log('🏁 Drag end:', appointment.id);

    // Remove the drag clone
    if (dragCloneRef.current) {
      dragCloneRef.current.remove();
      dragCloneRef.current = null;
    }

    // Full cleanup
    cleanupDragElements();

    if (onDragEnd) {
      onDragEnd();
    }
  };

  // Visual states for drag feedback
  const isThisOneDragging = isDragging;
  const shouldPassThrough = isAnyDragging;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        ...style,
        cursor: isThisOneDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        // Original appointment: 50% opacity with dashed border when being dragged
        // Other appointments: 90% opacity during any drag, 100% when no drag
        opacity: isThisOneDragging ? 0.5 : (shouldPassThrough ? 0.9 : 1),
        transform: 'none',
        transition: 'opacity 0.15s, outline 0.15s',
        // Show dashed border on original position while dragging (like Google Calendar)
        outline: isThisOneDragging ? '2px dashed #3b82f6' : 'none',
        outlineOffset: '-2px',
        borderRadius: '4px',
        // CRITICAL: ALL appointments pass through pointer events during drag
        pointerEvents: shouldPassThrough ? 'none' : 'auto',
      }}
      className="touch-none select-none">
      <AppointmentPill
        appointment={appointment}
        staffMember={staffMember}
        onEdit={onEdit}
        onView={onView}
        onCheckIn={onCheckIn}
        onDelete={onDelete}
        onAppointmentUpdated={onAppointmentUpdated}
      />
    </div>
  );
};


// Time slot visual component - drop handling moved to StaffColumnDropZone for reliability
const TimeSlotDropZone: React.FC<{
  time: string;
  staffId: string;
  onDrop: (appointmentId: string, staffId: string, time: string) => void;
  children: React.ReactNode;
}> = ({ time, staffId, onDrop, children }) => {
  // Drop handling is now done at the StaffColumnDropZone level for more reliable cursor-based positioning
  // This component just renders the visual slot
  return (
    <div className="relative">
      {children}
    </div>
  );
};


// Staff column drop zone - calculates time from cursor position with visual drop preview
const StaffColumnDropZone: React.FC<{
  staffId: string;
  staffMember: StaffMember;
  appointments: Appointment[];
  onDrop: (appointmentId: string, targetStaffId: string) => void;
  onDropWithTime: (appointmentId: string, staffId: string, time: string) => void;
  onCreateAppointment: (staffId: string, time: string) => void;
  children: React.ReactNode;
}> = ({ staffId, staffMember, appointments, onDrop, onDropWithTime, onCreateAppointment, children }) => {
  const [isOver, setIsOver] = useState(false);
  const [dropPreviewY, setDropPreviewY] = useState<number | null>(null);
  const [dropPreviewTime, setDropPreviewTime] = useState<string | null>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  // Calculate drop position and time from Y coordinate
  const calculateDropPosition = (clientY: number): { y: number; time: string } | null => {
    if (!columnRef.current) return null;

    const gridContent = columnRef.current.querySelector('[data-grid-content]');
    if (!gridContent) return null;

    const gridRect = gridContent.getBoundingClientRect();
    const clickOffsetY = (window as any).__dragClickOffsetY || 0;

    // Calculate where the TOP of the pill would be
    // NOTE: Don't add scrollTop here! getBoundingClientRect() already accounts for scroll
    // because it returns position relative to viewport, which changes when we scroll.
    const rawRelativeY = clientY - gridRect.top;
    const adjustedRelativeY = rawRelativeY - clickOffsetY;
    const relativeY = Math.max(0, adjustedRelativeY);

    // 2px per minute, starting at 8 AM (480 minutes)
    const minutesFromGridStart = relativeY / 2;
    const totalMinutes = 480 + minutesFromGridStart;

    // Snap to 15-minute intervals using Math.round for more intuitive drag behavior
    // This fixes the issue where dragging down 1 cell required moving 2 cells
    // because Math.floor only snapped after fully crossing the boundary
    const snappedMinutes = Math.round(totalMinutes / 15) * 15;

    // Clamp to valid time range (8 AM to 11:45 PM)
    const clampedMinutes = Math.min(Math.max(snappedMinutes, 480), 1425); // 480 = 8 AM, 1425 = 23:45

    const hours = Math.floor(clampedMinutes / 60) % 24;
    const minutes = clampedMinutes % 60;
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Calculate Y position for the preview indicator (snapped position)
    const snappedRelativeY = ((clampedMinutes - 480) * 2);

    return { y: snappedRelativeY, time };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);

    // Update drop preview position
    const dropPos = calculateDropPosition(e.clientY);
    if (dropPos) {
      setDropPreviewY(dropPos.y);
      setDropPreviewTime(dropPos.time);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only hide if we're actually leaving the column (not entering a child)
    const relatedTarget = e.relatedTarget as Node;
    if (columnRef.current && !columnRef.current.contains(relatedTarget)) {
      setIsOver(false);
      setDropPreviewY(null);
      setDropPreviewTime(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    setDropPreviewY(null);
    setDropPreviewTime(null);

    try {
      const appointmentId = (window as any).__dragAppointmentId;
      const clickOffsetY = (window as any).__dragClickOffsetY || 0;

      if (!appointmentId) {
        console.log('❌ No drag appointment ID found');
        toast({
          title: "Drop Error",
          description: "Could not identify the dragged appointment.",
          variant: "destructive",
        });
        return;
      }

      // Calculate time from cursor Y position, adjusted for where user grabbed the pill
      const dropPos = calculateDropPosition(e.clientY);
      if (dropPos) {
        console.log('📦 STAFF COLUMN DROP with calculated time:', {
          staffId,
          staffName: staffMember.name,
          calculatedTime: dropPos.time,
          cursorY: e.clientY,
          clickOffsetY
        });

        // Use the time-aware drop handler
        onDropWithTime(appointmentId, staffId, dropPos.time);
      } else {
        // Fallback to staff-only drop if can't calculate position
        console.log('⚠️ Could not calculate drop position, using staff-only drop');
        onDrop(appointmentId, staffId);
      }

      // Clear drag data after successful drop
      (window as any).__dragAppointmentId = null;
      (window as any).__dragStaffId = null;
      (window as any).__dragTime = null;
      (window as any).__dragClickOffsetY = null;
      (window as any).__dragPillHeight = null;

    } catch (error) {
      console.error('❌ Error in staff column drop:', error);
      toast({
        title: "Drop Error",
        description: "Could not move appointment. Please try again.",
        variant: "destructive",
      });

      // Clear drag data on error
      (window as any).__dragAppointmentId = null;
      (window as any).__dragStaffId = null;
      (window as any).__dragTime = null;
      (window as any).__dragClickOffsetY = null;
      (window as any).__dragPillHeight = null;
    }
  };

  return (
    <div
      ref={columnRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 border-r last:border-r-0 relative transition-colors duration-150 ${
        isOver ? 'bg-slate-50/50' : ''
      }`}
      style={{
        // Highlight the entire column when dragging over
        boxShadow: isOver ? 'inset 0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none'
      }}
    >
      {children}

      {/* Drop preview indicator - shows where the appointment will land */}
      {isOver && dropPreviewY !== null && dropPreviewTime && (
        <div
          className="absolute left-1 right-1 pointer-events-none z-50"
          style={{
            top: `${dropPreviewY}px`,
          }}
        >
          {/* Time indicator pill - positioned ABOVE the drop zone */}
          <div className="absolute -top-5 left-0 flex items-center gap-1">
            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
              {dropPreviewTime}
            </div>
          </div>
          {/* Top line showing exact drop position */}
          <div className="h-[2px] bg-slate-800 rounded shadow-lg" />
          {/* Preview outline showing where pill will be placed - starts exactly at dropPreviewY */}
          <div
            className="border-2 border-dashed border-gray-400 rounded bg-slate-50/30"
            style={{
              height: `${(window as any).__dragPillHeight || 60}px`,
            }}
          />
        </div>
      )}
    </div>
  );
};


// Helper to get current time in Winnipeg timezone
const getWinnipegTime = (): Date => {
  // Get current time in Winnipeg, Canada timezone (America/Winnipeg)
  const now = new Date();
  const winnipegTimeStr = now.toLocaleString('en-US', {
    timeZone: 'America/Winnipeg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  // Parse the Winnipeg time string back to a Date object
  const [datePart, timePart] = winnipegTimeStr.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute, second] = timePart.split(':');
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
};

// Current Time Tracker Line Component for ScheduleGrid
const CurrentTimeTrackerLine: React.FC<{
  selectedDate: Date;
  showLabel?: boolean;
}> = ({ selectedDate, showLabel = false }) => {
  const [currentTime, setCurrentTime] = useState(getWinnipegTime());
  const lineRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    // Initial update
    setCurrentTime(getWinnipegTime());

    const interval = setInterval(() => {
      setCurrentTime(getWinnipegTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time on mount and when date changes
  useEffect(() => {
    if (isToday(selectedDate) && lineRef.current && showLabel) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        lineRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, [selectedDate, showLabel]);

  // Only show the line if viewing today's schedule
  if (!isToday(selectedDate)) {
    return null;
  }

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // TIME_SLOTS starts at 8 AM, each slot is 15 minutes = 30px height
  const SLOT_HEIGHT_PX = 30;
  const START_HOUR = 8;

  // Calculate minutes from 8 AM to current time
  const minutesFrom8AM = (currentHour - START_HOUR) * 60 + currentMinute;

  // Calculate pixel position (each 15 minutes = 30px)
  const topPosition = (minutesFrom8AM / 15) * SLOT_HEIGHT_PX;

  // Don't show if current time is outside business hours (before 8 AM)
  if (topPosition < 0) {
    return null;
  }

  // Format time with Winnipeg timezone label
  const formattedTime = format(currentTime, 'h:mm a');

  return (
    <div
      ref={lineRef}
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top: `${topPosition}px`, zIndex: 100 }}
    >
      {/* Time label with Winnipeg timezone - only show on first column */}
      {showLabel && (
        <div className="absolute -left-[75px] -top-3 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap" style={{ zIndex: 101 }}>
          {formattedTime} CST
        </div>
      )}
      {/* Yellow line - more visible */}
      <div className="h-[3px] bg-yellow-500 shadow-lg" style={{ boxShadow: '0 0 10px rgba(234, 179, 8, 0.8)' }} />
      {/* Triangle indicator on left - only show on first column */}
      {showLabel && (
        <div
          className="absolute left-0 -top-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-yellow-500"
        />
      )}
    </div>
  );
};


const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  selectedDate,
  staff,
  selectedStaff,
  appointments,
  onDateChange,
  onAppointmentEdit,
  onAppointmentView,
  onAppointmentCheckIn,
  onAppointmentDelete,
  onAppointmentUpdated,
  onCreateAppointment,
  className = '',
}) => {
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dragOverStaff, setDragOverStaff] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Partial<Appointment>>>({});

  // Global cleanup on component mount - handles edge cases like drag ending outside window
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      // Clean up any orphaned drag elements when drag ends anywhere
      cleanupDragElements();
      setDraggedAppointment(null);
    };

    const handleWindowBlur = () => {
      // Clean up if user drags outside the window
      cleanupDragElements();
      setDraggedAppointment(null);
    };

    // Listen for dragend on document to catch all drag end events
    document.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('blur', handleWindowBlur);
      // Cleanup on unmount
      cleanupDragElements();
    };
  }, []);

  // Filter appointments for selected date and staff
  const dayAppointments = useMemo(() => {
    // Apply optimistic updates
    const currentAppointments = appointments.map(apt =>
      optimisticUpdates[apt.id] ? { ...apt, ...optimisticUpdates[apt.id] } : apt
    );

    return currentAppointments.filter(apt =>
      isSameDay(parseISO(apt.appointment_date || apt.start_time), selectedDate) &&
      (apt.staff_id === null || selectedStaff.includes(apt.staff_id)) &&
      apt.status !== 'cancelled' // Filter out cancelled appointments
    );
  }, [appointments, selectedDate, selectedStaff, optimisticUpdates]);

  // Group appointments by staff
  const appointmentsByStaff = useMemo(() => {
    const grouped: { [staffId: string]: Appointment[] } = {};
    // Include unassigned appointments (staff_id: null)
    grouped['unassigned'] = dayAppointments.filter(apt => apt.staff_id === null);
    // Include assigned appointments
    selectedStaff.forEach(staffId => {
      grouped[staffId] = dayAppointments.filter(apt => apt.staff_id === staffId);
    });
    return grouped;
  }, [dayAppointments, selectedStaff]);

  // Helper function to normalize time format (HH:mm:ss -> HH:mm)
  const normalizeTime = (time: string | undefined): string => {
    if (!time) return '';
    // Handle HH:mm:ss or HH:mm format
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return time;
  };

  // SMART SYNC: Clear optimistic updates when real data from Supabase reflects the changes
  // This prevents appointments from reverting when the timeout clears the optimistic state
  useEffect(() => {
    if (Object.keys(optimisticUpdates).length === 0) return;

    const updatesToRemove: string[] = [];

    Object.entries(optimisticUpdates).forEach(([appointmentId, optimisticData]) => {
      const realAppointment = appointments.find(apt => apt.id === appointmentId);
      if (!realAppointment) {
        // If appointment is not found in real data, it might be a new appointment not yet fetched
        // Or it was deleted. We keep the optimistic update for now.
        return;
      }

      // Check if the real appointment data now matches the optimistic update
      let allMatch = true;

      // Check staff_id match
      if (optimisticData.staff_id !== undefined && realAppointment.staff_id !== optimisticData.staff_id) {
        allMatch = false;
      }

      // Check start_time by comparing with normalized time formats
      // The database may return HH:mm:ss while optimistic uses HH:mm
      const realTime = normalizeTime((realAppointment as any).appointment_time || realAppointment.start_time);
      const optimisticTime = normalizeTime(optimisticData.start_time || (optimisticData as any).appointment_time);

      if (optimisticTime && realTime !== optimisticTime) {
        allMatch = false;
      }

      // Check date match if applicable
      if (optimisticData.appointment_date && realAppointment.appointment_date) {
        if (optimisticData.appointment_date !== realAppointment.appointment_date) {
          allMatch = false;
        }
      }

      if (allMatch) {
        console.log('✅ Smart sync: Real data matches optimistic update, clearing:', appointmentId);
        updatesToRemove.push(appointmentId);
      }
    });

    if (updatesToRemove.length > 0) {
      setOptimisticUpdates(prev => {
        const newUpdates = { ...prev };
        updatesToRemove.forEach(id => delete newUpdates[id]);
        return newUpdates;
      });
    }
  }, [appointments, optimisticUpdates]);

  const getStaffColor = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return getStaffColorFromMap(staffMember?.color);
  };

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember?.name || 'Unknown';
  };

  // Handle dropping appointment on time slot - FIXED VERSION WITH DATE VALIDATION
  const handleTimeSlotDrop = useCallback(async (appointmentId: string, staffId: string, time: string) => {
    console.log('🔄 DRAG EVENT: handleTimeSlotDrop called', { appointmentId, staffId, time });

    const appointment = dayAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      console.log('❌ DRAG EVENT: Appointment not found', appointmentId);
      return;
    }

    console.log('📅 DRAG EVENT: Found appointment', appointment);

    // Calculate new duration if needed with proper validation
    let duration: number;

    try {
      // Since start_time and end_time are time-only strings (e.g., "14:30"),
      // we need to combine them with the appointment date to create proper Date objects
      const appointmentDateStr = appointment.appointment_date || format(selectedDate, 'yyyy-MM-dd');

      // Create full datetime strings by combining date with time
      const startDateTimeStr = `${appointmentDateStr}T${appointment.start_time}`;
      const endDateTimeStr = `${appointmentDateStr}T${appointment.end_time}`;

      const oldStart = parseISO(startDateTimeStr);
      const oldEnd = parseISO(endDateTimeStr);

      // Validate that dates were parsed successfully
      if (isNaN(oldStart.getTime()) || isNaN(oldEnd.getTime())) {
        console.log('⚠️ DRAG EVENT: Invalid date format, using default duration', {
          appointment,
          startDateTimeStr,
          endDateTimeStr
        });
        duration = appointment.duration_minutes || 60; // Default to 60 minutes
      } else {
        duration = differenceInMinutes(oldEnd, oldStart);
      }
    } catch (dateError) {
      console.log('⚠️ DRAG EVENT: Date parsing error, using default duration', dateError);
      duration = appointment.duration_minutes || 60; // Default to 60 minutes
    }

    const newStart = setMinutes(setHours(selectedDate, parseInt(time.split(':')[0])), parseInt(time.split(':')[1]));
    const newEnd = addMinutes(newStart, duration);

    console.log('⏰ DRAG EVENT: Calculated new times', {
      appointmentId,
      time,
      staffId,
      newStart: newStart.toISOString(),
      newEnd: newEnd.toISOString(),
      duration: duration
    });

    // VALIDATION: Prevent drops at or after midnight (12:00 AM)
    const maxTime = setMinutes(setHours(selectedDate, 23), 59); // 11:59 PM (last valid start time)
    if (newStart > maxTime) {
      console.log('🚫 DRAG EVENT: Drop blocked - time at/after midnight', { newStart: newStart.toISOString(), maxTime: maxTime.toISOString() });
      toast({
        title: "Invalid Time",
        description: "Appointments cannot start at or after midnight. Salon closes at 12:00 AM.",
        variant: "destructive",
      });
      return;
    }

    // VALIDATION: Prevent appointment END time from exceeding midnight
    const midnightNextDay = setMinutes(setHours(new Date(selectedDate), 24), 0); // Midnight of next day
    if (newEnd > midnightNextDay) {
      console.log('🚫 DRAG EVENT: Drop blocked - appointment would end after midnight', {
        newStart: newStart.toISOString(),
        newEnd: newEnd.toISOString(),
        midnight: midnightNextDay.toISOString()
      });
      toast({
        title: "Invalid Time",
        description: "Appointment would end after midnight. Salon closes at 12:00 AM.",
        variant: "destructive",
      });
      return;
    }

    // VALIDATION: Prevent overlapping with existing appointments for the same staff
    const newStartMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
    const newEndMinutes = newStartMinutes + duration;

    // Get all appointments for this staff on this date (excluding the one being moved)
    const staffAppointments = dayAppointments.filter(apt =>
      apt.staff_id === staffId && apt.id !== appointmentId
    );

    // Check for overlaps
    const hasOverlap = staffAppointments.some(existingApt => {
      // Parse existing appointment times
      const existingStartTime = existingApt.start_time || existingApt.appointment_time;
      if (!existingStartTime) return false;

      const existingStartParts = existingStartTime.split(':');
      const existingStartMinutes = parseInt(existingStartParts[0]) * 60 + parseInt(existingStartParts[1]);
      const existingDuration = existingApt.duration_minutes || 60;
      const existingEndMinutes = existingStartMinutes + existingDuration;

      // Check for overlap: new appointment overlaps if it starts before existing ends AND ends after existing starts
      const overlaps = newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes;

      if (overlaps) {
        console.log('🚫 OVERLAP DETECTED:', {
          newAppointment: { start: newStartMinutes, end: newEndMinutes, time },
          existingAppointment: {
            id: existingApt.id,
            client: existingApt.client_name,
            start: existingStartMinutes,
            end: existingEndMinutes,
            time: existingStartTime
          }
        });
      }

      return overlaps;
    });

    if (hasOverlap) {
      console.log('🚫 DRAG EVENT: Drop blocked - would overlap with existing appointment');
      toast({
        title: "Time Slot Occupied",
        description: "This time slot overlaps with an existing appointment. Please choose a different time.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [appointmentId]: {
        staff_id: staffId,
        start_time: time,
        appointment_time: time,
        end_time: format(newEnd, 'HH:mm'),
        appointment_date: format(selectedDate, 'yyyy-MM-dd')
      }
    }));

    try {
      console.log('🔄 DRAG EVENT: Attempting database update', {
        appointmentId,
        staffId,
        time,
        date: format(selectedDate, 'yyyy-MM-dd')
      });

      // Update appointment in Supabase
      // Note: Only update columns that exist in the database schema
      // The appointments table has: staff_id, appointment_time, appointment_date
      // start_time and end_time are computed client-side, not stored

      // First, verify the appointment exists
      const { data: existingApt, error: fetchError } = await supabase
        .from('appointments')
        .select('id, staff_id, appointment_time, appointment_date')
        .eq('id', appointmentId)
        .single();

      console.log('🔍 DRAG EVENT: Checking if appointment exists:', {
        appointmentId,
        existingApt,
        fetchError
      });

      if (fetchError || !existingApt) {
        console.error('❌ DRAG EVENT: Appointment not found in database', { appointmentId, fetchError });
        toast({
          title: "Appointment Not Found",
          description: "This appointment doesn't exist in the database.",
          variant: "destructive",
        });
        throw new Error('Appointment not found');
      }

      // Now perform the update
      console.log('🔄 DRAG EVENT: Attempting update with:', {
        staff_id: staffId,
        appointment_time: time,
        appointment_date: format(selectedDate, 'yyyy-MM-dd')
      });

      const { data: updatedData, error, status, statusText } = await supabase
        .from('appointments')
        .update({
          staff_id: staffId,
          appointment_time: time,
          appointment_date: format(selectedDate, 'yyyy-MM-dd')
        })
        .eq('id', appointmentId)
        .select();

      console.log('📊 DRAG EVENT: Update response:', {
        updatedData,
        error,
        status,
        statusText,
        rowCount: updatedData?.length
      });

      if (error) {
        console.error('❌ DRAG EVENT: Database update failed', error);
        toast({
          title: "Database Error",
          description: `Failed to update appointment: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }

      // Check if the update actually affected any rows (RLS might block silently)
      if (!updatedData || updatedData.length === 0) {
        console.error('❌ DRAG EVENT: No rows updated - check RLS or constraints');
        toast({
          title: "Update Failed",
          description: "Could not update appointment. Check console for details.",
          variant: "destructive",
        });
        throw new Error('No rows updated');
      }

      console.log('✅ DRAG EVENT: Database update successful');

      toast({
        title: "Appointment Updated",
        description: `Moved to ${format(newStart, 'h:mm a')}`,
      });

      // Clear drag state to ensure clicks work after drop
      setDraggedAppointment(null);

      // Notify parent to refetch data (since real-time might not trigger)
      if (onAppointmentUpdated) {
        console.log('📢 Notifying parent to refetch appointments');
        onAppointmentUpdated();
      }

      // Clear optimistic update immediately since we're refetching
      setOptimisticUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[appointmentId];
        return newUpdates;
      });
    } catch (error) {
      console.error('❌ DRAG EVENT: Error updating appointment', error);
      // Clear drag state even on error
      setDraggedAppointment(null);
      toast({
        title: "Update Failed",
        description: "Could not move appointment. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[appointmentId];
        return newUpdates;
      });
    }
  }, [dayAppointments, selectedDate]);

  // Handle dropping appointment on staff column
  const handleStaffDrop = useCallback(async (appointmentId: string, targetStaffId: string) => {
    console.log('🔄 DRAG EVENT: handleStaffDrop called', { appointmentId, targetStaffId });

    const appointment = dayAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      console.log('❌ DRAG EVENT: Appointment not found', appointmentId);
      toast({
        title: "Appointment Not Found",
        description: `Could not find appointment with ID: ${appointmentId}`,
        variant: "destructive",
      });
      return;
    }

    if (appointment.staff_id === targetStaffId) {
      console.log('⚠️ DRAG EVENT: Appointment already assigned to this staff', appointmentId);
      toast({
        title: "Already Assigned",
        description: "This appointment is already assigned to the selected staff member.",
      });
      return;
    }

    // VALIDATION: Check for overlapping appointments with the target staff
    const appointmentStartTime = appointment.start_time || (appointment as any).appointment_time;
    if (appointmentStartTime) {
      const startParts = appointmentStartTime.split(':');
      const appointmentStartMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      const appointmentDuration = appointment.duration_minutes || 60;
      const appointmentEndMinutes = appointmentStartMinutes + appointmentDuration;

      // Get all appointments for target staff on this date
      const targetStaffAppointments = dayAppointments.filter(apt =>
        apt.staff_id === targetStaffId && apt.id !== appointmentId
      );

      // Check for overlaps with target staff's appointments
      const hasOverlap = targetStaffAppointments.some(existingApt => {
        const existingStartTime = existingApt.start_time || (existingApt as any).appointment_time;
        if (!existingStartTime) return false;

        const existingStartParts = existingStartTime.split(':');
        const existingStartMinutes = parseInt(existingStartParts[0]) * 60 + parseInt(existingStartParts[1]);
        const existingDuration = existingApt.duration_minutes || 60;
        const existingEndMinutes = existingStartMinutes + existingDuration;

        // Check for overlap
        const overlaps = appointmentStartMinutes < existingEndMinutes && appointmentEndMinutes > existingStartMinutes;

        if (overlaps) {
          console.log('🚫 STAFF OVERLAP DETECTED:', {
            movingAppointment: { start: appointmentStartMinutes, end: appointmentEndMinutes },
            existingAppointment: {
              id: existingApt.id,
              client: existingApt.client_name,
              start: existingStartMinutes,
              end: existingEndMinutes
            }
          });
        }

        return overlaps;
      });

      if (hasOverlap) {
        console.log('🚫 DRAG EVENT: Staff drop blocked - would overlap with existing appointment');
        toast({
          title: "Time Slot Occupied",
          description: "This staff member already has an appointment at this time. Please choose a different time or staff member.",
          variant: "destructive",
        });
        return;
      }
    }

    console.log('👤 DRAG EVENT: Moving appointment to staff', {
      appointmentId,
      fromStaff: appointment.staff_id,
      toStaff: targetStaffId
    });

    // Optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [appointmentId]: {
        staff_id: targetStaffId
      }
    }));

    try {
      console.log('🔄 DRAG EVENT: Attempting staff database update', {
        appointmentId,
        targetStaffId
      });

      // Update appointment staff in Supabase
      // Using .select() to verify the update actually happened (important for RLS)
      const { data: updatedData, error } = await supabase
        .from('appointments')
        .update({
          staff_id: targetStaffId
        })
        .eq('id', appointmentId)
        .select();

      if (error) {
        console.error('❌ DRAG EVENT: Staff database update failed', error);
        toast({
          title: "Staff Update Error",
          description: `Failed to reassign staff: ${error.message}`,
          variant: "destructive",
        });
        throw error;
      }

      // Check if the update actually affected any rows (RLS might block silently)
      if (!updatedData || updatedData.length === 0) {
        console.error('❌ DRAG EVENT: No rows updated for staff - possible RLS restriction');
        toast({
          title: "Update Failed",
          description: "Could not reassign staff. You may not have permission.",
          variant: "destructive",
        });
        throw new Error('No rows updated');
      }

      console.log('✅ DRAG EVENT: Staff database update successful');

      toast({
        title: "Staff Updated",
        description: `Appointment moved to ${getStaffName(targetStaffId)}`,
      });

      // Clear drag state to ensure clicks work after drop
      setDraggedAppointment(null);

      // Notify parent to refetch data (since real-time might not trigger)
      if (onAppointmentUpdated) {
        console.log('📢 Notifying parent to refetch appointments');
        onAppointmentUpdated();
      }

      // Clear optimistic update immediately since we're refetching
      setOptimisticUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[appointmentId];
        return newUpdates;
      });
    } catch (error) {
      console.error('❌ DRAG EVENT: Error updating appointment staff', error);
      // Clear drag state even on error
      setDraggedAppointment(null);
      toast({
        title: "Update Failed",
        description: "Could not reassign staff. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[appointmentId];
        return newUpdates;
      });
    }
  }, [dayAppointments, getStaffName]);

  // Handle appointment resize
  const handleAppointmentResize = useCallback((appointmentId: string, newDuration: number) => {
    const appointment = dayAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    console.log('Resizing appointment:', {
      appointmentId,
      oldDuration: appointment.duration_minutes,
      newDuration,
      serviceName: appointment.service_name
    });

    // Update appointment duration (this would need backend integration)
    // Example: updateAppointment(appointmentId, {
    //   duration_minutes: newDuration,
    //   end_time: new Date(new Date(appointment.start_time).getTime() + newDuration * 60000).toISOString()
    // });
  }, [dayAppointments]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const handleDragStart = (appointment: Appointment) => {
    // Delay setting state to allow drag to start properly before disabling pointer events
    setTimeout(() => {
      setDraggedAppointment(appointment);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
  };

  return (
    <div className={`flex-1 flex flex-col bg-white ${className}`} data-testid="schedule-grid">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, MMM d')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
            {dayAppointments.length} appointments
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="h-8 text-xs"
          >
            Today
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (selectedStaff.length > 0) {
                onCreateAppointment(selectedStaff[0], '09:00');
              }
            }}
            className="h-8 text-xs bg-black hover:bg-slate-800"
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Schedule Grid with Fixed Header - 4 columns visible by default with horizontal scroll */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header Row - Always visible, with padding for scrollbar */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white overflow-x-auto scrollbar-hide" style={{ zIndex: 60, paddingRight: '17px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `64px ${selectedStaff.map(() => 'minmax(180px, 1fr)').join(' ')}`,
            minWidth: `${64 + (selectedStaff.length * 180)}px`
          }}>
            {/* Time Column Header */}
            <div className="h-[48px] bg-gray-100 border-r sticky left-0 z-10"></div>

            {/* Staff Column Headers - Compact with photo beside name */}
            {selectedStaff.map((staffId, index) => {
              const staffMember = staff.find(s => s.id === staffId);
              if (!staffMember) return null;
              const firstName = staffMember.name.split(' ')[0];

              return (
                <div
                  key={staffId}
                  className="h-[48px] bg-white border-r flex items-center px-3 gap-2"
                  style={{ minWidth: '180px' }}
                >
                  <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm flex-shrink-0">
                    <AvatarImage
                      src={staffMember.avatar || '/images/client-1.jpg'}
                      alt={firstName}
                    />
                    <AvatarFallback
                      className="text-white text-sm font-semibold"
                      style={{ backgroundColor: staffMember.color }}
                    >
                      {staffMember.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {firstName}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-100 flex-shrink-0"
                    onClick={() => onCreateAppointment(staffId, '09:00')}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Area - Horizontal scroll for more than 4 staff */}
        <div className="flex-1 overflow-auto">
          <div style={{
            display: 'grid',
            gridTemplateColumns: `64px ${selectedStaff.map(() => 'minmax(180px, 1fr)').join(' ')}`,
            minWidth: `${64 + (selectedStaff.length * 180)}px`
          }}>
            {/* Time Column */}
            <div className="bg-gray-50 border-r">
              {HOUR_LABELS.map((hour, index) => (
              <div
                key={index}
                className="h-[60px] border-b border-gray-200 flex items-start justify-center pt-1 text-xs font-medium text-gray-500"
              >
                {hour}
              </div>
            ))}
          </div>



          {/* Staff Grid Cells */}
          {selectedStaff.map((staffId, index) => {
            const staffMember = staff.find(s => s.id === staffId);
            if (!staffMember) return null;

            return (
              <StaffColumnDropZone
                key={staffId}
                staffId={staffId}
                staffMember={staffMember}
                appointments={appointmentsByStaff[staffId] || []}
                onDrop={handleStaffDrop}
                onDropWithTime={handleTimeSlotDrop}
                onCreateAppointment={onCreateAppointment}
              >
                <div
                  className="relative border-r border-gray-200 overflow-hidden"
                  data-grid-content="true"
                >
                  {/* Time Slots */}
                  {TIME_SLOTS.map((time, timeIndex) => (
                    <TimeSlotDropZone
                      key={timeIndex}
                      time={time}
                      staffId={staffId}
                      onDrop={handleTimeSlotDrop}
                    >
                      <div
                        className="h-[30px] border-b border-gray-100 hover:bg-gray-50 cursor-pointer relative group"
                        onClick={() => onCreateAppointment(staffId, time)}
                        style={{ zIndex: 0 }}
                      >
                        {/* 15-minute intervals - Enhanced visibility */}
                        {timeIndex % 4 === 1 && (
                          <div className="absolute top-0 left-0 right-0 border-t border-dashed border-gray-300" style={{ borderTopWidth: '1px' }} />
                        )}
                        {timeIndex % 4 === 2 && (
                          <div className="absolute top-0 left-0 right-0 border-t border-gray-400" style={{ borderTopWidth: '1.5px' }} />
                        )}
                        {timeIndex % 4 === 3 && (
                          <div className="absolute top-0 left-0 right-0 border-t border-dashed border-gray-300" style={{ borderTopWidth: '1px' }} />
                        )}
                      </div>
                    </TimeSlotDropZone>
                  ))}

                  {/* Appointments with Fixed Grid Positioning */}
                  {appointmentsByStaff[staffId]?.map((appointment) => (
                    <DraggableAppointment
                      key={appointment.id}
                      appointment={appointment}
                      staffMember={staffMember}
                      onEdit={onAppointmentEdit}
                      onView={onAppointmentView}
                      onCheckIn={onAppointmentCheckIn}
                      onDelete={onAppointmentDelete}
                      onAppointmentUpdated={onAppointmentUpdated}
                      onDragStart={handleDragStart}
                      onDropOnAppointment={handleTimeSlotDrop}
                      style={{
                        position: 'absolute',
                        left: '4px',
                        right: '4px',
                        // Grid uses 2px per minute (30px per 15-minute slot)
                        top: `${((parseInt(appointment.start_time.split(':')[0]) - 8) * 60 + parseInt(appointment.start_time.split(':')[1])) * 2}px`,
                        height: `${Math.max(appointment.duration_minutes * 2, 40)}px`,
                        maxWidth: 'calc(100% - 8px)',
                        overflow: 'hidden',
                        zIndex: draggedAppointment?.id === appointment.id ? 100 : 10,
                      }}
                      isDragging={draggedAppointment?.id === appointment.id}
                      isAnyDragging={!!draggedAppointment}
                      onDragEnd={handleDragEnd}
                    />
                  ))}

                  {/* Current Time Tracker Line - shows in all columns, label only on first */}
                  <CurrentTimeTrackerLine selectedDate={selectedDate} showLabel={index === 0} />
                </div>
              </StaffColumnDropZone>
            );
          })}
        </div>
      </div>
    </div>

    </div>
  );
};


export default ScheduleGrid;