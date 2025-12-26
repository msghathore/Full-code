import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Star, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  rating: number;
}

interface Recommendation {
  service: Service;
  reason: string;
  confidence: number;
  matchType: 'complementary' | 'popular' | 'seasonal' | 'personalized';
}

interface ServiceRecommendationsProps {
  selectedService?: string;
  userHistory?: string[];
  className?: string;
}

export function ServiceRecommendations({
  selectedService,
  userHistory = [],
  className = ''
}: ServiceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock services data - in real app, this would come from API
  const allServices: Service[] = [
    {
      id: 'hair-styling',
      name: 'Hair Styling',
      description: 'Premium cuts, coloring, and treatments',
      price: 85,
      duration: 60,
      category: 'hair',
      rating: 4.8
    },
    {
      id: 'nail-care',
      name: 'Nail Care',
      description: 'Manicures, pedicures, and nail art',
      price: 45,
      duration: 45,
      category: 'nails',
      rating: 4.6
    },
    {
      id: 'skincare',
      name: 'Skincare',
      description: 'Facials, treatments, and rejuvenation',
      price: 120,
      duration: 90,
      category: 'skin',
      rating: 4.9
    },
    {
      id: 'massage',
      name: 'Massage',
      description: 'Relaxation and therapeutic massage',
      price: 95,
      duration: 60,
      category: 'body',
      rating: 4.7
    },
    {
      id: 'tattoo',
      name: 'Tattoo',
      description: 'Custom artwork and body art',
      price: 150,
      duration: 120,
      category: 'body',
      rating: 4.5
    },
    {
      id: 'piercing',
      name: 'Piercing',
      description: 'Professional piercing services',
      price: 65,
      duration: 30,
      category: 'body',
      rating: 4.4
    }
  ];

  useEffect(() => {
    generateRecommendations();
  }, [selectedService, userHistory]);

  const generateRecommendations = async () => {
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const recs: Recommendation[] = [];

    if (selectedService) {
      // Rule-based recommendations based on selected service
      const selectedServiceData = allServices.find(s => s.id === selectedService);

      if (selectedServiceData) {
        // Complementary services
        if (selectedServiceData.category === 'hair') {
          recs.push({
            service: allServices.find(s => s.id === 'skincare')!,
            reason: 'Complete your look with professional skincare',
            confidence: 0.85,
            matchType: 'complementary'
          });
          recs.push({
            service: allServices.find(s => s.id === 'nail-care')!,
            reason: 'Popular combination with hair services',
            confidence: 0.75,
            matchType: 'popular'
          });
        } else if (selectedServiceData.category === 'nails') {
          recs.push({
            service: allServices.find(s => s.id === 'massage')!,
            reason: 'Relax while your nails dry',
            confidence: 0.80,
            matchType: 'complementary'
          });
        } else if (selectedServiceData.category === 'skin') {
          recs.push({
            service: allServices.find(s => s.id === 'massage')!,
            reason: 'Enhance your skincare results',
            confidence: 0.90,
            matchType: 'complementary'
          });
        }
      }
    }

    // Add popular services if no specific selection
    if (recs.length < 3) {
      const popularServices = allServices
        .filter(s => !recs.some(r => r.service.id === s.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3 - recs.length);

      popularServices.forEach(service => {
        recs.push({
          service,
          reason: 'Highly rated by our clients',
          confidence: 0.70,
          matchType: 'popular'
        });
      });
    }

    // Seasonal recommendation (mock - could be based on current season)
    const seasonalService = allServices.find(s => s.category === 'skin');
    if (seasonalService && !recs.some(r => r.service.id === seasonalService.id)) {
      recs.splice(1, 0, {
        service: seasonalService,
        reason: 'Perfect for seasonal skin care',
        confidence: 0.65,
        matchType: 'seasonal'
      });
    }

    setRecommendations(recs.slice(0, 3)); // Limit to 3 recommendations
    setLoading(false);
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'complementary': return 'bg-slate-800/20 text-white';
      case 'popular': return 'bg-green-500/20 text-green-300';
      case 'seasonal': return 'bg-white/10/20 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]';
      case 'personalized': return 'bg-white/10/20 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleBookService = (serviceId: string) => {
    navigate(`/booking?service=${serviceId}`);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-white/60" />
          <h3 className="text-lg font-serif text-white/90">Recommended for You</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-black/40 border-white/10 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded mb-1"></div>
                <div className="h-3 bg-white/10 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-white/60" />
        <h3 className="text-lg font-serif text-white/90">Recommended for You</h3>
        <Badge variant="secondary" className="bg-white/10 text-white/70">
          AI-Powered
        </Badge>
      </div>

      <p className="text-sm text-white/60 mb-4">
        Based on your preferences and booking history
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, index) => (
          <Card key={rec.service.id} className="bg-black/40 border-white/10 hover:bg-black/60 transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-white text-base font-serif">
                  {rec.service.name}
                </CardTitle>
                <Badge className={`${getMatchTypeColor(rec.matchType)} text-xs`}>
                  {rec.matchType}
                </Badge>
              </div>
              <p className="text-white/60 text-sm">{rec.service.description}</p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-white/70">
                  <Clock className="h-4 w-4" />
                  {rec.service.duration}min
                </div>
                <div className="flex items-center gap-1 text-white/70">
                  <DollarSign className="h-4 w-4" />
                  ${rec.service.price}
                </div>
                <div className="flex items-center gap-1 text-white/70">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {rec.service.rating}
                </div>
              </div>

              <div className="bg-white/5 rounded p-2">
                <p className="text-xs text-white/70">
                  <strong>Why recommended:</strong> {rec.reason}
                </p>
              </div>

              <Button
                onClick={() => handleBookService(rec.service.id)}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                size="sm"
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}