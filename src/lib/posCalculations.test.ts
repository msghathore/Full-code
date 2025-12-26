/**
 * Unit tests for POS Calculations
 * Comprehensive test coverage for tip calculations and edge cases
 */

import { describe, it, expect } from 'vitest';
import { calculateTotals, formatCurrency, parseCurrency, CartItem, PaymentMethod } from './posCalculations';

describe('calculateTotals', () => {
  describe('Tip Calculations', () => {
    it('should correctly add tip to amount due', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Haircut',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 15);

      expect(result.tip).toBe(15);
      // Amount due = subtotal (100) + tax (5) + tip (15) = 120
      expect(result.amountDue).toBe(120);
    });

    it('should handle zero tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Haircut',
          price: 50,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 0);

      expect(result.tip).toBe(0);
      // Amount due = subtotal (50) + tax (2.50) = 52.50
      expect(result.amountDue).toBe(52.50);
    });

    it('should round tip to 2 decimal places', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 10.126);

      expect(result.tip).toBe(10.13);
    });

    it('should calculate 10% tip correctly', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const subtotal = 100;
      const tipAmount = Math.round(subtotal * 0.10 * 100) / 100;

      const result = calculateTotals(cartItems, [], tipAmount);

      expect(result.tip).toBe(10);
      expect(result.amountDue).toBe(115); // 100 + 5 (tax) + 10 (tip)
    });

    it('should calculate 15% tip correctly', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const subtotal = 100;
      const tipAmount = Math.round(subtotal * 0.15 * 100) / 100;

      const result = calculateTotals(cartItems, [], tipAmount);

      expect(result.tip).toBe(15);
      expect(result.amountDue).toBe(120); // 100 + 5 (tax) + 15 (tip)
    });

    it('should calculate 20% tip correctly', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const subtotal = 100;
      const tipAmount = Math.round(subtotal * 0.20 * 100) / 100;

      const result = calculateTotals(cartItems, [], tipAmount);

      expect(result.tip).toBe(20);
      expect(result.amountDue).toBe(125); // 100 + 5 (tax) + 20 (tip)
    });

    it('should handle fractional percentage tips', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 33.33,
          quantity: 1,
          discount: 0
        }
      ];

      const subtotal = 33.33;
      const tipAmount = Math.round(subtotal * 0.10 * 100) / 100;

      const result = calculateTotals(cartItems, [], tipAmount);

      expect(result.tip).toBe(3.33);
      expect(result.subtotal).toBe(33.33);
    });

    it('should handle very large tip values', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 999999.99);

      expect(result.tip).toBe(999999.99);
      expect(result.amountDue).toBe(1000104.99); // 100 + 5 (tax) + 999999.99 (tip)
    });

    it('should handle very small tip values', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 0.01);

      expect(result.tip).toBe(0.01);
      expect(result.amountDue).toBe(105.01);
    });
  });

  describe('Tip with Discounts', () => {
    it('should calculate tip on discounted subtotal', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 20 // $20 discount
        }
      ];

      const result = calculateTotals(cartItems, [], 0);

      // Subtotal = 100, Discount = 20, Taxable = 80
      expect(result.subtotal).toBe(100);
      expect(result.discount).toBe(20);
      expect(result.tax).toBe(4); // 5% of 80

      // Now with 10% tip on original subtotal (100)
      const tipAmount = Math.round(100 * 0.10 * 100) / 100;
      const resultWithTip = calculateTotals(cartItems, [], tipAmount);

      expect(resultWithTip.tip).toBe(10);
      // Amount due = 80 (subtotal - discount) + 4 (tax) + 10 (tip) = 94
      expect(resultWithTip.amountDue).toBe(94);
    });

    it('should handle multiple items with discounts', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service 1',
          price: 50,
          quantity: 1,
          discount: 5
        },
        {
          item_type: 'service',
          item_id: '2',
          name: 'Service 2',
          price: 60,
          quantity: 1,
          discount: 10
        }
      ];

      const result = calculateTotals(cartItems, [], 15);

      expect(result.subtotal).toBe(110); // 50 + 60
      expect(result.discount).toBe(15); // 5 + 10
      expect(result.tax).toBe(4.75); // 5% of (110 - 15) = 5% of 95
      expect(result.tip).toBe(15);
      // Amount due = 95 + 4.75 + 15 = 114.75
      expect(result.amountDue).toBe(114.75);
    });
  });

  describe('Tip with Deposits', () => {
    it('should subtract deposit from amount due (tip not affected)', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0,
          deposit_amount: 20
        }
      ];

      const result = calculateTotals(cartItems, [], 10);

      expect(result.deposit).toBe(20);
      expect(result.tip).toBe(10);
      // Amount due = subtotal (100) + tax (5) + tip (10) - deposit (20) = 95
      expect(result.amountDue).toBe(95);
    });

    it('should handle deposit larger than subtotal', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 50,
          quantity: 1,
          discount: 0,
          deposit_amount: 60
        }
      ];

      const result = calculateTotals(cartItems, [], 5);

      expect(result.deposit).toBe(60);
      // Amount due = 50 + 2.5 (tax) + 5 (tip) - 60 = -2.5 (customer gets refund)
      expect(result.amountDue).toBe(-2.5);
    });
  });

  describe('Multiple Items', () => {
    it('should calculate tip with multiple quantities', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 50,
          quantity: 3,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 15);

      expect(result.subtotal).toBe(150); // 50 * 3
      expect(result.tax).toBe(7.5); // 5% of 150
      expect(result.tip).toBe(15);
      expect(result.amountDue).toBe(172.5);
    });

    it('should calculate tip with mixed item types', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Haircut',
          price: 50,
          quantity: 1,
          discount: 0
        },
        {
          item_type: 'product',
          item_id: '2',
          name: 'Shampoo',
          price: 20,
          quantity: 2,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 10);

      expect(result.subtotal).toBe(90); // 50 + (20 * 2)
      expect(result.tax).toBe(4.5); // 5% of 90
      expect(result.tip).toBe(10);
      expect(result.amountDue).toBe(104.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart with tip', () => {
      const result = calculateTotals([], [], 10);

      expect(result.subtotal).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.tip).toBe(10);
      expect(result.amountDue).toBe(10); // Only tip
    });

    it('should handle negative tip (should not happen but test anyway)', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], -10);

      expect(result.tip).toBe(-10);
      // Amount due = 100 + 5 - 10 = 95
      expect(result.amountDue).toBe(95);
    });

    it('should round all decimal values correctly', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 33.333,
          quantity: 3,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 12.999);

      expect(result.subtotal).toBe(100); // 33.333 * 3 = 99.999, rounds to 100
      expect(result.tax).toBe(5); // 5% of 100 = 5
      expect(result.tip).toBe(13); // 12.999 rounds to 13
      expect(result.amountDue).toBe(118); // 100 + 5 + 13 = 118
    });
  });

  describe('Integration with Payment Methods', () => {
    it('should calculate change due when payment includes tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const paymentMethods: PaymentMethod[] = [
        { method: 'CASH', amount: 150 }
      ];

      const result = calculateTotals(cartItems, paymentMethods, 20);

      expect(result.amountDue).toBe(125); // 100 + 5 (tax) + 20 (tip)
      expect(result.amountPaid).toBe(150);
      expect(result.changeDue).toBe(25); // 150 - 125
    });

    it('should handle split payment with tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: '1',
          name: 'Service',
          price: 100,
          quantity: 1,
          discount: 0
        }
      ];

      const paymentMethods: PaymentMethod[] = [
        { method: 'CASH', amount: 60 },
        { method: 'CREDIT', amount: 65 }
      ];

      const result = calculateTotals(cartItems, paymentMethods, 20);

      expect(result.amountDue).toBe(125); // 100 + 5 (tax) + 20 (tip)
      expect(result.amountPaid).toBe(125); // 60 + 65
      expect(result.changeDue).toBe(0);
    });
  });
});

