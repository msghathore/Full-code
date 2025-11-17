import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomCursor } from '@/components/CustomCursor';
import { Navigation } from '@/components/Navigation';
import { VideoHero } from '@/components/VideoHero';
import { HeroLogo } from '@/components/HeroLogo';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-black">
      <CustomCursor />
      <Navigation />
      <HeroLogo />
      <VideoHero />
      
      {/* Services Preview Section - Mobile Responsive */}
      <section ref={servicesRef} className="py-12 md:py-24 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif luxury-glow mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground text-base md:text-lg tracking-wider">
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
                <div className="relative overflow-hidden rounded-3xl frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      style={{
                        filter: 'brightness(0.8)',
                      }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.4)',
                        border: '2px solid rgba(255,255,255,0.5)',
                        borderRadius: '1.5rem'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <h3 className="text-3xl font-serif luxury-glow mb-2">
                        {service.name}
                      </h3>
                      <p className="text-white/90 text-sm tracking-wide">
                        {service.description}
                      </p>
                    </div>
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

      {/* Shop Our Products Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif luxury-glow mb-4">
              Shop Our Products
            </h2>
            <p className="text-muted-foreground text-base md:text-lg tracking-wider">
              Premium beauty products for home care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { id: 1, name: 'Luxury Hair Serum', category: 'Hair Care', price: 89, image: '/images/product-1.jpg' },
              { id: 2, name: 'Premium Face Cream', category: 'Skin Care', price: 120, image: '/images/product-2.jpg' },
              { id: 3, name: 'Nail Polish Set', category: 'Nail Care', price: 45, image: '/images/product-3.jpg' },
              { id: 4, name: 'Hydrating Shampoo', category: 'Hair Care', price: 65, image: '/images/product-4.jpg' },
              { id: 5, name: 'Anti-Aging Serum', category: 'Skin Care', price: 150, image: '/images/product-5.jpg' },
              { id: 6, name: 'Makeup Brush Set', category: 'Makeup', price: 95, image: '/images/product-6.jpg' },
            ].map((product) => (
              <Link
                key={product.id}
                to="/shop"
                className="group cursor-hover"
              >
                <div className="relative overflow-hidden rounded-3xl frosted-glass border border-white/10 hover:border-white/30 transition-all duration-500">
                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      style={{
                        filter: 'brightness(0.8)',
                      }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: 'inset 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.4)',
                        border: '2px solid rgba(255,255,255,0.5)',
                        borderRadius: '1.5rem'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white/90 text-xs md:text-sm tracking-wide mb-2">{product.category}</p>
                      <h3 className="text-xl md:text-2xl font-serif luxury-glow mb-2">
                        {product.name}
                      </h3>
                      <p className="text-lg md:text-xl text-white">${product.price}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-block px-6 md:px-8 py-3 md:py-4 border border-white/20 rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-300 cursor-hover luxury-glow text-sm md:text-base"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <ReviewsCarousel />

      <Footer />
    </div>
  );
};

export default Index;
