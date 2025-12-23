import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CORRECT_PASSWORD = 'Ghathore5';
const SESSION_KEY = 'maintenance_bypass';

interface MaintenanceModeProps {
  onAuthenticated: () => void;
}

export const MaintenanceMode = ({ onAuthenticated }: MaintenanceModeProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      // Store auth in session
      sessionStorage.setItem(SESSION_KEY, 'true');
      onAuthenticated();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Brand */}
        <h1
          className="text-6xl md:text-8xl font-serif font-bold mb-8 text-white"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)'
          }}
        >
          ZAVIRA
        </h1>

        {/* Maintenance Message */}
        <div className="space-y-4 mb-12">
          <h2
            className="text-3xl md:text-4xl font-serif text-white"
            style={{
              textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4)'
            }}
          >
            Under Maintenance
          </h2>
          <p
            className="text-lg md:text-xl text-white/90"
            style={{
              textShadow: '0 0 8px rgba(255,255,255,0.6), 0 0 16px rgba(255,255,255,0.4)'
            }}
          >
            We're currently making some improvements to serve you better.
            <br />
            Please check back soon.
          </p>
        </div>

        {/* Developer Access */}
        <div className="mt-16">
          <details className="group">
            <summary
              className="text-sm text-white/60 hover:text-white/80 cursor-pointer list-none transition-colors"
              style={{
                textShadow: '0 0 6px rgba(255,255,255,0.4)'
              }}
            >
              Developer Access
            </summary>

            <div className="mt-6 max-w-sm mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                  autoComplete="off"
                />

                {error && (
                  <p className="text-rose-400 text-sm">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Access Site
                </Button>
              </form>
            </div>
          </details>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p
          className="text-sm text-white/50"
          style={{
            textShadow: '0 0 6px rgba(255,255,255,0.3)'
          }}
        >
          © {new Date().getFullYear()} Zavira Salon & Spa
        </p>
      </div>
    </div>
  );
};

// Helper function to check if maintenance mode is bypassed
export const isMaintenanceBypassed = (): boolean => {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
};

// Helper function to clear bypass (for logout)
export const clearMaintenanceBypass = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};
