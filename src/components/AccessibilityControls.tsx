import { Accessibility } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "@/hooks/use-theme"
import { useLanguage } from "@/hooks/use-language"
import { useFontSize } from "@/hooks/use-font-size"
import { Lightbulb, Languages, Type, Sun, Moon, Monitor, Contrast } from "lucide-react"

export function AccessibilityControls() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { fontSize, setFontSize } = useFontSize()

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("system")
    else if (theme === "system") setTheme("high-contrast")
    else if (theme === "high-contrast") setTheme("dark")
    else setTheme("dark")
  }

  const cycleLanguage = () => {
    if (language === "en") setLanguage("fr")
    else if (language === "fr") setLanguage("es")
    else setLanguage("en")
  }

  const cycleFontSize = () => {
    if (fontSize === "small") setFontSize("medium")
    else if (fontSize === "medium") setFontSize("large")
    else if (fontSize === "large") setFontSize("extra-large")
    else setFontSize("small")
  }

  const getThemeDisplay = () => {
    switch (theme) {
      case "light": return "Light"
      case "system": return "System"
      case "high-contrast": return "Contrast"
      default: return "Dark"
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light": return <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
      case "system": return <Monitor className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
      case "high-contrast": return <Contrast className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
      default: return <Moon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
    }
  }

  const getLanguageDisplay = () => {
    switch (language) {
      case "en": return "EN"
      case "fr": return "FR"
      case "es": return "ES"
      default: return "EN"
    }
  }

  const getFontSizeDisplay = () => {
    switch (fontSize) {
      case "small": return "Small"
      case "medium": return "Medium"
      case "large": return "Large"
      case "extra-large": return "X-Large"
      default: return "Medium"
    }
  }

  // Dynamic styles based on theme
  const isHighContrast = theme === "high-contrast"
  const isLight = theme === "light"

  const triggerButtonClass = isHighContrast
    ? "fixed top-24 sm:top-[55%] right-2 sm:right-4 z-[1000] border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-300 cursor-hover"
    : isLight
    ? "fixed top-24 sm:top-[55%] right-2 sm:right-4 z-[1000] border-black/30 hover:bg-black/10 transition-all duration-300 cursor-hover bg-white text-black hover:text-black shadow-md"
    : "fixed top-24 sm:top-[55%] right-2 sm:right-4 z-[1000] border-white/30 hover:bg-white/10 transition-all duration-300 cursor-hover bg-black/80 text-white hover:text-white"

  const popoverClass = isHighContrast
    ? "w-[70vw] sm:w-80 max-w-sm bg-black border-2 border-white text-white z-[1001]"
    : isLight
    ? "w-[70vw] sm:w-80 max-w-sm bg-white/95 backdrop-blur-sm border-black/20 text-black z-[1001] shadow-lg"
    : "w-[70vw] sm:w-80 max-w-sm bg-black/95 backdrop-blur-sm border-white/20 text-white z-[1001]"

  const optionButtonClass = isHighContrast
    ? "border-2 border-white hover:bg-white hover:text-black bg-transparent text-white text-xs px-2 sm:px-3 h-7 sm:h-8 min-w-[80px] sm:min-w-[90px] justify-center"
    : isLight
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
          <Accessibility className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
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