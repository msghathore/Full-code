import React from 'react';
import { format } from 'date-fns';
import DroppableTimeSlot from '@/components/DroppableTimeSlot';
import { formatTime } from '@/pages/StaffSchedulingSystem';
import type { StaffMember, Appointment } from '@/pages/StaffSchedulingSystem';

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
          {/* Staff Header Row - COMPRESSED for maximum density */}
          <div className="flex border-b border-gray-100 mb-2 relative z-10">
            <div className="w-12 flex-shrink-0 border-r-2 border-gray-200">
              <div className="p-1.5 font-medium text-gray-600 text-xs">Time</div>
            </div>
            {filteredStaff.map(staffMember => {
              return (
                <div key={staffMember.id} className="flex-1 min-w-[160px] max-w-[180px] border-l border-gray-100 p-2 relative">
                  <div className="text-center">
                    <div className="text-xs font-medium text-black flex items-center justify-center">
                      <span>{staffMember.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots as Rows - COMPRESSED for maximum density */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <div
              key={timeIndex}
              className="flex border-b border-gray-200 min-h-[30px] relative"
            >
              {/* Horizontal lines to divide 15-min intervals - COMPRESSED */}
              <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 opacity-70"></div>
              
              {/* Time Display - COMPRESSED */}
              <div className="w-12 flex-shrink-0 p-1 border-r border-gray-200 bg-gray-50 relative z-10">
                <div className="text-xs font-medium text-gray-600">
                  {timeSlot.minute === 0 ? formatTime(timeSlot.time) : ''}
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
                      <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
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