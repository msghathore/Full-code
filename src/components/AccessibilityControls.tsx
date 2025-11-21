import { Accessibility } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "@/hooks/use-theme"
import { useLanguage } from "@/hooks/use-language"
import { useFontSize } from "@/hooks/use-font-size"
import { Lightbulb, Languages, Type } from "lucide-react"

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
      case "high-contrast": return "High Contrast"
      default: return "Dark"
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
      case "extra-large": return "Extra Large"
      default: return "Medium"
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-16 sm:top-1/2 right-2 sm:right-4 z-[1000] border-white/20 hover:bg-white/10 luxury-glow transition-all duration-300 cursor-hover bg-black/80 text-white hover:text-white"
          aria-label="Accessibility controls"
        >
          <Accessibility className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
          <span className="sr-only">Open accessibility controls</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[90vw] sm:w-80 max-w-sm bg-black/90 border-white/20 text-white" align="end" side="left">
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">Accessibility Controls</h3>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm sm:text-base">Theme</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleTheme}
                className="border-white/20 hover:bg-white/10 bg-transparent text-white text-xs sm:text-sm px-2 sm:px-3"
              >
                {getThemeDisplay()}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span className="text-sm sm:text-base">Language</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleLanguage}
                className="border-white/20 hover:bg-white/10 bg-transparent text-white text-xs sm:text-sm px-2 sm:px-3"
              >
                {getLanguageDisplay()}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="text-sm sm:text-base">Font Size</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cycleFontSize}
                className="border-white/20 hover:bg-white/10 bg-transparent text-white text-xs sm:text-sm px-2 sm:px-3"
              >
                {getFontSizeDisplay()}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}