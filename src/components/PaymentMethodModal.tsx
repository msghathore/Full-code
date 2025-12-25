import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Smartphone,
  Banknote,
  FileText,
  Gift,
  SplitSquareHorizontal,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Plus,
  Minus,
  CreditCard,
  Loader2
} from 'lucide-react';
import { formatCurrency, parseCurrency, PaymentMethod } from '@/lib/posCalculations';

// Types
interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountDue: number;
  terminalConnected: boolean;
  terminalName?: string;
  onTerminalPayment: () => void;
  onManualPayment: (payments: PaymentMethod[]) => void;
  isProcessing: boolean;
  terminalProcessing?: boolean;
}

type PaymentType = 'TERMINAL' | 'CASH' | 'CHECK' | 'GIFT_CERTIFICATE';
type SplitMode = 'none' | 'by_amount' | 'by_person';

interface SplitPayment {
  id: string;
  type: PaymentType;
  amount: number;
  giftCardNumber?: string;
  giftCardBalance?: number;
}

// Animation variants for luxury feel
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
      staggerChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 10,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const pulseVariants = {
  pulse: {
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0)',
      '0 0 0 8px rgba(59, 130, 246, 0.1)',
      '0 0 0 0 rgba(59, 130, 246, 0)'
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};

// Payment method button component
const PaymentMethodButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  primary?: boolean;
  className?: string;
}> = ({ icon, label, description, onClick, selected, disabled, primary, className }) => (
  <motion.button
    variants={buttonVariants}
    initial="idle"
    whileHover={!disabled ? "hover" : "idle"}
    whileTap={!disabled ? "tap" : "idle"}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-colors
      ${primary
        ? 'bg-gradient-to-br from-slate-500 to-slate-600 border-gray-400 text-white shadow-lg shadow-slate-500/25'
        : selected
          ? 'bg-gray-50 border-gray-500 text-gray-900'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className || ''}
    `}
  >
    {selected && !primary && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute top-2 right-2"
      >
        <CheckCircle className="h-5 w-5 text-slate-900" />
      </motion.div>
    )}
    <div className={`mb-2 ${primary ? 'text-white' : ''}`}>{icon}</div>
    <span className={`font-medium text-sm ${primary ? 'text-white' : ''}`}>{label}</span>
    {description && (
      <span className={`text-xs mt-1 ${primary ? 'text-slate-100' : 'text-gray-500'}`}>{description}</span>
    )}
  </motion.button>
);

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  amountDue,
  terminalConnected,
  terminalName,
  onTerminalPayment,
  onManualPayment,
  isProcessing,
  terminalProcessing
}) => {
  // State
  const [splitMode, setSplitMode] = useState<SplitMode>('none');
  const [payments, setPayments] = useState<SplitPayment[]>([]);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [showGiftCardPrompt, setShowGiftCardPrompt] = useState(false);
  const [giftCardInput, setGiftCardInput] = useState('');
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null);
  const [isCheckingGiftCard, setIsCheckingGiftCard] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentType | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSplitMode('none');
      setPayments([]);
      setNumberOfPeople(2);
      setShowGiftCardPrompt(false);
      setGiftCardInput('');
      setGiftCardBalance(null);
      setSelectedMethod(null);
    }
  }, [isOpen]);

  // Calculate total paid and remaining
  const totalPaid = useMemo(() =>
    payments.reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const remaining = useMemo(() =>
    Math.max(0, amountDue - totalPaid),
    [amountDue, totalPaid]
  );

  // Handle single payment method selection (non-split mode)
  const handleSinglePayment = (type: PaymentType) => {
    if (type === 'TERMINAL') {
      onTerminalPayment();
      return;
    }

    if (type === 'GIFT_CERTIFICATE') {
      setSelectedMethod(type);
      setShowGiftCardPrompt(true);
      return;
    }

    // For Cash and Check, proceed directly
    const payment: PaymentMethod = { method: type === 'TERMINAL' ? 'CREDIT' : type, amount: amountDue };
    onManualPayment([payment]);
  };

  // Handle gift card balance check (simulated)
  const checkGiftCardBalance = async () => {
    if (!giftCardInput.trim()) return;

    setIsCheckingGiftCard(true);

    // Simulate API call - in real implementation, this would call your gift card API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulated balance (in real app, fetch from database)
    const simulatedBalance = Math.random() * 100 + 20; // Random balance for demo
    setGiftCardBalance(simulatedBalance);
    setIsCheckingGiftCard(false);
  };

  // Handle gift card payment after balance check
  const handleGiftCardPayment = () => {
    if (giftCardBalance === null) return;

    if (giftCardBalance >= amountDue) {
      // Gift card covers full amount
      const payment: PaymentMethod = { method: 'GIFT_CERTIFICATE', amount: amountDue };
      onManualPayment([payment]);
    } else {
      // Gift card doesn't cover full amount - prompt for second payment
      const giftPayment: SplitPayment = {
        id: `gc_${Date.now()}`,
        type: 'GIFT_CERTIFICATE',
        amount: giftCardBalance,
        giftCardNumber: giftCardInput,
        giftCardBalance: giftCardBalance
      };
      setPayments([giftPayment]);
      setSplitMode('by_amount');
      setShowGiftCardPrompt(false);
      setGiftCardInput('');
      setGiftCardBalance(null);
    }
  };

  // Add payment to split
  const addSplitPayment = (type: PaymentType) => {
    if (type === 'TERMINAL') {
      // Can't add terminal to split - it processes full amount
      return;
    }

    if (type === 'GIFT_CERTIFICATE') {
      setShowGiftCardPrompt(true);
      return;
    }

    const newPayment: SplitPayment = {
      id: `${type}_${Date.now()}`,
      type,
      amount: remaining
    };
    setPayments(prev => [...prev, newPayment]);
  };

  // Update split payment amount
  const updatePaymentAmount = (id: string, amount: number) => {
    setPayments(prev => prev.map(p =>
      p.id === id ? { ...p, amount } : p
    ));
  };

  // Remove split payment
  const removePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  // Initialize split by person
  const initializeSplitByPerson = () => {
    const amountPerPerson = Math.ceil(amountDue / numberOfPeople);
    const newPayments: SplitPayment[] = Array.from({ length: numberOfPeople }, (_, i) => ({
      id: `person_${i}_${Date.now()}`,
      type: 'CASH' as PaymentType,
      amount: i === numberOfPeople - 1
        ? amountDue - (amountPerPerson * (numberOfPeople - 1)) // Last person pays remainder
        : amountPerPerson
    }));
    setPayments(newPayments);
  };

  // Process split payments
  const processSplitPayments = () => {
    if (totalPaid < amountDue) return;

    const paymentMethods: PaymentMethod[] = payments.map(p => ({
      method: p.type === 'GIFT_CERTIFICATE' ? 'GIFT_CERTIFICATE' : p.type,
      amount: p.amount
    }));

    onManualPayment(paymentMethods);
  };

  // Get payment method icon
  const getPaymentIcon = (type: PaymentType) => {
    switch (type) {
      case 'TERMINAL': return <Smartphone className="h-6 w-6" />;
      case 'CASH': return <Banknote className="h-6 w-6" />;
      case 'CHECK': return <FileText className="h-6 w-6" />;
      case 'GIFT_CERTIFICATE': return <Gift className="h-6 w-6" />;
      default: return <DollarSign className="h-6 w-6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <motion.div
              className="flex items-center justify-between p-6 border-b border-gray-100"
              variants={itemVariants}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Amount due: <span className="font-medium text-gray-900">{formatCurrency(amountDue)}</span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <div className="p-6">
              {/* No Terminal Warning */}
              {!terminalConnected && (
                <motion.div
                  variants={itemVariants}
                  className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">No Terminal Connected</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Card payments are not available. Please use cash, check, or gift certificate.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Gift Card Balance Check Modal */}
              {showGiftCardPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-900">Gift Certificate</span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Input
                      type="text"
                      value={giftCardInput}
                      onChange={(e) => setGiftCardInput(e.target.value)}
                      placeholder="Enter gift card number"
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && checkGiftCardBalance()}
                    />
                    <Button
                      onClick={checkGiftCardBalance}
                      disabled={isCheckingGiftCard || !giftCardInput.trim()}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {isCheckingGiftCard ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Check'
                      )}
                    </Button>
                  </div>

                  {giftCardBalance !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-white rounded-lg border border-amber-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Card Balance:</span>
                        <span className="font-medium text-amber-700">{formatCurrency(giftCardBalance)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">Amount Due:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(amountDue)}</span>
                      </div>

                      {giftCardBalance < amountDue && (
                        <div className="p-2 bg-amber-50 rounded-lg mb-3">
                          <p className="text-xs text-amber-700">
                            Gift card balance is less than amount due. You'll need to add another payment method for the remaining {formatCurrency(amountDue - giftCardBalance)}.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowGiftCardPrompt(false);
                            setGiftCardInput('');
                            setGiftCardBalance(null);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleGiftCardPayment}
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                          {giftCardBalance >= amountDue ? 'Pay Full Amount' : 'Use Balance & Continue'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Split Mode Selection */}
              {splitMode === 'none' && !showGiftCardPrompt && (
                <>
                  {/* Payment Methods Grid */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
                    {/* Terminal - Primary (if connected) */}
                    {terminalConnected && (
                      <motion.div
                        className="col-span-2"
                        animate="pulse"
                        variants={pulseVariants}
                      >
                        <PaymentMethodButton
                          icon={<Smartphone className="h-8 w-8" />}
                          label="Pay on Terminal"
                          description={terminalName || 'Square Terminal'}
                          onClick={() => handleSinglePayment('TERMINAL')}
                          disabled={isProcessing || terminalProcessing}
                          primary
                        />
                      </motion.div>
                    )}

                    {/* Cash */}
                    <PaymentMethodButton
                      icon={<Banknote className="h-6 w-6" />}
                      label="Cash"
                      onClick={() => handleSinglePayment('CASH')}
                      disabled={isProcessing}
                    />

                    {/* Check */}
                    <PaymentMethodButton
                      icon={<FileText className="h-6 w-6" />}
                      label="Check"
                      onClick={() => handleSinglePayment('CHECK')}
                      disabled={isProcessing}
                    />

                    {/* Gift Certificate */}
                    <PaymentMethodButton
                      icon={<Gift className="h-6 w-6" />}
                      label="Gift Certificate"
                      onClick={() => handleSinglePayment('GIFT_CERTIFICATE')}
                      disabled={isProcessing}
                    />

                    {/* Split Payment */}
                    <PaymentMethodButton
                      icon={<SplitSquareHorizontal className="h-6 w-6" />}
                      label="Split Payment"
                      onClick={() => setSplitMode('by_amount')}
                      disabled={isProcessing}
                    />
                  </motion.div>

                  {/* Split Options */}
                  <motion.div
                    variants={itemVariants}
                    className="flex gap-2"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-gray-500 hover:text-gray-700"
                      onClick={() => setSplitMode('by_amount')}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Split by Amount
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-gray-500 hover:text-gray-700"
                      onClick={() => setSplitMode('by_person')}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Split by Person
                    </Button>
                  </motion.div>
                </>
              )}

              {/* Split by Amount Mode */}
              {splitMode === 'by_amount' && !showGiftCardPrompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Back Link - Always visible at top */}
                  <button
                    onClick={() => {
                      setSplitMode('none');
                      setPayments([]);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to payment methods
                  </button>

                  {/* Added Payments */}
                  {payments.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Payments</div>
                      {payments.map((payment, index) => (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="text-gray-500">
                            {getPaymentIcon(payment.type)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.type.replace('_', ' ')}
                            </div>
                            {payment.giftCardNumber && (
                              <div className="text-xs text-gray-500">
                                Card: {payment.giftCardNumber}
                              </div>
                            )}
                          </div>
                          <Input
                            type="text"
                            value={payment.amount ? payment.amount.toString() : ''}
                            onChange={(e) => updatePaymentAmount(payment.id, parseCurrency(e.target.value))}
                            className="w-24 h-8 text-right"
                            placeholder="0.00"
                            disabled={!!payment.giftCardBalance}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removePayment(payment.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Add Payment Method */}
                  {remaining > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Add Payment ({formatCurrency(remaining)} remaining)
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSplitPayment('CASH')}
                        >
                          <Banknote className="h-4 w-4 mr-1" />
                          Cash
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSplitPayment('CHECK')}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Check
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSplitPayment('GIFT_CERTIFICATE')}
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Gift Cert
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-medium ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSplitMode('none');
                        setPayments([]);
                      }}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={processSplitPayments}
                      disabled={totalPaid < amountDue || isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Complete Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Split by Person Mode */}
              {splitMode === 'by_person' && !showGiftCardPrompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Back Link - Always visible at top */}
                  <button
                    onClick={() => {
                      setSplitMode('none');
                      setPayments([]);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to payment methods
                  </button>

                  {/* Number of People */}
                  {payments.length === 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Number of People</div>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setNumberOfPeople(prev => Math.max(2, prev - 1))}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          <Minus className="h-5 w-5" />
                        </motion.button>
                        <span className="text-3xl font-bold text-gray-900 w-16 text-center">
                          {numberOfPeople}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setNumberOfPeople(prev => Math.min(10, prev + 1))}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          <Plus className="h-5 w-5" />
                        </motion.button>
                      </div>
                      <div className="text-center text-sm text-gray-500 mb-4">
                        Each person pays: <span className="font-medium text-gray-900">
                          {formatCurrency(Math.ceil(amountDue / numberOfPeople))}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSplitMode('none')}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={initializeSplitByPerson}
                          className="flex-1 bg-black hover:bg-slate-800"
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Individual Payments */}
                  {payments.length > 0 && (
                    <>
                      <div className="space-y-3">
                        {payments.map((payment, index) => (
                          <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-gray-900">Person {index + 1}</span>
                              <Badge variant="outline">{formatCurrency(payment.amount)}</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {['CASH', 'CHECK', 'GIFT_CERTIFICATE'].map(type => (
                                <Button
                                  key={type}
                                  variant={payment.type === type ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setPayments(prev => prev.map(p =>
                                    p.id === payment.id ? { ...p, type: type as PaymentType } : p
                                  ))}
                                  className={payment.type === type ? 'bg-black' : ''}
                                >
                                  {type === 'CASH' && <Banknote className="h-3 w-3 mr-1" />}
                                  {type === 'CHECK' && <FileText className="h-3 w-3 mr-1" />}
                                  {type === 'GIFT_CERTIFICATE' && <Gift className="h-3 w-3 mr-1" />}
                                  {type === 'CASH' ? 'Cash' : type === 'CHECK' ? 'Check' : 'Gift'}
                                </Button>
                              ))}
                            </div>
                            <div className="mt-3">
                              <Input
                                type="text"
                                value={payment.amount ? payment.amount.toString() : ''}
                                onChange={(e) => updatePaymentAmount(payment.id, parseCurrency(e.target.value))}
                                className="text-right h-9"
                                placeholder="0.00"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Summary */}
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Paid:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Remaining:</span>
                          <span className={`font-medium ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(remaining)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSplitMode('none');
                            setPayments([]);
                          }}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={processSplitPayments}
                          disabled={totalPaid < amountDue || isProcessing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Complete Payment
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Loading Overlay */}
            <AnimatePresence>
              {(isProcessing || terminalProcessing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-black mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      {terminalProcessing ? 'Waiting for customer...' : 'Processing payment...'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentMethodModal;
