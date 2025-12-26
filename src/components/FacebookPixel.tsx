import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Facebook Pixel tracking component
// Replace 'YOUR_PIXEL_ID' with your actual Facebook Pixel ID from Meta Business Suite

const FB_PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID || 'YOUR_PIXEL_ID';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

export const FacebookPixel = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize Facebook Pixel
    if (!window.fbq) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      // Add noscript tracking pixel
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />
      `;
      document.body.appendChild(noscript);
    }
  }, []);

  useEffect(() => {
    // Track page views on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
};

// Utility functions for tracking specific events
export const trackFBEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Common event trackers
export const trackViewContent = (contentName: string, value?: number) => {
  trackFBEvent('ViewContent', {
    content_name: contentName,
    value: value,
    currency: 'USD'
  });
};

export const trackAddToCart = (contentName: string, value: number) => {
  trackFBEvent('AddToCart', {
    content_name: contentName,
    value: value,
    currency: 'USD'
  });
};

export const trackInitiateCheckout = (value: number) => {
  trackFBEvent('InitiateCheckout', {
    value: value,
    currency: 'USD'
  });
};

export const trackPurchase = (value: number, contentIds?: string[]) => {
  trackFBEvent('Purchase', {
    value: value,
    currency: 'USD',
    content_ids: contentIds
  });
};

export const trackLead = (contentName: string) => {
  trackFBEvent('Lead', {
    content_name: contentName
  });
};

export const trackCompleteRegistration = (registrationType: string) => {
  trackFBEvent('CompleteRegistration', {
    content_name: registrationType
  });
};

export const trackSearch = (searchString: string) => {
  trackFBEvent('Search', {
    search_string: searchString
  });
};
