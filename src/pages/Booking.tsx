import { useState } from 'react';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const services = [
  { id: '1', name: 'Hair Styling', price: 150 },
  { id: '2', name: 'Manicure & Pedicure', price: 80 },
  { id: '3', name: 'Facial Treatment', price: 120 },
  { id: '4', name: 'Massage Therapy', price: 200 },
  { id: '5', name: 'Hair Coloring', price: 250 },
];

const Booking = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState('');

  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-serif luxury-glow mb-4">
              BOOK APPOINTMENT
            </h1>
            <p className="text-muted-foreground text-lg tracking-wider">
              Reserve your luxurious experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left - Form */}
            <div className="frosted-glass border border-white/10 rounded-lg p-8 space-y-6">
              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT SERVICE</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id} className="text-white">
                        {service.name} - ${service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">FULL NAME</label>
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
                <label className="text-sm text-white/70 mb-2 block tracking-wider">PHONE</label>
                <Input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">SPECIAL REQUESTS</label>
                <Textarea 
                  placeholder="Any special requirements..." 
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[100px]"
                />
              </div>

              <Button className="w-full bg-white text-black hover:bg-white/90 font-serif text-lg tracking-wider py-6">
                CONFIRM BOOKING
              </Button>
            </div>

            {/* Right - Calendar */}
            <div className="frosted-glass border border-white/10 rounded-lg p-8">
              <h3 className="text-2xl font-serif luxury-glow mb-6">SELECT DATE & TIME</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-0"
              />
              
              <div className="mt-8 space-y-3">
                <p className="text-sm text-white/70 tracking-wider mb-4">AVAILABLE TIME SLOTS</p>
                {['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'].map(time => (
                  <button
                    key={time}
                    className="w-full py-3 border border-white/20 rounded-lg hover:border-white/40 hover:bg-white/5 transition-all cursor-hover text-white"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
