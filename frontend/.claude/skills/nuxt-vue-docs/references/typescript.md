# TypeScript with Vue & Nuxt

## Table of Contents
1. [Setup](#setup)
2. [Component Types](#component-types)
3. [Props & Emits](#props--emits)
4. [Refs & Reactive](#refs--reactive)
5. [Composables](#composables)
6. [API Routes](#api-routes)
7. [Auto-imports](#auto-imports)
8. [Utility Types](#utility-types)

---

## Setup

### Nuxt TypeScript

Nuxt has built-in TypeScript support:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    strict: true,
    typeCheck: true
  }
})
```

### tsconfig.json

Nuxt generates this automatically:

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

---

## Component Types

### Script setup with lang="ts"

```vue
<script setup lang="ts">
import type { User } from '~/types'

const user = ref<User | null>(null)
</script>
```

### Global types

```ts
// types/index.ts
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface Post {
  id: string
  title: string
  content: string
  author: User
  createdAt: Date
}
```

---

## Props & Emits

### Typed props

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
  user: {
    name: string
    email: string
  }
}

const props = defineProps<Props>()

// With defaults
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})
</script>
```

### Typed emits

```vue
<script setup lang="ts">
const emit = defineEmits<{
  update: [value: number]
  submit: [data: { name: string }]
  'custom-event': []
}>()

// Call with type safety
emit('update', 42)
emit('submit', { name: 'test' })
</script>
```

### v-model types

```vue
<script setup lang="ts">
const model = defineModel<string>()
const count = defineModel<number>('count')

// With required
const required = defineModel<string>({ required: true })
</script>
```

---

## Refs & Reactive

### Typed refs

```ts
import { ref, type Ref } from 'vue'

// Inferred type
const count = ref(0)  // Ref<number>

// Explicit type
const user = ref<User | null>(null)

// Complex types
const items = ref<string[]>([])
const map = ref<Map<string, User>>(new Map())
```

### Typed reactive

```ts
import { reactive } from 'vue'

interface State {
  count: number
  user: User | null
  items: string[]
}

const state = reactive<State>({
  count: 0,
  user: null,
  items: []
})
```

### Typed computed

```ts
import { computed, type ComputedRef } from 'vue'

// Inferred
const doubled = computed(() => count.value * 2)  // ComputedRef<number>

// Explicit
const user: ComputedRef<User | null> = computed(() => {
  return users.value.find(u => u.id === selectedId.value) ?? null
})
```

### Template refs

```vue
<script setup lang="ts">
const inputRef = ref<HTMLInputElement | null>(null)
const divRef = ref<HTMLDivElement | null>(null)

// Component ref
import ChildComponent from './ChildComponent.vue'
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)
</script>

<template>
  <input ref="inputRef" />
  <div ref="divRef" />
  <ChildComponent ref="childRef" />
</template>
```

---

## Composables

### Typed composable

```ts
// composables/useUser.ts
import type { User } from '~/types'

export function useUser() {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  async function fetchUser(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const { data } = await useFetch<User>(`/api/users/${id}`)
      user.value = data.value
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchUser
  }
}
```

### Generic composable

```ts
// composables/useCollection.ts
export function useCollection<T extends { id: string }>(key: string) {
  const items = ref<T[]>([]) as Ref<T[]>
  
  function add(item: T) {
    items.value.push(item)
  }
  
  function remove(id: string) {
    items.value = items.value.filter(item => item.id !== id)
  }
  
  function find(id: string): T | undefined {
    return items.value.find(item => item.id === id)
  }
  
  return { items, add, remove, find }
}

// Usage
const { items, add } = useCollection<User>('users')
```

---

## API Routes

### Typed event handlers

```ts
// server/api/users/[id].get.ts
import type { User } from '~/types'

export default defineEventHandler<{ id: string }>(async (event) => {
  const id = getRouterParam(event, 'id')
  
  const user: User = await getUserById(id!)
  return user
})
```

### Typed request body

```ts
// server/api/users.post.ts
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user']).default('user')
})

type CreateUserInput = z.infer<typeof createUserSchema>

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createUserSchema.parse)
  
  // body is typed as CreateUserInput
  const user = await createUser(body)
  return user
})
```

### Typed API response

```ts
// types/api.ts
export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    perPage: number
  }
}

export interface ApiError {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
}
```

---

## Auto-imports

### Type-only imports

```vue
<script setup lang="ts">
// Auto-imported from ~/types via nuxt.config
// But for types, explicit import is clearer
import type { User, Post } from '~/types'

const user = ref<User | null>(null)
</script>
```

### Configure type auto-imports

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: ['types']
  }
})
```

---

## Utility Types

### Common Vue types

```ts
import type {
  Ref,
  ComputedRef,
  WritableComputedRef,
  ShallowRef,
  PropType,
  ComponentPublicInstance,
  VNode
} from 'vue'
```

### Nuxt types

```ts
import type {
  NuxtApp,
  RuntimeConfig,
  AppConfig
} from '#app'

import type {
  RouteLocationNormalized,
  RouteLocationRaw
} from 'vue-router'
```

### Extract component props

```ts
import type { ExtractPropTypes, ExtractPublicPropTypes } from 'vue'

// Get props type from component
type ButtonProps = InstanceType<typeof Button>['$props']
```

### MaybeRef utility

```ts
import { toValue, type MaybeRef, type MaybeRefOrGetter } from 'vue'

function useTitle(title: MaybeRefOrGetter<string>) {
  watchEffect(() => {
    document.title = toValue(title)
  })
}

// Can be called with:
useTitle('Static Title')
useTitle(ref('Reactive Title'))
useTitle(() => computedTitle.value)
```

### Nuxt-specific types

```ts
// Route params
const route = useRoute()
type Params = typeof route.params  // Inferred from file structure

// Typed route names (auto-generated)
const route = useRoute('users-id')  // Type-safe route
navigateTo({ name: 'users-id', params: { id: '123' } })

// Runtime config
const config = useRuntimeConfig()
type Config = typeof config  // Includes public and private keys

// App config
const appConfig = useAppConfig()
type AppConfig = typeof appConfig
```

### Declare module augmentation

```ts
// types/nuxt.d.ts
declare module '#app' {
  interface NuxtApp {
    $myHelper: (msg: string) => void
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $myHelper: (msg: string) => void
  }
}

export {}
```
