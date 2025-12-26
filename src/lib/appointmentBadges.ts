import { Repeat, FileText, DollarSign, CreditCard, Package, Users, AlertCircle } from 'lucide-react';

export type RetentionStatus = 'RR' | 'RNR' | 'NR' | 'NNR' | null;
export type PaymentStatus = 'paid' | 'deposit' | 'package' | 'membership' | 'pending' | null;

export const RETENTION_BADGES = {
  RR: {
    label: 'RR',
    tooltip: 'Return Request - Returning client requesting specific provider',
    bgColor: 'bg-slate-800',
    textColor: 'text-white',
    borderColor: 'border-gray-600'
  },
  RNR: {
    label: 'RNR',
    tooltip: 'Return Non-Request - Returning client NOT requesting specific provider',
    bgColor: 'bg-yellow-400',
    textColor: 'text-gray-900',
    borderColor: 'border-yellow-500'
  },
  NR: {
    label: 'NR',
    tooltip: 'New Request - New client requesting specific provider',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600'
  },
  NNR: {
    label: 'NNR',
    tooltip: 'New Non-Request - New client NOT requesting specific provider',
    bgColor: 'bg-slate-700',
    textColor: 'text-white',
    borderColor: 'border-gray-500'
  }
};

export const PAYMENT_ICONS = {
  paid: { icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100', tooltip: 'Paid in full' },
  deposit: { icon: CreditCard, color: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]', bgColor: 'bg-white/10', tooltip: 'Deposit placed' },
  package: { icon: Package, color: 'text-black', bgColor: 'bg-slate-50', tooltip: 'Paid with package' },
  membership: { icon: Users, color: 'text-black', bgColor: 'bg-slate-50', tooltip: 'Paid with membership' },
  pending: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100', tooltip: 'Payment pending' }
};

export const ATTRIBUTE_ICONS = {
  recurring: { icon: Repeat, color: 'text-black', tooltip: 'Recurring appointment' },
  has_note: { icon: FileText, color: 'text-yellow-600', tooltip: 'Has notes' }
};
