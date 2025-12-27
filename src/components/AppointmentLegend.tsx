import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Palette,
  Repeat,
  X,
  Home,
  FileText,
  Clipboard,
  DollarSign,
  Users,
  Facebook,
  Instagram,
  MessageSquare,
  CreditCard,
  Package,
  DollarSign as DepositIcon,
  UserPlus,
  RotateCcw,
  RotateCcw as RotateCw,
  CheckCircle,
  UserCheck,
  PlayCircle,
  XCircle,
  CalendarX,
  Clock
} from 'lucide-react';
import { STATUS_COLORS } from '@/lib/colorConstants';

// Attribute icons mapping - comprehensive list as requested
const ATTRIBUTE_ICONS = {
  'recurring': { icon: Repeat, label: 'Recurring Appointment', color: 'text-black' },
  'stopped_recurring': { icon: X, label: 'Stopped Recurring', color: 'text-red-600' },
  'bundle': { icon: Users, label: 'Bundle', color: 'text-black' },
  'house_call': { icon: Home, label: 'House Call', color: 'text-green-600' },
  'note': { icon: FileText, label: 'Note', color: 'text-yellow-600' },
  'popup_note': { icon: MessageSquare, label: 'Popup Note', color: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' },
  'form_required': { icon: Clipboard, label: 'Form Required', color: 'text-emerald-600' },
  'prepaid': { icon: DollarSign, label: 'Pre-paid Appointment', color: 'text-emerald-700' },
  'show_checked_in': { icon: CheckCircle, label: 'Show - Checked In', color: 'text-emerald-500' },
  'online_booking_blocked': { icon: XCircle, label: 'Online Booking Blocked', color: 'text-red-500' },
  'booked_instagram': { icon: Instagram, label: 'Booked on Instagram', color: 'text-slate-600' },
  'booked_facebook': { icon: Facebook, label: 'Booked on Facebook', color: 'text-slate-700' },
  'booked_yelp': { icon: MessageSquare, label: 'Booked on Yelp', color: 'text-red-600' },
  'membership': { icon: CreditCard, label: 'Membership', color: 'text-emerald-500' },
  'package': { icon: Package, label: 'Package', color: 'text-slate-900' },
  'deposit_paid': { icon: DepositIcon, label: 'Deposit Paid', color: 'text-green-600' },
  'new_request': { icon: UserPlus, label: 'New Request (NR)', color: 'text-slate-900' },
  'return_request': { icon: RotateCcw, label: 'Return Request (RR)', color: 'text-green-500' },
  'return_non_request': { icon: RotateCw, label: 'Return Non Request (RNR)', color: 'text-yellow-500' },
  'new_non_request': { icon: UserCheck, label: 'New Non Request (NNR)', color: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' }
};

interface AppointmentLegendProps {
  isLegendOpen?: boolean;
  setIsLegendOpen?: (open: boolean) => void;
}

const AppointmentLegend: React.FC<AppointmentLegendProps> = ({
  isLegendOpen,
  setIsLegendOpen
}) => {
  const handleOpenChange = (open: boolean) => {
    setIsLegendOpen?.(open);
  };

  return (
    <Popover open={isLegendOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Palette className="h-4 w-4 mr-1" />
          Legend
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-50 border-4 border-transparent rounded-2xl shadow-2xl"
                     style={{
                       backgroundImage: `linear-gradient(white, white), linear-gradient(45deg, #ff6b6b, #feca57, #7c3aed, #ff9ff3, #a78bfa, #5f27cd)`,
                       backgroundOrigin: 'border-box',
                       backgroundClip: 'content-box, border-box',
                       boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(255, 107, 107, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                     }}>
        <div className="p-4">
          {/* Header */}
          <div className="text-center border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointment Status & Attributes Legend
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Click outside or press Escape to close
            </p>
          </div>

          {/* TWO-COLUMN LAYOUT - ATTRIBUTES and STATUS COLORS */}
          <div className="grid grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: ATTRIBUTES */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                ATTRIBUTES
              </h4>
              <div className="space-y-1">
                {Object.entries(ATTRIBUTE_ICONS).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <div key={key} className="flex items-center gap-2 py-0.5">
                      <div className="flex items-center gap-2 flex-shrink-0 w-32">
                        <IconComponent
                          size={20}
                          className={config.color}
                        />
                        <span className="text-xs text-gray-700 font-medium truncate">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: STATUS COLORS */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                STATUS COLORS
              </h4>
              <div className="space-y-1">
                {Object.entries(STATUS_COLORS).map(([status, config]) => (
                  <div key={status} className="flex items-center gap-2 py-0.5">
                    {/* Color swatch */}
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 border-2 border-gray-400 ${config.bgClass}`}
                    />
                    <span className="text-xs text-gray-700 font-medium">
                      {config.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-gray-100 pt-3 mt-4">
            <p className="text-xs text-gray-500 text-center">
              Appointment pills are sized proportionally to service duration
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppointmentLegend;