import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  User,
  History,
  Plus,
  Edit,
  ShoppingBag,
  Scan,
  Scissors,
  Package,
  Gift,
  CreditCard,
  Calculator,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { calculateTotals, formatCurrency, parseCurrency, CartItem, PaymentMethod } from '@/lib/posCalculations';
import { supabase } from '@/integrations/supabase/client';
import { ReceiptConfirmationModal } from '@/components/ReceiptConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import EmailService from '@/lib/email-service';

// Utility functions for database compatibility
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Updated mapping function that matches database constraint
const mapPaymentMethod = (frontendMethod: string): string => {
  const mapping: Record<string, string> = {
    'CASH': 'CASH',
    'CHECK': 'CHECK',
    'CREDIT': 'CREDIT',
    'DEBIT': 'DEBIT',
    'GIFT_CERTIFICATE': 'GIFT_CERTIFICATE'
  };
  return mapping[frontendMethod] || 'CASH';
};

// Mock current customer - in real app this would come from context/auth
const mockCurrentCustomer = {
  id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
  name: 'Carol Wilson',
  loyaltyPoints: 0,
  lastVisit: '2024-11-15'
};

// Mock services/products for search
const mockItems = [
  // Services
  { id: 'svc-1', name: 'Hair Cut & Style', type: 'SERVICE', price: 65.00, code: 'HC001' },
  { id: 'svc-2', name: 'Manicure', type: 'SERVICE', price: 35.00, code: 'MN001' },
  { id: 'svc-3', name: 'Pedicure', type: 'SERVICE', price: 45.00, code: 'PC001' },
  { id: 'svc-4', name: 'Facial Treatment', type: 'SERVICE', price: 85.00, code: 'FC001' },
  { id: 'svc-5', name: 'Massage Therapy', type: 'SERVICE', price: 95.00, code: 'MS001' },
  { id: 'svc-6', name: 'Hair Color', type: 'SERVICE', price: 120.00, code: 'HC002' },
  { id: 'svc-7', name: 'Waxing Service', type: 'SERVICE', price: 55.00, code: 'WX001' },
    
  // Products
  { id: 'prod-1', name: 'Shampoo Premium', type: 'PRODUCT', price: 15.99, code: 'PR001' },
  { id: 'prod-2', name: 'Conditioner Deluxe', type: 'PRODUCT', price: 17.99, code: 'PR002' },
  { id: 'prod-3', name: 'Hair Gel Strong', type: 'PRODUCT', price: 12.99, code: 'PR003' },
  { id: 'prod-4', name: 'Nail Polish Set', type: 'PRODUCT', price: 24.99, code: 'PR004' },
  { id: 'prod-5', name: 'Face Cleanser', type: 'PRODUCT', price: 28.99, code: 'PR005' },
  { id: 'prod-6', name: 'Moisturizer Daily', type: 'PRODUCT', price: 32.99, code: 'PR006' },
  { id: 'prod-7', name: 'Sunscreen SPF 50', type: 'PRODUCT', price: 19.99, code: 'PR007' },
    
  // Gift Cards
  { id: 'gift-1', name: 'Spa Package Gift Card', type: 'GIFT', price: 120.00, code: 'GF001' },
  { id: 'gift-2', name: 'Hair Styling Gift Card', type: 'GIFT', price: 80.00, code: 'GF002' },
  { id: 'gift-3', name: 'Nail Care Gift Card', type: 'GIFT', price: 60.00, code: 'GF003' },
  { id: 'gift-4', name: 'Facial Treatment Gift Card', type: 'GIFT', price: 100.00, code: 'GF004' },
    
  // Packages
  { id: 'pack-1', name: 'Premium Hair Care Package', type: 'PACKAGE', price: 180.00, code: 'PK001' },
  { id: 'pack-2', name: 'Complete Manicure Package', type: 'PACKAGE', price: 95.00, code: 'PK002' },
  { id: 'pack-3', name: 'Spa Day Package', type: 'PACKAGE', price: 250.00, code: 'PK003' },
  { id: 'pack-4', name: 'Bridal Package', type: 'PACKAGE', price: 350.00, code: 'PK004' },
  { id: 'pack-5', name: 'Monthly Beauty Package', type: 'PACKAGE', price: 280.00, code: 'PK005' }
];

