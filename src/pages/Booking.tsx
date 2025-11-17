import { useState, useEffect } from 'react';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Booking = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please login to book an appointment.",
          variant: "destructive",
        });
        navigate('/auth');
      } else {
        setUser(session.user);
        setEmail(session.user.email || '');
      }
    });

    // Fetch services from database
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching services:', error);
    } else {
      setServices(data || []);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to book an appointment.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!date || !selectedService || !selectedTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          service_id: selectedService,
          appointment_date: date.toISOString().split('T')[0],
          appointment_time: selectedTime,
          notes: notes,
          total_amount: selectedServiceData?.price || 0,
          deposit_amount: (selectedServiceData?.price || 0) * 0.2, // 20% deposit
          status: 'pending',
          payment_status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Booking confirmed!",
        description: "Your appointment has been scheduled successfully.",
      });

      // Reset form
      setSelectedService('');
      setSelectedTime('');
      setNotes('');
      setDate(new Date());
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-4">
              BOOK APPOINTMENT
            </h1>
            <p className="text-muted-foreground text-base md:text-lg tracking-wider">
              Reserve your luxurious experience
            </p>
          </div>

          <form onSubmit={handleBooking}>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Left - Form */}
              <div className="frosted-glass border border-white/10 rounded-lg p-6 md:p-8 space-y-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">SELECT SERVICE</label>
                  <Select value={selectedService} onValueChange={setSelectedService} required>
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
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">EMAIL</label>
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    required
                    disabled
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">PHONE (Optional)</label>
                  <Input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000" 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">SPECIAL REQUESTS</label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements..." 
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30 min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-white/90 font-serif text-base md:text-lg tracking-wider py-4 md:py-6"
                >
                  {loading ? 'BOOKING...' : 'CONFIRM BOOKING'}
                </Button>
              </div>

              {/* Right - Calendar */}
              <div className="frosted-glass border border-white/10 rounded-lg p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-serif luxury-glow mb-6">SELECT DATE & TIME</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border-0"
                  disabled={(date) => date < new Date()}
                />
                
                <div className="mt-8 space-y-3">
                  <p className="text-sm text-white/70 tracking-wider mb-4">AVAILABLE TIME SLOTS</p>
                  {['10:00', '12:00', '14:00', '16:00', '18:00'].map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`w-full py-3 border rounded-lg transition-all cursor-hover text-white text-sm md:text-base ${
                        selectedTime === time
                          ? 'border-white bg-white/10'
                          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
