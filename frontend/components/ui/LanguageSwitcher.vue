<script setup lang="ts">
const { locale, setLocale } = useI18n()

const languageItems = computed(() => [
  { value: 'pl', label: '', icon: '🇵🇱' },
  { value: 'en', label: '', icon: '🇬🇧' },
  { value: 'de', label: '', icon: '🇩🇪' },
  { value: 'uk', label: '', icon: '🇺🇦' },
])

function setLanguage(code: string) {
  if (code === 'pl' || code === 'en' || code === 'de' || code === 'uk') {
    setLocale(code)
    // Save to localStorage
    localStorage.setItem('user-language', code)
  }
}
</script>

<template>
  <div class="language-switcher">
    <Dropdown
      :model-value="locale"
      :items="languageItems"
      @update:model-value="setLanguage"
      position="bottom-left"
    />
  </div>
</template>

<style scoped>
.language-switcher {
  position: fixed;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2000;
}

/* Update dropdown styles for light theme */
.language-switcher :deep(.dropdown__trigger) {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.language-switcher :deep(.dropdown__trigger:hover) {
  background: #fff;
}

.language-switcher :deep(.dropdown__menu) {
  background: #fff;
  border-color: #e5e7eb;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.language-switcher :deep(.dropdown__option) {
  color: #4b5563;
}

.language-switcher :deep(.dropdown__option:hover) {
  background: #f3f4f6;
  color: #1f2937;
}

.language-switcher :deep(.dropdown__option--active) {
  background: #ecfdf5;
  color: #10b981;
}
</style>
