<script setup lang="ts">
const { pageView } = useAnalytics()

onMounted(() => {
  pageView('app')
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
