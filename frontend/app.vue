<script setup lang="ts">
const route = useRoute()
const { pageView } = useAnalytics()

// Redirect root to explore
watchEffect(() => {
  if (route.path === '/') {
    navigateTo('/explore', { replace: true })
  }
})

onMounted(() => {
  if (route.path !== '/') {
    pageView('app')
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
