import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, Star, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { scrollIntoViewFast } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

gsap.registerPlugin(ScrollTrigger);

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15
    }
  }
};

const categoryVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Testimonials data
const testimonials = [
  {
    name: 'Sarah M.',
    service: 'Hair Color Treatment',
    rating: 5,
    quote: 'Absolutely amazing experience! The color came out exactly as I envisioned.',
    image: '/images/client-2.jpg'
  },
  {
    name: 'Emily R.',
    service: 'Deep Tissue Massage',
    rating: 5,
    quote: 'Best massage I\'ve ever had. The therapist knew exactly where my tension was.',
    image: '/images/client-4.jpg'
  },
  {
    name: 'Jessica L.',
    service: 'Nail Art',
    rating: 5,
    quote: 'The attention to detail is incredible. I always get compliments on my nails!',
    image: '/images/client-2.jpg'
  }
];

const Services = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    fetchServices();
  }, []);

  // Scroll to hash section when data is loaded
  useEffect(() => {
    if (!loading && location.hash) {
      const hash = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          scrollIntoViewFast(element, 400, 150);
        }
      }, 300);
    }
  }, [loading, location.hash]);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    if (!error && data) {
      setDbServices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (servicesRef.current) {
      const categories = servicesRef.current.querySelectorAll('.service-category');

      categories.forEach((category) => {
        gsap.fromTo(
          category,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: category,
              start: 'top 80%',
            }
          }
        );
      });
    }
  }, [dbServices]);

  // Get unique categories
  const categories = ['ALL', ...new Set(dbServices.map((s: any) => s.category))];

  // Organize services by parent-child relationship
  const organizeServices = (services: any[]) => {
    const parentServices = services.filter(s => s.is_parent || !s.parent_service_id);
    const childServices = services.filter(s => s.parent_service_id && !s.is_parent);

    return parentServices.map(parent => ({
      ...parent,
      variants: childServices.filter(child => child.parent_service_id === parent.id)
    }));
  };

  // Group services by category with parent-child structure
  const groupedServices = dbServices.reduce((acc: any, service: any) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    // Only add parent services and standalone services (not child variants)
    if (service.is_parent || !service.parent_service_id) {
      acc[service.category].push(service);
    }
    return acc;
  }, {});

  // Attach variants to parent services
  Object.keys(groupedServices).forEach(category => {
    groupedServices[category] = organizeServices([
      ...groupedServices[category],
      ...dbServices.filter(s => s.category === category && s.parent_service_id)
    ]);
  });

  // Filter services based on search and active category
  const filteredServices = Object.keys(groupedServices).reduce((acc: any, category: string) => {
    if (activeCategory !== 'ALL' && category !== activeCategory) {
      return acc;
    }

    const filtered = groupedServices[category].filter((service: any) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    if (category !== 'ALL') {
      setTimeout(() => {
        const element = document.getElementById(category.toLowerCase());
        if (element) {
          scrollIntoViewFast(element, 400, 150);
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-6">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div
            className="text-center pt-6 md:pt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif luxury-glow">
              {t('servicesTitle') || 'OUR SERVICES'}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Sticky Category Tabs - Full Width */}
      <div className="sticky top-14 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 md:gap-2.5 py-2.5 sm:py-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-6">
        {/* Search Bar - Responsive Width */}
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Input
              id="service-search"
              name="service-search"
              type="text"
              autoComplete="off"
              placeholder={t('searchServicesPlaceholder') || 'Search services...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 pl-9 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base rounded-full"
            />
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Services List */}
        <div ref={servicesRef} className="space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, categoryIndex) => (
              <div key={categoryIndex} className="service-category">
                <Skeleton className="h-8 w-32 mb-3 bg-white/10" />
                <div className="grid gap-2">
                  {Array.from({ length: 3 }).map((_, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Skeleton className="w-14 h-14 rounded-lg bg-white/10" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-40 mb-1.5 bg-white/10" />
                        <Skeleton className="h-3 w-20 bg-white/10" />
                      </div>
                      <Skeleton className="h-7 w-14 bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : Object.keys(filteredServices).length > 0 ? (
            Object.keys(filteredServices).map((category) => (
              <motion.div
                key={category}
                id={category.toLowerCase()}
                className="service-category scroll-mt-32"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={categoryVariants}
              >
                <h2 className="text-xl md:text-2xl font-serif mb-3 pb-2 border-b border-white/10 luxury-glow">
                  {category.toUpperCase()}
                </h2>

                <motion.div
                  className="grid gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                >
                  {filteredServices[category].map((item: any) => (
                    <div key={item.id}>
                      {/* Parent Service or Standalone Service */}
                      <motion.div
                        className={`group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg transition-all duration-300 ${item.is_parent ? 'mb-2' : ''}`}
                        variants={itemVariants}
                      >
                        {/* Service Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-serif group-hover:luxury-glow transition-all truncate">
                            {item.name}
                          </h3>
                          {item.description && !item.is_parent && (
                            <p className="text-xs text-white/50 line-clamp-1">{item.description}</p>
                          )}
                          {!item.is_parent && (
                            <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.duration_minutes} {t('minutes') || 'min'}
                              </span>
                            </div>
                          )}
                          {item.is_parent && item.variants && item.variants.length > 0 && (
                            <p className="text-xs text-white/50 mt-0.5">
                              {item.variants.length} {item.variants.length === 1 ? 'option' : 'options'} available
                            </p>
                          )}
                        </div>

                        {/* Price & Actions */}
                        {!item.is_parent && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-lg md:text-xl luxury-glow transition-all">
                              ${item.price}
                            </div>
                            <Button
                              onClick={() => navigate(`/booking?service=${item.id}`)}
                              size="sm"
                              className="h-8 bg-white text-black hover:bg-white/90 font-medium px-3 text-xs"
                            >
                              <span className="hidden sm:inline">{t('bookNow') || 'Book'}</span>
                              <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
                            </Button>
                          </div>
                        )}
                      </motion.div>

                      {/* Variants (if this is a parent service) */}
                      {item.is_parent && item.variants && item.variants.length > 0 && (
                        <div className="ml-8 md:ml-12 space-y-2 mb-3">
                          {item.variants.map((variant: any) => (
                            <motion.div
                              key={variant.id}
                              className="group flex items-center gap-3 p-2.5 bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-lg transition-all duration-300"
                              variants={itemVariants}
                            >
                              {/* Variant Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium group-hover:text-white/90 transition-all">
                                  {variant.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {variant.duration_minutes} min
                                  </span>
                                </div>
                              </div>

                              {/* Variant Price & Actions */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-base md:text-lg luxury-glow transition-all">
                                  ${variant.price}
                                </div>
                                <Button
                                  onClick={() => navigate(`/booking?service=${variant.id}`)}
                                  size="sm"
                                  className="h-7 bg-white/90 text-black hover:bg-white font-medium px-2.5 text-xs"
                                >
                                  <span className="hidden sm:inline">Book</span>
                                  <ChevronRight className="h-3 w-3 sm:ml-1" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-white/60 py-8">
              <p className="text-base">{t('noServicesFound', { query: searchQuery }) || `No services found matching "${searchQuery}"`}</p>
              <p className="text-sm mt-1">{t('tryDifferentSearch') || 'Try a different search term'}</p>
            </div>
          )}
        </div>

        {/* Testimonials Section */}
        {!searchQuery && (
          <motion.section
            className="mt-10 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-5">
              <h2 className="text-xl md:text-2xl font-serif luxury-glow mb-1">What Our Clients Say</h2>
              <p className="text-white/50 text-xs">Real experiences from real customers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-white text-sm">{testimonial.name}</p>
                      <p className="text-[10px] text-white/50">{testimonial.service}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs italic leading-relaxed">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA Section */}
        <motion.section
          className="text-center py-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl md:text-2xl font-serif luxury-glow mb-2">Ready to Transform?</h2>
          <p className="text-white/60 text-sm mb-4 max-w-sm mx-auto">
            Book your appointment today and experience the Zavira difference
          </p>
          <Button
            onClick={() => navigate('/booking')}
            className="bg-white text-black hover:bg-white/90 font-serif tracking-wider px-6 py-2.5 luxury-button-hover"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Your Appointment
          </Button>
        </motion.section>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-black/95 backdrop-blur-lg border-t border-white/10 md:hidden z-50">
        <Button
          onClick={() => navigate('/booking')}
          className="w-full bg-white text-black hover:bg-white/90 font-serif tracking-wider py-2.5"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {t('bookNow') || 'Book Now'}
        </Button>
      </div>

      <div className="pb-16 md:pb-0">
        <Footer />
      </div>
    </div>
  );
};

export default Services;
