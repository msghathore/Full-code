import React from 'react';
import { format, isValid } from 'date-fns';
import { 
  User, 
  Clock, 
  DollarSign, 
  MessageCircle, 
  Repeat, 
  CreditCard,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  is_recurring?: boolean;
  payment_status?: 'paid' | 'pending' | 'refunded';
  staff_id: string;
  staff_name?: string;
  client_phone?: string;
  client_email?: string;
  color?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  staffColor: string;
  onEdit?: (appointment: Appointment) => void;
  onView?: (appointment: Appointment) => void;
  onCheckIn?: (appointment: Appointment) => void;
  className?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  staffColor,
  onEdit,
  onView,
  onCheckIn,
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentIcon = (status?: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'refunded':
        return <CreditCard className="h-3 w-3 text-gray-600" />;
      default:
        return null;
    }
  };

  // Parse time strings
  const startTime = new Date(`2000-01-01T${appointment.start_time}`);
  const endTime = new Date(`2000-01-01T${appointment.end_time}`);
  
  const formatTime = (date: Date) => {
    if (!isValid(date)) return '00:00';
    return format(date, 'HH:mm');
  };

  const cardColor = appointment.color || staffColor;

  return (
    <Card
      className={`
        group relative cursor-pointer transition-all duration-200 hover:shadow-md
        border-l-4 bg-white
        ${className}
      `}
      style={{
        borderLeftColor: cardColor,
        minHeight: '60px',
        paddingLeft: 'var(--card-pad-x, 14px)',
        paddingRight: 'var(--card-pad-x, 14px)',
        paddingTop: 'var(--card-pad-y, 12px)',
        paddingBottom: 'var(--card-pad-y, 12px)',
        borderRadius: 'var(--card-radius, 12px)',
        boxShadow: 'var(--shadow, 0 6px 18px rgba(10,10,10,0.06))',
      }}
      onClick={() => onView?.(appointment)}
    >
      <CardContent className="p-0">
        {/* Quick Actions (visible on hover) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView?.(appointment); }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(appointment); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Appointment
              </DropdownMenuItem>
              {appointment.status === 'confirmed' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCheckIn?.(appointment); }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client Name */}
        <div className="pr-8">
          <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
            {appointment.client_name}
          </h4>
          
          {/* Service Name */}
          <p className="text-xs text-gray-600 mb-2 leading-tight">
            {appointment.service_name}
          </p>
          
          {/* Metadata Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatTime(startTime)}</span>
              {appointment.is_recurring && (
                <Repeat className="h-3 w-3 text-blue-500" />
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {appointment.notes && (
                <MessageCircle className="h-3 w-3 text-gray-400" />
              )}
              {getPaymentIcon(appointment.payment_status)}
            </div>
          </div>
          
          {/* Price (if applicable) */}
          {appointment.price > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="h-3 w-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-700">
                ${appointment.price.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="absolute bottom-1 left-1">
          <Badge 
            variant="secondary" 
            className={`text-xs ${getStatusColor(appointment.status)}`}
          >
            {appointment.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        {/* Staff Name (if multiple staff visible) */}
        {appointment.staff_name && (
          <div className="absolute bottom-1 right-1">
            <div className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: staffColor }}
              />
              <span className="text-xs text-gray-500">
                {appointment.staff_name.split(' ')[0]}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;