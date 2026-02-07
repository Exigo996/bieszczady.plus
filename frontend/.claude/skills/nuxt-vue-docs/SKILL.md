---
name: nuxt-vue-docs
description: Comprehensive Vue 3 and Nuxt 4 documentation skill for building modern web applications. Use when working with Vue.js 3 (Composition API, reactivity, components, composables), Nuxt 4/3 (file-based routing, useFetch, useAsyncData, server routes, middleware, auto-imports), Pinia state management, or any Vue/Nuxt development tasks. Triggers on questions about Vue reactivity (ref, reactive, computed, watch), Nuxt data fetching, server API routes, SSR/SSG, component patterns, TypeScript with Vue/Nuxt, or building full-stack Nuxt applications.
---

# Vue 3 & Nuxt 4 Documentation Skill

Comprehensive reference for Vue 3 and Nuxt 4 development patterns, APIs, and best practices.

## Quick Reference

### Vue 3 Composition API Basics

```vue
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

// Reactive state
const count = ref(0)
const state = reactive({ name: 'Vue', items: [] })

// Computed
const doubled = computed(() => count.value * 2)

// Watchers
watch(count, (newVal, oldVal) => console.log(newVal))

// Lifecycle
onMounted(() => console.log('mounted'))
</script>
```

### Nuxt 4 Data Fetching

```vue
<script setup lang="ts">
// SSR-safe data fetching
const { data, pending, error, refresh } = await useFetch('/api/items')

// With options
const { data: posts } = await useFetch('/api/posts', {
  key: 'posts',
  lazy: true,
  server: true,
  transform: (data) => data.items
})

// For complex async operations
const { data } = await useAsyncData('dashboard', async () => {
  const [user, stats] = await Promise.all([
    $fetch('/api/user'),
    $fetch('/api/stats')
  ])
  return { user, stats }
})
</script>
```

### Nuxt Server Routes

```ts
// server/api/items/index.get.ts
export default defineEventHandler(async (event) => {
  return { items: ['a', 'b', 'c'] }
})

// server/api/items/[id].get.ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return { id }
})

// server/api/items.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return { created: body }
})
```

## Reference Files

Read these files based on what you're working on:

- **Vue 3 Core**: See [references/vue-core.md](references/vue-core.md) for reactivity, components, lifecycle
- **Vue 3 Advanced**: See [references/vue-advanced.md](references/vue-advanced.md) for composables, provide/inject, Teleport, Suspense
- **Nuxt Fundamentals**: See [references/nuxt-core.md](references/nuxt-core.md) for routing, layouts, middleware, auto-imports
- **Nuxt Data Fetching**: See [references/nuxt-data.md](references/nuxt-data.md) for useFetch, useAsyncData, $fetch patterns
- **Nuxt Server**: See [references/nuxt-server.md](references/nuxt-server.md) for API routes, server middleware, Nitro
- **Pinia State**: See [references/pinia.md](references/pinia.md) for stores, actions, getters
- **TypeScript**: See [references/typescript.md](references/typescript.md) for Vue/Nuxt TypeScript patterns

## Key Differences: Vue 3 vs Nuxt

| Feature | Vue 3 | Nuxt 4 |
|---------|-------|--------|
| Routing | Vue Router manual setup | File-based automatic |
| Data fetching | fetch/axios | useFetch, useAsyncData |
| SSR | Manual config | Built-in |
| Auto-imports | No | Yes (components, composables) |
| API routes | External backend | Built-in server/ directory |
| State | Pinia manual setup | Pinia with auto-import |

## Common Patterns

### Component Props & Emits

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  update: [value: number]
  submit: []
}>()
</script>
```

### Nuxt Page with Data

```vue
<!-- pages/posts/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.id}`)

definePageMeta({
  middleware: 'auth'
})
</script>

<template>
  <article v-if="post">
    <h1>{{ post.title }}</h1>
  </article>
</template>
```

### Server Route with Validation

```ts
// server/api/posts.post.ts
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  content: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validated = schema.parse(body)
  // Create post...
  return { success: true, post: validated }
})
```
