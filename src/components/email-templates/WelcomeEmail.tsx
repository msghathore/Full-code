import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  customerName: string;
  customerEmail: string;
}

export const WelcomeEmail = ({
  customerName = 'Valued Customer',
  customerEmail = 'customer@example.com',
}: WelcomeEmailProps) => {
  const previewText = `Welcome to Zavira Salon & Spa, ${customerName}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Heading style={logo}>ZAVIRA</Heading>
            <Text style={tagline}>Salon & Spa</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to Zavira!</Heading>

            <Text style={text}>
              Hi {customerName},
            </Text>

            <Text style={text}>
              Thank you for choosing Zavira Salon & Spa! We're thrilled to have you join our community
              of beauty-conscious customers who trust us for premium salon services.
            </Text>

            <Text style={text}>
              Your account has been successfully created with the email: <strong>{customerEmail}</strong>
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href="https://zavira.ca/booking">
                Book Your First Appointment
              </Button>
            </Section>

            <Text style={text}>
              Here's what you can do next:
            </Text>

            <ul style={list}>
              <li style={listItem}>Browse our premium services</li>
              <li style={listItem}>Book an appointment online 24/7</li>
              <li style={listItem}>Manage your bookings from your account</li>
              <li style={listItem}>Earn rewards with our referral program</li>
            </ul>

            <Text style={text}>
              Our salon is located at <strong>283 Tache Avenue, Winnipeg, MB</strong> and we're open
              daily from <strong>8:00 AM - 11:30 PM</strong>.
            </Text>

            <Text style={text}>
              If you have any questions, feel free to call us at <Link href="tel:+14318163330" style={link}>(431) 816-3330</Link> or
              reply to this email.
            </Text>

            <Text style={signature}>
              Welcome aboard!<br />
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

export default WelcomeEmail;

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
  margin: '32px 0',
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
