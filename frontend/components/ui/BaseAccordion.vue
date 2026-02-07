<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const contentRef = ref<HTMLElement | null>(null)
const contentHeight = ref(0)
const resizeObserver = ref<ResizeObserver | null>(null)

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}

// Update the content height
function updateHeight() {
  if (contentRef.value && props.modelValue) {
    contentHeight.value = contentRef.value.scrollHeight
  }
}

// Calculate height when opened
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      updateHeight()
      // Recalculate after a short delay to account for any delayed content rendering
      setTimeout(updateHeight, 100)
      setTimeout(updateHeight, 300)
    })
  } else {
    contentHeight.value = 0
  }
}, { immediate: true })

// Set up ResizeObserver to detect content changes
onMounted(() => {
  if (typeof ResizeObserver !== 'undefined' && contentRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      if (props.modelValue) {
        updateHeight()
      }
    })
    resizeObserver.value.observe(contentRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})
</script>

<template>
  <div class="base-accordion" :class="{ 'base-accordion--open': modelValue }">
    <button
      class="base-accordion__header"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="base-accordion__title">
        <slot name="title">{{ title }}</slot>
      </span>
      <svg
        class="base-accordion__icon"
        :class="{ 'base-accordion__icon--rotated': modelValue }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <div
      ref="contentRef"
      class="base-accordion__content"
      :class="{ 'base-accordion__content--open': modelValue }"
      :style="{ maxHeight: modelValue ? `${contentHeight}px` : '0' }"
    >
      <div class="base-accordion__inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-accordion {
  border-radius: 1rem;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.base-accordion__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.base-accordion__header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 1px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  pointer-events: none;
}

.base-accordion--open .base-accordion__header {
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
}

.base-accordion--open .base-accordion__header::after {
  opacity: 0;
}

.base-accordion__header:hover:not(:disabled) {
  background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
}

.base-accordion__header:active:not(:disabled) {
  background: #f1f5f9;
}

.base-accordion__header:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-accordion__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.01em;
}

.base-accordion__icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #10b981;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.base-accordion__icon--rotated {
  transform: rotate(180deg);
  color: #059669;
}

.base-accordion__content {
  overflow: hidden;
  transition: max-height 0.4s ease;
  will-change: max-height;
  background: #fff;
}

.base-accordion__content--open {
  /* Allow overflow for content that might exceed calculated height */
  overflow-y: auto;
}

.base-accordion__inner {
  padding: 1.5rem;
  min-height: 0;
}
</style>
