# Nuxt Data Fetching

## Table of Contents
1. [Overview: When to Use What](#overview-when-to-use-what)
2. [useFetch](#usefetch)
3. [useAsyncData](#useasyncdata)
4. [$fetch](#fetch)
5. [Data Fetching Options](#data-fetching-options)
6. [Caching & Keys](#caching--keys)
7. [Error Handling](#error-handling)
8. [Refreshing Data](#refreshing-data)
9. [Lazy Loading](#lazy-loading)
10. [SSR Considerations](#ssr-considerations)

---

## Overview: When to Use What

| Method | Use Case |
|--------|----------|
| `useFetch` | Simple API calls, SSR-safe, auto-generates key |
| `useAsyncData` | Complex async operations, multiple requests, custom keys |
| `$fetch` | Event handlers, client-side only, server routes |

### Quick Decision Tree

1. **In `<script setup>` for initial data?** → `useFetch` or `useAsyncData`
2. **In event handler (button click)?** → `$fetch`
3. **In server route?** → `$fetch`
4. **Need to combine multiple requests?** → `useAsyncData`
5. **Simple single endpoint?** → `useFetch`

---

## useFetch

Wrapper around `useAsyncData` and `$fetch`. Auto-generates cache key.

### Basic usage

```vue
<script setup lang="ts">
const { data, pending, error, refresh, status } = await useFetch('/api/posts')
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="post in data" :key="post.id">
      {{ post.title }}
    </div>
  </div>
</template>
```

### With TypeScript

```ts
interface Post {
  id: number
  title: string
  body: string
}

const { data } = await useFetch<Post[]>('/api/posts')
// data is Ref<Post[] | null>
```

### With options

```ts
const { data } = await useFetch('/api/posts', {
  method: 'POST',
  body: { title: 'New Post' },
  headers: {
    'Authorization': `Bearer ${token}`
  },
  query: {
    page: 1,
    limit: 10
  }
})
```

### Reactive URL

```ts
const page = ref(1)

// URL updates when page changes
const { data } = await useFetch(() => `/api/posts?page=${page.value}`)

// Or with query option
const { data } = await useFetch('/api/posts', {
  query: { page }  // Reactive query params
})
```

---

## useAsyncData

For complex async operations or when you need more control.

### Basic usage

```ts
const { data, pending, error, refresh } = await useAsyncData(
  'posts',  // Unique key
  () => $fetch('/api/posts')
)
```

### Combining multiple requests

```ts
const { data } = await useAsyncData('dashboard', async () => {
  const [user, posts, stats] = await Promise.all([
    $fetch('/api/user'),
    $fetch('/api/posts'),
    $fetch('/api/stats')
  ])
  return { user, posts, stats }
})

// Access: data.value.user, data.value.posts, data.value.stats
```

### With transform

```ts
const { data } = await useAsyncData('posts', 
  () => $fetch('/api/posts'),
  {
    transform: (posts) => posts.map(p => ({
      ...p,
      createdAt: new Date(p.createdAt)
    }))
  }
)
```

### With pick (reduce payload)

```ts
// Only include specific fields in client payload
const { data } = await useAsyncData('posts',
  () => $fetch('/api/posts'),
  {
    pick: ['id', 'title']  // Only these fields sent to client
  }
)
```

---

## $fetch

Low-level fetch utility. Use for:
- Event handlers
- Server routes
- Non-SSR contexts

### In event handlers

```vue
<script setup>
async function createPost() {
  try {
    const result = await $fetch('/api/posts', {
      method: 'POST',
      body: { title: 'New Post' }
    })
    console.log('Created:', result)
  } catch (error) {
    console.error('Failed:', error)
  }
}
</script>

<template>
  <button @click="createPost">Create Post</button>
</template>
```

### In server routes

```ts
// server/api/aggregate.ts
export default defineEventHandler(async (event) => {
  // Use $fetch to call other APIs
  const users = await $fetch('/api/users')
  const posts = await $fetch('/api/posts')
  
  return { users, posts }
})
```

### ⚠️ Don't use $fetch in setup for SSR

```vue
<script setup>
// ❌ BAD - causes double fetch (server + client)
const posts = await $fetch('/api/posts')

// ✅ GOOD - SSR-safe
const { data: posts } = await useFetch('/api/posts')
</script>
```

---

## Data Fetching Options

Common options for `useFetch` and `useAsyncData`:

```ts
const { data } = await useFetch('/api/posts', {
  // Execution control
  lazy: false,           // Block navigation (default: false)
  immediate: true,       // Fetch immediately (default: true)
  server: true,          // Fetch on server (default: true)
  
  // Caching
  key: 'my-posts',       // Cache key
  dedupe: 'cancel',      // 'cancel' | 'defer' | 'none'
  
  // Transform response
  transform: (data) => data.items,
  pick: ['id', 'title'],
  
  // Watch for changes
  watch: [page, filter],
  
  // Deep reactivity (Nuxt 4 defaults to shallowRef)
  deep: true,
  
  // Default value
  default: () => ([]),
  
  // Cache control (Nuxt 3.8+)
  getCachedData: (key, nuxtApp) => {
    return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
  }
})
```

---

## Caching & Keys

### Auto-generated keys

`useFetch` auto-generates keys from URL and options:

```ts
// These have different keys
useFetch('/api/posts')
useFetch('/api/posts', { query: { page: 1 } })
useFetch('/api/posts', { query: { page: 2 } })
```

### Custom keys

```ts
const { data } = await useAsyncData(
  `post-${route.params.id}`,  // Custom key
  () => $fetch(`/api/posts/${route.params.id}`)
)
```

### Accessing cached data

```ts
// Read cached data without refetching
const { data: posts } = useNuxtData('posts')

// Use for optimistic updates
const { data: cachedPosts } = useNuxtData('posts')
cachedPosts.value = [...cachedPosts.value, newPost]
```

### Clearing cache

```ts
const nuxtApp = useNuxtApp()

// Clear specific key
nuxtApp.payload.data['posts'] = undefined

// Or use clearNuxtData
clearNuxtData('posts')
```

---

## Error Handling

### With composables

```vue
<script setup>
const { data, error, status } = await useFetch('/api/posts')

// status: 'idle' | 'pending' | 'success' | 'error'
</script>

<template>
  <div v-if="status === 'pending'">Loading...</div>
  <div v-else-if="status === 'error'">
    Error: {{ error?.message }}
  </div>
  <div v-else>{{ data }}</div>
</template>
```

### With try/catch ($fetch)

```ts
async function fetchData() {
  try {
    const data = await $fetch('/api/posts')
  } catch (error) {
    if (error.statusCode === 404) {
      // Handle not found
    } else if (error.statusCode === 401) {
      // Handle unauthorized
    }
  }
}
```

### Global error handling

```ts
// plugins/fetchError.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error) => {
    console.error('Global error:', error)
  })
})
```

---

## Refreshing Data

### Manual refresh

```ts
const { data, refresh, execute } = await useFetch('/api/posts')

// Refresh (re-fetches)
await refresh()

// Execute (alias for refresh with options)
await execute({ dedupe: true })
```

### Refresh on interval

```ts
const { data, refresh } = await useFetch('/api/stats')

// Refresh every 30 seconds
const interval = setInterval(() => {
  refresh()
}, 30000)

onUnmounted(() => clearInterval(interval))
```

### Watch for changes

```ts
const page = ref(1)
const filter = ref('')

const { data } = await useFetch('/api/posts', {
  query: { page, filter },
  watch: [page, filter]  // Refetch when these change
})
```

### Refresh all data

```ts
// Refresh all useAsyncData/useFetch on current page
await refreshNuxtData()

// Refresh specific keys
await refreshNuxtData(['posts', 'user'])
```

---

## Lazy Loading

### Lazy fetch

```ts
// Don't block navigation
const { data, pending } = await useFetch('/api/posts', {
  lazy: true
})

// Or use convenience composable
const { data, pending } = await useLazyFetch('/api/posts')
```

### Lazy async data

```ts
const { data, pending } = await useLazyAsyncData('posts', 
  () => $fetch('/api/posts')
)
```

### Show loading state

```vue
<script setup>
const { data, pending } = await useLazyFetch('/api/posts')
</script>

<template>
  <div>
    <Spinner v-if="pending" />
    <PostList v-else :posts="data" />
  </div>
</template>
```

---

## SSR Considerations

### Hydration

Data fetched on server is serialized and sent to client:

```ts
// Server fetches, client hydrates (no refetch)
const { data } = await useFetch('/api/posts')
```

### Client-only fetch

```ts
// Skip server, only fetch on client
const { data } = await useFetch('/api/browser-only', {
  server: false
})
```

### Passing cookies/headers

```ts
// In server context, manually forward headers
const headers = useRequestHeaders(['cookie', 'authorization'])

const { data } = await useFetch('/api/user', {
  headers
})
```

### Using useRequestFetch

```ts
// Automatically forwards cookies in SSR
const requestFetch = useRequestFetch()

const { data } = await useAsyncData('user', () => 
  requestFetch('/api/user')
)
```

### Payload serialization

Custom types need serialization:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: true
  }
})

// Or define custom serializers
// plugins/serializers.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.payload.revive = {
    Date: (value: string) => new Date(value)
  }
})
```
