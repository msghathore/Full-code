import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, Timer, CalendarX, Settings } from 'lucide-react';

interface SlotActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number; position: string; cellCenterY: number };
  selectedSlot: { staffId: string; time: string; staffMember: any };
  selectedDate: Date;
  onAction: (action: string) => void;
}

export const SlotActionMenu: React.FC<SlotActionMenuProps> = ({
  isOpen,
  onClose,
  position,
  selectedSlot,
  selectedDate,
  onAction
}) => {
  const arrowHalfSize = 6; // Half of 12px arrow size

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        {/* This trigger won't be visible, but needed for Popover to work */}
        <div style={{ display: 'none' }} />
      </PopoverTrigger>
      <PopoverContent
        data-slot-popover
        className="w-80 p-0 bg-white border border-gray-200 shadow-xl rounded-lg"
        style={{
          position: 'fixed',
          left: position.x ? `${position.x}px` : 'auto',
          top: position.y ? `${position.y}px` : 'auto',
          zIndex: 1000
        }}
      >
        {/* Speech bubble arrow - positioned to point to exact cell center */}
        {position.position === 'right' && position.cellCenterY !== undefined ? (
          // Arrow on left side pointing to the clicked cell
          <div
            className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45 -left-1"
            style={{
              top: `${arrowHalfSize}px`,
              transform: 'rotate(45deg)',
              boxShadow: '-1px 1px 0 0 #d1d5db'
            }}
          />
        ) : position.position === 'left' && position.cellCenterY !== undefined ? (
          // Arrow on right side pointing to the clicked cell
          <div
            className="absolute w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45 -right-1"
            style={{
              top: `${arrowHalfSize}px`,
              transform: 'rotate(45deg)',
              boxShadow: '1px -1px 0 0 #d1d5db'
            }}
          />
        ) : null}
        
        <div className="p-1 relative">
          {/* Header with slot info */}
          <div className="text-xs text-gray-600 mb-2 px-2 py-1 bg-gray-50 rounded-t-lg">
            {selectedSlot.staffMember?.name} • {formatTime(selectedSlot.time)}
          </div>
          
          {/* Menu options */}
          <div className="space-y-1">
            {/* Option 1: New Appointment */}
            <button
              onClick={() => {
                onAction('new-appointment');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                <Calendar className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-black">New Appointment</div>
                <div className="text-xs text-gray-500">Create a new appointment</div>
              </div>
            </button>

            {/* Option 2: New Multiple Appointments */}
            <button
              onClick={() => {
                onAction('new-multiple-appointments');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-black">New Multiple Appointments</div>
                <div className="text-xs text-gray-500">Create recurring appointments</div>
              </div>
            </button>

            {/* Option 3: Add to Waitlist */}
            <button
              onClick={() => {
                onAction('add-waitlist');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                <Timer className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-black">Add to Waitlist</div>
                <div className="text-xs text-gray-500">Add customer to waitlist</div>
              </div>
            </button>

            {/* Option 4: Personal Task */}
            <button
              onClick={() => {
                onAction('personal-task');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                <CalendarX className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-black">Personal Task</div>
                <div className="text-xs text-gray-500">Block time for personal task</div>
              </div>
            </button>

            {/* Option 5: Edit Working Hours */}
            <button
              onClick={() => {
                onAction('edit-working-hours');
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors text-left border-b border-gray-100 last:border-b-0"
            >
              <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center flex-shrink-0">
                <Settings className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-black">Edit Working Hours</div>
                <div className="text-xs text-gray-500">Update calendar working hours</div>
              </div>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Helper function to format time
const formatTime = (timeString: string) => {
  const [hour, minute] = timeString.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};