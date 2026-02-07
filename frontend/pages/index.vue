<script setup lang="ts">
const router = useRouter()

// Redirect to explore page
onMounted(() => {
  router.replace('/explore')
})
</script>

<template>
  <div class="home-redirect">
    <div class="home-redirect__spinner" />
  </div>
</template>

<style scoped>
.home-redirect {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

.home-redirect__spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
