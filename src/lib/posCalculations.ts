// POS Calculation Utilities
export interface CartItem {
  item_type: 'service' | 'product' | 'gift' | 'package'; // Changed to lowercase to match database
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  provider_id?: string;
  deposit_amount?: number;
}

export interface PaymentMethod {
  method: 'CASH' | 'CHECK' | 'CREDIT' | 'DEBIT' | 'GIFT_CERTIFICATE';
  amount: number;
}

export interface CalculationResult {
  subtotal: number;
  discount: number;
  deposit: number;
  tax: number;
  tip: number;
  amountDue: number;
  amountPaid: number;
  changeDue: number;
  taxRate: number;
}

export const calculateTotals = (
  cartItems: CartItem[],
  paymentMethods: PaymentMethod[],
  tipAmount: number = 0,
  taxRate: number = 0.05 // Default 5% tax rate
): CalculationResult => {
  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Calculate total discount
  const discount = cartItems.reduce((sum, item) => {
    return sum + (item.discount || 0);
  }, 0);

  // Calculate total deposit
  const deposit = cartItems.reduce((sum, item) => {
    return sum + (item.deposit_amount || 0);
  }, 0);

  // Calculate tax on subtotal minus discount
  const taxableAmount = subtotal - discount;
  const tax = Math.round((taxableAmount * taxRate) * 100) / 100;

  // Calculate total amount due
  const amountDue = Math.round((taxableAmount + tax + tipAmount - deposit) * 100) / 100;

  // Calculate total amount paid
  const amountPaid = paymentMethods.reduce((sum, payment) => {
    return sum + payment.amount;
  }, 0);

  // Calculate change due
  const changeDue = Math.round((amountPaid - amountDue) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    deposit: Math.round(deposit * 100) / 100,
    tax: tax,
    tip: Math.round(tipAmount * 100) / 100,
    amountDue: amountDue,
    amountPaid: amountPaid,
    changeDue: changeDue,
    taxRate: taxRate
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  // Remove dollar signs, commas, and parse as float
  const cleaned = value.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
};

// Validation utilities
export const isValidPaymentAmount = (amount: number): boolean => {
  return amount >= 0 && amount <= 999999.99;
};

export const isPaymentComplete = (calculationResult: CalculationResult): boolean => {
  return calculationResult.amountPaid >= calculationResult.amountDue;
};

// Debounce utility for search input
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T;
};