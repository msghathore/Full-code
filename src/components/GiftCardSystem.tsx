import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, Mail, CreditCard, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GiftCard {
  id: string;
  amount: number;
  recipientEmail: string;
  recipientName: string;
  message: string;
  senderName: string;
  deliveryMethod: 'email' | 'digital';
  status: 'pending' | 'sent' | 'redeemed';
  code?: string;
}

const giftCardAmounts = [25, 50, 75, 100, 150, 200];

export const GiftCardSystem = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [giftCard, setGiftCard] = useState<Partial<GiftCard>>({
    recipientEmail: '',
    recipientName: '',
    message: '',
    senderName: '',
    deliveryMethod: 'email',
  });
  const [purchasedCards, setPurchasedCards] = useState<GiftCard[]>([]);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const { toast } = useToast();

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    return selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  };

  const handlePurchase = () => {
    const amount = getFinalAmount();
    if (!amount || amount < 10) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a valid amount (minimum $10)",
        variant: "destructive",
      });
      return;
    }

    if (!giftCard.recipientEmail || !giftCard.recipientName || !giftCard.senderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Generate a unique gift card code
    const code = `ZAVIRA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newCard: GiftCard = {
      id: Date.now().toString(),
      amount,
      recipientEmail: giftCard.recipientEmail!,
      recipientName: giftCard.recipientName!,
      message: giftCard.message || '',
      senderName: giftCard.senderName!,
      deliveryMethod: giftCard.deliveryMethod as 'email' | 'digital',
      status: 'pending',
      code,
    };

    setPurchasedCards(prev => [...prev, newCard]);

    toast({
      title: "Gift Card Purchased!",
      description: `$${amount} gift card created for ${giftCard.recipientName}`,
    });

    // Reset form
    setSelectedAmount(null);
    setCustomAmount('');
    setGiftCard({
      recipientEmail: '',
      recipientName: '',
      message: '',
      senderName: '',
      deliveryMethod: 'email',
    });
    setShowPurchaseForm(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Gift card code copied to clipboard",
    });
  };

  return (
    <div className="py-16 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif luxury-glow mb-4">
            GIFT CARDS
          </h2>
          <p className="text-muted-foreground text-base md:text-lg tracking-wider">
            Share the luxury of Zavira with someone special
          </p>
        </div>

        {/* Gift Card Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Purchase Section */}
          <Card className="bg-black/50 border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-serif luxury-glow flex items-center">
                <Gift className="w-6 h-6 mr-3" />
                Purchase Gift Card
              </CardTitle>
              <CardDescription className="text-white/70">
                Choose an amount and send digitally or via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Selection */}
              <div>
                <Label className="text-white font-semibold mb-3 block">Select Amount</Label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {giftCardAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(amount)}
                      className={selectedAmount === amount ? "bg-white text-black" : "border-white/20 text-white hover:bg-white/10"}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="custom-amount"
                      name="custom-amount"
                      type="number"
                      autoComplete="off"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                      min="10"
                    />
                  </div>
                  <Button
                    onClick={() => setShowPurchaseForm(true)}
                    disabled={!getFinalAmount()}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-black/50 border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-serif luxury-glow">Why Choose Zavira Gift Cards?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold">Instant Digital Delivery</h4>
                  <p className="text-white/70 text-sm">Send immediately or schedule for later</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold">No Expiration Date</h4>
                  <p className="text-white/70 text-sm">Use anytime at your convenience</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold">Personalized Messages</h4>
                  <p className="text-white/70 text-sm">Add a special note to make it memorable</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold">Multiple Uses</h4>
                  <p className="text-white/70 text-sm">Valid for services, products, and packages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Form Modal */}
        {showPurchaseForm && (
          <Card className="bg-black/50 border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-serif luxury-glow">
                Gift Card Details - ${getFinalAmount()}
              </CardTitle>
              <CardDescription className="text-white/70">
                Fill in the details for digital delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName" className="text-white">Your Name *</Label>
                  <Input
                    id="senderName"
                    name="senderName"
                    autoComplete="name"
                    value={giftCard.senderName}
                    onChange={(e) => setGiftCard(prev => ({ ...prev, senderName: e.target.value }))}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="recipientName" className="text-white">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    name="recipientName"
                    autoComplete="off"
                    value={giftCard.recipientName}
                    onChange={(e) => setGiftCard(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    placeholder="Recipient's name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recipientEmail" className="text-white">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  name="recipientEmail"
                  type="email"
                  autoComplete="off"
                  value={giftCard.recipientEmail}
                  onChange={(e) => setGiftCard(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <Label htmlFor="deliveryMethod" className="text-white">Delivery Method</Label>
                <Select
                  value={giftCard.deliveryMethod}
                  onValueChange={(value) => setGiftCard(prev => ({ ...prev, deliveryMethod: value as 'email' | 'digital' }))}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="email" className="text-white hover:bg-white/10">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Delivery
                      </div>
                    </SelectItem>
                    <SelectItem value="digital" className="text-white hover:bg-white/10">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Digital Code Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message" className="text-white">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  autoComplete="off"
                  value={giftCard.message}
                  onChange={(e) => setGiftCard(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  placeholder="Add a personal message..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handlePurchase} className="bg-white text-black hover:bg-white/90 flex-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase Gift Card
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseForm(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchased Gift Cards */}
        {purchasedCards.length > 0 && (
          <Card className="bg-black/50 border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-serif luxury-glow">Your Gift Cards</CardTitle>
              <CardDescription className="text-white/70">
                Manage and track your purchased gift cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchasedCards.map((card) => (
                  <div key={card.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Gift className="w-5 h-5 text-white/60" />
                        <div>
                          <h4 className="text-white font-semibold">${card.amount} Gift Card</h4>
                          <p className="text-white/60 text-sm">To: {card.recipientName}</p>
                        </div>
                      </div>
                      <Badge variant={card.status === 'sent' ? 'default' : 'secondary'} className="capitalize">
                        {card.status}
                      </Badge>
                    </div>

                    {card.code && (
                      <div className="bg-black/30 rounded p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-sm">Gift Card Code:</p>
                            <p className="text-white font-mono text-lg">{card.code}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(card.code!)}
                            className="text-white/60 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-white/60">
                      <p>Sent to: {card.recipientEmail}</p>
                      {card.message && <p>Message: "{card.message}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};