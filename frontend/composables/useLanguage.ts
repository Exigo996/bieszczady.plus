import type { Language } from '~/i18n'

const SUPPORTED_LANGUAGES: Language[] = ['pl', 'en', 'de', 'uk']

export function useLanguage() {
  const { locale, setLocale } = useI18n()
  const userStore = useUserStore()

  function detectLanguage(): Language {
    const browserLang = navigator.language?.split('-')[0] as Language
    return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en'
  }

  function initLanguage() {
    const detected = detectLanguage()
    userStore.setLanguage(detected)
    setLocale(detected)
  }

  function changeLanguage(lang: Language) {
    userStore.setLanguage(lang)
    setLocale(lang)
  }

  return {
    locale,
    detectLanguage,
    initLanguage,
    changeLanguage,
  }
}
