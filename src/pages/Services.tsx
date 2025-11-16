import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { CustomCursor } from '@/components/CustomCursor';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    category: 'HAIR',
    items: [
      { name: 'Haircut & Styling', price: 120, duration: '60 min' },
      { name: 'Color Treatment', price: 200, duration: '120 min' },
      { name: 'Hair Treatment', price: 150, duration: '90 min' },
    ]
  },
  {
    category: 'NAILS',
    items: [
      { name: 'Manicure', price: 80, duration: '45 min' },
      { name: 'Pedicure', price: 90, duration: '60 min' },
      { name: 'Nail Art', price: 120, duration: '90 min' },
    ]
  },
  {
    category: 'SKIN',
    items: [
      { name: 'Facial Treatment', price: 180, duration: '75 min' },
      { name: 'Deep Cleansing', price: 150, duration: '60 min' },
      { name: 'Anti-Aging Treatment', price: 250, duration: '90 min' },
    ]
  },
  {
    category: 'MASSAGE',
    items: [
      { name: 'Swedish Massage', price: 200, duration: '90 min' },
      { name: 'Deep Tissue', price: 220, duration: '90 min' },
      { name: 'Hot Stone', price: 240, duration: '120 min' },
    ]
  },
  {
    category: 'TATTOO',
    items: [
      { name: 'Small Tattoo', price: 150, duration: '60 min' },
      { name: 'Medium Tattoo', price: 300, duration: '120 min' },
      { name: 'Large Tattoo', price: 500, duration: '180+ min' },
    ]
  },
  {
    category: 'PIERCING',
    items: [
      { name: 'Ear Piercing', price: 50, duration: '15 min' },
      { name: 'Nose Piercing', price: 80, duration: '20 min' },
      { name: 'Body Piercing', price: 100, duration: '30 min' },
    ]
  },
];

const Services = () => {
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (servicesRef.current) {
      const categories = servicesRef.current.querySelectorAll('.service-category');
      
      categories.forEach((category) => {
        gsap.fromTo(
          category,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: category,
              start: 'top 75%',
            }
          }
        );
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-8">
        <div className="container mx-auto">
          <h1 className="text-7xl font-serif text-center mb-6 luxury-glow">
            SERVICES
          </h1>
          <p className="text-center text-muted-foreground mb-20 tracking-wider">
            Indulge in our curated selection of luxury treatments
          </p>

          <div ref={servicesRef} className="space-y-20">
            {services.map((category) => (
              <div key={category.category} className="service-category">
                <h2 className="text-5xl font-serif mb-12 pb-4 border-b border-white/10 luxury-glow">
                  {category.category}
                </h2>
                
                <div className="grid gap-6">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="group flex items-center justify-between p-8 frosted-glass border border-white/10 hover:border-white/30 transition-all cursor-hover"
                    >
                      <div>
                        <h3 className="text-2xl font-serif mb-2 group-hover:luxury-glow transition-all">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground tracking-wider">
                          {item.duration}
                        </p>
                      </div>
                      <div className="text-3xl font-serif group-hover:luxury-glow transition-all">
                        ${item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;
