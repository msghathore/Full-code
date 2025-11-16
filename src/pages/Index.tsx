import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { VideoHero } from '@/components/VideoHero';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = servicesRef.current?.querySelectorAll('.service-card');
    if (cards) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 80%',
          },
        }
      );
    }
  }, []);

  const services = [
    {
      name: 'Hair Styling',
      image: '/images/hair-service.jpg',
      description: 'Premium cuts, coloring, and treatments'
    },
    {
      name: 'Nail Care',
      image: '/images/nails-service.jpg',
      description: 'Manicures, pedicures, and nail art'
    },
    {
      name: 'Skincare',
      image: '/images/skin-service.jpg',
      description: 'Facials, treatments, and rejuvenation'
    },
    {
      name: 'Massage',
      image: '/images/massage-service.jpg',
      description: 'Relaxation and therapeutic massage'
    },
    {
      name: 'Tattoo',
      image: '/images/tattoo-service.jpg',
      description: 'Custom artwork and body art'
    },
    {
      name: 'Piercing',
      image: '/images/piercing-service.jpg',
      description: 'Professional piercing services'
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      <VideoHero />
      
      {/* Services Preview Section */}
      <section ref={servicesRef} className="py-24 px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-serif luxury-glow mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground text-lg tracking-wider">
              Experience luxury and excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.name}
                to="/services"
                className="service-card group cursor-hover"
              >
                <div className="relative overflow-hidden rounded-lg frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover image-hover-glow transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-serif luxury-glow mb-2">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground text-sm tracking-wide">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-block px-8 py-4 border border-white/20 rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-300 cursor-hover luxury-glow"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
