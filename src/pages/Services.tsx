import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Search, Calendar, Eye, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ImageComparisonSlider } from '@/components/ImageComparisonSlider';

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

// Category mapping - subcategories to main categories
const categoryGroups: { [key: string]: string } = {
  // Hair subcategories
  'Haircuts': 'Hair',
  'Hair Color': 'Hair',
  'Hair Styling': 'Hair',
  'Hair Treatments': 'Hair',
  'Hair Extensions': 'Hair',

  // Nails subcategories
  'Manicure': 'Nails',
  'Pedicure': 'Nails',
  'Nail Enhancements': 'Nails',
  'Nail Art': 'Nails',

  // Skin subcategories
  'Facials': 'Skin',
  'Advanced Skin Treatments': 'Skin',

  // Waxing subcategories
  'Facial Waxing': 'Waxing',
  'Body Waxing': 'Waxing',

  // Keep as-is categories
  'Massage': 'Massage',
  'Eyebrow': 'Eyebrow',
  'Lash': 'Lash',
  'Piercing': 'Piercing',
  'Tattoo': 'Tattoo',
  'Sugaring': 'Sugaring',
};

const Services = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

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

  // Get unique main categories for filter buttons in the exact order specified
  const mainCategories = ['ALL', 'Hair', 'Nails', 'Tattoo', 'Massage', 'Waxing', 'Sugaring', 'Skin', 'Eyebrow', 'Lash', 'Piercing'];

  // Filter services based on search and category
  const filteredServices = Object.keys(groupedServices).reduce((acc: any, category: string) => {
    // Check if this category matches the selected main category
    const mainCategory = categoryGroups[category] || category;
    const matchesCategory = selectedCategory === 'ALL' || mainCategory === selectedCategory;

    if (!matchesCategory) return acc;

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
    <div className="pt-32 pb-24 px-4 md:px-8">
      <div className="container mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-center mb-6 luxury-glow">
          SERVICES
        </h1>
        <p className="text-center text-muted-foreground mb-8 md:mb-12 tracking-wider text-base md:text-lg">
          Indulge in our curated selection of luxury treatments
        </p>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {mainCategories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`
                font-serif tracking-wider px-4 md:px-6 py-2 transition-all
                ${selectedCategory === category
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'border-white/30 text-white hover:bg-white/10'}
              `}
            >
              {category}
            </Button>
          ))}
        </div>

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
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, categoryIndex) => (
              <div key={categoryIndex} className="service-category">
                <Skeleton className="h-12 w-48 mb-8 bg-white/10" />
                <div className="grid gap-4 md:gap-6">
                  {Array.from({ length: 3 }).map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 frosted-glass border border-white/10 rounded-xl"
                    >
                      <div className="mb-4 md:mb-0 flex-1">
                        <Skeleton className="h-8 w-64 mb-2 bg-white/10" />
                        <Skeleton className="h-4 w-32 mb-2 bg-white/10" />
                        <Skeleton className="h-4 w-full max-w-md bg-white/10" />
                      </div>
                      <Skeleton className="h-10 w-20 bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : Object.keys(filteredServices).length > 0 ? (
            Object.keys(filteredServices).map((category) => (
              <div key={category} className="service-category">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-8 md:mb-12 pb-4 border-b border-white/10 luxury-glow">
                  {category.toUpperCase()}
                </h2>
                
                <div className="grid gap-4 md:gap-6">
                  {filteredServices[category].map((item: any) => (
                    <div
                      key={item.id}
                      className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 frosted-glass border border-white/10 micro-hover-lift micro-hover-glow cursor-hover rounded-xl"
                    >
                      <div className="mb-4 md:mb-0 flex-1">
                        <img
                          src={`/images/${item.category.toLowerCase()}-service.jpg`}
                          alt={`${item.category} service`}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-lg mb-4 object-cover"
                        />
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
                      <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                        <div className="text-2xl md:text-3xl font-serif group-hover:luxury-glow transition-all">
                          ${item.price}
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="border-white/30 text-white hover:bg-white/10 font-serif tracking-wider px-4 py-2 flex items-center gap-2 micro-hover-scale"
                              >
                                <Eye className="h-4 w-4" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-[95vw] md:w-[90vw] bg-black/95 border-white/20">
                              <div className="space-y-4 md:space-y-6 p-2 md:p-0">
                                <div className="text-center">
                                  <h3 className="text-xl md:text-2xl font-serif luxury-glow mb-2">{item.name}</h3>
                                  <p className="text-white/70 text-sm md:text-base">{item.description || 'See the transformation'}</p>
                                </div>
                                <ImageComparisonSlider
                                  beforeImage={`/images/${item.category.toLowerCase()}-service.jpg`}
                                  afterImage={`/images/${item.category.toLowerCase()}-service.jpg`}
                                  beforeLabel="Before Treatment"
                                  afterLabel="After Treatment"
                                  className="w-full h-48 md:h-64"
                                />
                                <div className="flex justify-center gap-2 md:gap-4">
                                  <Button
                                    onClick={() => navigate(`/booking?service=${item.id}`)}
                                    className="bg-white text-black hover:bg-white/90 font-serif tracking-wider px-4 md:px-8 py-2 md:py-3 text-sm md:text-base luxury-button-hover"
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book This Service
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            onClick={() => navigate(`/booking?service=${item.id}`)}
                            className="bg-white text-black hover:bg-white/90 font-serif tracking-wider px-6 py-2 flex items-center gap-2 luxury-button-hover"
                          >
                            <Calendar className="h-4 w-4" />
                            Book Now
                          </Button>
                        </div>
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

      <Footer />
    </div>
  );
};

export default Services;
