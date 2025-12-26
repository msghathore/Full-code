import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, CheckCircle2, ArrowRight, Mail, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Footer } from '@/components/Footer';
import { FadeInUp } from '@/components/animations';
import { LeadMagnet, LeadMagnetFormData } from '@/types/lead-magnets';

const LeadMagnetDownload = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leadMagnet, setLeadMagnet] = useState<LeadMagnet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadMagnetFormData>();

  // Fetch lead magnet data
  useEffect(() => {
    if (!slug) {
      navigate('/');
      return;
    }
    fetchLeadMagnet();
  }, [slug]);

  const fetchLeadMagnet = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      if (data) {
        setLeadMagnet(data as LeadMagnet);
      } else {
        toast({
          title: 'Not Found',
          description: 'This download is not available.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error: any) {
      console.error('Error fetching lead magnet:', error);
      toast({
        title: 'Error',
        description: 'Failed to load download. Please try again.',
        variant: 'destructive',
      });
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LeadMagnetFormData) => {
    if (!leadMagnet) return;

    setIsSubmitting(true);
    try {
      // Save to database
      const { error } = await supabase
        .from('lead_magnet_downloads')
        .insert({
          lead_magnet_id: leadMagnet.id,
          customer_email: data.email,
          customer_name: data.name,
          customer_phone: data.phone || null,
        });

      if (error) throw error;

      setHasSubmitted(true);
      setDownloadUrl(leadMagnet.file_url || null);

      toast({
        title: 'Success!',
        description: 'Your download is ready!',
        duration: 3000,
      });

      // Auto-download if file URL is available
      if (leadMagnet.file_url) {
        window.open(leadMagnet.file_url, '_blank');
      }
    } catch (error: any) {
      console.error('Error saving lead magnet download:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!leadMagnet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-12 px-4 sm:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <FadeInUp>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Gift className="w-12 h-12 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-serif text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mb-4">
              {leadMagnet.title}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {leadMagnet.description}
            </p>
          </div>
        </FadeInUp>

        {/* Preview Image */}
        {leadMagnet.preview_image && (
          <FadeInUp delay={0.2}>
            <div className="relative rounded-lg overflow-hidden mb-12 border border-white/10">
              <img
                src={leadMagnet.preview_image}
                alt={leadMagnet.title}
                className="w-full h-auto"
              />
            </div>
          </FadeInUp>
        )}

        {/* Benefits Section */}
        {leadMagnet.benefits && leadMagnet.benefits.length > 0 && (
          <FadeInUp delay={0.3}>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 mb-12">
              <h2 className="text-2xl font-serif text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mb-6 text-center">
                What You'll Get
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {leadMagnet.benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-white/80">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Download Section */}
        {!hasSubmitted ? (
          <FadeInUp delay={0.5}>
            <div className="bg-white/5 border border-white/10 rounded-lg p-8">
              <div className="text-center mb-8">
                <Mail className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-serif text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mb-2">
                  Get Instant Access
                </h2>
                <p className="text-white/60">
                  Enter your details below to download your free {leadMagnet.magnet_type}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
                <div>
                  <Input
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Your Name *"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    placeholder="Your Email *"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    {...register('phone')}
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500/50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-serif text-lg py-6 transition-all duration-300"
                >
                  {isSubmitting ? (
                    'Processing...'
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Now
                    </>
                  )}
                </Button>

                <p className="text-white/40 text-xs text-center">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </FadeInUp>
        ) : (
          <FadeInUp delay={0.5}>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] mb-4">
                Success! Your Download is Ready
              </h2>
              <p className="text-white/70 mb-8">
                We've sent the download link to your email. You can also download it directly using the button below.
              </p>

              {downloadUrl && (
                <Button
                  onClick={() => window.open(downloadUrl, '_blank')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-serif text-lg py-6 px-8 mb-6"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Again
                </Button>
              )}

              <div className="mt-8">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  Back to Home
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Trust Signals */}
        <FadeInUp delay={0.6}>
          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm">
              Join thousands of beauty enthusiasts who have downloaded our free resources
            </p>
          </div>
        </FadeInUp>
      </div>

      <Footer />
    </div>
  );
};

export default LeadMagnetDownload;
