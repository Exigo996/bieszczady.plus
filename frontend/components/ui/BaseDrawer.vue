<script setup lang="ts">
interface Props {
  modelValue: boolean
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  size: 'md',
  persistent: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const drawerRef = ref<HTMLElement | null>(null)

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    left: {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96',
      xl: 'w-[28rem]',
      full: 'w-full',
    },
    right: {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96',
      xl: 'w-[28rem]',
      full: 'w-full',
    },
    top: {
      sm: 'h-48',
      md: 'h-64',
      lg: 'h-80',
      xl: 'h-96',
      full: 'h-full',
    },
    bottom: {
      sm: 'h-48',
      md: 'h-64',
      lg: 'h-80',
      xl: 'h-96',
      full: 'h-full',
    },
  }
  return sizes[props.position][props.size]
})

// Position classes
const positionClasses = computed(() => {
  const positions = {
    left: 'left-0 top-0 bottom-0',
    right: 'right-0 top-0 bottom-0',
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
  }
  return positions[props.position]
})

// Transform for off-canvas state
const transformClass = computed(() => {
  if (props.modelValue) return 'translate-0'
  const transforms = {
    left: '-translate-x-full',
    right: 'translate-x-full',
    top: '-translate-y-full',
    bottom: 'translate-y-full',
  }
  return transforms[props.position]
})

function close() {
  if (!props.persistent) {
    emit('update:modelValue', false)
  }
}

// Close on escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !props.persistent) {
    close()
  }
}

// Handle backdrop click
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget && !props.persistent) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

watch(() => props.modelValue, (isOpen) => {
  if (import.meta.client) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="base-drawer__backdrop"
        @click="handleBackdropClick"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class=""
      leave-active-class="transition-transform duration-300 ease-in"
      leave-to-class=""
    >
      <div
        v-if="modelValue"
        ref="drawerRef"
        class="base-drawer"
        :class="[sizeClasses, positionClasses, transformClass]"
      >
        <div v-if="$slots.header" class="base-drawer__header">
          <slot name="header" />
          <button
            class="base-drawer__close"
            @click="close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="base-drawer__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="base-drawer__footer">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-drawer__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.base-drawer {
  position: fixed;
  background: #fff;
  z-index: 1000;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  max-height: 100vh;
}

.base-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.base-drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.base-drawer__close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.base-drawer__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.base-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.base-drawer__footer {
  padding: 1.25rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}
</style>
