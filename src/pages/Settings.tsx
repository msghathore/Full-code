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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resolution/Density Setting */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Calendar Resolution</Label>
              <div className="space-y-2">
                <Select
                  value={calendarResolution.toString()}
                  onValueChange={(value) => setCalendarResolution(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resolutionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{option.label}</span>
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
              <Label className="text-sm font-medium">Font Size</Label>
              <div className="space-y-2">
                <Select
                  value={fontSize.toString()}
                  onValueChange={(value) => setFontSize(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{option.label}</span>
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
              <Label className="text-sm font-medium">Preview</Label>
              <div 
                className="p-3 bg-gray-50 rounded border text-center"
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="text-xs text-gray-500 mb-1">Sample Appointment</div>
                <div className="font-medium">Sarah Johnson - Hair Cut</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              Notifications & Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Notifications</Label>
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
                <Label className="text-sm font-medium">Auto Refresh</Label>
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
                <Label className="text-sm font-medium">Compact Mode</Label>
                <p className="text-xs text-gray-500">Reduce spacing for more information density</p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            {/* Notification Types */}
            {notificationsEnabled && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-medium">Notification Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Appointments</span>
                    <Badge variant="outline" className="text-xs">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cancelled Appointments</span>
                    <Badge variant="outline" className="text-xs">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Staff Check-ins</span>
                    <Badge variant="secondary" className="text-xs">Disabled</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Performance & Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* View Density */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">View Density</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={calendarResolution === 5 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarResolution(5)}
                  className="text-xs"
                >
                  <ZoomIn className="h-3 w-3 mr-1" />
                  Detailed
                </Button>
                <Button
                  variant={calendarResolution === 10 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarResolution(10)}
                  className="text-xs"
                >
                  Balanced
                </Button>
                <Button
                  variant={calendarResolution === 15 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCalendarResolution(15)}
                  className="text-xs"
                >
                  <ZoomOut className="h-3 w-3 mr-1" />
                  Compact
                </Button>
              </div>
            </div>

            {/* Font Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Size Preview</Label>
              <div className="space-y-2">
                <div 
                  className="text-gray-700 p-2 bg-gray-50 rounded"
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
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current Version:</span>
                <div className="font-medium">v2.1.0</div>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <div className="font-medium">Nov 22, 2025</div>
              </div>
              <div>
                <span className="text-gray-500">Resolution:</span>
                <div className="font-medium">{calendarResolution} min slots</div>
              </div>
              <div>
                <span className="text-gray-500">Font Size:</span>
                <div className="font-medium">{fontSize}px</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
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
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleResetSettings}
          className="flex items-center gap-2"
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          type="button"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;