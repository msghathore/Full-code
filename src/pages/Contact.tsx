import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-serif luxury-glow mb-4">
              CONTACT US
            </h1>
            <p className="text-muted-foreground text-lg tracking-wider">
              Get in touch with our team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="frosted-glass border border-white/10 rounded-lg p-8 space-y-6">
              <h3 className="text-2xl font-serif luxury-glow mb-6">Send us a message</h3>
              
              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">NAME</label>
                <Input 
                  placeholder="Your name" 
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">EMAIL</label>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">MESSAGE</label>
                <Textarea 
                  placeholder="How can we help you?" 
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[150px]"
                />
              </div>

              <Button className="w-full bg-white text-black hover:bg-white/90 font-serif text-lg tracking-wider py-6">
                SEND MESSAGE
              </Button>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="frosted-glass border border-white/10 rounded-lg p-6">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-white mr-4 mt-1 luxury-glow" />
                  <div>
                    <h4 className="text-xl font-serif luxury-glow mb-2">Address</h4>
                    <p className="text-muted-foreground">
                      123 Luxury Avenue<br />
                      Beverly Hills, CA 90210
                    </p>
                  </div>
                </div>
              </div>

              <div className="frosted-glass border border-white/10 rounded-lg p-6">
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-white mr-4 mt-1 luxury-glow" />
                  <div>
                    <h4 className="text-xl font-serif luxury-glow mb-2">Phone</h4>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>

              <div className="frosted-glass border border-white/10 rounded-lg p-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-white mr-4 mt-1 luxury-glow" />
                  <div>
                    <h4 className="text-xl font-serif luxury-glow mb-2">Email</h4>
                    <p className="text-muted-foreground">contact@zavira.com</p>
                  </div>
                </div>
              </div>

              <div className="frosted-glass border border-white/10 rounded-lg p-6">
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-white mr-4 mt-1 luxury-glow" />
                  <div>
                    <h4 className="text-xl font-serif luxury-glow mb-2">Hours</h4>
                    <p className="text-muted-foreground">
                      Mon - Fri: 9:00 AM - 8:00 PM<br />
                      Sat - Sun: 10:00 AM - 6:00 PM
                    </p>
                  </div>
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
