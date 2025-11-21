import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { config } from '@/lib/environment';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const savedPreferences = localStorage.getItem('cookie-preferences');
    const consentGiven = localStorage.getItem('cookie-consent');

    if (!consentGiven) {
      setShowBanner(true);
    } else if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };

    setPreferences(allPreferences);
    savePreferences(allPreferences);
    setShowBanner(false);
    applyPreferences(allPreferences);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };

    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
    setShowBanner(false);
    applyPreferences(necessaryOnly);
  };

  const handleSaveSettings = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
    applyPreferences(preferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // Google Analytics
    if (prefs.analytics && config.analytics.googleAnalyticsId) {
      // Enable GA
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    } else {
      // Disable GA
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }

    // Marketing cookies
    if (prefs.marketing) {
      // Enable marketing cookies
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
        });
      }
    } else {
      // Disable marketing cookies
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
        });
      }
    }

    // Functional cookies
    if (prefs.functional) {
      // Enable functional cookies
      localStorage.setItem('functional-cookies-enabled', 'true');
    } else {
      // Disable functional cookies
      localStorage.removeItem('functional-cookies-enabled');
    }
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Necessary cookies cannot be disabled

    setPreferences(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 bg-black/95 backdrop-blur-sm border-t border-white/20">
      {!showSettings ? (
        <Card className="max-w-none sm:max-w-4xl mx-auto bg-black/90 border-white/20">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-white mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-white">Cookie Preferences</h3>
                <p className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4 leading-relaxed">
                  We use cookies to enhance your browsing experience. Manage your preferences below.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleAcceptAll} size="sm" className="w-full sm:w-auto">
                    Accept All
                  </Button>
                  <Button onClick={handleAcceptNecessary} variant="outline" size="sm" className="w-full sm:w-auto">
                    Necessary Only
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-none sm:max-w-2xl mx-auto bg-black/90 border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              Cookie Settings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-white/80">
              Manage your cookie preferences. Necessary cookies are required for the website to function.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 pt-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="font-medium text-white text-sm sm:text-base">Necessary Cookies</h4>
                  <p className="text-xs sm:text-sm text-white/70">
                    Required for basic website functionality
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="rounded flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="font-medium text-white text-sm sm:text-base">Analytics Cookies</h4>
                  <p className="text-xs sm:text-sm text-white/70">
                    Help us understand website usage
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                  className="rounded flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="font-medium text-white text-sm sm:text-base">Marketing Cookies</h4>
                  <p className="text-xs sm:text-sm text-white/70">
                    Used for personalized advertisements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                  className="rounded flex-shrink-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className="font-medium text-white text-sm sm:text-base">Functional Cookies</h4>
                  <p className="text-xs sm:text-sm text-white/70">
                    Enable enhanced functionality
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                  className="rounded flex-shrink-0"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
              <Button onClick={handleSaveSettings} size="sm" className="w-full sm:w-auto">
                Save Settings
              </Button>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CookieConsent;