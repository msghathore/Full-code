import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BUSINESS_ADDRESS, BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_HOURS } from '@/lib/businessConstants';

const Contact = () => {
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
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif luxury-glow mb-4">
            CONTACT US
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground tracking-wider">
            Get in touch with our team
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Form */}
          <div className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-8 space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-serif luxury-glow mb-4 sm:mb-6">Send us a message</h3>
            
            <div>
              <label className="text-xs sm:text-sm text-white/70 mb-2 block tracking-wider">NAME</label>
              <Input
                placeholder="Your name"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm text-white/70 mb-2 block tracking-wider">EMAIL</label>
              <Input
                type="email"
                placeholder="your@email.com"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm text-white/70 mb-2 block tracking-wider">MESSAGE</label>
              <Textarea
                placeholder="How can we help you?"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[120px] sm:min-h-[150px]"
              />
            </div>

            <Button variant="cta" className="w-full font-serif text-base sm:text-lg tracking-wider py-4 sm:py-6">
              SEND MESSAGE
            </Button>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">Address</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {BUSINESS_ADDRESS.street}<br />
                    {BUSINESS_ADDRESS.city}, {BUSINESS_ADDRESS.province}
                  </p>
                </div>
              </div>
            </div>

            <div id="phone" className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6 scroll-mt-24">
              <div className="flex items-start">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">Phone</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{BUSINESS_PHONE}</p>
                </div>
              </div>
            </div>

            <div className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6">
              <div className="flex items-start">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">Email</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">{BUSINESS_EMAIL}</p>
                </div>
              </div>
            </div>

            <div id="hours" className="frosted-glass border border-white/10 rounded-lg p-4 sm:p-6 scroll-mt-24">
              <div className="flex items-start">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-3 sm:mr-4 mt-1 luxury-glow" />
                <div>
                  <h4 className="text-lg sm:text-xl font-serif luxury-glow mb-2">Hours</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {BUSINESS_HOURS.display}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
