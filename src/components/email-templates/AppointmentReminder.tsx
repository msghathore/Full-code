import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface AppointmentReminderProps {
  customerName: string;
  serviceName: string;
  staffName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  hoursUntil: number;
}

export const AppointmentReminder = ({
  customerName = 'Valued Customer',
  serviceName = 'Premium Service',
  staffName = 'Our Team',
  appointmentDate = 'Tomorrow',
  appointmentTime = '10:00 AM',
  duration = 60,
  hoursUntil = 24,
}: AppointmentReminderProps) => {
  const previewText = `Reminder: Your appointment is in ${hoursUntil} hours`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>ZAVIRA</Heading>
            <Text style={tagline}>Salon & Spa</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Countdown Badge */}
            <Section style={badgeContainer}>
              <div style={badge}>
                <div style={badgeNumber}>{hoursUntil}</div>
                <div style={badgeText}>hours until<br />your appointment</div>
              </div>
            </Section>

            <Heading style={h1}>Appointment Reminder</Heading>

            <Text style={text}>
              Hi {customerName},
            </Text>

            <Text style={text}>
              This is a friendly reminder that you have an appointment at Zavira Salon & Spa coming up soon!
            </Text>

            {/* Appointment Details Box */}
            <Section style={detailsBox}>
              <table style={detailsTable}>
                <tr>
                  <td style={labelCell}>Service:</td>
                  <td style={valueCell}>{serviceName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>With:</td>
                  <td style={valueCell}>{staffName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Date:</td>
                  <td style={valueCell}><strong>{appointmentDate}</strong></td>
                </tr>
                <tr>
                  <td style={labelCell}>Time:</td>
                  <td style={valueCell}><strong>{appointmentTime}</strong></td>
                </tr>
                <tr>
                  <td style={labelCell}>Duration:</td>
                  <td style={valueCell}>{duration} minutes</td>
                </tr>
              </table>
            </Section>

            {/* Quick Actions */}
            <Section style={buttonContainer}>
              <Button style={button} href="https://zavira.ca/staff/calendar">
                View Details
              </Button>
            </Section>

            <Text style={centerText}>
              Need to make changes?
            </Text>

            <Section style={buttonContainer}>
              <Button style={buttonSecondary} href="https://zavira.ca/booking/reschedule">
                Reschedule or Cancel
              </Button>
            </Section>

            <Section style={reminderBox}>
              <Text style={reminderTitle}>📍 Location & Directions</Text>
              <Text style={reminderText}>
                <strong>Zavira Salon & Spa</strong><br />
                283 Tache Avenue<br />
                Winnipeg, MB, Canada
              </Text>
              <Text style={reminderText}>
                <Link href="https://maps.google.com/?q=283+Tache+Avenue+Winnipeg+MB" style={link}>
                  Get Directions →
                </Link>
              </Text>
            </Section>

            <Section style={tipsBox}>
              <Text style={tipsTitle}>✨ Preparation Tips</Text>
              <ul style={list}>
                <li style={listItem}>Arrive 5-10 minutes early</li>
                <li style={listItem}>Bring any product preferences or inspiration photos</li>
                <li style={listItem}>Wear comfortable clothing</li>
                <li style={listItem}>Let us know if you have any allergies</li>
              </ul>
            </Section>

            <Text style={text}>
              Questions? Call us at{' '}
              <Link href="tel:+14318163330" style={link}>(431) 816-3330</Link>{' '}
              or reply to this email.
            </Text>

            <Text style={signature}>
              See you soon!<br />
              <strong>The Zavira Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Zavira Salon & Spa<br />
              283 Tache Avenue, Winnipeg, MB, Canada<br />
              (431) 816-3330 | zavirasalonandspa@gmail.com
            </Text>
            <Text style={footerText}>
              <Link href="https://zavira.ca/unsubscribe" style={footerLink}>
                Unsubscribe
              </Link>
              {' • '}
              <Link href="https://zavira.ca" style={footerLink}>
                Visit Website
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AppointmentReminder;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#000000',
  padding: '30px 20px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
  letterSpacing: '2px',
  textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6)',
};

const tagline = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '5px 0 0',
  letterSpacing: '1px',
  textShadow: '0 0 8px rgba(255,255,255,0.6)',
};

const content = {
  padding: '40px 40px',
};

const badgeContainer = {
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const badge = {
  display: 'inline-block',
  backgroundColor: '#10b981',
  borderRadius: '50%',
  width: '140px',
  height: '140px',
  textAlign: 'center' as const,
  padding: '30px 20px',
  color: '#ffffff',
};

const badgeNumber = {
  fontSize: '48px',
  fontWeight: '700',
  lineHeight: '1',
  margin: '0 0 8px',
};

const badgeText = {
  fontSize: '14px',
  fontWeight: '500',
  lineHeight: '1.3',
};

const h1 = {
  color: '#000000',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 30px',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const centerText = {
  ...text,
  textAlign: 'center' as const,
  margin: '24px 0 12px',
  fontSize: '14px',
  color: '#666666',
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '2px solid #10b981',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const detailsTable = {
  width: '100%',
};

const labelCell = {
  color: '#666666',
  fontSize: '14px',
  padding: '8px 16px 8px 0',
  verticalAlign: 'top' as const,
  width: '100px',
};

const valueCell = {
  color: '#000000',
  fontSize: '16px',
  padding: '8px 0',
  fontWeight: '500',
};

const reminderBox = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const reminderTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const reminderText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

const tipsBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #10b981',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const tipsTitle = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const list = {
  color: '#064e3b',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '6px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '16px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  width: '100%',
  maxWidth: '300px',
};

const buttonSecondary = {
  ...button,
  backgroundColor: '#ffffff',
  color: '#10b981',
  border: '2px solid #10b981',
};

const link = {
  color: '#10b981',
  textDecoration: 'underline',
};

const signature = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '32px 0 0',
};

const footer = {
  backgroundColor: '#f6f9fc',
  padding: '30px 40px',
  borderTop: '1px solid #e6e6e6',
};

const footerText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#666666',
  textDecoration: 'underline',
};
