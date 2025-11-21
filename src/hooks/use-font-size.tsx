import { createContext, useContext, useEffect, useState } from 'react'

type FontSize = 'small' | 'medium' | 'large' | 'extra-large'

type FontSizeProviderProps = {
  children: React.ReactNode
  defaultFontSize?: FontSize
  storageKey?: string
}

type FontSizeProviderState = {
  fontSize: FontSize
  setFontSize: (fontSize: FontSize) => void
}

const initialState: FontSizeProviderState = {
  fontSize: 'medium',
  setFontSize: () => null,
}

const FontSizeProviderContext = createContext<FontSizeProviderState>(initialState)

export function FontSizeProvider({
  children,
  defaultFontSize = 'medium',
  storageKey = 'vite-ui-font-size',
  ...props
}: FontSizeProviderProps) {
  const [fontSize, setFontSize] = useState<FontSize>(
    () => (localStorage.getItem(storageKey) as FontSize) || defaultFontSize
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Remove existing font size classes
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-extra-large')

    // Add current font size class
    root.classList.add(`font-size-${fontSize}`)
  }, [fontSize])

  const value = {
    fontSize,
    setFontSize: (fontSize: FontSize) => {
      localStorage.setItem(storageKey, fontSize)
      setFontSize(fontSize)
    },
  }

  return (
    <FontSizeProviderContext.Provider {...props} value={value}>
      {children}
    </FontSizeProviderContext.Provider>
  )
}

export const useFontSize = () => {
  const context = useContext(FontSizeProviderContext)

  if (context === undefined)
    throw new Error('useFontSize must be used within a FontSizeProvider')

  return context
}