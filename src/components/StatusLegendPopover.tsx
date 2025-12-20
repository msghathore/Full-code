import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette, RefreshCw, Layers, Car, Home, StickyNote, FileText } from 'lucide-react';
import { LEGEND_CONFIG } from '@/lib/appointmentConfig';

interface StatusLegendPopoverProps {
  className?: string;
}

export const StatusLegendPopover: React.FC<StatusLegendPopoverProps> = ({ className = '' }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`text-gray-500 hover:text-gray-700 ${className}`}
          title="View Status Legend"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-xl rounded-lg">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appointment Status & Attributes Legend
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Visual guide for appointment statuses and attributes
          </p>
        </div>

        {/* Content - Two Column Layout */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Left Column - Icons & Attributes */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Attributes
              </h4>
              <div className="space-y-3">
                {LEGEND_CONFIG.attributeIcons.map(({ attribute, label, icon: IconComponent }) => (
                  <div key={attribute} className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <IconComponent className="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Status Colors */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                Status Colors
              </h4>
              <div className="space-y-3">
                {LEGEND_CONFIG.statusColors.map(({ status, label, color }) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      ></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-900">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-center text-xs text-gray-500 gap-4">
            <span>Calendar appointments display these visual cues</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StatusLegendPopover;