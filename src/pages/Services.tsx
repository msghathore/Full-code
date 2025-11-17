import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { CustomCursor } from '@/components/CustomCursor';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [dbServices, setDbServices] = useState<any[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);
    
    if (!error && data) {
      setDbServices(data);
    }
  };

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
  }, [dbServices]);

  // Group services by category
  const groupedServices = dbServices.reduce((acc: any, service: any) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  // Filter services based on search
  const filteredServices = Object.keys(groupedServices).reduce((acc: any, category: string) => {
    const filtered = groupedServices[category].filter((service: any) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <CustomCursor />
      <Navigation />
      
      <div className="pt-32 pb-24 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-center mb-6 luxury-glow">
            SERVICES
          </h1>
          <p className="text-center text-muted-foreground mb-12 md:mb-20 tracking-wider text-base md:text-lg">
            Indulge in our curated selection of luxury treatments
          </p>

          {/* Search Bar with AI capability */}
          <div className="max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search services... (e.g., 'relaxing massage' or 'hair color')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border-white/20 text-white placeholder:text-white/30 pl-12 py-4 md:py-6 text-base md:text-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>

          <div ref={servicesRef} className="space-y-16 md:space-y-20">
            {Object.keys(filteredServices).length > 0 ? (
              Object.keys(filteredServices).map((category) => (
                <div key={category} className="service-category">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-8 md:mb-12 pb-4 border-b border-white/10 luxury-glow">
                    {category.toUpperCase()}
                  </h2>
                  
                  <div className="grid gap-4 md:gap-6">
                    {filteredServices[category].map((item: any) => (
                      <div
                        key={item.id}
                        className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 frosted-glass border border-white/10 hover:border-white/30 transition-all cursor-hover rounded-xl"
                      >
                        <div className="mb-4 md:mb-0">
                          <h3 className="text-xl md:text-2xl font-serif mb-2 group-hover:luxury-glow transition-all">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground tracking-wider">
                            {item.duration_minutes} minutes
                          </p>
                          {item.description && (
                            <p className="text-sm text-white/60 mt-2 max-w-md">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-2xl md:text-3xl font-serif group-hover:luxury-glow transition-all">
                          ${item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/60 py-12">
                <p className="text-lg md:text-xl">No services found matching "{searchQuery}"</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;
