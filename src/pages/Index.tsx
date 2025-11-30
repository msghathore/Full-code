// Comment out Supabase import to prevent initialization errors
// import { supabase } from '@/integrations/supabase/client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VideoHero } from '@/components/VideoHero';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { SocialProof } from '@/components/SocialProof';
import { Footer } from '@/components/Footer';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { DynamicBackground } from '@/components/DynamicBackground';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import EmailService from '@/lib/email-service';

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
  const blogRef = useRef<HTMLDivElement>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 36, minutes: 0, seconds: 0 });
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const { t } = useLanguage();
  const { toast } = useToast();

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

  // Separate useEffect for timers (runs on mount)
  useEffect(() => {
    console.log('🔍 DEBUG: Setting up secret deals popup timers');

    // Lightweight countdown timer for secret deals - updates every second
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Timer expired
          clearInterval(countdownInterval);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours, minutes, seconds };
      });
    }, 1000); // Update every second

    // Show secret deals popup after 30 seconds (less intrusive)
    const popupTimer = setTimeout(() => {
      console.log('🔍 DEBUG: Showing secret deals popup');
      setShowSecretDeals(true);
    }, 30000);

    return () => {
      clearTimeout(popupTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  // Use hardcoded services instead of Supabase to prevent initialization errors
  useEffect(() => {
    // Set default services immediately to prevent loading state
    setServices([
      {
        name: 'HAIR',
        image: '/images/hair-service.jpg',
        category: 'Hair'
      },
      {
        name: 'NAILS',
        image: '/images/nails-service.jpg',
        category: 'Nails'
      },
      {
        name: 'SKIN',
        image: '/images/skin-service.jpg',
        category: 'Skin'
      },
      {
        name: 'MASSAGE',
        image: '/images/massage-service.jpg',
        category: 'Massage'
      },
      {
        name: 'TATTOO',
        image: '/images/tattoo-service.jpg',
        category: 'Tattoo'
      },
      {
        name: 'PIERCING',
        image: '/images/piercing-service.jpg',
        category: 'Piercing'
      }
    ]);
    setServicesLoading(false);
    
    // TODO: Re-enable Supabase fetching after environment setup
    // const fetchServices = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('services')
    //       .select('*')
    //       .eq('is_active', true)
    //       .order('category');
    //     // ... rest of fetch logic
    //   } catch (error) {
    //     console.error('Supabase fetch failed, using fallback:', error);
    //   }
    // };
    // fetchServices();
  }, []);

  // Separate useEffect for GSAP animations (runs after component mounts)
  useEffect(() => {
    try {
      // Luxury section titles animation - Enhanced with morphing and advanced effects
      const sectionTitles = document.querySelectorAll('.section-title');
      sectionTitles.forEach((title, index) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            end: 'bottom 10%',
            scrub: 1,
            toggleActions: 'play none none reverse'
          }
        });

        tl.fromTo(title,
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
            textShadow: '0 0 0px rgba(255,255,255,0)',
            filter: 'blur(5px)',
            letterSpacing: '0.5em'
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)',
            filter: 'blur(0px)',
            letterSpacing: '0.1em',
            duration: 1.2,
            delay: index * 0.3,
            ease: 'elastic.out(1, 0.5)',
            onComplete: () => {
              // Add continuous glow pulsing
              gsap.to(title, {
                textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.6)',
                duration: 2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: 1
              });
            }
          }
        );

        // Add letter-by-letter reveal effect
        const letters = title.textContent?.split('') || [];
        letters.forEach((letter, i) => {
          if (letter !== ' ') {
            tl.fromTo(title,
              { textShadow: '0 0 0px rgba(255,255,255,0)' },
              {
                textShadow: '0 0 20px rgba(255,255,255,0.6)',
                duration: 0.1,
                delay: i * 0.05
              },
              `-=${1.2 - index * 0.3}`
            );
          }
        });
      });

      // Premium buttons animation
      const buttons = document.querySelectorAll('.animate-button');
      buttons.forEach((button, index) => {
        gsap.fromTo(button,
          {
            opacity: 0,
            scale: 0.7,
            y: 40,
            filter: 'blur(5px)'
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            delay: index * 0.15,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: button,
              start: 'top 85%',
              end: 'bottom 5%',
              scrub: 1,
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Enhanced text elements animation
      const textElements = document.querySelectorAll('.text-body, .text-caption-enhanced, p, .text-muted-foreground');
      textElements.forEach((element, index) => {
        gsap.fromTo(element,
          {
            opacity: 0,
            x: -30,
            filter: 'blur(3px)'
          },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 85%',
              end: 'bottom 5%',
              scrub: 1,
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Newsletter section animations
      const newsletterSection = document.querySelector('.py-24.px-4.md\\:px-8.bg-gradient-to-b.from-black.via-gray-900\\/50.to-black');
      if (newsletterSection) {
        gsap.fromTo(newsletterSection.querySelector('h2'),
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
            textShadow: '0 0 0px rgba(255,255,255,0)'
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: newsletterSection,
              start: 'top 80%',
              end: 'bottom 10%',
              scrub: 1,
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.fromTo(newsletterSection.querySelector('p'),
          {
            opacity: 0,
            y: 40,
            filter: 'blur(3px)'
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: newsletterSection,
              start: 'top 85%',
              end: 'bottom 5%',
              scrub: 1,
              toggleActions: 'play none none reverse'
            }
          }
        );

        gsap.fromTo(newsletterSection.querySelector('form'),
          {
            opacity: 0,
            scale: 0.8,
            y: 30,
            filter: 'blur(5px)'
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: newsletterSection,
              start: 'top 85%',
              end: 'bottom 5%',
              scrub: 1,
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Shop cards animation
      const shopCards = shopRef.current?.querySelectorAll('.shop-card');
      if (shopCards) {
        gsap.fromTo(
          shopCards,
          {
            opacity: 0,
            y: 80,
            scale: 0.85,
            rotationY: -15,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            filter: 'blur(0px)',
            duration: 1.5,
            stagger: 0.2,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: shopRef.current,
              start: 'top 75%',
              end: 'bottom 15%',
              scrub: 1,
              toggleActions: 'play none none reverse'
            },
          }
        );
      }

      // Blog cards animation
      const blogCards = blogRef.current?.querySelectorAll('.blog-card');
      if (blogCards) {
        gsap.fromTo(
          blogCards,
          {
            opacity: 0,
            y: 80,
            scale: 0.85,
            rotationY: -15,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            filter: 'blur(0px)',
            duration: 1.5,
            stagger: 0.2,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: blogRef.current,
              start: 'top 75%',
              end: 'bottom 15%',
              scrub: 1,
              toggleActions: 'play none none reverse'
            },
          }
        );
      }

      // Luxury image hover effects
      const images = document.querySelectorAll('.service-card img, .group img');
      images.forEach((img) => {
        gsap.set(img, { filter: 'brightness(1.1) contrast(1.05)' });
      });
    } catch (error) {
      console.error('Error in Index animations:', error);
    }
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSecretDealsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store in a simple table or just log for now
      // You might want to create a secret_deals table in Supabase
      console.log('Secret deals signup:', phoneNumber);

      toast({
        title: "🎉 Exclusive Access Granted!",
        description: "You'll receive our secret deals via SMS soon!",
      });

      setShowSecretDeals(false);
      setPhoneNumber('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <main className="absolute top-[100vh] left-0 right-0 flex flex-col">
        {/* Services Preview Section - Mobile Responsive */}
        <section ref={servicesRef} className="pt-6 md:pt-12 pb-8 md:pb-16 px-4 md:px-8" aria-labelledby="services-heading">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mb-8"></div>
          <div className="container mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 id="services-heading" className="section-title text-section-title text-6xl md:text-7xl lg:text-8xl mb-4">
                {t('ourServices')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicesLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="service-card group cursor-hover animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className="relative overflow-hidden rounded-[10%] frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-white/20 hover:z-10" style={{ transformStyle: 'preserve-3d' }}>
                      <div className="h-[28rem] overflow-hidden relative">
                        <div className="w-full h-full bg-white/10 animate-pulse rounded-[10%]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center">
                          <div className="h-8 bg-white/20 rounded mb-2 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                services.map((service, index) => (
                <Link
                  key={service.name}
                  to="/services"
                  className={`service-card group cursor-hover ${
                    index % 3 === 0 ? 'animate-float' :
                    index % 3 === 1 ? 'animate-float-delayed' :
                    'animate-float-slow'
                  }`}
                >
                  <div className="relative overflow-hidden rounded-[10%] frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-white/20 hover:z-10" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="h-[28rem] overflow-hidden relative">
                      <img
                        src={service.image}
                        alt={service.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-125 group-hover:contrast-110"
                        style={{
                          filter: 'brightness(1.2)',
                          borderRadius: '10%'
                        }}
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.4)',
                          border: '2px solid rgba(255,255,255,0.5)',
                          borderRadius: '10%'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <h3 className="text-card-title text-8xl font-bold text-center">
                          {service.category}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
                ))
              )}
            </div>

            <div className="text-center mt-12 space-y-4">
              <Button variant="cta" asChild className="animate-button hover:scale-105 transition-transform duration-300 px-8 py-4 text-lg">
                <Link to="/booking">
                  BOOK NOW
                </Link>
              </Button>
              <Button variant="outline" asChild className="animate-button hover:scale-105 transition-transform duration-300">
                <Link to="/services">
                  {t('viewAllServices')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Shop Our Products Section */}
        <section ref={shopRef} className="py-12 px-4 md:px-8" aria-labelledby="shop-heading">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mb-8"></div>
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 id="shop-heading" className="section-title text-section-title text-4xl md:text-5xl lg:text-6xl mb-4">
                {t('shopOurProducts')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { id: 1, name: t('luxuryHairSerum'), category: t('hairCare'), price: 89, image: '/images/product-1.jpg' },
                { id: 2, name: t('premiumFaceCream'), category: t('skinCare'), price: 120, image: '/images/product-2.jpg' },
                { id: 3, name: t('nailPolishSet'), category: t('nailCareCategory'), price: 45, image: '/images/product-3.jpg' },
                { id: 4, name: t('hydratingShampoo'), category: t('hairCare'), price: 65, image: '/images/product-4.jpg' },
                { id: 5, name: t('antiAgingSerum'), category: t('skinCare'), price: 150, image: '/images/product-5.jpg' },
                { id: 6, name: t('makeupBrushSet'), category: t('makeup'), price: 95, image: '/images/product-6.jpg' },
              ].map((product) => (
                <Link
                  key={product.id}
                  to="/shop"
                  className="shop-card group cursor-hover"
                >
                  <div className="relative overflow-hidden rounded-[10%] frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-110 hover:shadow-2xl hover:shadow-white/20 hover:z-10" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-125 group-hover:contrast-110"
                        style={{
                          filter: 'brightness(1.2)',
                          borderRadius: '10%'
                        }}
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.4)',
                          border: '2px solid rgba(255,255,255,0.5)',
                          borderRadius: '10%'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center">
                        <p className="text-caption-enhanced text-white/90 mb-2 font-bold">{product.category}</p>
                        <h3 className="text-card-title text-3xl md:text-4xl mb-2 font-bold">
                          {product.name}
                        </h3>
                        <p className="text-body text-white font-bold">${product.price}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" asChild className="animate-button hover:scale-105 transition-transform duration-300">
                <Link to="/shop">
                  {t('viewAllProducts')}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <ReviewsCarousel />

        <SocialProof />

        {/* Top Stories Section */}
        <section ref={blogRef} className="py-12 px-4 md:px-8" aria-labelledby="blog-heading">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mb-8"></div>
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 id="blog-heading" className="section-title text-section-title text-4xl md:text-5xl lg:text-6xl mb-4">
                Top Stories
              </h2>
            </div>

            <div className="flex overflow-hidden">
              {[
                {
                  id: 1,
                  title: "Summer Hair Care Tips",
                  desc: "Keep your hair healthy and vibrant during the hot summer months with these expert tips.",
                  image: "/images/blog-1.jpg"
                },
                {
                  id: 2,
                  title: "The Art of Skincare",
                  desc: "Discover the secrets to radiant, glowing skin with our comprehensive skincare guide.",
                  image: "/images/blog-2.jpg"
                },
                {
                  id: 3,
                  title: "Nail Trends 2024",
                  desc: "Stay ahead of the curve with the latest nail art and color trends for the new year.",
                  image: "/images/blog-3.jpg"
                },
                {
                  id: 4,
                  title: "Massage Therapy Benefits",
                  desc: "Why regular massages are essential for your well-being and relaxation.",
                  image: "/images/blog-4.jpg"
                }
              ].map((blog, index) => (
                <div key={index} className="blog-card flex-1 min-w-0 transition-all duration-700 ease-out hover:flex-grow-[2] group cursor-hover">
                  <div className="relative overflow-hidden rounded-[10%] frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-125 group-hover:contrast-110"
                        style={{
                          filter: 'brightness(1.2)',
                          borderRadius: '10%'
                        }}
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.4)',
                          border: '2px solid rgba(255,255,255,0.5)',
                          borderRadius: '10%'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center">
                        <h3 className="text-card-title text-2xl md:text-3xl mb-2 font-bold">
                          {blog.title}
                        </h3>
                        <p className="text-body text-white/90 mb-4">
                          {blog.desc}
                        </p>
                        <Button asChild className="bg-white text-black hover:bg-gray-200 transition-colors duration-300">
                          <Link to={`/blog/${blog.id}`}>
                            READ MORE
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Subscription Section */}
        <section className="py-12 px-4 md:px-8 bg-gradient-to-b from-black via-gray-900/50 to-black" aria-labelledby="newsletter-heading">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mb-8"></div>
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <div className="relative overflow-hidden rounded-[20px] frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-white/20 hover:z-10 mx-auto max-w-lg" style={{ transformStyle: 'preserve-3d' }}>
                <div className="p-8 md:p-12">
                  <h2 id="newsletter-heading" className="section-title text-section-title text-4xl md:text-5xl lg:text-6xl mb-6 luxury-glow">
                    Stay Informed
                  </h2>

                  <form
                    onSubmit={handleSubmit(handleNewsletterSubmit)}
                    className="space-y-6"
                    role="form"
                    aria-labelledby="newsletter-heading"
                    noValidate
                  >
                    <div className="relative">
                      <label htmlFor="newsletter-email" className="sr-only">Email address for newsletter subscription</label>
                      <Input
                        {...register('email')}
                        id="newsletter-email"
                        type="email"
                        placeholder="Enter your email address"
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg py-6 rounded-full backdrop-blur-sm focus:bg-white/15 focus:border-white/30 transition-all duration-300 ${
                          errors.email ? 'border-red-400 focus:border-red-400' : ''
                        }`}
                        aria-describedby={errors.email ? 'newsletter-email-error newsletter-description' : 'newsletter-description'}
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                      {errors.email && (
                        <p id="newsletter-email-error" className="text-red-400 text-sm mt-2 text-center">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="cta"
                      className="w-full py-6 text-lg font-serif tracking-wider rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Subscribe to newsletter"
                      disabled={isNewsletterSubmitting}
                    >
                      {isNewsletterSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                    </Button>
                  </form>

                  <p id="newsletter-description" className="text-caption-enhanced text-white/60 mt-6 text-sm">
                    Join 10,000+ beauty enthusiasts. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
     </main>

      {/* Secret Deals Popup */}
      <Dialog open={showSecretDeals} onOpenChange={setShowSecretDeals}>
        {/* Custom Backdrop with Heavy Blur */}
        {showSecretDeals && (
          <div className="fixed inset-0 z-[1100] bg-black/60" />
        )}
        <DialogContent className="frosted-glass border-white/20 w-[90vw] mx-auto mt-20 z-[1200] shadow-2xl shadow-white/20">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl md:text-4xl font-serif font-light text-white mb-4 text-center w-full">
              SECRET DEALS
            </DialogTitle>
            <div className="text-white/80 text-base leading-relaxed text-center">
              Join our exclusive VIP list and unlock <span className="font-bold">50% OFF</span> on premium services,
              <span className="font-bold"> free upgrades</span>, and <span className="font-bold">early access</span> to new treatments.
              <br /><br />
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm text-white/60">Offer expires in:</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-2xl md:text-3xl font-mono font-bold">
                <span className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-white/60 px-1">:</span>
                <span className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-white/60 px-1">:</span>
                <span className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/20">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSecretDealsSubmit} className="space-y-6 mt-6">
            <div className="text-center">
              <label className="text-sm text-white/70 mb-3 block tracking-wider">YOUR PHONE NUMBER</label>
              <Input
                type="text"
                inputMode="tel"
                pattern="[0-9\-\+\(\)\s]+"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="+1 (555) 000-0000"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/30 text-center text-lg py-4 caret-transparent mx-auto max-w-xs"
                required
              />
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSecretDeals(false)}
                className="px-6 py-3"
                disabled={isSubmitting}
              >
                Maybe Later
              </Button>
              <Button
                type="submit"
                variant="cta"
                className="px-6 py-3 font-serif text-base tracking-wider font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'JOINING...' : 'CLAIM DEALS'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
