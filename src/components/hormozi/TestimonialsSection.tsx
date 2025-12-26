import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  service_category: string | null;
  rating: number;
  testimonial_text: string;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
}

const titleVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
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

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-play carousel
  useEffect(() => {
    if (featuredTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredTestimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [featuredTestimonials.length]);

  // Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching testimonials:', error);
          setTestimonials([]);
          setFeaturedTestimonials([]);
        } else if (data && data.length > 0) {
          setTestimonials(data);
          // Get featured testimonials for carousel
          const featured = data.filter(t => t.is_featured);
          setFeaturedTestimonials(featured.length > 0 ? featured : data.slice(0, 3));
        } else {
          setTestimonials([]);
          setFeaturedTestimonials([]);
        }
      } catch (error) {
        console.error('Testimonials fetch failed:', error);
        setTestimonials([]);
        setFeaturedTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 justify-center mb-4" aria-label={`${rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating
                ? 'fill-emerald-500 text-emerald-500'
                : 'fill-slate-700 text-slate-700'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredTestimonials.length) % featuredTestimonials.length);
  };

  if (loading) {
    return (
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="container mx-auto text-center">
          <div className="text-white/60 text-lg">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't show section if no testimonials
  }

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-20 px-4 md:px-8 bg-black"
      aria-labelledby="testimonials-heading"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={sectionInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-12 origin-center"
      />

      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          variants={titleVariants}
          className="text-center mb-16"
        >
          <h2
            id="testimonials-heading"
            className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4"
            style={{
              color: 'white',
              textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)'
            }}
          >
            What Our Clients Say
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Real experiences from real customers who trust Zavira for their beauty needs
          </p>
        </motion.div>

        {/* Featured Testimonials Carousel */}
        {featuredTestimonials.length > 0 && (
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="relative">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-3xl">
                <motion.div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {featuredTestimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="min-w-full px-4"
                    >
                      <motion.div
                        className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12"
                        whileHover={{
                          boxShadow: "0 20px 60px rgba(16, 185, 129, 0.2)",
                          borderColor: "rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        <div className="flex flex-col items-center text-center">
                          {/* Customer Photo */}
                          <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-emerald-500/30">
                            <img
                              src={testimonial.customer_photo_url || 'https://i.pravatar.cc/150?img=1'}
                              alt={testimonial.customer_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Stars */}
                          {renderStars(testimonial.rating)}

                          {/* Testimonial Text */}
                          <blockquote className="text-lg md:text-xl text-white/90 mb-6 italic leading-relaxed">
                            "{testimonial.testimonial_text}"
                          </blockquote>

                          {/* Customer Name & Verified Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-serif text-xl text-white font-semibold">
                              {testimonial.customer_name}
                            </p>
                            {testimonial.is_verified && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-label="Verified Customer" />
                            )}
                          </div>

                          {/* Service Badge */}
                          {testimonial.service_category && (
                            <span className="inline-block px-4 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm rounded-full">
                              {testimonial.service_category}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Navigation Buttons */}
              {featuredTestimonials.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white p-3 rounded-full transition-all hover:scale-110"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-white p-3 rounded-full transition-all hover:scale-110"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {featuredTestimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {featuredTestimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'bg-emerald-500 w-8'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
        >
          {testimonials.slice(0, 9).map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              className="bg-gradient-to-br from-slate-900/70 to-slate-950/70 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-emerald-500/30">
                  <img
                    src={testimonial.customer_photo_url || 'https://i.pravatar.cc/150?img=1'}
                    alt={testimonial.customer_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate">
                      {testimonial.customer_name}
                    </p>
                    {testimonial.is_verified && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-label="Verified" />
                    )}
                  </div>
                  {testimonial.service_category && (
                    <p className="text-sm text-emerald-400">{testimonial.service_category}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'fill-emerald-500 text-emerald-500'
                        : 'fill-slate-700 text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <blockquote className="text-white/80 text-sm leading-relaxed line-clamp-4">
                "{testimonial.testimonial_text}"
              </blockquote>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Reviews Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              asChild
              className="rounded-full border-emerald-500/50 text-white hover:bg-emerald-500 hover:text-black transition-colors px-8 py-6 text-lg"
            >
              <Link to="/services">
                View All Reviews
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
