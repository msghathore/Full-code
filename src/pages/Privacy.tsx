import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  const { t } = useLanguage();
  const { settings } = useBusinessSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest luxury-glow mb-6 sm:mb-8 text-center">
          {t('privacyPolicy').toUpperCase()}
        </h1>
        
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto tracking-wide">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Information We Collect</h2>
            <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground tracking-wide">
              We collect information you provide directly to us, such as when you create an account,
              book an appointment, or contact us for support.
            </p>
            <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
              <li>Personal identification information (name, email, phone number)</li>
              <li>Appointment preferences and service history</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Communication records and customer service interactions</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">How We Use Your Information</h2>
            <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground tracking-wide">
              We use the information we collect to provide, maintain, and improve our services:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
              <li>Process and manage your appointments</li>
              <li>Communicate with you about services and promotions</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Information Sharing</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy or as required by law.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Data Security</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Contact Us</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              If you have any questions about this Privacy Policy, please contact us at {settings?.email || 'zavirasalonandspa@gmail.com'}
              or call us at {settings?.phone || '(431) 816-3330'}. You can also reach us through our contact page.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}