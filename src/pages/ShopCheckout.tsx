import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { SquareProvider } from '@/components/SquareProvider';
import { SquarePaymentForm } from '@/components/SquarePaymentForm';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@clerk/clerk-react';

interface CartItem {
  id: string; // UUID from products table
  name: string;
  price: number;
  quantity: number;
  images: string[];
  image_url?: string; // Alternative image field from products table
}

const ShopCheckout = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('zavira-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Redirect to shop if no cart
      navigate('/shop');
    }
  }, [navigate]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('zavira-cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: number) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('zavira-cart', JSON.stringify(updated));
      return updated;
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      console.log('💳 Payment successful, saving order to database...');

      // Get user ID if logged in (try Clerk user email to find profile)
      let userId = null;
      if (clerkUser?.primaryEmailAddress?.emailAddress) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', clerkUser.primaryEmailAddress.emailAddress)
          .single();
        userId = profile?.id || null;
      }

      // Build shipping address string
      const shippingAddress = `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`;

      // Create the order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: total,
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          status: 'pending',
          payment_intent_id: paymentIntent.id || paymentIntent.payment?.id || `sq_${Date.now()}`,
          shipping_address: shippingAddress,
          customer_email: customerInfo.email,
          customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
          customer_phone: customerInfo.phone,
          notes: customerInfo.notes || null
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Failed to create order:', orderError);
        throw new Error('Failed to save order to database');
      }

      console.log('✅ Order created:', order.id);

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id, // UUID from products table
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Failed to create order items:', itemsError);
        // Order was created, so continue but log the error
      } else {
        console.log('✅ Order items saved:', orderItems.length, 'items');
      }

      // Award loyalty points if user is logged in (1 point per $1 spent)
      if (userId) {
        const pointsToAward = Math.floor(total);
        if (pointsToAward > 0) {
          // Update profile loyalty points
          const { data: profile } = await supabase
            .from('profiles')
            .select('loyalty_points')
            .eq('id', userId)
            .single();

          const currentPoints = profile?.loyalty_points || 0;
          await supabase
            .from('profiles')
            .update({ loyalty_points: currentPoints + pointsToAward })
            .eq('id', userId);

          // Log loyalty transaction
          await supabase
            .from('loyalty_transactions')
            .insert({
              user_id: userId,
              points_change: pointsToAward,
              transaction_type: 'earned',
              description: `Earned from order #${order.id.substring(0, 8).toUpperCase()}`
            });

          console.log('✅ Awarded', pointsToAward, 'loyalty points');
        }
      }

      // Update order status to completed
      await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);

      // Clear cart
      localStorage.removeItem('zavira-cart');

      toast({
        title: "Order completed successfully!",
        description: `Order #${order.id.substring(0, 8).toUpperCase()} - Thank you for your purchase!`,
      });

      // Redirect to success page with order ID
      navigate('/shop/order-success', { state: { orderId: order.id } });
    } catch (error) {
      console.error('❌ Order processing error:', error);
      toast({
        title: "Order processing failed",
        description: "There was an error processing your order. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment failed",
      description: error.message || "There was an error processing your payment.",
      variant: "destructive",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-20 pb-12 px-4 md:px-8">
          <div className="container mx-auto max-w-2xl text-center">
            <ShoppingBag className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h1 className="text-3xl font-serif luxury-glow mb-4">Your cart is empty</h1>
            <p className="text-white/60 mb-8">Add some products to your cart before checking out.</p>
            <Button onClick={() => navigate('/shop')} className="luxury-button-hover">
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      <div className="pt-20 pb-12 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/shop')}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif luxury-glow mb-12">
            CHECKOUT
          </h1>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif luxury-glow">Order Summary</h2>

              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <img
                      src={item.image_url || (item.images && item.images[0]) || '/images/product-1.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-white/60">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-white min-w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 h-6 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-white/10" />

              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information & Payment */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif luxury-glow">Customer Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">FIRST NAME</label>
                  <Input
                    value={customerInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">LAST NAME</label>
                  <Input
                    value={customerInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">EMAIL</label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">PHONE</label>
                <Input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">ADDRESS</label>
                <Input
                  value={customerInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">CITY</label>
                  <Input
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    placeholder="New York"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70 mb-2 block tracking-wider">STATE</label>
                  <Input
                    value={customerInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">ZIP CODE</label>
                <Input
                  value={customerInfo.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  placeholder="10001"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block tracking-wider">ORDER NOTES (Optional)</label>
                <Textarea
                  value={customerInfo.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/30"
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>

              {/* Payment Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-xl font-serif luxury-glow mb-4">Payment</h3>
                <SquareProvider>
                  <SquarePaymentForm
                    amount={total}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={(error) => handlePaymentError({ message: error })}
                    description={`Order total for ${cart.length} item${cart.length > 1 ? 's' : ''}`}
                  />
                </SquareProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShopCheckout;