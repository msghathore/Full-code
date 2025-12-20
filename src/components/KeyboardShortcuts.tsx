import { useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useFontSize } from '@/hooks/use-font-size';

export function KeyboardShortcuts() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts when not typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      // Alt + T: Toggle theme
      if (event.altKey && event.key === 't') {
        event.preventDefault();
        if (theme === "dark") setTheme("light");
        else if (theme === "light") setTheme("high-contrast");
        else if (theme === "high-contrast") setTheme("dark");
        else setTheme("dark");
      }

      // Alt + F: Toggle font size
      if (event.altKey && event.key === 'f') {
        event.preventDefault();
        if (fontSize === "small") setFontSize("medium");
        else if (fontSize === "medium") setFontSize("large");
        else if (fontSize === "large") setFontSize("extra-large");
        else setFontSize("small");
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
  }, [theme, setTheme, fontSize, setFontSize]);

  return null; // This component doesn't render anything
}