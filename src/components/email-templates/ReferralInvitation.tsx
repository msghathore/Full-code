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

interface ReferralInvitationProps {
  customerName: string;
  referralCode: string;
  customerDiscount: string;
  friendDiscount: string;
  referralLink: string;
}

export const ReferralInvitation = ({
  customerName = 'Valued Customer',
  referralCode = 'ZAVIRA2025',
  customerDiscount = '$20',
  friendDiscount = '$20',
  referralLink = 'https://zavira.ca/referral/ZAVIRA2025',
}: ReferralInvitationProps) => {
  const previewText = `Share Zavira and earn ${customerDiscount} for every friend!`;

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
            <Heading style={h1}>Share the Beauty, Earn Rewards! 💎</Heading>

            <Text style={text}>
              Hi {customerName},
            </Text>

            <Text style={text}>
              We're thrilled you've experienced the Zavira difference! As a valued customer, we'd love
              for you to share the luxury with your friends and family.
            </Text>

            {/* Referral Offer Box */}
            <Section style={offerBox}>
              <Text style={offerTitle}>🎁 YOUR REFERRAL REWARDS</Text>

              <Section style={rewardGrid}>
                <div style={rewardCard}>
                  <div style={rewardIcon}>👥</div>
                  <Text style={rewardAmount}>{friendDiscount}</Text>
                  <Text style={rewardText}>Your friend gets</Text>
                </div>

                <div style={rewardDivider}>+</div>

                <div style={rewardCard}>
                  <div style={rewardIcon}>⭐</div>
                  <Text style={rewardAmount}>{customerDiscount}</Text>
                  <Text style={rewardText}>You earn</Text>
                </div>
              </Section>

              <Text style={offerSubtext}>
                For every friend who books their first appointment
              </Text>
            </Section>

            {/* Referral Code */}
            <Section style={codeSection}>
              <Text style={codeLabel}>YOUR UNIQUE REFERRAL CODE</Text>
              <Section style={codeBox}>
                <Text style={code}>{referralCode}</Text>
              </Section>
              <Text style={codeInstructions}>
                Share this code with friends or use the link below
              </Text>
            </Section>

            {/* CTA Buttons */}
            <Section style={buttonContainer}>
              <Button style={button} href={referralLink}>
                Share Your Referral Link
              </Button>
            </Section>

            {/* Social Sharing */}
            <Section style={shareSection}>
              <Text style={shareTitle}>Share on social media:</Text>
              <Section style={socialButtons}>
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                  style={socialButton}
                >
                  Facebook
                </Link>
                <Link
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Get ${friendDiscount} off your first visit to Zavira Salon & Spa!`)}&url=${encodeURIComponent(referralLink)}`}
                  style={socialButton}
                >
                  Twitter
                </Link>
                <Link
                  href={`https://wa.me/?text=${encodeURIComponent(`Hey! Check out Zavira Salon & Spa. Use my code ${referralCode} for ${friendDiscount} off your first visit! ${referralLink}`)}`}
                  style={socialButton}
                >
                  WhatsApp
                </Link>
              </Section>
            </Section>

            {/* How It Works */}
            <Section style={stepsSection}>
              <Heading style={stepsTitle}>How It Works</Heading>

              <table style={stepsTable}>
                <tr>
                  <td style={stepNumber}>1</td>
                  <td style={stepText}>
                    <strong>Share your code</strong> with friends and family
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>2</td>
                  <td style={stepText}>
                    <strong>They book</strong> their first appointment using your code
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>3</td>
                  <td style={stepText}>
                    <strong>You both save!</strong> They get {friendDiscount} off, you earn {customerDiscount}
                  </td>
                </tr>
                <tr>
                  <td style={stepNumber}>4</td>
                  <td style={stepText}>
                    <strong>Repeat!</strong> Unlimited referrals, unlimited rewards
                  </td>
                </tr>
              </table>
            </Section>

            {/* Benefits Section */}
            <Section style={benefitsBox}>
              <Text style={benefitsTitle}>✨ Why Your Friends Will Love Zavira</Text>
              <ul style={list}>
                <li style={listItem}>Expert stylists with years of experience</li>
                <li style={listItem}>Premium products and latest techniques</li>
                <li style={listItem}>Luxurious, modern salon atmosphere</li>
                <li style={listItem}>Flexible hours (8 AM - 11:30 PM daily)</li>
                <li style={listItem}>Easy online booking system</li>
                <li style={listItem}>Exceptional customer service</li>
              </ul>
            </Section>

            {/* Terms */}
            <Section style={termsBox}>
              <Text style={termsTitle}>Program Details</Text>
              <ul style={termsList}>
                <li style={termsItem}>Referral discount applies to first-time customers only</li>
                <li style={termsItem}>Minimum service value of $50 required</li>
                <li style={termsItem}>Rewards credited after friend's appointment completion</li>
                <li style={termsItem}>No limit on number of referrals</li>
                <li style={termsItem}>Cannot be combined with other promotional offers</li>
              </ul>
            </Section>

            <Text style={text}>
              Questions about the referral program? Contact us at{' '}
              <Link href="tel:+14318163330" style={link}>(431) 816-3330</Link> or reply to this email.
            </Text>

            <Text style={signature}>
              Thanks for spreading the word!<br />
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

export default ReferralInvitation;

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

const offerBox = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  borderRadius: '12px',
  padding: '32px 24px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const offerTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 24px',
  letterSpacing: '1px',
};

const rewardGrid = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
  margin: '24px 0',
};

const rewardCard = {
  flex: '1',
  maxWidth: '180px',
};

const rewardIcon = {
  fontSize: '48px',
  margin: '0 0 12px',
};

const rewardAmount = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: '700',
  margin: '8px 0',
};

const rewardText = {
  color: 'rgba(255,255,255,0.9)',
  fontSize: '14px',
  margin: '4px 0',
};

const rewardDivider = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '300',
  padding: '0 10px',
};

const offerSubtext = {
  color: 'rgba(255,255,255,0.9)',
  fontSize: '14px',
  margin: '16px 0 0',
};

const codeSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const codeLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 0 12px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const codeBox = {
  backgroundColor: '#f9fafb',
  border: '2px dashed #10b981',
  borderRadius: '8px',
  padding: '20px',
  margin: '12px auto',
  maxWidth: '300px',
};

const code = {
  color: '#10b981',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '4px',
};

const codeInstructions = {
  color: '#666666',
  fontSize: '14px',
  margin: '12px 0 0',
};

const shareSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const shareTitle = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const socialButtons = {
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  flexWrap: 'wrap' as const,
};

const socialButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #10b981',
  borderRadius: '5px',
  color: '#10b981',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '10px 20px',
  display: 'inline-block',
};

const stepsSection = {
  margin: '32px 0',
};

const stepsTitle = {
  color: '#000000',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const stepsTable = {
  width: '100%',
};

const stepNumber = {
  width: '50px',
  height: '50px',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  textAlign: 'center' as const,
  borderRadius: '50%',
  padding: '12px',
  verticalAlign: 'top' as const,
};

const stepText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  padding: '12px 0 12px 20px',
  verticalAlign: 'top' as const,
};

const benefitsBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #10b981',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const benefitsTitle = {
  color: '#065f46',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const list = {
  color: '#064e3b',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '12px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
};

const termsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const termsTitle = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const termsList = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '8px 0',
  paddingLeft: '20px',
};

const termsItem = {
  margin: '6px 0',
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
