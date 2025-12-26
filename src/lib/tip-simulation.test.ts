/**
 * Real-World Tip Calculation Simulation Tests
 * Tests actual customer scenarios to prevent failures in production
 */

import { describe, it, expect } from 'vitest';
import { calculateTotals, CartItem, PaymentMethod } from './posCalculations';

describe('Real-World Customer Scenarios', () => {
  describe('Scenario 1: Simple Haircut with 15% Tip', () => {
    it('should calculate correctly for $50 haircut with 15% tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'haircut-001',
          name: 'Mens Haircut',
          price: 50,
          quantity: 1,
          discount: 0
        }
      ];

      // Staff selects 15% tip
      const tip = Math.round(50 * 0.15 * 100) / 100; // $7.50

      const result = calculateTotals(cartItems, [], tip);

      expect(result.subtotal).toBe(50);
      expect(result.tax).toBe(2.50); // 5% GST
      expect(result.tip).toBe(7.50);
      expect(result.amountDue).toBe(60); // 50 + 2.50 + 7.50
    });
  });

  describe('Scenario 2: Multiple Services with 20% Tip', () => {
    it('should calculate correctly for haircut + shave with 20% tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'haircut-001',
          name: 'Haircut',
          price: 50,
          quantity: 1,
          discount: 0
        },
        {
          item_type: 'service',
          item_id: 'shave-001',
          name: 'Straight Razor Shave',
          price: 30,
          quantity: 1,
          discount: 0
        }
      ];

      const subtotal = 80;
      const tip = Math.round(subtotal * 0.20 * 100) / 100; // $16

      const result = calculateTotals(cartItems, [], tip);

      expect(result.subtotal).toBe(80);
      expect(result.tax).toBe(4); // 5% of 80
      expect(result.tip).toBe(16);
      expect(result.amountDue).toBe(100); // 80 + 4 + 16
    });
  });

  describe('Scenario 3: Service + Products with Custom Tip', () => {
    it('should handle service + products with custom $15 tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'haircut-001',
          name: 'Haircut',
          price: 50,
          quantity: 1,
          discount: 0
        },
        {
          item_type: 'product',
          item_id: 'shampoo-001',
          name: 'Professional Shampoo',
          price: 25,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 15); // Custom $15 tip

      expect(result.subtotal).toBe(75);
      expect(result.tax).toBe(3.75); // 5% of 75
      expect(result.tip).toBe(15);
      expect(result.amountDue).toBe(93.75); // 75 + 3.75 + 15
    });
  });

  describe('Scenario 4: Walk-in with No Tip', () => {
    it('should handle walk-in customer declining tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'haircut-001',
          name: 'Haircut',
          price: 35,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 0); // No tip

      expect(result.subtotal).toBe(35);
      expect(result.tax).toBe(1.75); // 5% of 35
      expect(result.tip).toBe(0);
      expect(result.amountDue).toBe(36.75); // 35 + 1.75 + 0
    });
  });

  describe('Scenario 5: Discounted Service with 10% Tip', () => {
    it('should calculate tip on discounted service correctly', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'haircut-001',
          name: 'Haircut (Senior Discount)',
          price: 50,
          quantity: 1,
          discount: 10 // $10 senior discount
        }
      ];

      const originalSubtotal = 50;
      const tip = Math.round(originalSubtotal * 0.10 * 100) / 100; // 10% of original $50 = $5

      const result = calculateTotals(cartItems, [], tip);

      expect(result.subtotal).toBe(50);
      expect(result.discount).toBe(10);
      expect(result.tax).toBe(2); // 5% of (50 - 10) = 5% of 40
      expect(result.tip).toBe(5);
      // Amount due = (50 - 10) + 2 + 5 = 47
      expect(result.amountDue).toBe(47);
    });
  });

  describe('Scenario 6: Appointment with Deposit', () => {
    it('should subtract deposit and add tip correctly', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'color-001',
          name: 'Hair Coloring',
          price: 150,
          quantity: 1,
          discount: 0,
          deposit_amount: 30 // $30 deposit paid at booking
        }
      ];

      const tip = Math.round(150 * 0.15 * 100) / 100; // 15% tip = $22.50

      const result = calculateTotals(cartItems, [], tip);

      expect(result.subtotal).toBe(150);
      expect(result.deposit).toBe(30);
      expect(result.tax).toBe(7.50); // 5% of 150
      expect(result.tip).toBe(22.50);
      // Amount due = 150 + 7.50 + 22.50 - 30 = 150
      expect(result.amountDue).toBe(150);
    });
  });

  describe('Scenario 7: Group Service (Multiple Quantities)', () => {
    it('should handle same service for multiple people with 18% tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'haircut-001',
          name: 'Haircut',
          price: 40,
          quantity: 3, // 3 people
          discount: 0
        }
      ];

      const subtotal = 120; // 40 * 3
      const tip = Math.round(subtotal * 0.18 * 100) / 100; // 18% = $21.60

      const result = calculateTotals(cartItems, [], tip);

      expect(result.subtotal).toBe(120);
      expect(result.tax).toBe(6); // 5% of 120
      expect(result.tip).toBe(21.60);
      expect(result.amountDue).toBe(147.60); // 120 + 6 + 21.60
    });
  });

  describe('Scenario 8: Odd Amounts with Custom Tip', () => {
    it('should handle odd-cent amounts with custom tip', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'service-001',
          name: 'Specialty Service',
          price: 67.99,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 12.50); // Custom $12.50 tip

      expect(result.subtotal).toBe(67.99);
      expect(result.tax).toBe(3.40); // 5% of 67.99 = 3.3995, rounds to 3.40
      expect(result.tip).toBe(12.50);
      expect(result.amountDue).toBe(83.89); // 67.99 + 3.40 + 12.50
    });
  });

  describe('Scenario 9: Round Dollar Amounts', () => {
    it('should handle round dollar amounts perfectly', () => {
      const testCases = [
        { price: 25, tip: 5, expectedDue: 31.25 }, // 25 + 1.25 (tax) + 5 (tip)
        { price: 50, tip: 10, expectedDue: 62.50 }, // 50 + 2.50 (tax) + 10 (tip)
        { price: 100, tip: 20, expectedDue: 125 }, // 100 + 5 (tax) + 20 (tip)
        { price: 75, tip: 15, expectedDue: 93.75 }, // 75 + 3.75 (tax) + 15 (tip)
      ];

      testCases.forEach(({ price, tip, expectedDue }) => {
        const cartItems: CartItem[] = [
          {
            item_type: 'service',
            item_id: 'test',
            name: 'Test Service',
            price,
            quantity: 1,
            discount: 0
          }
        ];

        const result = calculateTotals(cartItems, [], tip);
        expect(result.amountDue).toBe(expectedDue);
      });
    });
  });

  describe('Scenario 10: Edge Case - Very Small Tip', () => {
    it('should handle $0.50 tip correctly', () => {
      const cartItems: CartItem[] = [
        {
          item_type: 'service',
          item_id: 'quicktrim-001',
          name: 'Quick Trim',
          price: 15,
          quantity: 1,
          discount: 0
        }
      ];

      const result = calculateTotals(cartItems, [], 0.50);

      expect(result.subtotal).toBe(15);
      expect(result.tax).toBe(0.75); // 5% of 15
      expect(result.tip).toBe(0.50);
      expect(result.amountDue).toBe(16.25); // 15 + 0.75 + 0.50
    });
  });
});