describe('formatCurrency', () => {
  it('should format positive amounts correctly', () => {
    expect(formatCurrency(10)).toBe('$10.00');
    expect(formatCurrency(10.5)).toBe('$10.50');
    expect(formatCurrency(10.99)).toBe('$10.99');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should format large amounts correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(999999.99)).toBe('$999,999.99');
  });

  it('should round to 2 decimal places', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
    expect(formatCurrency(10.001)).toBe('$10.00');
  });
});

describe('parseCurrency', () => {
  it('should parse plain numbers', () => {
    expect(parseCurrency('10')).toBe(10);
    expect(parseCurrency('10.50')).toBe(10.50);
    expect(parseCurrency('0')).toBe(0);
  });

  it('should parse currency with dollar sign', () => {
    expect(parseCurrency('$10')).toBe(10);
    expect(parseCurrency('$10.50')).toBe(10.50);
  });

  it('should parse currency with commas', () => {
    expect(parseCurrency('1,000')).toBe(1000);
    expect(parseCurrency('$1,000.50')).toBe(1000.50);
  });

  it('should handle invalid input', () => {
    expect(parseCurrency('')).toBe(0);
    expect(parseCurrency('abc')).toBe(0);
    expect(parseCurrency('$')).toBe(0);
  });

  it('should round to 2 decimal places', () => {
    expect(parseCurrency('10.999')).toBe(11);
    expect(parseCurrency('10.001')).toBe(10);
  });
});
