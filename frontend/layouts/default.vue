<script setup lang="ts">
const { t } = useI18n()
const { pageView } = useAnalytics()

onMounted(() => {
  pageView('default')
})
</script>

<template>
  <div>
    <LanguageSwitcher />
    <NuxtPage />
  </div>
</template>
