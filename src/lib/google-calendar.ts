// Google Calendar API Integration for Real-time Availability
// This service will query Google Calendar to get actual booked appointments

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
}

export class GoogleCalendarService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY || '';
  }

  /**
   * Get appointments from Google Calendar for a specific date and staff member
   */
  async getAppointmentsForDate(
    date: string, 
    staffCalendarId: string = 'primary'
  ): Promise<CalendarEvent[]> {
    try {
      const startDateTime = `${date}T00:00:00Z`;
      const endDateTime = `${date}T23:59:59Z`;

      const response = await fetch(
        `${this.baseUrl}/calendars/${encodeURIComponent(staffCalendarId)}/events?` +
        new URLSearchParams({
          key: this.apiKey,
          timeMin: startDateTime,
          timeMax: endDateTime,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '100'
        })
      );

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  }

  /**
   * Convert Google Calendar events to time slots showing availability
   */
  async getAvailabilityForDate(
    date: Date,
    staffCalendarId: string = 'primary',
    timeSlots: string[] = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00']
  ): Promise<{ date: string; slots: TimeSlot[]; lastUpdated: Date }> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Get events from Google Calendar
      const events = await this.getAppointmentsForDate(dateStr, staffCalendarId);
      
      // Extract booked time slots from events
      const bookedTimes = new Set<string>();
      
      events.forEach(event => {
        if (event.start?.dateTime && event.end?.dateTime) {
          const startTime = new Date(event.start.dateTime);
          const endTime = new Date(event.end.dateTime);
          
          // Extract the hour and minute from the event start time
          const eventTime = startTime.toTimeString().slice(0, 5); // "HH:MM" format
          bookedTimes.add(eventTime);
          
          // Also mark the 30-minute slots around the appointment as unavailable
          // This prevents double-booking in overlapping time slots
          const beforeSlot = this.getBeforeSlot(eventTime);
          const afterSlot = this.getAfterSlot(eventTime);
          if (beforeSlot) bookedTimes.add(beforeSlot);
          if (afterSlot) bookedTimes.add(afterSlot);
        }
      });

      // Create availability slots
      const slots: TimeSlot[] = timeSlots.map(time => ({
        time,
        available: !bookedTimes.has(time),
        staffId: staffCalendarId === 'primary' ? undefined : staffCalendarId,
      }));

      return {
        date: dateStr,
        slots,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting availability:', error);
      
      // Return all slots as available as fallback
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        slots: timeSlots.map(time => ({
          time,
          available: true,
          staffId: staffCalendarId === 'primary' ? undefined : staffCalendarId,
        })),
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Get time slot before the given time
   */
  private getBeforeSlot(time: string): string | null {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes - 90; // 1.5 hours before
    if (totalMinutes < 540) return null; // Before 9 AM
    
    const beforeHours = Math.floor(totalMinutes / 60);
    const beforeMinutes = totalMinutes % 60;
    return `${beforeHours.toString().padStart(2, '0')}:${beforeMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Get time slot after the given time
   */
  private getAfterSlot(time: string): string | null {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 90; // 1.5 hours after
    if (totalMinutes > 1140) return null; // After 7 PM
    
    const afterHours = Math.floor(totalMinutes / 60);
    const afterMinutes = totalMinutes % 60;
    return `${afterHours.toString().padStart(2, '0')}:${afterMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Create a new appointment event in Google Calendar
   */
  async createAppointment(
    appointmentData: {
      serviceName: string;
      date: string;
      time: string;
      duration: number;
      staffCalendarId?: string;
      customerName?: string;
      customerEmail?: string;
    }
  ): Promise<boolean> {
    try {
      const calendarId = appointmentData.staffCalendarId || 'primary';
      const startDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + appointmentData.duration * 60000);

      const event = {
        summary: `${appointmentData.serviceName} - ${appointmentData.customerName || 'Client'}`,
        description: `Appointment for ${appointmentData.serviceName}\nCustomer: ${appointmentData.customerName || 'N/A'}\nEmail: ${appointmentData.customerEmail || 'N/A'}\nBooked through Zavira Salon website`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Toronto',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Toronto',
        },
      };

      const response = await fetch(
        `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events?` +
        new URLSearchParams({
          key: this.apiKey,
        }),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create calendar event: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return false;
    }
  }

  /**
   * Check if Google Calendar API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get the API key status
   */
  getStatus(): { configured: boolean; message: string } {
    if (!this.apiKey) {
      return {
        configured: false,
        message: 'Google Calendar API key not configured. Set VITE_GOOGLE_CALENDAR_API_KEY in your environment.',
      };
    }
    
    return {
      configured: true,
      message: 'Google Calendar API is configured and ready to use.',
    };
  }
}

// Export a singleton instance
export const googleCalendar = new GoogleCalendarService();