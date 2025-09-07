'use client'

import { useState, useEffect } from 'react'
import { Locale, locales, setLocale as setLocaleCookie } from '@/lib/i18n'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    // Get locale from cookie on mount
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1] as Locale

    if (cookieLocale && locales.includes(cookieLocale)) {
      setLocaleState(cookieLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale)
      setLocaleCookie(newLocale)
    }
  }

  return {
    locale,
    setLocale,
    locales,
  }
}
