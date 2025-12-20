import { createContext, useContext } from 'react'
import { useTranslation } from 'react-i18next'

type Language = 'en' | 'fr'

type LanguageProviderProps = {
  children: React.ReactNode
}

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

const initialState: LanguageProviderState = {
  language: 'en',
  setLanguage: () => null,
  t: () => '',
}

const LanguageProviderContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n, t: i18nT } = useTranslation()

  const language = (i18n.language?.substring(0, 2) || 'en') as Language

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang)
  }

  const t = (key: string, options?: Record<string, unknown>): string => {
    return i18nT(key, options as any) as string
  }

  const value = {
    language,
    setLanguage,
    t,
  }

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)

  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider')

  return context
}
