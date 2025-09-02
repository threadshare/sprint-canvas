import React from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  
  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === 'zh' ? 'EN' : '中文'}
      </span>
    </Button>
  )
}