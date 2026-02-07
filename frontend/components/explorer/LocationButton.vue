<script setup lang="ts">
interface Props {
  isActive: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  toggle: []
  reset: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="location-button">
    <!-- GPS Toggle Button -->
    <button
      class="location-button__gps"
      :class="{ 'location-button__gps--active': isActive }"
      :disabled="isLoading"
      @click="emit('toggle')"
    >
      <svg
        class="location-button__icon"
        :class="{ 'location-button__icon--loading': isLoading }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <span class="location-button__label">
        {{ t('explorer.location.get') }}
      </span>
    </button>

    <!-- Reset Button (visible when GPS is active) -->
    <Transition name="location-button__fade">
      <button
        v-if="isActive"
        class="location-button__reset"
        :disabled="isLoading"
        @click="emit('reset')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span>{{ t('explorer.location.reset') }}</span>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.location-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  width: 100%;
  box-sizing: border-box;
}

.location-button__gps {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.location-button__gps:hover:not(:disabled) {
  background: #e5e7eb;
}

.location-button__gps--active {
  background: #10b981;
  border-color: #10b981;
  color: #fff;
}

.location-button__gps:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.location-button__icon {
  width: 1.125rem;
  height: 1.125rem;
}

.location-button__icon--loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.location-button__label {
  white-space: nowrap;
}

.location-button__reset {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.location-button__reset:hover:not(:disabled) {
  background: #f9fafb;
  color: #374151;
}

.location-button__reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.location-button__reset svg {
  width: 1rem;
  height: 1rem;
}

.location-button__fade-enter-active,
.location-button__fade-leave-active {
  transition: all 0.2s ease;
}

.location-button__fade-enter-from,
.location-button__fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
