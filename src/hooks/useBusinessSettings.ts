import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessSettings {
  business_name: string;
  business_name_short: string;
  address_full: string;
  address_street: string;
  address_city: string;
  address_province: string;
  address_country: string;
  phone: string;
  phone_raw: string;
  email: string;
  hours_display: string;
  hours_open: string;
  hours_close: string;
  timezone: string;
  founded_year: string;
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  social_handle: string;
}

interface UseBusinessSettingsReturn {
  settings: BusinessSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch business settings from the database
 * Returns all business configuration data including contact info, hours, social media, etc.
 */
export const useBusinessSettings = (): UseBusinessSettingsReturn => {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('business_settings')
        .select('setting_key, setting_value');

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('No business settings found');
      }

      // Convert array of key-value pairs to object
      const settingsObject = data.reduce((acc, { setting_key, setting_value }) => {
        acc[setting_key] = setting_value;
        return acc;
      }, {} as Record<string, string>);

      setSettings(settingsObject as BusinessSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business settings';
      setError(errorMessage);
      console.error('Error fetching business settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
};
