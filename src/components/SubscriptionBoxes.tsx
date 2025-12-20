import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Star, Gift, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionBox {
  id: string;
  name: string;
  description: string;
  price: number;
  frequency: 'monthly' | 'quarterly';
  items: string[];
  customizable: boolean;
  popular?: boolean;
}

const subscriptionBoxes: SubscriptionBox[] = [
  {
    id: 'basic-beauty',
    name: 'Basic Beauty Box',
    description: 'Essential beauty products for everyday use',
    price: 45,
    frequency: 'monthly',
    items: ['Cleanser', 'Moisturizer', 'Sunscreen', 'Lip Balm'],
    customizable: false,
  },
  {
    id: 'luxury-skincare',
    name: 'Luxury Skincare Box',
    description: 'Premium skincare products with anti-aging focus',
    price: 89,
    frequency: 'monthly',
    items: ['Serum', 'Eye Cream', 'Face Mask', 'Neck Cream'],
    customizable: true,
    popular: true,
  },
  {
    id: 'hair-care-deluxe',
    name: 'Hair Care Deluxe',
    description: 'Complete hair care routine with professional products',
    price: 65,
    frequency: 'monthly',
    items: ['Shampoo', 'Conditioner', 'Hair Mask', 'Styling Product'],
    customizable: true,
  },
  {
    id: 'seasonal-beauty',
    name: 'Seasonal Beauty Box',
    description: 'Curated products based on seasonal needs',
    price: 55,
    frequency: 'quarterly',
    items: ['Seasonal Cleanser', 'Moisturizer', 'Treatment', 'Accessory'],
    customizable: true,
  },
];

const customizationOptions = {
  skinType: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'],
  concerns: ['Anti-aging', 'Acne', 'Hyperpigmentation', 'Hydration', 'Brightening'],
  allergies: ['Fragrance-free', 'Paraben-free', 'Vegan', 'Cruelty-free'],
};

export const SubscriptionBoxes = () => {
  const [selectedBox, setSelectedBox] = useState<SubscriptionBox | null>(null);
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly'>('monthly');
  const [customizations, setCustomizations] = useState({
    skinType: '',
    concerns: [] as string[],
    allergies: [] as string[],
  });
  const { toast } = useToast();

  const handleSubscribe = (box: SubscriptionBox) => {
    toast({
      title: "Subscription Added",
      description: `You've subscribed to ${box.name} (${frequency})`,
    });
  };

  const handleCustomizationChange = (type: string, value: string, checked?: boolean) => {
    setCustomizations(prev => {
      if (type === 'skinType') {
        return { ...prev, skinType: value };
      } else if (type === 'concerns' || type === 'allergies') {
        const currentArray = prev[type as keyof typeof prev] as string[];
        if (checked) {
          return { ...prev, [type]: [...currentArray, value] };
        } else {
          return { ...prev, [type]: currentArray.filter(item => item !== value) };
        }
      }
      return prev;
    });
  };

  return (
    <div className="py-16 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif luxury-glow mb-4">
            SUBSCRIPTION BOXES
          </h2>
          <p className="text-muted-foreground text-base md:text-lg tracking-wider">
            Curated beauty boxes delivered to your door monthly
          </p>
        </div>

        {/* Frequency Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/50 p-1 rounded-lg border border-white/20">
            <Button
              variant={frequency === 'monthly' ? 'default' : 'ghost'}
              onClick={() => setFrequency('monthly')}
              className={frequency === 'monthly' ? 'bg-white text-black' : 'text-white'}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monthly
            </Button>
            <Button
              variant={frequency === 'quarterly' ? 'default' : 'ghost'}
              onClick={() => setFrequency('quarterly')}
              className={frequency === 'quarterly' ? 'bg-white text-black' : 'text-white'}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Quarterly
            </Button>
          </div>
        </div>

        {/* Subscription Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {subscriptionBoxes.map((box) => (
            <Card
              key={box.id}
              className={`bg-black/50 border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer ${
                box.popular ? 'ring-2 ring-white/50' : ''
              }`}
              onClick={() => setSelectedBox(box)}
            >
              <CardHeader className="text-center">
                {box.popular && (
                  <Badge className="bg-white text-black mb-2 self-center">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardTitle className="text-xl font-serif luxury-glow">{box.name}</CardTitle>
                <CardDescription className="text-white/70">{box.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-white mb-1">
                    ${box.price}
                  </div>
                  <div className="text-sm text-white/60">
                    per {box.frequency === 'monthly' ? 'month' : 'quarter'}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {box.items.map((item, index) => (
                    <div key={index} className="flex items-center text-sm text-white/80">
                      <Sparkles className="w-3 h-3 mr-2 text-white/60" />
                      {item}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full bg-white text-black hover:bg-white/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(box);
                  }}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customization Panel */}
        {selectedBox?.customizable && (
          <Card className="bg-black/50 border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-serif luxury-glow">
                Customize Your {selectedBox.name}
              </CardTitle>
              <CardDescription className="text-white/70">
                Tell us about your preferences for a personalized experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skin Type */}
              <div>
                <label className="text-white font-semibold mb-3 block">Skin Type</label>
                <Select value={customizations.skinType} onValueChange={(value) => handleCustomizationChange('skinType', value)}>
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Select your skin type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    {customizationOptions.skinType.map((type) => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-white/10">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Concerns */}
              <div>
                <label className="text-white font-semibold mb-3 block">Skin Concerns</label>
                <div className="grid grid-cols-2 gap-3">
                  {customizationOptions.concerns.map((concern) => (
                    <div key={concern} className="flex items-center space-x-2">
                      <Checkbox
                        id={`concern-${concern}`}
                        checked={customizations.concerns.includes(concern)}
                        onCheckedChange={(checked) =>
                          handleCustomizationChange('concerns', concern, checked as boolean)
                        }
                        className="border-white/20"
                      />
                      <label
                        htmlFor={`concern-${concern}`}
                        className="text-sm text-white/80 cursor-pointer"
                      >
                        {concern}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies/Restrictions */}
              <div>
                <label className="text-white font-semibold mb-3 block">Preferences & Restrictions</label>
                <div className="grid grid-cols-2 gap-3">
                  {customizationOptions.allergies.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={`allergy-${allergy}`}
                        checked={customizations.allergies.includes(allergy)}
                        onCheckedChange={(checked) =>
                          handleCustomizationChange('allergies', allergy, checked as boolean)
                        }
                        className="border-white/20"
                      />
                      <label
                        htmlFor={`allergy-${allergy}`}
                        className="text-sm text-white/80 cursor-pointer"
                      >
                        {allergy}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};