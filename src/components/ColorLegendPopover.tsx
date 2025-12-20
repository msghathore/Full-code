import React from 'react';
import { Palette } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { STATUS_COLORS } from '@/lib/colorConstants';

// Status labels for display
const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  confirmed: 'Confirmed',
  no_show: 'No Show',
  ready_to_start: 'Ready to Start',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  pending: 'Pending',
  personal_task: 'Personal Task',
};

const ColorLegendPopover: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Legend</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-0 border border-gray-200"
        align="end"
        sideOffset={8}
        style={{ zIndex: 9999 }}
      >
        <div className="bg-white text-gray-900 rounded-lg shadow-xl">
          <div className="px-3 py-2 border-b border-gray-200">
            <h4 className="font-semibold text-xs text-gray-600">
              Status Colors
            </h4>
          </div>
          <div className="py-1">
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-100">
                <div
                  className={`w-4 h-4 rounded-sm ${colors.bgClass} flex-shrink-0`}
                />
                <span className="text-sm text-gray-800">
                  {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorLegendPopover;
