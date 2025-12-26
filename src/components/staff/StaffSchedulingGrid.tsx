import React, { useState, useEffect, useRef } from 'react';
import { format, isToday } from 'date-fns';
import DroppableTimeSlot from '@/components/DroppableTimeSlot';
import { formatTime } from '@/pages/StaffSchedulingSystem';
import type { StaffMember, Appointment } from '@/pages/StaffSchedulingSystem';
import { GRID_CONSTANTS } from '@/lib/gridConstants';

// Helper to get current time in Winnipeg timezone
const getWinnipegTime = (): Date => {
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

// Current Time Tracker Line Component
const CurrentTimeTracker: React.FC<{
  timeSlots: { time: string; hour: number; minute: number }[];
  selectedDate: Date;
}> = ({ timeSlots, selectedDate }) => {
  const [currentTime, setCurrentTime] = useState(getWinnipegTime());
  const lineRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    setCurrentTime(getWinnipegTime());

    const interval = setInterval(() => {
      setCurrentTime(getWinnipegTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current time on mount and when date changes
  useEffect(() => {
    if (isToday(selectedDate) && lineRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        lineRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, [selectedDate]);

  // Only show the line if viewing today's schedule
  if (!isToday(selectedDate)) {
    return null;
  }

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // Find the position of the current time within the time slots
  // Use grid constants for consistent sizing
  const SLOT_HEIGHT_PX = GRID_CONSTANTS.SLOT_HEIGHT_PX;
  const MINUTES_PER_SLOT = GRID_CONSTANTS.MINUTES_PER_SLOT;

  // Find the first time slot to calculate offset
  const firstSlot = timeSlots[0];
  if (!firstSlot) return null;

  const startHour = firstSlot.hour;
  const startMinute = firstSlot.minute;

  // Calculate minutes from start of calendar to current time
  const calendarStartMinutes = startHour * 60 + startMinute;
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const minutesFromStart = currentTotalMinutes - calendarStartMinutes;

  // Calculate pixel position
  const topPosition = (minutesFromStart / MINUTES_PER_SLOT) * SLOT_HEIGHT_PX;

  // Don't show if current time is outside the calendar range
  if (topPosition < 0 || minutesFromStart > (timeSlots.length * MINUTES_PER_SLOT)) {
    return null;
  }

  const formattedTime = format(currentTime, 'h:mm a');

  return (
    <div
      ref={lineRef}
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top: `${topPosition + GRID_CONSTANTS.HEADER_HEIGHT_PX}px`, zIndex: 100 }}
    >
      {/* Time label with Winnipeg timezone */}
      <div className="absolute -left-1 -top-3 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap" style={{ zIndex: 101 }}>
        {formattedTime} CST
      </div>
      {/* Yellow line - more visible */}
      <div className="h-[3px] bg-yellow-500 shadow-lg" style={{ boxShadow: '0 0 10px rgba(234, 179, 8, 0.8)' }} />
      {/* Triangle indicator on left */}
      <div
        className="absolute -left-0 -top-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-yellow-500"
      />
    </div>
  );
};

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  display: string;
}

interface StaffSchedulingGridProps {
  filteredStaff: StaffMember[];
  selectedDate: Date;
  timeSlots: TimeSlot[];
  getAppointmentsForSlot: (staffId: string, date: Date, time: string) => Appointment[];
  selectedSlot: { staffId: string; time: string } | null;
  hoveredSlot: { staffId: string; time: string } | null;
  handleAppointmentDrop: (appointmentId: string, newTime: string, newStaffId: string, newDate: string) => void;
  handleSlotHover: (staffId: string, time: string) => void;
  handleSlotLeave: () => void;
  handleEmptySlotClick: (staffId: string, time: string, staffMember: StaffMember, event: React.MouseEvent) => void;
  setSelectedSlot: (slot: { staffId: string; time: string } | null) => void;
  setContextMenu: (menu: any) => void;
  showSlotPopover: boolean;
  selectedBookingSlot: { staffId: string; staffMember: StaffMember; time: string } | null;
  slotPopoverPosition: { x: number; y: number; position: string; cellCenterY: number } | null;
  handleSlotActionClick: (action: string) => void;
  closeSlotPopover: () => void;
  ARROW_HALF_SIZE: number;
  POPOVER_WIDTH: number;
  POPOVER_HEIGHT: number;
  GAP: number;
}

const StaffSchedulingGrid: React.FC<StaffSchedulingGridProps> = ({
  filteredStaff,
  selectedDate,
  timeSlots,
  getAppointmentsForSlot,
  selectedSlot,
  hoveredSlot,
  handleAppointmentDrop,
  handleSlotHover,
  handleSlotLeave,
  handleEmptySlotClick,
  setSelectedSlot,
  setContextMenu,
  showSlotPopover,
  selectedBookingSlot,
  slotPopoverPosition,
  handleSlotActionClick,
  closeSlotPopover,
  ARROW_HALF_SIZE,
  POPOVER_WIDTH,
  POPOVER_HEIGHT,
  GAP,
}) => {
  return (
    <div className="bg-white">
      <div className="px-4 py-6">
        <div className="overflow-auto relative">
          {/* Staff Header Row - Sticky for visibility when scrolling */}
          <div className="flex border-b border-gray-100 mb-2 relative sticky top-0 bg-white" style={{ zIndex: 50 }}>
            <div className="w-12 flex-shrink-0 border-r-2 border-gray-200 bg-gray-50">
              <div className="p-1.5 font-medium text-gray-600 text-xs">Time</div>
            </div>
            {filteredStaff.map(staffMember => {
              // Extract first name only
              const firstName = staffMember.name.split(' ')[0];
              return (
                <div key={staffMember.id} className="flex-1 min-w-[160px] max-w-[180px] border-l border-gray-100 p-2 relative bg-white">
                  <div className="flex items-center justify-center h-full">
                    <span className="text-sm font-semibold text-black text-center whitespace-nowrap">
                      {firstName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Time Tracker Line - Shows yellow line at current time */}
          <CurrentTimeTracker timeSlots={timeSlots} selectedDate={selectedDate} />

          {/* Time Slots as Rows - COMPRESSED for maximum density */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <div
              key={timeIndex}
              className="flex border-b border-gray-200 relative"
              style={{ minHeight: `${GRID_CONSTANTS.SLOT_HEIGHT_PX}px` }}
            >
              {/* Horizontal lines to divide 15-min intervals - COMPRESSED */}
              <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 opacity-70"></div>
              
              {/* Time Display - COMPRESSED */}
              <div className="w-12 flex-shrink-0 p-1 border-r border-gray-200 bg-gray-50 relative z-10">
                <div className="text-xs font-medium text-gray-600">
                  {formatTime(timeSlot.time)}
                </div>
              </div>

              {/* Staff Columns for this time slot */}
              {filteredStaff.map(staffMember => {
                const slotAppointments = getAppointmentsForSlot(
                  staffMember.id,
                  selectedDate,
                  timeSlot.time
                );
                
                return (
                  <DroppableTimeSlot
                    key={`${staffMember.id}-${timeIndex}`}
                    staffMember={staffMember}
                    timeSlot={timeSlot}
                    timeIndex={timeIndex}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    hoveredSlot={hoveredSlot}
                    slotAppointments={slotAppointments}
                    filteredStaff={filteredStaff}
                    handleAppointmentDrop={handleAppointmentDrop}
                    handleSlotHover={handleSlotHover}
                    handleSlotLeave={handleSlotLeave}
                    handleEmptySlotClick={handleEmptySlotClick}
                    setSelectedSlot={setSelectedSlot}
                    setContextMenu={setContextMenu}
                  />
                );
              })}
            </div>
          ))}
          
          {/* Slot Action Popover - moved outside individual time slot components */}
          {showSlotPopover && selectedSlot && (() => {
            // Find the current selected staff member and time slot for the popover
            const selectedStaffMember = filteredStaff.find(s => s.id === selectedSlot.staffId);
            const selectedTimeSlot = timeSlots.find(ts => ts.time === selectedSlot.time);
            
            if (!selectedStaffMember || !selectedTimeSlot) return null;
            
            return (
              <div
                data-slot-popover
                className="absolute z-50 w-80 p-0 bg-white border border-gray-200 shadow-xl rounded-lg"
                style={{
                  position: 'fixed',
                  left: slotPopoverPosition?.x ? `${slotPopoverPosition.x}px` : 'auto',
                  top: slotPopoverPosition?.y ? `${slotPopoverPosition.y}px` : 'auto',
                  zIndex: 1000
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Speech bubble arrow - positioned to point to exact cell center */}
                {slotPopoverPosition?.position === 'right' && slotPopoverPosition.cellCenterY !== undefined ? (
                  // Arrow on left side pointing to the clicked cell
                  <div
                    className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 -left-1"
                    style={{
                      top: `${ARROW_HALF_SIZE}px`, // Arrow center is at 6px from popover top edge
                      transform: 'rotate(45deg)',
                      boxShadow: '-1px 1px 0 0 #d1d5db'
                    }}
                  />
                ) : slotPopoverPosition?.position === 'left' && slotPopoverPosition.cellCenterY !== undefined ? (
                  // Arrow on right side pointing to the clicked cell
                  <div
                    className="absolute w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45 -right-1"
                    style={{
                      top: `${ARROW_HALF_SIZE}px`, // Arrow center is at 6px from popover top edge
                      transform: 'rotate(45deg)',
                      boxShadow: '1px -1px 0 0 #d1d5db'
                    }}
                  />
                ) : null}
                
                <div className="p-1 relative">
                  {/* Header with slot info */}
                  <div className="text-xs text-gray-600 mb-2 px-2 py-1 bg-gray-50 rounded-t-lg">
                    {selectedBookingSlot?.staffMember?.name} • {formatTime(selectedBookingSlot?.time || '')}
                  </div>
                  
                  {/* Menu options */}
                  <div className="space-y-1">
                    {/* Option 1: New Appointment */}
                    <button
                      onClick={() => handleSlotActionClick('new-appointment')}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">+</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">New Appointment</div>
                        <div className="text-xs text-gray-500">Create a new appointment</div>
                      </div>
                    </button>

                    {/* Option 2: Add to Waitlist */}
                    <button
                      onClick={() => handleSlotActionClick('add-waitlist')}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">⏰</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">Add to Waitlist</div>
                        <div className="text-xs text-gray-500">Add a customer to the waitlist</div>
                      </div>
                    </button>

                    {/* Option 3: Personal Task */}
                    <button
                      onClick={() => handleSlotActionClick('personal-task')}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">📋</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-black">Personal Task</div>
                        <div className="text-xs text-gray-500">Add a personal task</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default StaffSchedulingGrid;