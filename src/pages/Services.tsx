import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Search, Calendar, Eye, Star, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImageComparisonSlider } from '@/components/ImageComparisonSlider';
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

// Popular/featured service names
const popularServiceNames = ['Haircut', 'Massage', 'Facial', 'Manicure', 'Color'];

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
      .eq('is_active', true);

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

  // Group services by category
  const groupedServices = dbServices.reduce((acc: any, service: any) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

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

  // Get featured/popular services
  const featuredServices = dbServices.filter((s: any) =>
    popularServiceNames.some(name => s.name.toLowerCase().includes(name.toLowerCase()))
  ).slice(0, 4);

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

  const isPopularService = (name: string) => {
    return popularServiceNames.some(popular => name.toLowerCase().includes(popular.toLowerCase()));
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/services-menu.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)'
          }}
        />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            className="text-center pt-6 md:pt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-3 luxury-glow">
              {t('servicesTitle') || 'OUR SERVICES'}
            </h1>
            <p className="text-white/70 text-sm md:text-base tracking-wider max-w-xl mx-auto mb-4">
              {t('servicesSubtitle') || 'Indulge in our curated selection of luxury treatments'}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {dbServices.length}+ Services
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                5.0 Rating
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Open Daily
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Category Tabs */}
      <div className="sticky top-14 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-white text-black'
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
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Input
              id="service-search"
              name="service-search"
              type="text"
              autoComplete="off"
              placeholder={t('searchServicesPlaceholder') || 'Search services...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 pl-9 py-2.5 text-sm rounded-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
          </div>
        </div>

        {/* Featured Services Section */}
        {!searchQuery && activeCategory === 'ALL' && featuredServices.length > 0 && (
          <motion.section
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <h2 className="text-lg font-serif luxury-glow">Popular Services</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {featuredServices.map((service: any) => (
                <motion.div
                  key={service.id}
                  className="group relative rounded-lg overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/booking?service=${service.id}`)}
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={`/images/${service.category.toLowerCase()}-service.jpg`}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-1.5 right-1.5 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                      POPULAR
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <h3 className="text-white font-medium text-xs mb-0.5 group-hover:luxury-glow transition-all line-clamp-1">
                      {service.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-[10px]">{service.duration_minutes} min</span>
                      <span className="text-white font-serif text-sm">${service.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

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
                    <motion.div
                      key={item.id}
                      className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg transition-all duration-300"
                      variants={itemVariants}
                    >
                      {/* Service Image */}
                      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`/images/${item.category.toLowerCase()}-service.jpg`}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {isPopularService(item.name) && (
                          <div className="absolute top-0.5 left-0.5 bg-yellow-500 text-black text-[8px] font-bold px-1 py-0.5 rounded">
                            HOT
                          </div>
                        )}
                      </div>

                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-serif group-hover:luxury-glow transition-all truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration_minutes} {t('minutes') || 'min'}
                          </span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-lg md:text-xl font-serif group-hover:luxury-glow transition-all">
                          ${item.price}
                        </div>
                        <div className="flex gap-1.5">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hidden md:flex h-8 w-8 p-0 border border-white/20 text-white hover:bg-white/10"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl w-[95vw] bg-black/95 border-white/20">
                              <div className="space-y-4 p-2">
                                <div className="text-center">
                                  <h3 className="text-xl font-serif luxury-glow mb-1">{item.name}</h3>
                                  <p className="text-white/70 text-sm">{item.description || t('seeTransformation') || 'Experience luxury treatment'}</p>
                                </div>
                                <ImageComparisonSlider
                                  beforeImage={`/images/${item.category.toLowerCase()}-service.jpg`}
                                  afterImage={`/images/${item.category.toLowerCase()}-service.jpg`}
                                  beforeLabel={t('beforeTreatment') || 'Before'}
                                  afterLabel={t('afterTreatment') || 'After'}
                                  className="w-full h-48 md:h-56"
                                />
                                <div className="flex justify-center">
                                  <Button
                                    onClick={() => navigate(`/booking?service=${item.id}`)}
                                    className="bg-white text-black hover:bg-white/90 font-serif tracking-wider px-6 luxury-button-hover"
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {t('bookThisService') || 'Book This Service'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            onClick={() => navigate(`/booking?service=${item.id}`)}
                            size="sm"
                            className="h-8 bg-white text-black hover:bg-white/90 font-medium px-3 text-xs"
                          >
                            <span className="hidden sm:inline">{t('bookNow') || 'Book'}</span>
                            <ChevronRight className="h-3.5 w-3.5 sm:ml-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
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
