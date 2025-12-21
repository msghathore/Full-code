import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useIsMobile } from '@/hooks/use-mobile';

export const PWAInstallPrompt = () => {
  const { isInstallable, installPWA } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useIsMobile();

  if (!isInstallable || dismissed || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[1000] bg-black/90 border border-white/20 rounded-lg p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="h-6 w-6 text-white" />
          <div>
            <h3 className="text-white font-semibold">Install Zavira App</h3>
            <p className="text-white/70 text-sm">Get the full app experience with offline access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={installPWA}
            size="sm"
            className="bg-white text-black hover:bg-white/90"
          >
            Install
          </Button>
          <Button
            onClick={() => setDismissed(true)}
            size="sm"
            variant="ghost"
            className="text-white/70 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};