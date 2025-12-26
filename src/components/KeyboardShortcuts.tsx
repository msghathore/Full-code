import { useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';

export function KeyboardShortcuts() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Alt + T: Toggle theme (dark/light only)
      if (event.altKey && event.key === 't') {
        event.preventDefault();
        if (theme === "dark") setTheme("light");
        else setTheme("dark");
      }

      // Alt + H: Go to home
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        window.location.href = '/';
      }

      // Alt + S: Go to services
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        window.location.href = '/services';
      }

      // Alt + B: Go to booking
      if (event.altKey && event.key === 'b') {
        event.preventDefault();
        window.location.href = '/booking';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);

  return null; // This component doesn't render anything
}