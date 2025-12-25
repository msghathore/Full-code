import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { addDays, format } from 'date-fns';
import type { StaffMember } from '@/pages/StaffSchedulingSystem';

interface StaffSchedulingHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onStaffToggle: (staffId: string) => void;
  selectedStaff: string[];
  showHelp: boolean;
  onShowHelp: (show: boolean) => void;
  staff: StaffMember[];
  filteredStaff: StaffMember[];
}

const StaffSchedulingHeader: React.FC<StaffSchedulingHeaderProps> = ({
  selectedDate,
  onDateChange,
  onStaffToggle,
  selectedStaff,
  showHelp,
  onShowHelp,
  staff,
  filteredStaff,
}) => {
  const navigateDate = (direction: 'prev' | 'next') => {
    const days = 1; // Day view
    const newDate = direction === 'prev'
      ? addDays(selectedDate, -days)
      : addDays(selectedDate, days);
    onDateChange(newDate);
  };

  return (
    <div className="bg-white px-4 py-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Date Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-lg font-semibold text-black min-w-[200px] text-center">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="text-black border-gray-300"
          >
            Today
          </Button>
        </div>

        {/* Staff Filters and Help */}
        <div className="flex items-center gap-4">
          {/* Staff Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Staff:</span>
            <div className="flex items-center gap-2 max-w-xs">
              {filteredStaff.slice(0, 3).map(member => (
                <button
                  key={member.id}
                  onClick={() => onStaffToggle(member.id)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    selectedStaff.includes(member.id)
                      ? 'bg-slate-50 text-slate-800 border-slate-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {member.name.split(' ')[0]}
                </button>
              ))}
              {filteredStaff.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{filteredStaff.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Help Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowHelp(!showHelp)}
            className="text-black border-gray-300"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffSchedulingHeader;