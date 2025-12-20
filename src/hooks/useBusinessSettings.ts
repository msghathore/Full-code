import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BusinessSettings {
  businessName: string;
  businessNameShort: string;
  address: {
    street: string;
    city: string;
    province: string;
    country: string;
    full: string;
  };
  phone: string;
  phoneRaw: string;
  email: string;
  hours: {
    display: string;
    open: string;
    close: string;
  };
  timezone: string;
  foundedYear: string;
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
    handle: string;
  };
}

// Default values from businessConstants.ts for fallback
const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Zavira Salon & Spa',
  businessNameShort: 'Zavira',
  address: {
    street: '283 Tache Avenue',
    city: 'Winnipeg',
    province: 'MB',
    country: 'Canada',
    full: '283 Tache Avenue, Winnipeg, MB, Canada',
  },
  phone: '(431) 816-3330',
  phoneRaw: '+14318163330',
  email: 'zavirasalonandspa@gmail.com',
  hours: {
    display: 'Daily: 8:00 AM - 11:30 PM',
    open: '08:00',
    close: '23:30',
  },
  timezone: 'America/Winnipeg',
  foundedYear: '2020',
  social: {
    instagram: 'https://instagram.com/zavirasalon',
    facebook: 'https://facebook.com/zavirasalon',
    twitter: 'https://twitter.com/zavirasalon',
    handle: '@ZaviraSalon',
  },
};

/**
 * Hook to fetch business settings from Supabase
 * Falls back to default constants if fetch fails
 *
 * Usage:
 * const { settings, isLoading, error } = useBusinessSettings();
 *
 * Note: For now, this uses static constants. In the future, enable
 * the Supabase fetch by uncommenting the query below.
 */
export const useBusinessSettings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['business-settings'],
    queryFn: async (): Promise<BusinessSettings> => {
      const { data: settings, error } = await supabase
        .from('business_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.warn('Failed to fetch business settings, using defaults:', error);
        return DEFAULT_SETTINGS;
      }

      // Convert array of key-value pairs to object
      const settingsMap: Record<string, string> = {};
      settings?.forEach(item => {
        settingsMap[item.setting_key] = item.setting_value;
      });

      return {
        businessName: settingsMap.business_name || DEFAULT_SETTINGS.businessName,
        businessNameShort: settingsMap.business_name_short || DEFAULT_SETTINGS.businessNameShort,
        address: {
          street: settingsMap.address_street || DEFAULT_SETTINGS.address.street,
          city: settingsMap.address_city || DEFAULT_SETTINGS.address.city,
          province: settingsMap.address_province || DEFAULT_SETTINGS.address.province,
          country: settingsMap.address_country || DEFAULT_SETTINGS.address.country,
          full: settingsMap.address_full || DEFAULT_SETTINGS.address.full,
        },
        phone: settingsMap.phone || DEFAULT_SETTINGS.phone,
        phoneRaw: settingsMap.phone_raw || DEFAULT_SETTINGS.phoneRaw,
        email: settingsMap.email || DEFAULT_SETTINGS.email,
        hours: {
          display: settingsMap.hours_display || DEFAULT_SETTINGS.hours.display,
          open: settingsMap.hours_open || DEFAULT_SETTINGS.hours.open,
          close: settingsMap.hours_close || DEFAULT_SETTINGS.hours.close,
        },
        timezone: settingsMap.timezone || DEFAULT_SETTINGS.timezone,
        foundedYear: settingsMap.founded_year || DEFAULT_SETTINGS.foundedYear,
        social: {
          instagram: settingsMap.social_instagram || DEFAULT_SETTINGS.social.instagram,
          facebook: settingsMap.social_facebook || DEFAULT_SETTINGS.social.facebook,
          twitter: settingsMap.social_twitter || DEFAULT_SETTINGS.social.twitter,
          handle: settingsMap.social_handle || DEFAULT_SETTINGS.social.handle,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  return {
    settings: data || DEFAULT_SETTINGS,
    isLoading,
    error,
  };
};

export default useBusinessSettings;
