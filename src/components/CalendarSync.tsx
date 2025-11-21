import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadICalendarFile,
  createAppointmentEvent,
  openCalendarUrl
} from '@/lib/calendar-sync';

interface CalendarSyncProps {
  serviceName: string;
  date: string;
  time: string;
  duration?: number;
  location: string;
  notes?: string;
  className?: string;
}

export function CalendarSync({
  serviceName,
  date,
  time,
  duration = 60,
  location,
  notes,
  className = ''
}: CalendarSyncProps) {
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCalendarSync = async (type: 'google' | 'outlook' | 'ical') => {
    setSyncing(type);

    try {
      const event = createAppointmentEvent(serviceName, date, time, duration, location, notes);

      switch (type) {
        case 'google': {
          const googleUrl = generateGoogleCalendarUrl(event);
          openCalendarUrl(googleUrl);
          break;
        }

        case 'outlook': {
          const outlookUrl = generateOutlookCalendarUrl(event);
          openCalendarUrl(outlookUrl);
          break;
        }

        case 'ical': {
          downloadICalendarFile(event);
          break;
        }
      }

      toast({
        title: "Calendar sync successful!",
        description: `Appointment added to your ${type === 'ical' ? 'calendar' : type} calendar.`,
      });
    } catch (error) {
      toast({
        title: "Calendar sync failed",
        description: "There was an error adding to your calendar. Please try manually.",
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Card className={`bg-black/40 border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-base font-serif flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sync to Calendar
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-white/60">
          Add this appointment to your calendar to never miss it.
        </p>

        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={() => handleCalendarSync('google')}
            disabled={!!syncing}
            variant="outline"
            className="justify-start bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {syncing === 'google' ? 'Opening...' : 'Add to Google Calendar'}
          </Button>

          <Button
            onClick={() => handleCalendarSync('outlook')}
            disabled={!!syncing}
            variant="outline"
            className="justify-start bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {syncing === 'outlook' ? 'Opening...' : 'Add to Outlook'}
          </Button>

          <Button
            onClick={() => handleCalendarSync('ical')}
            disabled={!!syncing}
            variant="outline"
            className="justify-start bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            {syncing === 'ical' ? 'Downloading...' : 'Download .ics File'}
          </Button>
        </div>

        <p className="text-xs text-white/40 mt-2">
          Choose your preferred calendar application above.
        </p>
      </CardContent>
    </Card>
  );
}