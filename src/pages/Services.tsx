import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// Service type from database
interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
  parent_service_id: string | null;
  is_parent: boolean;
  display_order: number;
}

// Grouped service structure
interface ServiceGroup {
  parent: Service;
  variants: Service[];
}

const Services = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dbServices, setDbServices] = useState<Service[]>([]);
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
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      // Filter out PMU services
      const filteredData = (data as Service[]).filter(s => s.category !== 'PMU');
      setDbServices(filteredData);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (servicesRef.current && !loading) {
      const categories = servicesRef.current.querySelectorAll('.service-category');

      categories.forEach((category) => {
        gsap.fromTo(
          category,
          { opacity: 0, y: 20 },
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
  }, [dbServices, loading, selectedCategory, searchQuery]);

  // Define priority order for main service categories
  const categoryPriority = ['Hair', 'Nails', 'Tattoo', 'Massage', 'Skin', 'Waxing', 'Lash', 'Eyebrow', 'Piercing'];

  // Get unique main categories from database and sort by priority
  const uniqueCategories = Array.from(new Set(dbServices.map(s => s.category)));
  const sortedCategories = uniqueCategories.sort((a, b) => {
    const indexA = categoryPriority.indexOf(a);
    const indexB = categoryPriority.indexOf(b);

    // If both in priority list, sort by priority order
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A in priority, it comes first
    if (indexA !== -1) return -1;
    // If only B in priority, it comes first
    if (indexB !== -1) return 1;
    // If neither in priority, sort alphabetically
    return a.localeCompare(b);
  });

  const categories = ['ALL', ...sortedCategories];

  // Group services by category and parent-child relationships
  const groupServicesByCategory = (): { [category: string]: ServiceGroup[] } => {
    const grouped: { [category: string]: ServiceGroup[] } = {};

    // Filter by selected category
    const filteredByCategory = selectedCategory === 'ALL'
      ? dbServices
      : dbServices.filter(s => s.category === selectedCategory);

    // Filter by search query
    const filteredServices = filteredByCategory.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Group by category
    filteredServices.forEach(service => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
    });

    // For each category, organize into parent-child groups
    Object.keys(grouped).forEach(category => {
      const categoryServices = filteredServices.filter(s => s.category === category);

      // Find all parent services
      const parents = categoryServices.filter(s => s.is_parent);

      // Find all standalone services (no parent, not a parent)
      const standalone = categoryServices.filter(s => !s.is_parent && !s.parent_service_id);

      // Create groups for parents with their variants
      parents.forEach(parent => {
        const variants = categoryServices.filter(s => s.parent_service_id === parent.id);
        grouped[category].push({ parent, variants });
      });

      // Add standalone services as single-item groups
      standalone.forEach(service => {
        grouped[category].push({
          parent: service,
          variants: []
        });
      });
    });

    return grouped;
  };

  const groupedServices = groupServicesByCategory();

  return (
    <div className="pt-24 pb-16 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-center mb-4 luxury-glow">
          SERVICES
        </h1>
        <p className="text-center text-white/70 mb-8 tracking-wider text-sm md:text-base">
          Indulge in our curated selection of luxury treatments
        </p>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`
                font-serif tracking-wider px-4 md:px-6 py-2 text-sm transition-all
                ${selectedCategory === category
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'border-white/30 text-white hover:bg-white/10'}
              `}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border-white/20 text-white placeholder:text-white/40 pl-12 py-5 text-base"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
          </div>
        </div>

        <div ref={servicesRef} className="space-y-12">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, categoryIndex) => (
              <div key={categoryIndex} className="service-category">
                <Skeleton className="h-10 w-48 mb-6 bg-white/10" />
                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-5 frosted-glass border border-white/10 rounded-lg"
                    >
                      <div className="flex-1">
                        <Skeleton className="h-6 w-64 mb-2 bg-white/10" />
                        <Skeleton className="h-4 w-32 bg-white/10" />
                      </div>
                      <Skeleton className="h-8 w-20 bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : Object.keys(groupedServices).length > 0 ? (
            Object.keys(groupedServices).sort((a, b) => {
              const indexA = categoryPriority.indexOf(a);
              const indexB = categoryPriority.indexOf(b);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a.localeCompare(b);
            }).map((category) => (
              <div key={category} className="service-category">
                <h2 className="text-2xl md:text-3xl font-serif mb-6 pb-3 border-b border-white/10 luxury-glow">
                  {category.toUpperCase()}
                </h2>

                <div className="space-y-6">
                  {groupedServices[category].map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-2">
                      {/* Parent/Subcategory Header (only if it has variants) */}
                      {group.parent.is_parent && group.variants.length > 0 && (
                        <h3 className="text-lg md:text-xl font-serif text-white/90 mb-3 pl-2">
                          {group.parent.name}
                        </h3>
                      )}

                      {/* Standalone service or variants */}
                      {group.variants.length > 0 ? (
                        // Show variants
                        group.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 frosted-glass border border-white/10 micro-hover-lift rounded-lg gap-4"
                          >
                            <div className="flex-1">
                              <h4 className="text-base md:text-lg font-serif mb-1 group-hover:luxury-glow transition-all">
                                {variant.name}
                              </h4>
                              <p className="text-xs text-white/50 tracking-wider mb-1">
                                {variant.duration_minutes} min
                              </p>
                              {variant.description && (
                                <p className="text-xs text-white/60 mt-1 max-w-md line-clamp-2">
                                  {variant.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                              {/* Green glowing price with normal font for numbers */}
                              <div className="text-xl md:text-2xl font-serif">
                                <span className="text-emerald-400" style={{
                                  textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4)'
                                }}>
                                  $
                                </span>
                                <span className="font-sans text-emerald-400" style={{
                                  textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4)'
                                }}>
                                  {variant.price.toFixed(0)}
                                </span>
                              </div>
                              <Button
                                onClick={() => navigate(`/booking?service=${variant.id}`)}
                                className="bg-white text-black hover:bg-white/90 font-serif tracking-wider px-4 py-2 text-sm flex items-center gap-2 luxury-button-hover"
                              >
                                <Calendar className="h-4 w-4" />
                                Book
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Show standalone service
                        <div
                          key={group.parent.id}
                          className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 frosted-glass border border-white/10 micro-hover-lift rounded-lg gap-4"
                        >
                          <div className="flex-1">
                            <h4 className="text-base md:text-lg font-serif mb-1 group-hover:luxury-glow transition-all">
                              {group.parent.name}
                            </h4>
                            <p className="text-xs text-white/50 tracking-wider mb-1">
                              {group.parent.duration_minutes} min
                            </p>
                            {group.parent.description && (
                              <p className="text-xs text-white/60 mt-1 max-w-md line-clamp-2">
                                {group.parent.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            {/* Green glowing price with normal font for numbers */}
                            <div className="text-xl md:text-2xl font-serif">
                              <span className="text-emerald-400" style={{
                                textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4)'
                              }}>
                                $
                              </span>
                              <span className="font-sans text-emerald-400" style={{
                                textShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4)'
                              }}>
                                {group.parent.price.toFixed(0)}
                              </span>
                            </div>
                            <Button
                              onClick={() => navigate(`/booking?service=${group.parent.id}`)}
                              className="bg-white text-black hover:bg-white/90 font-serif tracking-wider px-4 py-2 text-sm flex items-center gap-2 luxury-button-hover"
                            >
                              <Calendar className="h-4 w-4" />
                              Book
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-white/60 py-12">
              <p className="text-base md:text-lg">No services found matching "{searchQuery}"</p>
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
