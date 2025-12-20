import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TerminalDevice {
  id: string;
  name: string;
  status: string;
  locationId?: string;
  productType?: string;
}

interface TerminalCheckout {
  checkoutId: string;
  status: string;
  amount: number;
  tipAmount?: number;
  deviceId: string;
  createdAt?: string;
  paymentId?: string;
}

interface UseSquareTerminalReturn {
  devices: TerminalDevice[];
  selectedDevice: TerminalDevice | null;
  isLoading: boolean;
  isProcessing: boolean;
  currentCheckout: TerminalCheckout | null;
  error: string | null;
  loadDevices: () => Promise<void>;
  selectDevice: (device: TerminalDevice) => void;
  createCheckout: (params: CreateCheckoutParams) => Promise<TerminalCheckout | null>;
  cancelCheckout: () => Promise<void>;
  getCheckoutStatus: () => Promise<TerminalCheckout | null>;
  pairNewDevice: (name?: string) => Promise<{ code: string; deviceId: string } | null>;
}

interface CreateCheckoutParams {
  amount: number;
  currency?: string;
  referenceId?: string;
  note?: string;
  appointmentId?: string;
  customerId?: string;
  staffId?: string;
  cartItems?: any[];
}

export function useSquareTerminal(): UseSquareTerminalReturn {
  const [devices, setDevices] = useState<TerminalDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<TerminalDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentCheckout, setCurrentCheckout] = useState<TerminalCheckout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load saved device preference
  useEffect(() => {
    const savedDeviceId = localStorage.getItem('zavira_terminal_device_id');
    if (savedDeviceId && devices.length > 0) {
      const device = devices.find(d => d.id === savedDeviceId);
      if (device) {
        setSelectedDevice(device);
      }
    }
  }, [devices]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Load available devices
  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('terminal-checkout', {
        body: { action: 'list_devices' }
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      setDevices(data.devices || []);

      // Auto-select if only one device
      if (data.devices?.length === 1) {
        setSelectedDevice(data.devices[0]);
        localStorage.setItem('zavira_terminal_device_id', data.devices[0].id);
      }

    } catch (err: any) {
      console.error('Failed to load devices:', err);
      setError(err.message || 'Failed to load terminal devices');
      toast({
        title: 'Failed to load devices',
        description: err.message || 'Could not connect to Square Terminal',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Select a device
  const selectDevice = useCallback((device: TerminalDevice) => {
    setSelectedDevice(device);
    localStorage.setItem('zavira_terminal_device_id', device.id);
  }, []);

  // Create a checkout on the terminal
  const createCheckout = useCallback(async (params: CreateCheckoutParams): Promise<TerminalCheckout | null> => {
    if (!selectedDevice) {
      toast({
        title: 'No device selected',
        description: 'Please select a Square Terminal device first.',
        variant: 'destructive',
      });
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert amount to cents
      const amountInCents = Math.round(params.amount * 100);

      const { data, error: fnError } = await supabase.functions.invoke('terminal-checkout', {
        body: {
          action: 'create_checkout',
          deviceId: selectedDevice.id,
          amount: amountInCents,
          currency: params.currency || 'CAD',
          referenceId: params.referenceId || `pos_${Date.now()}`,
          note: params.note || 'Zavira Beauty Service',
          appointmentId: params.appointmentId,
          customerId: params.customerId,
          staffId: params.staffId,
          cartItems: params.cartItems,
        }
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      const checkout: TerminalCheckout = {
        checkoutId: data.checkoutId,
        status: data.status,
        amount: data.amount,
        deviceId: selectedDevice.id,
        createdAt: data.createdAt,
      };

      setCurrentCheckout(checkout);

      toast({
        title: 'Payment sent to terminal',
        description: `$${params.amount.toFixed(2)} - Customer can tap or insert card now`,
      });

      // Start polling for status updates
      startStatusPolling(data.checkoutId);

      return checkout;

    } catch (err: any) {
      console.error('Failed to create checkout:', err);
      setError(err.message || 'Failed to create terminal checkout');
      toast({
        title: 'Terminal error',
        description: err.message || 'Failed to send payment to terminal',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedDevice, toast]);

  // Start polling for checkout status
  const startStatusPolling = useCallback((checkoutId: string) => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    let attempts = 0;
    const maxAttempts = 120; // 2 minutes at 1 second intervals

    pollingRef.current = setInterval(async () => {
      attempts++;

      try {
        const { data, error: fnError } = await supabase.functions.invoke('terminal-checkout', {
          body: {
            action: 'get_checkout_status',
            checkoutId,
          }
        });

        if (fnError) throw fnError;

        const checkout: TerminalCheckout = {
          checkoutId: data.checkoutId,
          status: data.status,
          amount: data.amount,
          tipAmount: data.tipMoney,
          deviceId: selectedDevice?.id || '',
          paymentId: data.paymentIds?.[0],
        };

        setCurrentCheckout(checkout);

        // Handle terminal states
        if (data.status === 'COMPLETED') {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;

          toast({
            title: '✅ Payment successful!',
            description: `$${data.amount.toFixed(2)}${data.tipMoney > 0 ? ` + $${data.tipMoney.toFixed(2)} tip` : ''} received`,
          });

          setCurrentCheckout(null);
        } else if (data.status === 'CANCELED') {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;

          toast({
            title: 'Payment canceled',
            description: data.cancelReason || 'Customer canceled the payment',
            variant: 'destructive',
          });

          setCurrentCheckout(null);
        }

        // Timeout check
        if (attempts >= maxAttempts) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setCurrentCheckout(null);

          toast({
            title: 'Payment timeout',
            description: 'The payment request has timed out. Please try again.',
            variant: 'destructive',
          });
        }

      } catch (err: any) {
        console.error('Status polling error:', err);
        // Don't stop polling on transient errors
      }
    }, 1000); // Poll every second
  }, [selectedDevice, toast]);

  // Cancel current checkout
  const cancelCheckout = useCallback(async () => {
    if (!currentCheckout) return;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('terminal-checkout', {
        body: {
          action: 'cancel_checkout',
          checkoutId: currentCheckout.checkoutId,
        }
      });

      if (fnError) throw fnError;

      // Stop polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      setCurrentCheckout(null);

      toast({
        title: 'Payment canceled',
        description: 'The terminal payment has been canceled',
      });

    } catch (err: any) {
      console.error('Failed to cancel checkout:', err);
      toast({
        title: 'Cancel failed',
        description: err.message || 'Could not cancel the payment',
        variant: 'destructive',
      });
    }
  }, [currentCheckout, toast]);

  // Get current checkout status manually
  const getCheckoutStatus = useCallback(async (): Promise<TerminalCheckout | null> => {
    if (!currentCheckout) return null;

    try {
      const { data, error: fnError } = await supabase.functions.invoke('terminal-checkout', {
        body: {
          action: 'get_checkout_status',
          checkoutId: currentCheckout.checkoutId,
        }
      });

      if (fnError) throw fnError;

      return {
        checkoutId: data.checkoutId,
        status: data.status,
        amount: data.amount,
        tipAmount: data.tipMoney,
        deviceId: selectedDevice?.id || '',
        paymentId: data.paymentIds?.[0],
      };

    } catch (err: any) {
      console.error('Failed to get checkout status:', err);
      return null;
    }
  }, [currentCheckout, selectedDevice]);

  // Pair a new device
  const pairNewDevice = useCallback(async (name?: string): Promise<{ code: string; deviceId: string } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('terminal-checkout', {
        body: {
          action: 'pair_device',
          name: name || 'Zavira Terminal',
        }
      });

      if (fnError) throw fnError;
      if (!data.success) throw new Error(data.error);

      toast({
        title: 'Pairing code generated',
        description: `Enter code ${data.code} on your Square Terminal`,
      });

      return {
        code: data.code,
        deviceId: data.deviceId,
      };

    } catch (err: any) {
      console.error('Failed to pair device:', err);
      setError(err.message || 'Failed to generate pairing code');
      toast({
        title: 'Pairing failed',
        description: err.message || 'Could not generate pairing code',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    devices,
    selectedDevice,
    isLoading,
    isProcessing,
    currentCheckout,
    error,
    loadDevices,
    selectDevice,
    createCheckout,
    cancelCheckout,
    getCheckoutStatus,
    pairNewDevice,
  };
}