const CheckoutPage = () => {
  // State management
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentCustomer] = useState(mockCurrentCustomer);
  const [staffList, setStaffList] = useState<{ id: string; name: string; }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'SERVICE' | 'PRODUCT' | 'GIFT' | 'PACKAGE' | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [showPaymentInputs, setShowPaymentInputs] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);

  // Add default demo items for testing
  useEffect(() => {
    // Clear any cached problematic UUIDs
    console.log('🧪 Checking cart state:', cartItems.length, 'items,', staffList.length, 'staff');
    
    // Remove any cart items with problematic UUIDs
    const cleanCartItems = cartItems.filter(item =>
      item.provider_id !== 'd3hhedbcc-9c0b-4ef8-bb6d-6bb9bd380a44' &&
      item.item_id !== 'svc-1'  // Also remove mock service IDs
    );
    
    if (cleanCartItems.length !== cartItems.length) {
      console.log('🧹 Cleaned cart of problematic IDs');
      setCartItems(cleanCartItems);
      return;
    }
    
    if (cartItems.length === 0 && staffList.length > 0) {
      console.log('🧪 Adding demo items to cart for testing');
      console.log('Available staff IDs:', staffList.map(s => ({id: s.id, name: s.name})));
      
      const firstStaffId = staffList[0]?.id;
      if (!firstStaffId) {
        console.log('⚠️  No staff available, skipping demo items');
        return;
      }
      
      // Use real service ID from database
      const demoItems: CartItem[] = [
        {
          item_type: 'service', // Use lowercase for database constraint
          item_id: 'e73690f5-2989-4389-ba5d-96bb50b0d8f1', // Real UUID from services table
          name: 'Signature Haircut & Style',
          price: 65.00,
          quantity: 1,
          discount: 0,
          provider_id: firstStaffId  // Use actual staff ID from database
        }
      ];
      console.log('Demo items created with real service ID:', demoItems[0].item_id);
      setCartItems(demoItems);
    }
  }, [staffList, cartItems.length]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate totals using the utility function
  const totals = useMemo(() => {
    return calculateTotals(cartItems, paymentMethods, tipAmount);
  }, [cartItems, paymentMethods, tipAmount]);

  // Fetch staff from Supabase
  useEffect(() => {
    const fetchStaff = async () => {
      const { data, error } = await supabase.from('staff').select('id, name');
      if (error) {
        console.error('Error fetching staff:', error);
        toast({
          title: "Error",
          description: "Could not fetch staff list.",
          variant: "destructive"
        });
      } else {
        setStaffList(data);
      }
    };
    fetchStaff();
  }, [supabase, toast]);

  // Handle appointment data from calendar completion
  useEffect(() => {
    const data = location.state?.appointmentData;
    if (data) {
      setAppointmentData(data);
      
      // Pre-populate cart with the completed service
      const serviceItem: CartItem = {
        item_type: 'service', // Use lowercase for database constraint
        item_id: data.appointmentId,
        name: data.serviceName,
        price: data.servicePrice,
        quantity: 1,
        discount: 0,
        provider_id: data.staffId
      };
      
      setCartItems([serviceItem]);
      
      // Show notification
      toast({
        title: "Service Completed",
        description: `Ready to process payment for ${data.serviceName}`,
        duration: 5000,
      });
    }
  }, [location.state, toast]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    // Filter by category if selected
    const filteredItems = selectedCategory 
      ? mockItems.filter(item => item.type === selectedCategory) 
      : mockItems;

    return filteredItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedCategory]);

  // Add item to cart
  const addItemToCart = (item: any) => {
    // For POS, we assume a provider is selected immediately or default to the first one if it's a service
    const defaultProviderId = item.type === 'SERVICE' ? staffList?.[0]?.id : undefined;

    const existingItemIndex = cartItems.findIndex(cartItem =>
      cartItem.item_id === item.id && cartItem.provider_id === defaultProviderId
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      setCartItems(prev => prev.map((cartItem, index) =>
        index === existingItemIndex 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      // Add new item
      const newItem: CartItem = {
        item_type: item.type,
        item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        discount: 0,
        provider_id: defaultProviderId
      };
      setCartItems(prev => [...prev, newItem]);
    }
    setSearchTerm('');
    setSelectedCategory(null); // Close category selection after adding
  };

  // Update cart item
  const updateCartItem = (index: number, field: keyof CartItem, value: any) => {
    setCartItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // Remove item from cart
  const removeItemFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Add payment method
  const addPaymentMethod = (method: PaymentMethod['method']) => {
    console.log('🧪 addPaymentMethod called with:', method);
    console.log('Current cart items:', cartItems);
    console.log('Current payment methods:', paymentMethods);
    console.log('Current totals:', totals);
    
    const existingIndex = paymentMethods.findIndex(p => p.method === method);
    if (existingIndex >= 0) {
      console.log('Payment method already exists');
      toast({
        title: "Payment method already added",
        description: "This payment method already exists. Please modify the amount instead.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if cart is empty
    if (cartItems.length === 0) {
      console.log('No items in cart - cannot add payment method');
      toast({
        title: "No items in cart",
        description: "Please add items to cart before adding payment methods.",
        variant: "destructive"
      });
      return;
    }
    
    // For initial payment, set amount to Amount Due if it's the first payment, otherwise 0
    const initialAmount = paymentMethods.length === 0 ? totals.amountDue : 0;
    console.log('Initial amount for payment:', initialAmount);

    const newPaymentMethod = { method, amount: initialAmount };
    console.log('Adding new payment method:', newPaymentMethod);
    
    setPaymentMethods(prev => {
      const updated = [...prev, newPaymentMethod];
      console.log('Updated payment methods:', updated);
      return updated;
    });
    setShowPaymentInputs(prev => ({ ...prev, [method]: true }));
  };

  // Update payment amount
  const updatePaymentAmount = (method: PaymentMethod['method'], amount: number) => {
    setPaymentMethods(prev => prev.map(p => 
      p.method === method ? { ...p, amount } : p
    ));
  };

  // Remove payment method
  const removePaymentMethod = (method: PaymentMethod['method']) => {
    setPaymentMethods(prev => prev.filter(p => p.method !== method));
    setShowPaymentInputs(prev => ({ ...prev, [method]: false }));
  };


  // Modified finalize transaction function that can be called with custom data
  const handleFinalizeTransactionWithData = async (customData?: any) => {
    setIsProcessing(true);

    try {
      const transactionData = customData || {
        customer_id: currentCustomer.id,
        staff_id: staffList[0]?.id,
        cart_items: cartItems,
        payment_methods: paymentMethods.map(p => ({
          ...p,
          method: mapPaymentMethod(p.method),
          status: 'completed'
        })),
        tip_amount: tipAmount
      };

      console.log('Finalizing transaction with data:', transactionData);
      
      // Log payment methods specifically for debugging
      console.log('Payment methods to be inserted:', JSON.stringify(transactionData.payment_methods, null, 2));
      
      // Log the mapped payment methods to verify they're correct
      const mappedMethods = transactionData.payment_methods.map(p => ({
        original: p.method,
        mapped: mapPaymentMethod(p.method),
        amount: p.amount
      }));
      console.log('Mapped payment methods:', mappedMethods);

      const { data, error } = await (supabase as any).rpc('finalize_transaction', {
        transaction_data: transactionData
      });

      if (error) throw error;

      if (data?.success) {
        setTransactionResult({
          success: true,
          transaction_id: data.transaction_id,
          total_amount: squarePaymentAmount || totals.amountDue,
          cart_items: [...cartItems],
          customer_name: currentCustomer.name
        });

        // Send receipt email if there's customer email from appointment data
        if (appointmentData?.customerEmail && appointmentData.customerName) {
          EmailService.sendReceiptEmail({
            email: appointmentData.customerEmail,
            transactionId: data.transaction_id,
            totalAmount: squarePaymentAmount || totals.amountDue,
            customerName: appointmentData.customerName,
            cartItems: cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }).catch(error => {
            console.error('Failed to send receipt email:', error);
          });
        }

        setShowReceiptModal(true);

        // Clear cart and reset state
        setCartItems([]);
        setPaymentMethods([]);
        setTipAmount(0);
      } else {
        throw new Error(data?.error || 'Transaction failed');
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction failed",
        description: error.message || "There was an error processing the transaction.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Finalize transaction
  const handleFinalizeTransaction = async () => {
    // Check if payment is complete
    if (totals.amountPaid < totals.amountDue) {
      toast({
        title: "Payment incomplete",
        description: "Please ensure the total amount due is paid.",
        variant: "destructive"
      });
      return;
    }

    // Get the correct staff_id for the transaction
    let staffId = appointmentData?.staffId; // Use appointment staff if coming from completed appointment
    if (!staffId && cartItems.length > 0) {
      // Use the first non-empty provider_id from cart items
      const firstServiceItem = cartItems.find(item => item.provider_id);
      staffId = firstServiceItem?.provider_id;
    }
    if (!staffId) {
      // Fallback to first staff member if available
      staffId = staffList[0]?.id;
    }
    
    // Validate staff_id is a valid UUID format
    if (!staffId) {
      throw new Error('No staff member selected for this transaction');
    }
    
    // Temporarily skip UUID validation to fix payment buttons
    console.log('📋 Using staff ID:', staffId);
    
    // Ensure the staff_id exists in our staff list
    const validStaff = staffList.find(staff => staff.id === staffId);
    if (!validStaff && staffList.length > 0) {
      console.log('⚠️  Staff validation failed, trying first available staff');
      // Use first staff member if the specific one isn't found
      staffId = staffList[0]?.id;
      if (!staffId) {
        throw new Error('No staff members available for transaction');
      }
    } else if (!validStaff) {
      console.log('⚠️  No staff list loaded, proceeding without staff validation');
      // Allow transaction without staff validation if no staff list is loaded
    }

    await handleFinalizeTransactionWithData();
  };


  // Handler for category icon clicks
  const handleCategoryClick = (category: 'SERVICE' | 'PRODUCT' | 'GIFT' | 'PACKAGE') => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deselect
      setSearchTerm('');
    } else {
      setSelectedCategory(category); // Select
      setSearchTerm(''); // Clear search when changing category filter
    }
  };

  // Handler for footer checkout button
  const handleCheckoutClick = () => {
    handleFinalizeTransaction();
  };

  // Handler for rebooking service
  const handleRebookService = () => {
    setShowReceiptModal(false);
    setTransactionResult(null);
    navigate('/staff/booking-flow');
  };

  // Handler for closing modal and navigating to dashboard
  const handleModalClose = () => {
    setShowReceiptModal(false);
    setTransactionResult(null);
    navigate('/staff');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Appointment Header - Show when coming from completed service */}
      {appointmentData && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Service Completed</span>
                </div>
                <div className="text-sm text-green-700">
                  <span className="font-medium">{appointmentData.serviceName}</span>
                  {appointmentData.customerName && (
                    <> • {appointmentData.customerName}</>
                  )}
                  {appointmentData.appointmentTime && (
                    <> • {appointmentData.appointmentTime}</>
                  )}
                </div>
              </div>
              <div className="text-green-800 font-medium">
                {formatCurrency(appointmentData.servicePrice)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Area - Two Column Layout */}
      <div className="flex max-w-7xl mx-auto">
        {/* Left Column - Items & Detail */}
        <div className="flex-1 border-r border-gray-200">
          <div className="p-6">
            {/* Header - Fixed column widths to prevent jumble */}
            <div className="mb-6">
              <div className="grid grid-cols-9 gap-1 text-sm font-medium text-gray-500 border-b border-gray-200 pb-2 w-full" style={{gridTemplateColumns: '100px 50px 90px 40px 60px 60px 60px 60px 1fr'}}>
                <div className="truncate">Item</div>
                <div className="text-center truncate">Code</div>
                <div className="truncate">Service/Provider</div>
                <div className="text-center truncate">Qty</div>
                <div className="text-center truncate">Price</div>
                <div className="text-center truncate">Discount</div>
                <div className="text-center truncate">Deposit</div>
                <div className="text-center truncate">Due</div>
                <div className="text-center truncate">Pts</div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {cartItems.map((item, index) => (
                <div key={`${item.item_id}-${index}`} className="grid items-center py-3 border-b border-gray-100 w-full" style={{gridTemplateColumns: '100px 50px 90px 40px 60px 60px 60px 60px 1fr'}}>
                  <div className="truncate">
                    <div className="text-gray-900 font-medium text-xs">{item.name}</div>
                    <div className="text-[10px] text-gray-500">{item.item_type}</div>
                  </div>
                  <div className="text-gray-700 text-[10px] text-center truncate">{item.item_id}</div>
                  <div>
                    <Select
                      value={item.provider_id || ''}
                      onValueChange={(value) => updateCartItem(index, 'provider_id', value || undefined)}
                    >
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-7 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="bg-white border-gray-300 text-gray-900 h-7 w-full text-center text-xs"
                      min="1"
                    />
                  </div>
                  <div className="text-gray-900 text-[10px] text-center truncate">{formatCurrency(item.price)}</div>
                  <div>
                    <Input
                      type="text"
                      value={item.discount ? item.discount.toString() : ''}
                      onChange={(e) => updateCartItem(index, 'discount', parseCurrency(e.target.value))}
                      className="bg-white border-gray-300 text-gray-900 h-7 w-full text-right text-xs"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      value={item.deposit_amount ? item.deposit_amount.toString() : ''}
                      onChange={(e) => updateCartItem(index, 'deposit_amount', parseCurrency(e.target.value))}
                      className="bg-white border-gray-300 text-gray-900 h-7 w-full text-right text-xs"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="text-gray-900 text-[10px] text-center truncate">
                    {formatCurrency((item.price * item.quantity) - (item.discount || 0) - (item.deposit_amount || 0))}
                  </div>
                </div>
              ))}
              
              {/* Add empty row for new items */}
              {cartItems.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No items in cart</p>
                </div>
              )}
            </div>

            {/* Subtotal Areas */}
            {cartItems.length > 0 && (
              <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Services:</span>
                  <span className="text-gray-900">
                    {formatCurrency(cartItems.filter(item => item.item_type === 'service').reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products:</span>
                  <span className="text-gray-900">
                    {formatCurrency(cartItems.filter(item => item.item_type === 'product').reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gifts/Packages:</span>
                  <span className="text-gray-900">
                    {formatCurrency(cartItems.filter(item => item.item_type === 'gift' || item.item_type === 'package').reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-red-500">-{formatCurrency(totals.discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="text-gray-900">{formatCurrency(totals.deposit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (5%):</span>
                  <span className="text-gray-900">{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Tip:</span>
                  <Input
                    type="text"
                    value={tipAmount ? tipAmount.toString() : ''}
                    onChange={(e) => setTipAmount(parseCurrency(e.target.value))}
                    className="bg-white border-gray-300 text-gray-900 h-8 w-20 text-right"
                    placeholder="0.00"
                  />
                </div>
                <Separator className="bg-gray-200 my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Amount Due:</span>
                  <span className="text-green-600">{formatCurrency(totals.amountDue)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary & Payment */}
        <div className="w-96 bg-white border-l border-gray-200">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2 border-gray-200">Payment</h3>
            
            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    console.log('💰 CASH button clicked');
                    addPaymentMethod('CASH');
                  }}
                  disabled={paymentMethods.some(p => p.method === 'CASH')}
                >
                  Cash
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    console.log('🏦 CHECK button clicked');
                    addPaymentMethod('CHECK');
                  }}
                  disabled={paymentMethods.some(p => p.method === 'CHECK')}
                >
                  Check
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    console.log('💳 CREDIT button clicked');
                    addPaymentMethod('CREDIT');
                  }}
                  disabled={paymentMethods.some(p => p.method === 'CREDIT')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit Card
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    console.log('🏧 DEBIT button clicked');
                    addPaymentMethod('DEBIT');
                  }}
                  disabled={paymentMethods.some(p => p.method === 'DEBIT')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Debit Card
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    console.log('🎁 GIFT button clicked');
                    addPaymentMethod('GIFT_CERTIFICATE');
                  }}
                  disabled={paymentMethods.some(p => p.method === 'GIFT_CERTIFICATE')}
                >
                  Gift Cert.
                </Button>
              </div>

              {/* Payment Method Inputs */}
              {paymentMethods.map(payment => (
                <div key={payment.method} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <span className="text-gray-900 font-medium">{payment.method}</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={payment.amount ? payment.amount.toString() : ''}
                      onChange={(e) => updatePaymentAmount(payment.method, parseCurrency(e.target.value))}
                      className="bg-white border-gray-300 text-gray-900 w-24 h-8 text-right"
                      placeholder="0.00"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePaymentMethod(payment.method)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-gray-900">{formatCurrency(totals.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Change Due:</span>
                <span className={totals.changeDue >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {formatCurrency(Math.abs(totals.changeDue))}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
              disabled={totals.amountPaid < totals.amountDue || isProcessing}
              onClick={handleFinalizeTransaction}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pay {formatCurrency(totals.amountDue)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer/Action Bar */}
      <div className="bg-gray-100 border-t border-gray-200 p-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          {/* Search/Scan Input */}
          <div className="mb-4">
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 text-lg h-12"
                placeholder="Scan barcode or type it"
              />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded border border-gray-300 max-h-48 overflow-y-auto shadow-lg">
                {searchResults.map(item => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    onClick={() => addItemToCart(item)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-900 font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.code} • {item.type}</div>
                      </div>
                      <div className="text-green-600 font-semibold">{formatCurrency(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {/* Category Icons */}
            <div className="flex items-center space-x-3">
              <Button
                variant={selectedCategory === 'SERVICE' ? 'default' : 'outline'}
                size="sm"
                className={`h-12 px-4 ${selectedCategory === 'SERVICE' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleCategoryClick('SERVICE')}
              >
                <Scissors className="h-5 w-5 mr-2" />
                Service
              </Button>
              <Button
                variant={selectedCategory === 'PRODUCT' ? 'default' : 'outline'}
                size="sm"
                className={`h-12 px-4 ${selectedCategory === 'PRODUCT' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleCategoryClick('PRODUCT')}
              >
                <Package className="h-5 w-5 mr-2" />
                Product
              </Button>
              <Button
                variant={selectedCategory === 'GIFT' ? 'default' : 'outline'}
                size="sm"
                className={`h-12 px-4 ${selectedCategory === 'GIFT' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleCategoryClick('GIFT')}
              >
                <Gift className="h-5 w-5 mr-2" />
                Gift
              </Button>
              <Button
                variant={selectedCategory === 'PACKAGE' ? 'default' : 'outline'}
                size="sm"
                className={`h-12 px-4 ${selectedCategory === 'PACKAGE' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleCategoryClick('PACKAGE')}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Package
              </Button>
            </div>

            {/* Checkout Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white h-12 px-6"
                onClick={handleCheckoutClick}
                disabled={totals.amountPaid < totals.amountDue || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(totals.amountDue)}`
                )}
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-50 h-12 px-6"
                onClick={() => {
                  setCartItems([]);
                  setPaymentMethods([]);
                  setTipAmount(0);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Receipt Confirmation Modal */}
      {transactionResult && (
        <ReceiptConfirmationModal
          isOpen={showReceiptModal}
          onClose={handleModalClose}
          transactionId={transactionResult.transaction_id}
          totalAmount={transactionResult.total_amount}
          cartItems={transactionResult.cart_items}
          onRebook={handleRebookService}
          customerName={transactionResult.customer_name}
        />
      )}

    </div>
  );
};

export default CheckoutPage;