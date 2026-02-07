<script setup lang="ts">
const { pageView } = useAnalytics()

onMounted(() => {
  pageView('fullscreen')
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden">
    <LanguageSwitcher />
    <NuxtPage />
  </div>
</template>
