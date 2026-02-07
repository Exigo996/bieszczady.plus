# Pinia State Management

## Table of Contents
1. [Setup](#setup)
2. [Defining Stores](#defining-stores)
3. [Using Stores](#using-stores)
4. [State](#state)
5. [Getters](#getters)
6. [Actions](#actions)
7. [Composing Stores](#composing-stores)
8. [Nuxt Integration](#nuxt-integration)

---

## Setup

### Nuxt config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['./stores/**']  // Auto-import stores
  }
})
```

---

## Defining Stores

### Setup Store (Recommended)

```ts
// stores/counter.ts
export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  const name = ref('Counter')
  
  // Getters (computed)
  const doubleCount = computed(() => count.value * 2)
  
  // Actions (functions)
  function increment() {
    count.value++
  }
  
  async function fetchCount() {
    const { data } = await useFetch('/api/count')
    count.value = data.value?.count ?? 0
  }
  
  return { count, name, doubleCount, increment, fetchCount }
})
```

### Option Store (like Options API)

```ts
// stores/counter.ts
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    }
  }
})
```

---

## Using Stores

### In components

```vue
<script setup>
const counter = useCounterStore()

// Access state/getters
console.log(counter.count)
console.log(counter.doubleCount)

// Call actions
counter.increment()
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <button @click="counter.increment">+1</button>
  </div>
</template>
```

### Destructuring with storeToRefs

```vue
<script setup>
const counter = useCounterStore()

// ✅ Keeps reactivity for state/getters
const { count, doubleCount } = storeToRefs(counter)

// Actions can be destructured directly
const { increment } = counter
</script>
```

---

## State

### Modifying state

```ts
const store = useCounterStore()

// Direct mutation
store.count++

// Multiple changes with $patch
store.$patch({
  count: 10,
  name: 'New Name'
})

// $patch with function
store.$patch((state) => {
  state.items.push(newItem)
  state.count++
})

// Reset to initial
store.$reset()
```

### Subscribe to changes

```ts
store.$subscribe((mutation, state) => {
  localStorage.setItem('counter', JSON.stringify(state))
})
```

---

## Getters

```ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  
  // Simple getter
  const itemCount = computed(() => items.value.length)
  
  // Getter with parameters
  const getItemById = computed(() => {
    return (id: string) => items.value.find(item => item.id === id)
  })
  
  // Computed total
  const totalPrice = computed(() => 
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  
  return { items, itemCount, getItemById, totalPrice }
})
```

---

## Actions

```ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  
  function setUser(newUser: User) {
    user.value = newUser
  }
  
  async function fetchUser(id: string) {
    isLoading.value = true
    try {
      const { data } = await useFetch(`/api/users/${id}`)
      user.value = data.value
    } finally {
      isLoading.value = false
    }
  }
  
  async function login(credentials: Credentials) {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    setUser(response.user)
  }
  
  function logout() {
    user.value = null
  }
  
  return { user, isLoading, setUser, fetchUser, login, logout }
})
```

---

## Composing Stores

### Using other stores

```ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const user = useUserStore()
  
  const personalizedDiscount = computed(() => {
    if (user.isPremium) return 0.2
    return 0
  })
  
  async function checkout() {
    if (!user.isLoggedIn) {
      throw new Error('Must be logged in')
    }
  }
  
  return { items, personalizedDiscount, checkout }
})
```

---

## Nuxt Integration

### SSR-safe usage

```vue
<script setup>
const store = useUserStore()

// State is automatically serialized for SSR
await store.fetchUser()
</script>
```

### useState for simple state

```ts
// For simple reactive state without full store
export function useCounter() {
  const count = useState('counter', () => 0)
  
  function increment() {
    count.value++
  }
  
  return { count, increment }
}
```

### Pinia vs useState

| Feature | Pinia | useState |
|---------|-------|----------|
| Complex state | ✅ | ❌ |
| DevTools | ✅ | ❌ |
| Getters/Actions | Built-in | Manual |
| SSR | ✅ | ✅ |
| Simple state | Overkill | ✅ |
