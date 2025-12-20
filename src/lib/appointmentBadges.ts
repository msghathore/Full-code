import { Repeat, FileText, DollarSign, CreditCard, Package, Users, AlertCircle } from 'lucide-react';

export type RetentionStatus = 'RR' | 'RNR' | 'NR' | 'NNR' | null;
export type PaymentStatus = 'paid' | 'deposit' | 'package' | 'membership' | 'pending' | null;

export const RETENTION_BADGES = {
  RR: {
    label: 'RR',
    tooltip: 'Return Request - Returning client requesting specific provider',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    borderColor: 'border-purple-600'
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
    bgColor: 'bg-violet-400',
    textColor: 'text-white',
    borderColor: 'border-violet-500'
  }
};

export const PAYMENT_ICONS = {
  paid: { icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100', tooltip: 'Paid in full' },
  deposit: { icon: CreditCard, color: 'text-orange-600', bgColor: 'bg-orange-100', tooltip: 'Deposit placed' },
  package: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100', tooltip: 'Paid with package' },
  membership: { icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-100', tooltip: 'Paid with membership' },
  pending: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100', tooltip: 'Payment pending' }
};

export const ATTRIBUTE_ICONS = {
  recurring: { icon: Repeat, color: 'text-violet-600', tooltip: 'Recurring appointment' },
  has_note: { icon: FileText, color: 'text-yellow-600', tooltip: 'Has notes' }
};
