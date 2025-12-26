import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, Calendar as CalendarIcon, Clock, User, Scissors, Mail,
  Phone, DollarSign, RotateCcw, X, Download, Star, LogIn, LogOut
} from 'lucide-react';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_amount: number;
  deposit_amount: number;
  full_name: string;
  email: string;
  phone: string;
  service: { name: string; duration: number; price: number };
  staff: { full_name: string };
}

export default function MyAppointmentsPortal() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);

  // Check auth state on mount
  useEffect(() => {
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadAppointments(session.user.email!);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        await loadAppointments(session.user.email!);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  };

  const loadAppointments = async (userEmail: string) => {
    setLoading(true);
    try {
      // Load all appointments for this email
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          total_amount,
          deposit_amount,
          full_name,
          email,
          phone,
          service:services(name, duration, price),
          staff:staff_members(full_name)
        `)
        .eq('email', userEmail)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      const appointments = (data || []) as Appointment[];

      // Split into upcoming and past
      const now = new Date();
      const upcoming = appointments.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return (isFuture(aptDate) || format(aptDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'))
          && apt.status !== 'CANCELLED'
          && apt.status !== 'COMPLETE';
      });

      const past = appointments.filter(apt => {
        const aptDate = parseISO(apt.appointment_date);
        return isPast(aptDate) || apt.status === 'CANCELLED' || apt.status === 'COMPLETE';
      });

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setSendingMagicLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/my-appointments`
        }
      });

      if (error) throw error;

      toast.success('Check your email for the login link!');
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setSendingMagicLink(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUpcomingAppointments([]);
    setPastAppointments([]);
    toast.success('Signed out successfully');
  };

  const handleGenerateToken = async (appointmentId: string, actionType: 'cancel' | 'reschedule') => {
    try {
      const { data, error } = await supabase.rpc('generate_appointment_token', {
        p_appointment_id: appointmentId,
        p_action_type: actionType,
        p_validity_hours: 72
      });

      if (error) throw error;

      const token = data as string;
      const url = `${window.location.origin}/appointment/${actionType}/${token}`;

      if (actionType === 'cancel') {
        navigate(`/appointment/cancel/${token}`);
      } else {
        navigate(`/appointment/reschedule/${token}`);
      }
    } catch (error: any) {
      console.error('Error generating token:', error);
      toast.error('Failed to generate link');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'bg-white/10',
      ACCEPTED: 'bg-violet-300 text-black',
      CONFIRMED: 'bg-emerald-500',
      READY_TO_START: 'bg-teal-400 text-black',
      IN_PROGRESS: 'bg-violet-500',
      COMPLETE: 'bg-indigo-500',
      CANCELLED: 'bg-rose-500',
      NO_SHOW: 'bg-slate-500'
    };

    return (
      <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: Appointment; isPast?: boolean }) => (
    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-500 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg">{appointment.service.name}</CardTitle>
            <CardDescription className="mt-1">
              {format(parseISO(appointment.appointment_date), 'MMMM d, yyyy')} at {appointment.appointment_time}
            </CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <User className="w-4 h-4 text-emerald-500" />
            <span>{appointment.staff.full_name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>{appointment.service.duration} min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>${appointment.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {!isPast && appointment.status !== 'CANCELLED' && (
          <div className="flex gap-2 pt-2 border-t border-slate-700">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black"
              onClick={() => handleGenerateToken(appointment.id, 'reschedule')}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              onClick={() => handleGenerateToken(appointment.id, 'cancel')}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}

        {isPast && appointment.status === 'COMPLETE' && (
          <div className="pt-2 border-t border-slate-700">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black"
              onClick={() => navigate('/booking')}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Rebook This Service
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              My Appointments
            </h1>
            <p className="text-gray-400">Sign in to view and manage your appointments</p>
          </div>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In
              </CardTitle>
              <CardDescription>We'll send you a magic link to sign in</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
                  disabled={sendingMagicLink}
                >
                  {sendingMagicLink ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Magic Link'
                  )}
                </Button>
              </form>

              <Alert className="mt-4 bg-slate-800 border-slate-700">
                <AlertDescription className="text-sm text-gray-300">
                  Enter the email you used when booking. We'll send you a secure link to access your appointments.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button variant="link" onClick={() => navigate('/')} className="text-gray-400">
              Back to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show appointments
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
              My Appointments
            </h1>
            <p className="text-gray-400">Welcome back, {user.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-slate-700 text-gray-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-900 mb-8">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                Upcoming ({upcomingAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <CalendarIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No upcoming appointments</p>
                    <Button
                      onClick={() => navigate('/booking')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-black"
                    >
                      Book an Appointment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                upcomingAppointments.map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastAppointments.length === 0 ? (
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <CalendarIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No past appointments</p>
                  </CardContent>
                </Card>
              ) : (
                pastAppointments.map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} isPast />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
