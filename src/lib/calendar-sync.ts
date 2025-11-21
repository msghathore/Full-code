interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const startTime = event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endTime = event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startTime}/${endTime}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const startTime = event.startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endTime = event.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: startTime,
    enddt: endTime,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function generateICalendarFile(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

export function createAppointmentEvent(
  serviceName: string,
  date: string,
  time: string,
  duration: number,
  location: string,
  notes?: string
): CalendarEvent {
  const startDate = new Date(`${date}T${time}`);
  const endDate = new Date(startDate.getTime() + duration * 60000); // duration in minutes

  return {
    title: `Zavira Salon - ${serviceName}`,
    description: `Your ${serviceName} appointment at Zavira Salon & Spa.\n\n${notes ? `Notes: ${notes}\n\n` : ''}Location: ${location}\n\nBooked through Zavira Salon website.`,
    startDate,
    endDate,
    location,
  };
}

export function openCalendarUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadICalendarFile(event: CalendarEvent): void {
  const url = generateICalendarFile(event);
  const link = document.createElement('a');
  link.href = url;
  link.download = `zavira-appointment-${event.startDate.toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}