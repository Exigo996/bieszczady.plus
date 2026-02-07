import type { Language } from '~/i18n'

const STORAGE_KEY = 'user-language'

export const useUserStore = defineStore('user', () => {
  const language = ref<Language>('pl')
  const withChildren = ref(false)
  const currentPoiId = ref<string | null>(null)

  function setLanguage(lang: Language) {
    language.value = lang
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, lang)
    }
  }

  function toggleChildren() {
    withChildren.value = !withChildren.value
  }

  function setCurrentPoiId(id: string | null) {
    currentPoiId.value = id
  }

  return {
    language,
    withChildren,
    currentPoiId,
    setLanguage,
    toggleChildren,
    setCurrentPoiId,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
