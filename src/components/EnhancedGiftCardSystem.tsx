import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Gift, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';

const GIFT_CARD_OFFERS = [
  {
    amount: 100,
    bonus: 20,
    totalValue: 120,
    savings: 20,
    pitch: "Buy $100, Get $120 Value",
    urgency: "Limited Time: +20% Bonus",
    valueStack: [
      "✅ $100 Credit",
      "🎁 +$20 Bonus Credit",
      "📧 Instant Email Delivery",
      "🎨 Beautiful Digital Card Design",
      "♾️ Never Expires"
    ],
    roi: "20% FREE BONUS"
  },
  {
    amount: 250,
    bonus: 75,
    totalValue: 325,
    savings: 75,
    pitch: "Buy $250, Get $325 Value",
    urgency: "BEST VALUE: +30% Bonus",
    valueStack: [
      "✅ $250 Credit",
      "🎁 +$75 Bonus Credit (30%!)",
      "💎 Priority Booking Access",
      "📧 Instant Email Delivery",
      "🎨 Premium Card Design",
      "♾️ Never Expires",
      "🎀 Free Gift Wrapping Option"
    ],
    badge: "MOST POPULAR",
    roi: "30% FREE BONUS"
  },
  {
    amount: 500,
    bonus: 200,
    totalValue: 700,
    savings: 200,
    pitch: "Buy $500, Get $700 Value",
    urgency: "ULTIMATE GIFT: +40% Bonus",
    valueStack: [
      "✅ $500 Credit",
      "🎁 +$200 Bonus Credit (40%!)",
      "👑 VIP Treatment for 1 Year",
      "📅 Unlimited Priority Booking",
      "💆 Free Upgrade on First Visit",
      "📧 Instant Email Delivery",
      "🎨 Luxury Card Design",
      "♾️ Never Expires",
      "🎀 Premium Gift Packaging",
      "📞 Dedicated Concierge Line"
    ],
    badge: "BEST VALUE",
    roi: "40% FREE BONUS"
  }
];

interface GiftCardOfferProps {
  amount: number;
  bonus: number;
  totalValue: number;
  savings: number;
  pitch: string;
  urgency: string;
  valueStack: string[];
  badge?: string;
  roi: string;
  onSelect: () => void;
}

const GiftCardOffer = ({ amount, bonus, totalValue, savings, pitch, urgency, valueStack, badge, roi, onSelect }: GiftCardOfferProps) => (
  <Card className={`bg-slate-900 border-2 hover:border-emerald-500 transition-all hover:scale-105 ${badge ? 'border-emerald-500' : 'border-slate-700'}`}>
    <CardHeader className="text-center relative">
      {badge && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-black font-bold px-4 py-1">
          {badge}
        </Badge>
      )}
      <div className="mt-2">
        <p className="text-sm text-emerald-400 font-bold mb-2">{urgency}</p>
        <CardTitle className="text-3xl font-serif text-white mb-2">{pitch}</CardTitle>
        <div className="inline-block bg-emerald-500 text-black px-4 py-2 rounded-lg font-bold text-xl mb-3">
          {roi}
        </div>
        <CardDescription className="text-lg">
          <span className="text-white font-bold">${amount}</span>
          <span className="text-gray-400 mx-2">→</span>
          <span className="text-emerald-400 font-bold text-2xl">${totalValue}</span>
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        {valueStack.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <Button
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg py-6"
        onClick={onSelect}
      >
        Get ${totalValue} Value for ${amount}
      </Button>
      <p className="text-xs text-center text-gray-400">
        Save ${savings} instantly!
      </p>
    </CardContent>
  </Card>
);

export function EnhancedGiftCardSystem() {
  const [selectedOffer, setSelectedOffer] = useState<typeof GIFT_CARD_OFFERS[0] | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSelectOffer = (offer: typeof GIFT_CARD_OFFERS[0]) => {
    setSelectedOffer(offer);
    setShowForm(true);
  };

  const handlePurchase = async () => {
    if (!selectedOffer || !recipientEmail || !recipientName) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`Gift card purchased! ${recipientEmail} will receive ${selectedOffer.totalValue} in credits.`);
    // Reset form
    setShowForm(false);
    setSelectedOffer(null);
    setRecipientEmail('');
    setRecipientName('');
    setMessage('');
  };

  if (showForm && selectedOffer) {
    return (
      <div className="bg-black text-white py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="ghost"
            className="mb-4 text-gray-400 hover:text-white"
            onClick={() => setShowForm(false)}
          >
            ← Back to Offers
          </Button>

          <Card className="bg-slate-900 border-emerald-500">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Complete Your Gift Card Purchase</CardTitle>
              <CardDescription>
                You're getting ${selectedOffer.totalValue} in value for just ${selectedOffer.amount}!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-emerald-900/20 border border-emerald-500 rounded-lg p-4">
                <p className="text-emerald-400 font-bold text-lg">{selectedOffer.pitch}</p>
                <p className="text-white text-3xl font-bold">${selectedOffer.amount}</p>
                <p className="text-sm text-gray-300">+ ${selectedOffer.bonus} FREE Bonus</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">Recipient Name *</Label>
                  <Input
                    placeholder="John Doe"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Recipient Email *</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Personal Message (Optional)</Label>
                  <Textarea
                    placeholder="Happy Birthday! Enjoy your spa day..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white min-h-24"
                    maxLength={500}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg py-6"
                onClick={handlePurchase}
              >
                Complete Purchase - ${selectedOffer.amount}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-black text-white py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-serif mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
            Gift Beauty, Get More Value
          </h2>
          <p className="text-2xl mb-4 text-emerald-400 font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            Limited Time: Get Up To 40% Bonus Credit FREE
            <Sparkles className="w-6 h-6" />
          </p>
          <p className="text-gray-400 text-lg">The more you give, the more they save!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {GIFT_CARD_OFFERS.map(offer => (
            <GiftCardOffer key={offer.amount} {...offer} onSelect={() => handleSelectOffer(offer)} />
          ))}
        </div>

        {/* Hormozi-style Guarantee Section */}
        <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-700/30 border-2 border-emerald-500 rounded-lg p-12 text-center mb-8">
          <Shield className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-6 text-white">
            💯 Our Unconditional Guarantee
          </h3>
          <p className="text-xl mb-4 text-gray-200">
            If the recipient isn't 100% thrilled with their experience,
            we'll refund the FULL amount - no questions asked.
          </p>
          <p className="text-2xl font-bold text-emerald-400 mb-4">
            You literally can't lose.
          </p>
          <p className="text-lg text-gray-300">
            Either they love it and save money, or you get your money back AND they keep the value.
            <br />
            <strong className="text-white">That's our promise.</strong>
          </p>
        </div>

        {/* Urgency */}
        <div className="text-center bg-white/10/20 border border-white/30 rounded-lg p-6">
          <p className="text-xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ⚡ Limited Time: First 50 buyers get an EXTRA $25 bonus
          </p>
          <p className="text-sm text-gray-400 mt-2">23 spots remaining</p>
        </div>
      </div>
    </section>
  );
}
