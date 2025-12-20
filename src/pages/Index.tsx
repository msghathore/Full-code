// Comment out Supabase import to prevent initialization errors
// import { supabase } from '@/integrations/supabase/client';

// Import Supabase for actual data fetching
import { supabase } from '@/integrations/supabase/client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import VideoHero from '@/components/VideoHero';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { Footer } from '@/components/Footer';
import { MapPin, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { DynamicBackground } from '@/components/DynamicBackground';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import EmailService from '@/lib/email-service';

// Framer Motion animation variants for micro-interactions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8
    }
  }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

const titleVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(10px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const glowVariants = {
  initial: {
    boxShadow: "0 0 0 rgba(212, 175, 55, 0)"
  },
  hover: {
    boxShadow: "0 10px 40px rgba(212, 175, 55, 0.3)",
    transition: { duration: 0.3 }
  }
};

gsap.registerPlugin(ScrollTrigger);

// Newsletter form schema
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

// Form types
type NewsletterForm = z.infer<typeof newsletterSchema>;

interface IndexProps {
  showSecretDeals: boolean;
  setShowSecretDeals: (value: boolean) => void;
}

const Index = ({ showSecretDeals, setShowSecretDeals }: IndexProps) => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);

  // UseInView hooks for scroll-triggered animations
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });
  const shopInView = useInView(shopRef, { once: true, margin: "-100px" });
  const newsletterInView = useInView(newsletterRef, { once: true, margin: "-50px" });

  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      console.log(`🔍 DEBUG: Device detected as ${mobile ? 'mobile' : 'desktop'}`);
    };
    checkMobile();
  }, []);

  // Newsletter form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
    mode: 'onChange'
  });

  // Fetch real services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('name, category, image_url')
          .eq('is_active', true)
          .order('category');

        if (error) {
          console.error('Error fetching services:', error);
          // Fallback to empty array if no data
          setServices([]);
        } else if (data && data.length > 0) {
          // Filter out waxing services from homepage display (keep code for future use)
          const filteredData = data.filter(service => service.category.toLowerCase() !== 'waxing');

          // Group services by category and take first of each
          const categoryMap = new Map();
          filteredData.forEach(service => {
            if (!categoryMap.has(service.category)) {
              categoryMap.set(service.category, {
                name: service.category.toUpperCase(),
                image: service.image_url || `/images/${service.category.toLowerCase()}-service.jpg`,
                category: service.category
              });
            }
          });
          setServices(Array.from(categoryMap.values()));
        } else {
          // No services available, show "00" or empty state
          setServices([]);
        }
      } catch (error) {
        console.error('Supabase fetch failed, using empty array:', error);
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, price, image_url')
          .eq('is_active', true)
          .limit(6);

        if (error) {
          console.error('Error fetching products:', error);
          setProducts([]);
        } else if (data && data.length > 0) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Products fetch failed:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Separate useEffect for GSAP animations (runs after component mounts)
  useEffect(() => {
    // ANIMATIONS COMPLETELY DISABLED TO PREVENT BLUR ISSUES
    // All GSAP animations have been removed to ensure crisp, clear text and images
    // Only keeping simple CSS transitions for hover effects

    // Skip all animations
    if (isMobile) return;

    // No animations - everything appears instantly
    console.log('GSAP animations disabled for better readability');
  }, [isMobile]);

  const handleNewsletterSubmit = async (data: NewsletterForm) => {
    setIsNewsletterSubmitting(true);

    try {
      console.log('📧 Frontend form submission:', data.email);

      // Use centralized email service for newsletter
      const result = await EmailService.subscribeToNewsletter({
        email: data.email,
        source: 'website'
      });
      console.log('✅ Email service result:', result);

      if (result.success) {
        toast({
          title: "🎉 Welcome to ZAVIRA!",
          description: result.message || "Successfully subscribed to our newsletter!",
        });
        reset(); // Clear form on success
      } else {
        // Provide helpful error message
        const errorMessage = result.error?.includes('mandeepghathore0565@gmail.com')
          ? `Testing account limitation: Use mandeepghathore0565@gmail.com for testing. Your email: ${data.email}`
          : result.message || result.error || "Failed to subscribe. Please try again.";

        toast({
          title: "Newsletter Info",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Newsletter submission error:', error);
      toast({
        title: "Error",
        description: "Newsletter service temporarily unavailable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-black flex flex-col">
      <DynamicBackground />
      <VideoHero />

      {/* Main Content */}
      <main className="absolute top-[100vh] left-0 right-0 flex flex-col bg-black">

        {/* Services Preview Section - Mobile Responsive with Framer Motion */}
        <section ref={servicesRef} className="py-6 md:py-12 px-4 md:px-8 section-reveal" aria-labelledby="services-heading">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={servicesInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mb-8 origin-center"
          />
          <div className="container mx-auto">
            <motion.div
              initial="hidden"
              animate={servicesInView ? "visible" : "hidden"}
              variants={titleVariants}
              className="text-center mb-12 md:mb-16"
            >
              <h2 id="services-heading" className="section-title text-section-title text-6xl md:text-7xl lg:text-8xl mb-4">
                {t('ourServices')}
              </h2>
            </motion.div>

            {/* Static Service Categories - Responsive Grid with Stagger Animation */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate={servicesInView ? "visible" : "hidden"}
            >
              {[
                { name: 'Hair', image: '/images/hair-service.jpg', label: 'Hair Services', link: '/services?category=Hair' },
                { name: 'Massage', image: '/images/massage-service.jpg', label: 'Massage Services', link: '/services?category=Massage' },
                { name: 'Nails', image: '/images/nails-service.jpg', label: 'Nail Services', link: '/services?category=Nails' },
                { name: 'Piercing', image: '/images/piercing-service.jpg', label: 'Piercing Services', link: '/services?category=Piercing' },
                { name: 'Skin', image: '/images/skin-service.jpg', label: 'Skin Services', link: '/services?category=Skin' },
                { name: 'Tattoos', image: '/images/tattoo-service.jpg', label: 'Tattoo Services', link: '/services?category=Tattoos' }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="space-y-4"
                  variants={cardVariants}
                  whileHover="hover"
                  initial="initial"
                >
                  <Link
                    to={service.link}
                    className="shop-card block"
                  >
                    <motion.div
                      className="relative overflow-hidden rounded-3xl frosted-glass border border-white/10 shadow-lg shadow-white/5"
                      variants={glowVariants}
                      whileHover={{
                        scale: 1.03,
                        y: -8,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                      }}
                    >
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <motion.img
                          src={service.image}
                          alt={service.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 p-8 text-center"
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <h3 className="text-3xl md:text-4xl mb-2 font-bold text-white font-serif" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                            {service.name}
                          </h3>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                  <div className="text-center">
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button variant="outline" asChild className="rounded-full border-white/50 text-white hover:bg-white hover:text-black transition-colors px-8 py-2">
                        <Link to={service.link}>
                          View All {service.name} Services
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12 space-y-4 space-x-4"
              initial={{ opacity: 0, y: 30 }}
              animate={servicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.div
                className="inline-block"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="cta" asChild className="px-8 py-4 text-lg">
                  <Link to="/booking">
                    BOOK NOW
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                className="inline-block"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="outline" asChild>
                  <Link to="/services">
                    {t('viewAllServices')}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Shop Our Products Section with Framer Motion */}
        <section ref={shopRef} className="py-6 md:py-12 px-4 md:px-8 section-reveal" aria-labelledby="shop-heading">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={shopInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mb-8 origin-center"
          />
          <div className="container mx-auto">
            <motion.div
              initial="hidden"
              animate={shopInView ? "visible" : "hidden"}
              variants={titleVariants}
              className="text-center mb-16"
            >
              <h2 id="shop-heading" className="section-title text-section-title text-5xl md:text-5xl lg:text-6xl mb-4">
                {t('shopOurProducts')}
              </h2>
            </motion.div>
            {/* Static Product Categories - Responsive Grid with Stagger Animation */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate={shopInView ? "visible" : "hidden"}
            >
              {[
                { name: 'Hair Products', image: '/images/product-1.jpg', label: 'Shampoos and Conditioners', link: '/shop?category=Hair' },
                { name: 'Nail Products', image: '/images/product-2.jpg', label: 'Nail Care', link: '/shop?category=Nail' },
                { name: 'Skin Products', image: '/images/product-3.jpg', label: 'Skin Care Products', link: '/shop?category=Skin' },
                { name: 'Body Care', image: '/images/product-4.jpg', label: 'Body Care', link: '/shop?category=Body' }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  className="space-y-4"
                  variants={cardVariants}
                  whileHover="hover"
                  initial="initial"
                >
                  <Link
                    to={category.link}
                    className="shop-card block"
                  >
                    <motion.div
                      className="relative overflow-hidden rounded-3xl frosted-glass border border-white/10 shadow-lg shadow-white/5"
                      variants={glowVariants}
                      whileHover={{
                        scale: 1.03,
                        y: -8,
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                      }}
                    >
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <motion.img
                          src={category.image}
                          alt={category.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 p-8 text-center"
                          whileHover={{ y: -5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <h3 className="text-3xl md:text-4xl mb-2 font-bold text-white font-serif" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                            {category.label}
                          </h3>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                  <div className="text-center">
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button variant="outline" asChild className="rounded-full border-white/50 text-white hover:bg-white hover:text-black transition-colors px-8 py-2">
                        <Link to={category.link}>
                          View All {category.name}
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={shopInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.div
                className="inline-block"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button variant="outline" asChild>
                  <Link to="/shop">
                    {t('viewAllProducts')}
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <ReviewsCarousel />


        {/* Newsletter Subscription Section with Framer Motion */}
        <section ref={newsletterRef} className="py-6 md:py-12 px-4 md:px-8 bg-gradient-to-b from-black via-gray-900/50 to-black" aria-labelledby="newsletter-heading">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={newsletterInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mb-8 origin-center"
          />
          <div className="container mx-auto max-w-4xl">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={newsletterInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                className="relative overflow-hidden rounded-[20px] frosted-glass border border-white/10 mx-auto max-w-lg"
                whileHover={{
                  boxShadow: "0 20px 60px rgba(212, 175, 55, 0.2)",
                  borderColor: "rgba(212, 175, 55, 0.3)",
                  transition: { duration: 0.4 }
                }}
              >
                <div className="p-8 md:p-12">
                  <motion.h2
                    id="newsletter-heading"
                    className="text-4xl md:text-5xl mb-6 luxury-glow font-serif"
                    initial={{ opacity: 0, y: 20 }}
                    animate={newsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    Stay Informed
                  </motion.h2>

                  <form
                    onSubmit={handleSubmit(handleNewsletterSubmit)}
                    className="space-y-6"
                    role="form"
                    aria-labelledby="newsletter-heading"
                    noValidate
                  >
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={newsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter subscription</label>
                      <Input
                        {...register('email')}
                        id="newsletter-email"
                        type="email"
                        placeholder="Enter your email address"
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg py-6 rounded-full backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all duration-300 ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                        aria-describedby={errors.email ? 'newsletter-email-error newsletter-description' : 'newsletter-description'}
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            id="newsletter-email-error"
                            className="text-red-400 text-sm mt-2 text-center"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={newsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        variant="cta"
                        className="w-full py-6 text-lg font-serif tracking-wider rounded-full shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Subscribe to newsletter"
                        disabled={isNewsletterSubmitting}
                      >
                        {isNewsletterSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                      </Button>
                    </motion.div>
                  </form>

                  <motion.p
                    id="newsletter-description"
                    className="text-white/60 mt-6 text-sm"
                    initial={{ opacity: 0 }}
                    animate={newsletterInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    Stay updated with our latest offers and beauty tips. Unsubscribe anytime.
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Index;
