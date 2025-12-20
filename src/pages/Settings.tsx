import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  ZoomIn, 
  ZoomOut, 
  Type, 
  Bell, 
  BellOff,
  Calendar,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
  const { toast } = useToast();
  
  // Settings state
  const [calendarResolution, setCalendarResolution] = useState(15); // 5, 10, or 15 minutes
  const [fontSize, setFontSize] = useState(14); // 12, 14, 16, 18
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const resolutionOptions = [
    { value: 5, label: '5 minutes', description: 'Very detailed view' },
    { value: 10, label: '10 minutes', description: 'Balanced view' },
    { value: 15, label: '15 minutes', description: 'Compact view' },
  ];

  const fontSizeOptions = [
    { value: 12, label: '12px', description: 'Small' },
    { value: 14, label: '14px', description: 'Medium' },
    { value: 16, label: '16px', description: 'Large' },
    { value: 18, label: '18px', description: 'Extra Large' },
  ];

  const handleSaveSettings = (event?: React.MouseEvent) => {
    // Prevent any default form submission or navigation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      // Save to localStorage or backend
      localStorage.setItem('zavira-settings', JSON.stringify({
        calendarResolution,
        fontSize,
        notificationsEnabled,
        compactMode,
        autoRefresh
      }));

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetSettings = (event?: React.MouseEvent) => {
    // Prevent any default form submission or navigation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      setCalendarResolution(15);
      setFontSize(14);
      setNotificationsEnabled(true);
      setCompactMode(true);
      setAutoRefresh(true);

      // Clear stored settings
      localStorage.removeItem('zavira-settings');

      toast({
        title: "Settings Reset",
        description: "All settings have been reset to defaults.",
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const selectedResolution = resolutionOptions.find(opt => opt.value === calendarResolution);
  const selectedFontSize = fontSizeOptions.find(opt => opt.value === fontSize);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Customize your Zavira experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Display Settings */}
        <Card className="bg-white text-black border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Calendar className="h-5 w-5" />
              Calendar Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resolution/Density Setting */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-black">Calendar Resolution</Label>
              <div className="space-y-2">
                <Select
                  value={calendarResolution.toString()}
                  onValueChange={(value) => setCalendarResolution(parseInt(value))}
                >
                  <SelectTrigger className="bg-white text-black border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {resolutionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="text-black">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-black">{option.label}</span>
                          <span className="text-xs text-gray-500 ml-2">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Current: {selectedResolution?.label} - {selectedResolution?.description}
                </p>
              </div>
            </div>

            {/* Font Size Setting */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-black">Font Size</Label>
              <div className="space-y-2">
                <Select
                  value={fontSize.toString()}
                  onValueChange={(value) => setFontSize(parseInt(value))}
                >
                  <SelectTrigger className="bg-white text-black border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="text-black">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-black">{option.label}</span>
                          <span className="text-xs text-gray-500 ml-2">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Current: {selectedFontSize?.label} - {selectedFontSize?.description}
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-black">Preview</Label>
              <div
                className="p-3 bg-gray-50 rounded border border-gray-200 text-center"
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="text-xs text-gray-500 mb-1">Sample Appointment</div>
                <div className="font-medium text-black">Sarah Johnson - Hair Cut</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white text-black border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              Notifications & Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-black">Enable Notifications</Label>
                <p className="text-xs text-gray-500">Receive alerts for appointments and updates</p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Auto Refresh */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-black">Auto Refresh</Label>
                <p className="text-xs text-gray-500">Automatically update the schedule view</p>
              </div>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-black">Compact Mode</Label>
                <p className="text-xs text-gray-500">Reduce spacing for more information density</p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            {/* Notification Types */}
            {notificationsEnabled && (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium text-black">Notification Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">New Appointments</span>
                    <Badge variant="outline" className="text-xs border-green-500 text-green-600 bg-green-50">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Cancelled Appointments</span>
                    <Badge variant="outline" className="text-xs border-green-500 text-green-600 bg-green-50">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Staff Check-ins</span>
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">Disabled</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card className="bg-white text-black border border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Performance & Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* View Density */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-black">View Density</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={calendarResolution === 5 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarResolution(5)}
                  className={calendarResolution === 5 ? "text-xs bg-blue-600 text-white" : "text-xs border-gray-300 text-black hover:bg-gray-100"}
                >
                  <ZoomIn className="h-3 w-3 mr-1" />
                  Detailed
                </Button>
                <Button
                  variant={calendarResolution === 10 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarResolution(10)}
                  className={calendarResolution === 10 ? "text-xs bg-blue-600 text-white" : "text-xs border-gray-300 text-black hover:bg-gray-100"}
                >
                  Balanced
                </Button>
                <Button
                  variant={calendarResolution === 15 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarResolution(15)}
                  className={calendarResolution === 15 ? "text-xs bg-blue-600 text-white" : "text-xs border-gray-300 text-black hover:bg-gray-100"}
                >
                  <ZoomOut className="h-3 w-3 mr-1" />
                  Compact
                </Button>
              </div>
            </div>

            {/* Font Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-black">Text Size Preview</Label>
              <div className="space-y-2">
                <div
                  className="text-black p-2 bg-gray-50 rounded border border-gray-200"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <Type className="h-4 w-4 inline mr-2" />
                  This is how your text will appear with {selectedFontSize?.label} font size
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="bg-white text-black border border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current Version:</span>
                <div className="font-medium text-black">v2.1.0</div>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <div className="font-medium text-black">Nov 22, 2025</div>
              </div>
              <div>
                <span className="text-gray-500">Resolution:</span>
                <div className="font-medium text-black">{calendarResolution} min slots</div>
              </div>
              <div>
                <span className="text-gray-500">Font Size:</span>
                <div className="font-medium text-black">{fontSize}px</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-300 text-black hover:bg-gray-100"
                onClick={() => toast({
                  title: "System Check",
                  description: "All systems operational",
                })}
              >
                Run System Check
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleResetSettings}
          className="flex items-center gap-2 border-gray-300 text-black hover:bg-gray-100"
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          type="button"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
      </div>
    </div>
  );
};

export default Settings;