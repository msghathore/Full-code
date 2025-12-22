import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "@/hooks/use-theme"
import { useLanguage } from "@/hooks/use-language"
import { useFontSize } from "@/hooks/use-font-size"
import { Lightbulb, Languages, Type, Sun, Moon } from "lucide-react"

// Wheelchair Ramp Accessibility Icon
const AnimatedAccessibilityIcon = ({ className = "", isLight = false }: { className?: string; isLight?: boolean }) => {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className={className}
      style={{
        filter: isLight
          ? 'grayscale(1) brightness(0.2)'
          : 'grayscale(1) invert(1) brightness(1.5)',
      }}
    >
      <source src="/videos/wheelchair.mp4" type="video/mp4" />
    </video>
  );
};

export function AccessibilityControls() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { fontSize, setFontSize } = useFontSize()

  // Toggle between dark and light only
  const cycleTheme = () => {
    if (theme === "dark") setTheme("light")
    else setTheme("dark")
  }

  // Toggle between English and French only
  const cycleLanguage = () => {
    if (language === "en") setLanguage("fr")
    else setLanguage("en")
  }

  // Cycle through 3 font sizes only: small, medium, large
  const cycleFontSize = () => {
    if (fontSize === "small") setFontSize("medium")
    else if (fontSize === "medium") setFontSize("large")
    else setFontSize("small")
  }

  const getThemeDisplay = () => {
    return theme === "light" ? "Light" : "Dark"
  }

  const getThemeIcon = () => {
    return theme === "light"
      ? <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
      : <Moon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
  }

  const getLanguageDisplay = () => {
    return language === "fr" ? "FR" : "EN"
  }

  const getFontSizeDisplay = () => {
    switch (fontSize) {
      case "small": return "Small"
      case "large": return "Large"
      default: return "Medium"
    }
  }

  // Dynamic styles based on theme
  const isLight = theme === "light"

  const triggerButtonClass = isLight
    ? "fixed top-1/2 -translate-y-1/2 right-2 sm:right-4 z-[1000] border-black/30 hover:bg-black/10 transition-all duration-300 cursor-hover bg-white text-black hover:text-black shadow-md"
    : "fixed top-1/2 -translate-y-1/2 right-2 sm:right-4 z-[1000] border-white/30 hover:bg-white/10 transition-all duration-300 cursor-hover bg-black/80 text-white hover:text-white"

  const popoverClass = isLight
    ? "w-[70vw] sm:w-80 max-w-sm bg-white/95 backdrop-blur-sm border-black/20 text-black z-[1001] shadow-lg"
    : "w-[70vw] sm:w-80 max-w-sm bg-black/95 backdrop-blur-sm border-white/20 text-white z-[1001]"

  const optionButtonClass = isLight
    ? "border-black/30 hover:bg-black/10 bg-transparent text-black text-xs px-2 sm:px-3 h-7 sm:h-8 min-w-[80px] sm:min-w-[90px] justify-center"
    : "border-white/30 hover:bg-white/10 bg-transparent text-white text-xs px-2 sm:px-3 h-7 sm:h-8 min-w-[80px] sm:min-w-[90px] justify-center"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={triggerButtonClass}
          aria-label="Accessibility controls"
        >
          <AnimatedAccessibilityIcon className="h-5 w-5 sm:h-6 sm:w-6" isLight={isLight} />
          <span className="sr-only">Open accessibility controls</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={popoverClass} align="end" side="left" sideOffset={8}>
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-sm sm:text-lg font-semibold">Accessibility Controls</h3>

          <div className="space-y-2 sm:space-y-3">
            {/* Theme Control */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-base">Theme</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleTheme}
                className={optionButtonClass}
                aria-label={`Current theme: ${getThemeDisplay()}. Click to change theme.`}
              >
                {getThemeIcon()}
                {getThemeDisplay()}
              </Button>
            </div>

            {/* Language Control */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Languages className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-base">Language</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleLanguage}
                className={optionButtonClass}
                aria-label={`Current language: ${getLanguageDisplay()}. Click to change language.`}
              >
                {getLanguageDisplay()}
              </Button>
            </div>

            {/* Font Size Control */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Type className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-base">Font Size</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleFontSize}
                className={optionButtonClass}
                aria-label={`Current font size: ${getFontSizeDisplay()}. Click to change font size.`}
              >
                {getFontSizeDisplay()}
              </Button>
            </div>
          </div>

          {/* Help text */}
          <p className={`text-[10px] sm:text-xs ${isLight ? 'text-black/60' : 'text-white/60'}`}>
            Click buttons to cycle through options
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
