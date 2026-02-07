# Vue 3 Advanced Patterns

## Table of Contents
1. [Composables](#composables)
2. [Provide/Inject](#provideinject)
3. [Async Components](#async-components)
4. [Teleport](#teleport)
5. [Suspense](#suspense)
6. [KeepAlive](#keepalive)
7. [Transition](#transition)
8. [Custom Directives](#custom-directives)
9. [Plugins](#plugins)
10. [Render Functions](#render-functions)

---

## Composables

Composables are functions that encapsulate and reuse stateful logic.

### Basic composable

```ts
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const doubled = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  function reset() {
    count.value = initialValue
  }
  
  return {
    count,
    doubled,
    increment,
    decrement,
    reset
  }
}

// Usage in component
const { count, doubled, increment } = useCounter(10)
```

### Async composable with fetch

```ts
// composables/useFetch.ts
import { ref, watchEffect, toValue, type MaybeRef } from 'vue'

export function useFetch<T>(url: MaybeRef<string>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function fetchData() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(toValue(url))
      if (!response.ok) throw new Error('Fetch failed')
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  watchEffect(() => {
    fetchData()
  })

  return { data, error, loading, refetch: fetchData }
}
```

### Composable with cleanup

```ts
// composables/useEventListener.ts
import { onMounted, onUnmounted } from 'vue'

export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | HTMLElement,
  event: K,
  callback: (e: WindowEventMap[K]) => void
) {
  onMounted(() => {
    target.addEventListener(event, callback as EventListener)
  })
  
  onUnmounted(() => {
    target.removeEventListener(event, callback as EventListener)
  })
}

// Usage
useEventListener(window, 'resize', (e) => {
  console.log('Window resized')
})
```

### Composable conventions

- Name starts with `use` (e.g., `useCounter`, `useMouse`)
- Return refs and functions (not reactive objects)
- Accept refs as arguments with `toValue()` for flexibility
- Handle cleanup in `onUnmounted` or return a cleanup function

---

## Provide/Inject

For deep component communication without prop drilling.

### Basic provide/inject

```ts
// Parent component
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)

// Deeply nested child
import { inject } from 'vue'

const theme = inject('theme')  // Ref<string>
```

### Type-safe provide/inject

```ts
// keys.ts - Create typed injection keys
import type { InjectionKey, Ref } from 'vue'

export interface User {
  name: string
  email: string
}

export const userKey: InjectionKey<Ref<User | null>> = Symbol('user')
export const themeKey: InjectionKey<Ref<'light' | 'dark'>> = Symbol('theme')

// Provider
import { provide, ref } from 'vue'
import { userKey } from './keys'

const user = ref<User | null>({ name: 'John', email: 'john@example.com' })
provide(userKey, user)

// Consumer
import { inject } from 'vue'
import { userKey } from './keys'

const user = inject(userKey)  // Ref<User | null> | undefined
// Or with default
const user = inject(userKey, ref(null))  // Ref<User | null>
```

### Provide with readonly

```ts
import { provide, readonly, ref } from 'vue'

const count = ref(0)
provide('count', readonly(count))  // Consumers can't modify
```

### App-level provide

```ts
// main.ts
const app = createApp(App)
app.provide('globalConfig', { apiUrl: '/api' })
```

---

## Async Components

### Basic async component

```ts
import { defineAsyncComponent } from 'vue'

const AsyncModal = defineAsyncComponent(() =>
  import('./components/Modal.vue')
)
```

### With loading and error states

```ts
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,        // Show loading after 200ms
  timeout: 3000,     // Error after 3s
  suspensible: false // Don't use with Suspense
})
```

### With Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

---

## Teleport

Render content to a different DOM location.

```vue
<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>

<template>
  <button @click="showModal = true">Open Modal</button>
  
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Modal Content</h2>
        <button @click="showModal = false">Close</button>
      </div>
    </div>
  </Teleport>
</template>
```

### Teleport options

```vue
<!-- Teleport to specific element -->
<Teleport to="#modal-container">
  <Modal />
</Teleport>

<!-- Conditional teleport -->
<Teleport to="body" :disabled="!isMobile">
  <Drawer />
</Teleport>

<!-- Multiple teleports to same target -->
<Teleport to="#notifications">
  <Notification v-for="n in notifications" :key="n.id" />
</Teleport>
```

---

## Suspense

Handle async dependencies in component tree.

### Basic Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

### Component with async setup

```vue
<!-- AsyncComponent.vue -->
<script setup>
// Top-level await makes component async
const data = await fetchData()
</script>

<template>
  <div>{{ data }}</div>
</template>
```

### Error handling with Suspense

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((e) => {
  error.value = e
  return false  // Prevent propagation
})
</script>

<template>
  <div v-if="error" class="error">
    {{ error.message }}
  </div>
  <Suspense v-else>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

---

## KeepAlive

Cache component instances.

```vue
<template>
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

### Include/exclude patterns

```vue
<!-- Include specific components -->
<KeepAlive include="TabA,TabB">
  <component :is="currentTab" />
</KeepAlive>

<!-- Exclude specific components -->
<KeepAlive :exclude="/Tab[CD]/">
  <component :is="currentTab" />
</KeepAlive>

<!-- Max cached instances -->
<KeepAlive :max="5">
  <component :is="currentTab" />
</KeepAlive>
```

### Lifecycle hooks

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log('Component activated from cache')
})

onDeactivated(() => {
  console.log('Component deactivated to cache')
})
</script>
```

---

## Transition

Animate enter/leave transitions.

### Basic transition

```vue
<template>
  <button @click="show = !show">Toggle</button>
  
  <Transition name="fade">
    <div v-if="show">Content</div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### Transition classes

- `.v-enter-from` - Starting state for enter
- `.v-enter-active` - Active state for enter
- `.v-enter-to` - Ending state for enter
- `.v-leave-from` - Starting state for leave
- `.v-leave-active` - Active state for leave
- `.v-leave-to` - Ending state for leave

### TransitionGroup for lists

```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
```

---

## Custom Directives

### Local directive

```vue
<script setup>
const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}
</script>

<template>
  <input v-focus />
</template>
```

### Full directive with hooks

```ts
const vHighlight = {
  created(el, binding, vnode, prevVnode) {},
  beforeMount(el, binding, vnode, prevVnode) {},
  mounted(el, binding, vnode, prevVnode) {
    el.style.backgroundColor = binding.value || 'yellow'
  },
  beforeUpdate(el, binding, vnode, prevVnode) {},
  updated(el, binding, vnode, prevVnode) {
    el.style.backgroundColor = binding.value || 'yellow'
  },
  beforeUnmount(el, binding, vnode, prevVnode) {},
  unmounted(el, binding, vnode, prevVnode) {}
}

// Usage: <p v-highlight="'red'">Text</p>
```

### Global directive

```ts
// main.ts
app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutside = (e: Event) => {
      if (!el.contains(e.target)) {
        binding.value(e)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
})
```

---

## Plugins

### Creating a plugin

```ts
// plugins/myPlugin.ts
import type { App } from 'vue'

export interface MyPluginOptions {
  prefix?: string
}

export const myPlugin = {
  install(app: App, options: MyPluginOptions = {}) {
    // Add global property
    app.config.globalProperties.$myMethod = () => {}
    
    // Add global component
    app.component('MyGlobalComponent', MyComponent)
    
    // Add global directive
    app.directive('my-directive', {})
    
    // Provide something
    app.provide('myPluginOptions', options)
  }
}

// main.ts
import { myPlugin } from './plugins/myPlugin'
app.use(myPlugin, { prefix: 'my-' })
```

---

## Render Functions

### Basic render function

```ts
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    
    return () => h('div', [
      h('span', `Count: ${count.value}`),
      h('button', { onClick: () => count.value++ }, 'Increment')
    ])
  }
}
```

### JSX (with build setup)

```tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)
    
    return () => (
      <div>
        <span>Count: {count.value}</span>
        <button onClick={() => count.value++}>Increment</button>
      </div>
    )
  }
})
```

### Functional component

```ts
import { h } from 'vue'

const FunctionalButton = (props: { label: string }, { emit }) => {
  return h('button', { onClick: () => emit('click') }, props.label)
}
```