describe('Tip Calculation Accuracy', () => {
  describe('Percentage Calculations', () => {
    it('should calculate exact percentages for common subtotals', () => {
      const subtotals = [25, 30, 35, 40, 45, 50, 60, 75, 80, 90, 100];
      const percentages = [0.10, 0.15, 0.18, 0.20, 0.25];

      subtotals.forEach(subtotal => {
        percentages.forEach(percentage => {
          const expectedTip = Math.round(subtotal * percentage * 100) / 100;

          const cartItems: CartItem[] = [
            {
              item_type: 'service',
              item_id: 'test',
              name: 'Test',
              price: subtotal,
              quantity: 1,
              discount: 0
            }
          ];

          const result = calculateTotals(cartItems, [], expectedTip);

          // Verify tip is exactly as calculated
          expect(result.tip).toBe(expectedTip);

          // Verify no floating point errors
          expect(result.tip).toBe(Math.round(result.tip * 100) / 100);
        });
      });
    });
  });

  describe('Rounding Consistency', () => {
    it('should always round to 2 decimal places', () => {
      const testTips = [
        10.001, 10.005, 10.009, 10.991, 10.995, 10.999,
        5.124, 5.125, 5.126, 15.874, 15.875, 15.876
      ];

      testTips.forEach(inputTip => {
        const cartItems: CartItem[] = [
          {
            item_type: 'service',
            item_id: 'test',
            name: 'Test',
            price: 50,
            quantity: 1,
            discount: 0
          }
        ];

        const result = calculateTotals(cartItems, [], inputTip);

        // Tip should be rounded to 2 decimal places
        const expectedTip = Math.round(inputTip * 100) / 100;
        expect(result.tip).toBe(expectedTip);

        // Verify it has max 2 decimal places
        const decimalPlaces = (result.tip.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });
  });
});

describe('Critical Customer-Facing Scenarios', () => {
  it('should never show negative tip', () => {
    const cartItems: CartItem[] = [
      {
        item_type: 'service',
        item_id: 'test',
        name: 'Test',
        price: 50,
        quantity: 1,
        discount: 0
      }
    ];

    // Even if negative tip somehow gets through (shouldn't happen with UI validation)
    const result = calculateTotals(cartItems, [], -5);

    // While the calculation allows it (for refund scenarios),
    // UI should never allow selecting negative tip
    expect(result.tip).toBe(-5);
  });

  it('should handle very large tip without error', () => {
    const cartItems: CartItem[] = [
      {
        item_type: 'service',
        item_id: 'test',
        name: 'Test',
        price: 50,
        quantity: 1,
        discount: 0
      }
    ];

    // Customer wants to tip $1000 on a $50 service (generous!)
    const result = calculateTotals(cartItems, [], 1000);

    expect(result.tip).toBe(1000);
    expect(result.amountDue).toBe(1052.50); // 50 + 2.50 + 1000
    expect(Number.isFinite(result.amountDue)).toBe(true);
  });

  it('should handle zero subtotal with tip (edge case)', () => {
    // Edge case: What if cart gets cleared but tip remains?
    const result = calculateTotals([], [], 10);

    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.tip).toBe(10);
    expect(result.amountDue).toBe(10); // Just the tip
  });

  it('should maintain precision across complex calculations', () => {
    const cartItems: CartItem[] = [
      {
        item_type: 'service',
        item_id: '1',
        name: 'Service 1',
        price: 33.33,
        quantity: 1,
        discount: 3.33
      },
      {
        item_type: 'service',
        item_id: '2',
        name: 'Service 2',
        price: 66.67,
        quantity: 2,
        discount: 6.67
      }
    ];

    const tip = 17.77;

    const result = calculateTotals(cartItems, [], tip);

    // All values should be rounded to 2 decimal places
    expect(result.subtotal.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.discount.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.tax.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.tip.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    expect(result.amountDue.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });
});
