// Calendar Invite Generator for ZAVIRA Beauty
// Generates .ics (iCalendar) files for appointments

interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  organizerEmail: string;
  organizerName: string;
  attendeeEmail?: string;
  attendeeName?: string;
  url?: string;
}

/**
 * Generate .ics calendar file content
 * Compatible with Google Calendar, Outlook, Apple Calendar
 */
export function generateICS(event: CalendarEventData): string {
  const formatDateTime = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const now = new Date();
  const uid = `${Date.now()}@zavira.ca`;

  // Escape special characters in text fields
  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZAVIRA Beauty//Appointment System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDateTime(now)}`,
    `DTSTART:${formatDateTime(event.startTime)}`,
    `DTEND:${formatDateTime(event.endTime)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    `ORGANIZER;CN=${escapeText(event.organizerName)}:mailto:${event.organizerEmail}`,
  ];

  if (event.attendeeEmail && event.attendeeName) {
    icsContent.push(
      `ATTENDEE;CN=${escapeText(event.attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}`
    );
  }

  if (event.url) {
    icsContent.push(`URL:${event.url}`);
  }

  icsContent.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'DESCRIPTION:Reminder: Your appointment at ZAVIRA Beauty is tomorrow',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\r\n');
}

/**
 * Create calendar invite for an appointment
 */
export function createAppointmentCalendarInvite(
  serviceName: string,
  appointmentDate: string,
  appointmentTime: string,
  durationMinutes: number = 60,
  customerName?: string,
  customerEmail?: string,
  staffName?: string,
  additionalNotes?: string
): string {
  // Parse date and time
  const [hours, minutes] = appointmentTime.split(':').map(Number);
  const startTime = new Date(appointmentDate);
  startTime.setHours(hours, minutes, 0, 0);

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  const description = [
    `Your appointment at ZAVIRA Beauty Salon & Spa`,
    `Service: ${serviceName}`,
    staffName ? `Stylist: ${staffName}` : '',
    additionalNotes ? `Notes: ${additionalNotes}` : '',
    '',
    'Important Reminders:',
    '• Please arrive 10 minutes early',
    '• Bring a valid ID for verification',
    '• Remaining balance (50%) due at appointment',
    '• Cancellations must be made 24 hours in advance',
    '',
    'Contact: (431) 816-3330',
    'Email: zavirasalonandspa@gmail.com',
    'Address: 283 Tache Avenue, Winnipeg, MB, Canada',
  ]
    .filter(Boolean)
    .join('\n');

  return generateICS({
    title: `${serviceName} - ZAVIRA Beauty`,
    description,
    location: '283 Tache Avenue, Winnipeg, MB, Canada',
    startTime,
    endTime,
    organizerEmail: 'zavirasalonandspa@gmail.com',
    organizerName: 'ZAVIRA Beauty Salon & Spa',
    attendeeEmail: customerEmail,
    attendeeName: customerName,
    url: 'https://zavira.ca',
  });
}

/**
 * Create calendar invite for group booking
 */
export function createGroupBookingCalendarInvite(
  groupName: string,
  groupType: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  memberName?: string,
  memberEmail?: string,
  serviceName?: string
): string {
  // Parse date and time
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const start = new Date(bookingDate);
  start.setHours(startHours, startMinutes, 0, 0);

  const end = new Date(bookingDate);
  end.setHours(endHours, endMinutes, 0, 0);

  const description = [
    `Group booking at ZAVIRA Beauty`,
    `Group: ${groupName}`,
    `Type: ${groupType}`,
    serviceName ? `Your Service: ${serviceName}` : '',
    '',
    'Important Reminders:',
    '• Please arrive 15 minutes early',
    '• This is a group booking',
    '• Bring a valid ID for verification',
    '• Remaining balance due at appointment',
    '',
    'Contact: (431) 816-3330',
    'Email: zavirasalonandspa@gmail.com',
    'Address: 283 Tache Avenue, Winnipeg, MB, Canada',
  ]
    .filter(Boolean)
    .join('\n');

  return generateICS({
    title: `${groupName} - ZAVIRA Beauty`,
    description,
    location: '283 Tache Avenue, Winnipeg, MB, Canada',
    startTime: start,
    endTime: end,
    organizerEmail: 'zavirasalonandspa@gmail.com',
    organizerName: 'ZAVIRA Beauty Salon & Spa',
    attendeeEmail: memberEmail,
    attendeeName: memberName,
    url: 'https://zavira.ca',
  });
}

/**
 * Convert ICS string to base64 for email attachment
 */
export function icsToBase64(icsContent: string): string {
  return btoa(unescape(encodeURIComponent(icsContent)));
}

/**
 * Create calendar attachment object for Brevo API
 */
export function createCalendarAttachment(
  icsContent: string,
  filename: string = 'appointment.ics'
): { content: string; name: string } {
  return {
    content: icsToBase64(icsContent),
    name: filename,
  };
}
