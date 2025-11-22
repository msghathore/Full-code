import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Users, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  color: string;
}

interface LeftNavProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  staff: StaffMember[];
  selectedStaff: string[];
  onStaffToggle: (staffId: string) => void;
  className?: string;
}

const LeftNav: React.FC<LeftNavProps> = ({
  selectedDate,
  onDateChange,
  staff,
  selectedStaff,
  onStaffToggle,
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  // Generate calendar days for mini calendar
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = startOfWeek(monthStart);
  const endDate = startOfWeek(addDays(monthEnd, 6));

  const calendarDays = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    calendarDays.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' 
        ? new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        : new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  return (
    <div className={`w-72 bg-[var(--panel)] border-r border-gray-200 flex flex-col h-screen ${className}`}>
      {/* Mini Calendar Section */}
      <Card className="m-4 mb-2 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`
                  h-8 w-8 p-0 text-sm rounded-md
                  ${!isCurrentMonth(date) ? 'text-gray-300' : ''}
                  ${isToday(date) ? 'bg-[var(--accent-2)] text-white' : ''}
                  ${isSelected(date) && !isToday(date) ? 'bg-gray-100 font-semibold' : ''}
                  ${!isCurrentMonth(date) || isToday(date) ? '' : 'hover:bg-gray-50'}
                `}
                onClick={() => onDateChange(date)}
              >
                {format(date, 'd')}
              </Button>
            ))}
          </div>

          {/* Quick navigation */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(new Date())}
              className="flex-1 text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(addDays(selectedDate, 1))}
              className="flex-1 text-xs"
            >
              +1 Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(addWeeks(selectedDate, 1))}
              className="flex-1 text-xs"
            >
              +1 Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Filter Section */}
      <Card className="mx-4 mb-4 flex-1 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5" />
            Staff & Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`staff-${member.id}`}
                  checked={selectedStaff.includes(member.id)}
                  onCheckedChange={() => onStaffToggle(member.id)}
                  className="data-[state=checked]:bg-[var(--accent-2)] data-[state=checked]:border-[var(--accent-2)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: member.color }}
                    />
                    <label
                      htmlFor={`staff-${member.id}`}
                      className="text-sm font-medium text-gray-900 cursor-pointer truncate"
                    >
                      {member.name}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 truncate ml-5">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Service Types</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-1)]" />
                <span className="text-gray-600">Hair Services</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-2)]" />
                <span className="text-gray-600">Beauty Treatments</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-3)]" />
                <span className="text-gray-600">Body Work</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Date Display */}
      <div className="mx-4 mb-4 p-3 bg-[var(--bg)] rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {selectedStaff.length} staff selected
        </p>
      </div>
    </div>
  );
};

export default LeftNav;