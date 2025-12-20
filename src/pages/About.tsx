import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from '@/components/Footer';

const About = () => {
  const location = useLocation();

  // Scroll to hash section on load
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif luxury-glow mb-4">
            ABOUT US
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Where luxury meets excellence
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12">
          <div id="story" className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8 scroll-mt-24">
            <h2 className="text-xl sm:text-3xl font-serif luxury-glow mb-4">Our Story</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Founded in 2020, Zavira Salon & Spa has become the premier destination for luxury beauty and wellness treatments.
              Our commitment to excellence and attention to detail has made us the choice of discerning clients who seek
              nothing but the best.
            </p>
          </div>

          <div className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-3xl font-serif luxury-glow mb-4">Our Philosophy</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              We believe that beauty is an art form, and every client deserves a personalized experience.
              Our team of expert stylists and therapists are passionate about bringing out your natural beauty
              while providing a sanctuary for relaxation and rejuvenation.
            </p>
          </div>

          <div className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8">
            <h2 className="text-xl sm:text-3xl font-serif luxury-glow mb-4">Why Choose Us</h2>
            <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start">
                <span className="luxury-glow mr-3">•</span>
                World-class professionals with years of experience
              </li>
              <li className="flex items-start">
                <span className="luxury-glow mr-3">•</span>
                Premium products from leading luxury brands
              </li>
              <li className="flex items-start">
                <span className="luxury-glow mr-3">•</span>
                State-of-the-art facilities in an elegant setting
              </li>
              <li className="flex items-start">
                <span className="luxury-glow mr-3">•</span>
                Personalized service tailored to your needs
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
