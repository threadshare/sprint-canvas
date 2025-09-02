import React, { createContext, useContext, useState } from 'react'
import type { Language } from '@/lib/i18n/translations'
import { getTranslation } from '@/lib/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Get initial language from localStorage or browser preference
  const getInitialLanguage = (): Language => {
    const stored = localStorage.getItem('language')
    if (stored === 'en' || stored === 'zh') {
      return stored
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('zh')) {
      return 'zh'
    }
    return 'en'
  }
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }
  
  const t = (key: string) => getTranslation(language, key)
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}