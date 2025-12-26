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
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface AppointmentConfirmationProps {
  customerName: string;
  serviceName: string;
  staffName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  price: string;
  notes?: string;
}

export const AppointmentConfirmation = ({
  customerName = 'Valued Customer',
  serviceName = 'Premium Service',
  staffName = 'Our Team',
  appointmentDate = 'January 1, 2025',
  appointmentTime = '10:00 AM',
  duration = 60,
  price = '$100.00',
  notes,
}: AppointmentConfirmationProps) => {
  const previewText = `Your appointment is confirmed for ${appointmentDate} at ${appointmentTime}`;

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
            <Heading style={h1}>Appointment Confirmed! ✓</Heading>

            <Text style={text}>
              Hi {customerName},
            </Text>

            <Text style={text}>
              Great news! Your appointment at Zavira Salon & Spa has been confirmed.
            </Text>

            {/* Appointment Details Box */}
            <Section style={detailsBox}>
              <table style={detailsTable}>
                <tr>
                  <td style={labelCell}>Service:</td>
                  <td style={valueCell}>{serviceName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Staff:</td>
                  <td style={valueCell}>{staffName}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Date:</td>
                  <td style={valueCell}>{appointmentDate}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Time:</td>
                  <td style={valueCell}>{appointmentTime}</td>
                </tr>
                <tr>
                  <td style={labelCell}>Duration:</td>
                  <td style={valueCell}>{duration} minutes</td>
                </tr>
                <tr>
                  <td style={labelCell}>Price:</td>
                  <td style={valueCell}><strong>{price}</strong></td>
                </tr>
              </table>

              {notes && (
                <>
                  <Hr style={hr} />
                  <Text style={notesText}>
                    <strong>Notes:</strong> {notes}
                  </Text>
                </>
              )}
            </Section>

            {/* CTA Buttons */}
            <Section style={buttonContainer}>
              <Button style={button} href="https://zavira.ca/staff/calendar">
                View Appointment
              </Button>
            </Section>

            <Section style={buttonContainer}>
              <Button style={buttonSecondary} href="https://zavira.ca/booking/reschedule">
                Reschedule or Cancel
              </Button>
            </Section>

            <Text style={text}>
              <strong>Important Reminders:</strong>
            </Text>

            <ul style={list}>
              <li style={listItem}>Please arrive 5-10 minutes early</li>
              <li style={listItem}>Cancellations require 24-hour notice</li>
              <li style={listItem}>Late arrivals may result in shortened service time</li>
            </ul>

            <Text style={text}>
              We're located at <strong>283 Tache Avenue, Winnipeg, MB</strong>.
              If you need directions or have questions, call us at{' '}
              <Link href="tel:+14318163330" style={link}>(431) 816-3330</Link>.
            </Text>

            <Text style={signature}>
              We look forward to seeing you!<br />
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

export default AppointmentConfirmation;

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

const h1 = {
  color: '#10b981',
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
  width: '120px',
};

const valueCell = {
  color: '#000000',
  fontSize: '16px',
  padding: '8px 0',
  fontWeight: '500',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '20px 0',
};

const notesText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0 0',
};

const list = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
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
