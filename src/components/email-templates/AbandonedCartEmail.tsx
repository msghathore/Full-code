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

interface AbandonedCartEmailProps {
  customerName: string;
  serviceName: string;
  selectedDate?: string;
  selectedTime?: string;
  price: string;
  discountCode?: string;
}

export const AbandonedCartEmail = ({
  customerName = 'Valued Customer',
  serviceName = 'Premium Service',
  selectedDate,
  selectedTime,
  price = '$100.00',
  discountCode = 'COMPLETE10',
}: AbandonedCartEmailProps) => {
  const previewText = `Complete your booking and save! Your ${serviceName} is waiting.`;

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
            <Heading style={h1}>Your Booking is Waiting! ⏰</Heading>

            <Text style={text}>
              Hi {customerName},
            </Text>

            <Text style={text}>
              We noticed you started booking an appointment but didn't finish. We'd love to help you
              complete your reservation!
            </Text>

            {/* Service Details */}
            <Section style={serviceBox}>
              <Heading style={serviceTitle}>Your Selected Service</Heading>
              <Text style={serviceName}>{serviceName}</Text>
              {selectedDate && selectedTime && (
                <Text style={serviceDetails}>
                  {selectedDate} at {selectedTime}
                </Text>
              )}
              <Text style={servicePrice}>{price}</Text>
            </Section>

            {/* Special Offer Banner */}
            {discountCode && (
              <Section style={offerBanner}>
                <Text style={offerTitle}>🎁 SPECIAL OFFER FOR YOU!</Text>
                <Text style={offerText}>
                  Complete your booking in the next 24 hours and get <strong>10% OFF</strong>
                </Text>
                <Section style={codeBox}>
                  <Text style={codeLabel}>Use code:</Text>
                  <Text style={code}>{discountCode}</Text>
                </Section>
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href="https://zavira.ca/booking">
                Complete Your Booking
              </Button>
            </Section>

            <Text style={text}>
              <strong>Why choose Zavira?</strong>
            </Text>

            <ul style={list}>
              <li style={listItem}>⭐ Premium salon services by expert stylists</li>
              <li style={listItem}>🕐 Flexible scheduling - 8 AM to 11:30 PM daily</li>
              <li style={listItem}>📱 Easy online booking and management</li>
              <li style={listItem}>💎 Luxurious, modern salon experience</li>
              <li style={listItem}>📍 Conveniently located in Winnipeg</li>
            </ul>

            <Section style={urgencyBox}>
              <Text style={urgencyText}>
                ⚡ <strong>Limited Availability!</strong><br />
                Our best time slots fill up quickly. Complete your booking today to secure your
                preferred date and time.
              </Text>
            </Section>

            <Text style={text}>
              Need help? Our team is here to assist you!
            </Text>

            <Section style={contactBox}>
              <Text style={contactText}>
                📞 <Link href="tel:+14318163330" style={link}>(431) 816-3330</Link><br />
                📧 <Link href="mailto:zavirasalonandspa@gmail.com" style={link}>zavirasalonandspa@gmail.com</Link><br />
                💬 Live chat available on our website
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={buttonSecondary} href="https://zavira.ca/services">
                Browse All Services
              </Button>
            </Section>

            <Text style={signature}>
              We can't wait to serve you!<br />
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

export default AbandonedCartEmail;

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

const serviceBox = {
  backgroundColor: '#f9fafb',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const serviceTitle = {
  color: '#666666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const serviceName = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '700',
  margin: '8px 0',
};

const serviceDetails = {
  color: '#666666',
  fontSize: '16px',
  margin: '8px 0',
};

const servicePrice = {
  color: '#10b981',
  fontSize: '28px',
  fontWeight: '700',
  margin: '12px 0 0',
};

const offerBanner = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const offerTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const offerText = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '8px 0 20px',
};

const codeBox = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  padding: '16px',
  margin: '12px auto 0',
  maxWidth: '280px',
};

const codeLabel = {
  color: '#666666',
  fontSize: '12px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const code = {
  color: '#10b981',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '3px',
};

const urgencyBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const urgencyText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
};

const contactBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const contactText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '26px',
  margin: '0',
};

const list = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
  width: '100%',
  maxWidth: '350px',
};

const buttonSecondary = {
  ...button,
  backgroundColor: '#ffffff',
  color: '#10b981',
  border: '2px solid #10b981',
  fontSize: '16px',
  padding: '12px 32px',
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
