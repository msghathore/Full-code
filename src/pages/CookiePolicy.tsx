import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Footer } from '@/components/Footer';

export default function CookiePolicy() {
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-16 px-4 sm:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-widest luxury-glow mb-6 sm:mb-8 text-center">
          {t('cookiePolicy').toUpperCase()}
        </h1>
        
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto tracking-wide">
            Learn about how we use cookies and similar technologies on our website.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">What Are Cookies?</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              Cookies are small text files that are stored on your device when you visit our website.
              They help us provide you with a better experience by remembering your preferences and
              analyzing how you use our site.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">How We Use Cookies</h2>
            <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground tracking-wide">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
              <li><strong className="text-white">Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong className="text-white">Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Managing Cookies</h2>
            <p className="leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground tracking-wide">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
              <li>Adjust your browser settings to block or delete cookies</li>
              <li>Use our cookie preference center when available</li>
              <li>Opt-out of third-party cookies through their respective websites</li>
            </ul>
            <p className="leading-relaxed mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground tracking-wide">
              Please note that disabling certain cookies may impact the functionality of our website.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Third-Party Cookies</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              We may use third-party services that set cookies on your device, including analytics
              providers and social media platforms. These services have their own cookie policies
              that we encourage you to review.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Updates to This Policy</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              We may update this Cookie Policy from time to time. Any changes will be posted on
              this page with an updated effective date.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-8 frosted-glass">
            <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white mb-4 sm:mb-6 luxury-glow tracking-wider">Contact Us</h2>
            <p className="leading-relaxed text-sm sm:text-base text-muted-foreground tracking-wide">
              If you have any questions about our use of cookies, please contact us at privacy@zaviraspa.com.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}