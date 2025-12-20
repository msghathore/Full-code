import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Employee {
  id: string;
  name: string;
  initials?: string;
  image?: string;
  avatar?: string;
}

interface Resource {
  id: string;
  name: string;
}

// Helper to get initials from name
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const resources: Resource[] = [
  { id: '1', name: 'Room 1' },
  { id: '2', name: 'Room 2' },
  { id: '3', name: 'Room 3' },
  { id: '4', name: 'Room 4' },
  { id: '5', name: 'Room 5' },
];

interface MiniCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ currentDate, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const handleDateClick = (day: number | null) => {
    if (day !== null) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(newDate);
      onDateChange(newDate);
    }
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day: number | null) => {
    if (day === null) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (day === null) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-semibold text-gray-900">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            disabled={day === null}
            className={`
              text-xs p-1 h-8 w-8 rounded-md transition-colors
              ${day === null ? '' : 'hover:bg-gray-100'}
              ${isSelected(day) ? 'bg-blue-500 text-white' : ''}
              ${!isSelected(day) && isToday(day) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
              ${!isSelected(day) && !isToday(day) ? 'text-gray-700' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Selected Date Display */}
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-600">
          Selected: {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
};

interface ScheduleSidebarProps {
  // Staff/employees data - passed from parent (fetched from database)
  employees?: Employee[];
  // Add props for filtering callbacks
  selectedEmployees?: string[];
  selectedResources?: string[];
  onEmployeeToggle?: (employeeId: string, isSelected: boolean) => void;
  onResourceToggle?: (resourceId: string, isSelected: boolean) => void;
  onDateChange?: (date: Date) => void;
}

const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({
  employees = [],
  selectedEmployees = [],
  selectedResources = [],
  onEmployeeToggle,
  onResourceToggle,
  onDateChange
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fully controlled component - use props directly, no local state for selections
  const handleEmployeeToggle = (employeeId: string) => {
    if (onEmployeeToggle) {
      const isCurrentlySelected = selectedEmployees.includes(employeeId);
      onEmployeeToggle(employeeId, !isCurrentlySelected);
    }
  };

  const handleResourceToggle = (resourceId: string) => {
    if (onResourceToggle) {
      const isCurrentlySelected = selectedResources.includes(resourceId);
      onResourceToggle(resourceId, !isCurrentlySelected);
    }
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  return (
    <div className="h-full bg-gray-50 p-4 space-y-6 overflow-y-auto">
      {/* Mini Calendar */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
        <MiniCalendar 
          currentDate={currentDate} 
          onDateChange={handleDateChange} 
        />
      </div>

      {/* Employee Filtering */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees</h3>
        <div className="space-y-3">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center space-x-3">
              <Checkbox
                id={`employee-${employee.id}`}
                checked={selectedEmployees.includes(employee.id)}
                onCheckedChange={() => handleEmployeeToggle(employee.id)}
              />
              <div className="flex items-center space-x-2 flex-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={employee.image || employee.avatar || '/images/client-1.jpg'}
                    alt={employee.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                    {employee.initials || getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor={`employee-${employee.id}`}
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  {employee.name}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Filtering */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center space-x-3">
              <Checkbox
                id={`resource-${resource.id}`}
                checked={selectedResources.includes(resource.id)}
                onCheckedChange={() => handleResourceToggle(resource.id)}
              />
              <label
                htmlFor={`resource-${resource.id}`}
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                {resource.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            onClick={() => {
              // Handle Checked In action
              console.log('Checked In clicked');
            }}
          >
            Checked In
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            onClick={() => {
              // Handle In Today action
              console.log('In Today clicked');
            }}
          >
            <span>In Today</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSidebar;