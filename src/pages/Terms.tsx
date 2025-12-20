import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Footer } from '@/components/Footer';

export default function Terms() {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest luxury-glow mb-6 sm:mb-8 text-center">
          {t('termsOfService').toUpperCase()}
        </h1>
        
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto tracking-wide">
            Please read these terms carefully before using our services.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Acceptance of Terms</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              By accessing and using Zavira Salon & Spa services, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Service Terms</h2>
            <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground tracking-wide">
              Our services include hair styling, nail care, skincare treatments, massage therapy, tattoo, and piercing services.
            </p>
            <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
              <li>All services require advance booking and payment confirmation</li>
              <li>Clients must arrive on time for scheduled appointments</li>
              <li>Children under 16 must be accompanied by a parent or guardian</li>
              <li>We reserve the right to refuse service to anyone</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Cancellation Policy</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              Cancellations must be made at least 24 hours in advance. Late cancellations may incur a fee
              equal to 50% of the service price. No-shows will be charged the full service price.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Payment Terms</h2>
            <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground tracking-wide">
              Payment is required at the time of service unless other arrangements have been made in advance.
            </p>
            <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
              <li>We accept cash, credit cards, and digital payments</li>
              <li>All prices are subject to change without notice</li>
              <li>Gift certificates are non-refundable but transferable</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Health and Safety</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              Clients must inform us of any allergies, medical conditions, or medications that may affect
              our services. We follow strict hygiene and safety protocols.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Limitation of Liability</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              Zavira Salon & Spa is not liable for any personal injury, property damage, or loss of personal
              items beyond our direct control.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Contact Information</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              If you have any questions about these Terms of Service, please contact us at legal@zaviraspa.com
              or visit our contact page.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}