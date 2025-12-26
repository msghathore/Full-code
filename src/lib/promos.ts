/**
 * Promo Management Utility
 * Handles reading, validating, and applying Hormozi-style promotional offers
 */

export interface PromoOffer {
  type: 'exit_intent' | 'lead_magnet' | 'referral' | 'limited_spots';
  code?: string;
  discountPercent?: number;
  discountAmount?: number;
  freeUpgrade?: boolean;
  description: string;
  icon: string;
  source: string;
}

/**
 * Check localStorage for active promo offers
 * Returns the best available offer (highest value)
 */
export const getActivePromo = (): PromoOffer | null => {
  const offers: PromoOffer[] = [];

  // Check for exit intent offer (20% OFF)
  const exitIntentEmail = localStorage.getItem('exit_intent_email');
  if (exitIntentEmail) {
    offers.push({
      type: 'exit_intent',
      discountPercent: 20,
      description: 'Exit Intent Special - 20% OFF',
      icon: '🎁',
      source: 'Exit Intent Popup',
    });
  }

  // Check for lead magnet offer (FREE upgrade)
  const leadMagnetClaimed = localStorage.getItem('lead_magnet_claimed');
  if (leadMagnetClaimed) {
    offers.push({
      type: 'lead_magnet',
      freeUpgrade: true,
      discountPercent: 15, // Estimated value of upgrade
      description: 'Lead Magnet Bonus - FREE Premium Upgrade',
      icon: '✨',
      source: 'Lead Magnet Download',
    });
  }

  // Check for referral code
  const referralCode = localStorage.getItem('referral_code');
  if (referralCode) {
    offers.push({
      type: 'referral',
      code: referralCode,
      discountAmount: 20,
      description: 'Referral Bonus - $20 OFF',
      icon: '👥',
      source: 'Referral Program',
    });
  }

  // Check for limited spots promo
  const limitedSpots = localStorage.getItem('limited_spots_promo');
  if (limitedSpots) {
    offers.push({
      type: 'limited_spots',
      discountPercent: 25,
      description: 'Limited Availability - 25% OFF',
      icon: '⚡',
      source: 'Limited Spots Offer',
    });
  }

  // Return the best offer (highest value)
  if (offers.length === 0) return null;

  // Sort by value: fixed amounts > high percentages > low percentages
  offers.sort((a, b) => {
    const valueA = a.discountAmount || (a.discountPercent || 0);
    const valueB = b.discountAmount || (b.discountPercent || 0);
    return valueB - valueA;
  });

  return offers[0];
};

/**
 * Calculate discount amount based on promo offer and subtotal
 */
export const calculatePromoDiscount = (
  promo: PromoOffer | null,
  subtotal: number
): number => {
  if (!promo) return 0;

  if (promo.discountAmount) {
    // Fixed dollar discount (e.g., $20 off)
    return Math.min(promo.discountAmount, subtotal);
  }

  if (promo.discountPercent) {
    // Percentage discount (e.g., 20% off)
    return subtotal * (promo.discountPercent / 100);
  }

  return 0;
};

/**
 * Apply promo discount to total price
 */
export const applyPromoToTotal = (
  subtotal: number,
  promo: PromoOffer | null
): { subtotal: number; discount: number; total: number; promo: PromoOffer | null } => {
  const discount = calculatePromoDiscount(promo, subtotal);
  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total: Math.max(total, 0), // Ensure total doesn't go negative
    promo,
  };
};

/**
 * Mark promo as used (remove from localStorage)
 */
export const markPromoAsUsed = (promo: PromoOffer | null) => {
  if (!promo) return;

  switch (promo.type) {
    case 'exit_intent':
      localStorage.removeItem('exit_intent_email');
      break;
    case 'lead_magnet':
      localStorage.removeItem('lead_magnet_claimed');
      break;
    case 'referral':
      localStorage.removeItem('referral_code');
      break;
    case 'limited_spots':
      localStorage.removeItem('limited_spots_promo');
      break;
  }
};

/**
 * Check if promo can be combined with group discount
 */
export const canCombineWithGroupDiscount = (promo: PromoOffer | null): boolean => {
  // Exit intent and lead magnet offers can't combine with group discount
  // Referral bonus CAN stack with group discount
  if (!promo) return true;
  return promo.type === 'referral';
};
