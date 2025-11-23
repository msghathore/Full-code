import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Calendar as CalendarIcon,
  MapPin,
  CheckCircle2,
  Circle,
  ArrowRight
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  color: string;
}

interface Resource {
  id: string;
  name: string;
  type: string;
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
  const { toast } = useToast();

  // Mock resources data
  const resources: Resource[] = [
    { id: 'room-1', name: 'Room 1', type: 'Treatment Room', color: '#f87171' },
    { id: 'room-2', name: 'Room 2', type: 'Treatment Room', color: '#60a5fa' },
    { id: 'room-3', name: 'Room 3', type: 'Treatment Room', color: '#c084fc' },
    { id: 'room-4', name: 'Room 4', type: 'Consultation Room', color: '#34d399' },
    { id: 'room-5', name: 'Room 5', type: 'Treatment Room', color: '#fbbf24' },
  ];

  const [selectedResources, setSelectedResources] = useState<string[]>(['room-1', 'room-2', 'room-3']);
  const [checkedInCount, setCheckedInCount] = useState(3);
  const [inTodayCount, setInTodayCount] = useState(8);

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

  const isTodayDate = (date: Date) => isToday(date);

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const handleCheckedIn = () => {
    toast({
      title: "Checked In",
      description: "Daily check-in completed successfully",
    });
    setCheckedInCount(prev => prev + 1);
  };

  const handleInToday = () => {
    toast({
      title: "In Today Filter",
      description: "Showing today's appointments",
    });
  };

  return (
    <div className={`w-72 bg-white border-r border-gray-200 flex flex-col h-screen shadow-sm ${className}`}>
      {/* Mini Calendar Section */}
      <Card className="m-4 mb-3 shadow-sm border-0 bg-gray-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0 hover:bg-gray-200"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0 hover:bg-gray-200"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
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
                  h-8 w-8 p-0 text-sm rounded-md transition-all
                  ${!isCurrentMonth(date) ? 'text-gray-300' : ''}
                  ${isTodayDate(date) ? 'bg-blue-600 text-white font-semibold' : ''}
                  ${isSelected(date) && !isTodayDate(date) ? 'bg-blue-100 text-blue-800 font-semibold border-2 border-blue-300' : ''}
                  ${!isCurrentMonth(date) || isTodayDate(date) ? '' : 'hover:bg-gray-200'}
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
              className="flex-1 text-xs border-gray-300"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(addDays(selectedDate, 1))}
              className="flex-1 text-xs border-gray-300"
            >
              +1 Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(addWeeks(selectedDate, 1))}
              className="flex-1 text-xs border-gray-300"
            >
              +1 Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Filter Section */}
      <Card className="mx-4 mb-3 shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5" />
            Employees
          </CardTitle>
          <p className="text-xs text-gray-500">Select staff to display in schedule</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`staff-${member.id}`}
                  checked={selectedStaff.includes(member.id)}
                  onCheckedChange={() => onStaffToggle(member.id)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || '/images/client-1.jpg'} alt={member.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`staff-${member.id}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer truncate block"
                      >
                        {member.name}
                      </label>
                      <p className="text-xs text-gray-500 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources Filter Section */}
      <Card className="mx-4 mb-3 shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MapPin className="h-5 w-5" />
            Resources
          </CardTitle>
          <p className="text-xs text-gray-500">Treatment rooms and spaces</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`resource-${resource.id}`}
                  checked={selectedResources.includes(resource.id)}
                  onCheckedChange={() => handleResourceToggle(resource.id)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`resource-${resource.id}`}
                    className="text-sm font-medium text-gray-900 cursor-pointer truncate block"
                  >
                    {resource.name}
                  </label>
                  <p className="text-xs text-gray-500">
                    {resource.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mx-4 mb-4 space-y-2">
        <Button
          onClick={handleCheckedIn}
          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Checked In ({checkedInCount})
        </Button>
        
        <Button
          onClick={handleInToday}
          variant="outline"
          className="w-full h-12 border-red-300 text-red-600 hover:bg-red-50 font-semibold"
        >
          <Circle className="h-5 w-5 mr-2 fill-current" />
          In Today ({inTodayCount})
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Current Status Bar */}
      <div className="mx-4 mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">
            {format(selectedDate, 'MMM d, yyyy')}
          </span>
          {isToday(selectedDate) && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
              Today
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <span>{selectedStaff.length} staff</span>
          <span>{selectedResources.length} resources</span>
        </div>
      </div>
    </div>
  );
};

export default LeftNav;