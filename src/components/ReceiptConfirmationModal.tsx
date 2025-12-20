import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BUSINESS_NAME, BUSINESS_ADDRESS, BUSINESS_PHONE, SOCIAL_MEDIA } from '@/lib/businessConstants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mail,
  Printer,
  MessageSquare,
  Calendar,
  CheckCircle,
  Receipt,
  Loader2
} from 'lucide-react';

interface ReceiptConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  totalAmount: number;
  cartItems: Array<{
    name: string;
    price: number;
    quantity: number;
    item_type: string;
  }>;
  onRebook: () => void;
  customerName?: string;
}

interface EmailFormData {
  email: string;
  isSubmitting: boolean;
}

interface SmsFormData {
  phone: string;
  isSubmitting: boolean;
}

export const ReceiptConfirmationModal: React.FC<ReceiptConfirmationModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  totalAmount,
  cartItems,
  onRebook,
  customerName = "Customer"
}) => {
  const [emailForm, setEmailForm] = useState<EmailFormData>({ email: '', isSubmitting: false });
  const [smsForm, setSmsForm] = useState<SmsFormData>({ phone: '', isSubmitting: false });
  const [emailQueued, setEmailQueued] = useState(false);
  const [smsQueued, setSmsQueued] = useState(false);

  // Email receipt handler
  const handleEmailReceipt = async () => {
    if (!emailForm.email.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    setEmailForm(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Placeholder API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setEmailQueued(true);
      
      // Show success feedback
      setTimeout(() => {
        setEmailQueued(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to send email receipt:', error);
      alert('Failed to send email receipt. Please try again.');
    } finally {
      setEmailForm(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // SMS receipt handler
  const handleSmsReceipt = async () => {
    if (!smsForm.phone.trim()) {
      alert('Please enter a valid phone number');
      return;
    }

    setSmsForm(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Placeholder API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      setSmsQueued(true);
      
      // Show success feedback
      setTimeout(() => {
        setSmsQueued(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to send SMS receipt:', error);
      alert('Failed to send SMS receipt. Please try again.');
    } finally {
      setSmsForm(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Print receipt handler
  const handlePrintReceipt = () => {
    // Create receipt content for printing
    const receiptContent = `
      <div style="font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <h2 style="margin: 0;">${BUSINESS_NAME.toUpperCase()}</h2>
          <p style="margin: 5px 0;">${BUSINESS_ADDRESS.formatted}</p>
          <p style="margin: 5px 0;">${BUSINESS_PHONE}</p>
        </div>
        
        <div style="border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          ${cartItems.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>${item.name} (${item.quantity}x)</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total:</span>
            <span>$${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #000;">
          <p>Thank you for your business!</p>
          <p style="font-size: 12px;">Follow us on social media ${SOCIAL_MEDIA.handle}</p>
        </div>
      </div>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${transactionId}</title>
        </head>
        <body>
          ${receiptContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  // Rebook service handler
  const handleRebookService = () => {
    onRebook();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 text-gray-900">
            <CheckCircle className="h-8 w-8" />
            Transaction Completed Successfully!
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-center text-lg">
              <div className="flex items-center justify-center gap-2">
                <Receipt className="h-5 w-5" />
                <span className="font-mono text-sm bg-gray-50 text-gray-800 px-2 py-1 rounded border border-gray-200">
                  Transaction ID: {transactionId}
                </span>
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">
                Total: ${totalAmount.toFixed(2)}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Receipt Actions Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Receipt className="h-5 w-5 text-gray-700" />
              Send Receipt
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Receipt */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Email Receipt</span>
                </div>
                
                {!emailQueued ? (
                  <>
                    <Input
                      type="email"
                      placeholder="customer@email.com"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      disabled={emailForm.isSubmitting}
                    />
                    <Button
                      onClick={handleEmailReceipt}
                      disabled={emailForm.isSubmitting || !emailForm.email.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {emailForm.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Email Receipt
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Email queued successfully!</span>
                  </div>
                )}
              </div>

              {/* Print Receipt */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Print Receipt</span>
                </div>
                <Button
                  onClick={handlePrintReceipt}
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-900 bg-white"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
              </div>

              {/* SMS Receipt */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">SMS Receipt</span>
                </div>
                
                {!smsQueued ? (
                  <>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={smsForm.phone}
                      onChange={(e) => setSmsForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-white border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500"
                      disabled={smsForm.isSubmitting}
                    />
                    <Button
                      onClick={handleSmsReceipt}
                      disabled={smsForm.isSubmitting || !smsForm.phone.trim()}
                      variant="outline"
                      className="w-full border-green-300 text-green-600 hover:bg-green-50 bg-white"
                    >
                      {smsForm.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          SMS Receipt
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>SMS queued successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Action Section */}
          <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-900">
              <Calendar className="h-5 w-5" />
              Next Step - Book Another Appointment
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-orange-800">
                Ready to schedule the next service or appointment?
              </p>
              <Button
                onClick={handleRebookService}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg font-semibold"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Next Appointment
              </Button>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Transaction Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Items:</span>
                <span className="font-medium text-gray-900">{cartItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Services:</span>
                <span className="text-gray-900">{cartItems.filter(item => item.item_type === 'SERVICE').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Products:</span>
                <span className="text-gray-900">{cartItems.filter(item => item.item_type === 'PRODUCT').length}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-gray-900">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Done Button */}
        <div className="flex justify-center mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-8 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptConfirmationModal;