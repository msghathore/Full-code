import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ServiceTiersDisplay } from '@/components/hormozi/ServiceTiersDisplay';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { PriceAnchoring } from '@/components/PriceAnchoring';
import { ValueModal } from '@/components/ValueModal';
import { SocialProofIndicator } from '@/components/SocialProofIndicator';

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
  const [showValueModal, setShowValueModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setShowValueModal(true);
  };

  const handleCloseModal = () => {
    setShowValueModal(false);
    setSelectedService(null);
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
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Services Catalog Section - HORMOZI STAGE I: Attraction Offer (Value First) */}
      <div className="px-4 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Social Proof Indicator - Top of page for urgency */}
          <div className="flex justify-center mb-6">
            <SocialProofIndicator />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-center mb-4 luxury-glow text-foreground">
            ALL SERVICES
          </h1>
          <p className="text-center text-muted-foreground mb-8 tracking-wider text-sm md:text-base">
            Browse our complete catalog of luxury treatments
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
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'border-border text-foreground hover:bg-accent'}
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
              className="w-full bg-accent/50 border-border text-foreground placeholder:text-muted-foreground pl-12 py-5 text-base"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          </div>
        </div>

        <div ref={servicesRef} className="space-y-12">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, categoryIndex) => (
              <div key={categoryIndex} className="service-category">
                <Skeleton className="h-10 w-48 mb-6 bg-accent" />
                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-5 frosted-glass border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <Skeleton className="h-6 w-64 mb-2 bg-accent" />
                        <Skeleton className="h-4 w-32 bg-accent" />
                      </div>
                      <Skeleton className="h-8 w-20 bg-accent" />
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
                <h2 className="text-2xl md:text-3xl font-serif mb-6 pb-3 border-b border-border luxury-glow text-foreground">
                  {category.toUpperCase()}
                </h2>

                <div className="space-y-6">
                  {groupedServices[category].map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-2">
                      {/* Parent/Subcategory Header (only if it has variants) */}
                      {group.parent.is_parent && group.variants.length > 0 && (
                        <h3 className="text-lg md:text-xl font-serif text-foreground mb-3 pl-2">
                          {group.parent.name}
                        </h3>
                      )}

                      {/* Standalone service or variants */}
                      {group.variants.length > 0 ? (
                        // Show variants
                        group.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 frosted-glass border border-border micro-hover-lift rounded-lg gap-4"
                          >
                            <div className="flex-1">
                              <h4 className="text-base md:text-lg font-serif mb-1 group-hover:luxury-glow transition-all text-foreground">
                                {variant.name}
                              </h4>
                              <p className="text-xs text-muted-foreground tracking-wider mb-1">
                                {variant.duration_minutes} min
                              </p>
                              {variant.description && (
                                <p className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-2">
                                  {variant.description}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                              {/* Price Anchoring */}
                              <PriceAnchoring
                                regularPrice={variant.price * 1.3} // 30% markup for regular price
                                currentPrice={variant.price}
                                size="sm"
                                badgeText="MEMBER PRICE"
                                className="flex-1 min-w-0"
                              />
                              <Button
                                onClick={() => handleServiceClick(variant)}
                                className="bg-foreground text-background hover:bg-foreground/90 font-serif tracking-wider px-4 py-2 text-sm flex items-center gap-2 luxury-button-hover w-full sm:w-auto whitespace-nowrap"
                              >
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                Book
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Show standalone service
                        <div
                          key={group.parent.id}
                          className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 frosted-glass border border-border micro-hover-lift rounded-lg gap-4"
                        >
                          <div className="flex-1">
                            <h4 className="text-base md:text-lg font-serif mb-1 group-hover:luxury-glow transition-all text-foreground">
                              {group.parent.name}
                            </h4>
                            <p className="text-xs text-muted-foreground tracking-wider mb-1">
                              {group.parent.duration_minutes} min
                            </p>
                            {group.parent.description && (
                              <p className="text-xs text-muted-foreground mt-1 max-w-md line-clamp-2">
                                {group.parent.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                            {/* Price Anchoring */}
                            <PriceAnchoring
                              regularPrice={group.parent.price * 1.3} // 30% markup for regular price
                              currentPrice={group.parent.price}
                              size="sm"
                              badgeText="MEMBER PRICE"
                              className="flex-1 min-w-0"
                            />
                            <Button
                              onClick={() => handleServiceClick(group.parent)}
                              className="bg-foreground text-background hover:bg-foreground/90 font-serif tracking-wider px-4 py-2 text-sm flex items-center gap-2 luxury-button-hover w-full sm:w-auto whitespace-nowrap"
                            >
                              <Calendar className="h-4 w-4 flex-shrink-0" />
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
            <div className="text-center text-muted-foreground py-12">
              <p className="text-base md:text-lg">No services found matching "{searchQuery}"</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* HORMOZI STAGE II: Upsell Offer (Pricing Tiers After Value) */}
      <ServiceTiersDisplay />

      {/* Value Modal */}
      {selectedService && (
        <ValueModal
          open={showValueModal}
          onClose={handleCloseModal}
          name={selectedService.name}
          price={selectedService.price}
          duration={selectedService.duration_minutes}
          category={selectedService.category}
          description={selectedService.description || undefined}
          serviceId={selectedService.id}
        />
      )}

      <Footer />
    </div>
  );
};

export default Services;
