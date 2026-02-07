# Vue 3 Core Reference

## Table of Contents
1. [Reactivity: ref vs reactive](#reactivity-ref-vs-reactive)
2. [Computed Properties](#computed-properties)
3. [Watchers](#watchers)
4. [Lifecycle Hooks](#lifecycle-hooks)
5. [Template Refs](#template-refs)
6. [Components](#components)
7. [Props](#props)
8. [Events/Emits](#eventsemits)
9. [v-model](#v-model)
10. [Slots](#slots)

---

## Reactivity: ref vs reactive

### ref()
For primitives and values that may be reassigned:

```ts
import { ref } from 'vue'

const count = ref(0)
const name = ref('Vue')
const items = ref<string[]>([])

// Access with .value in script
count.value++
items.value.push('new item')
items.value = ['replaced', 'array']  // Can reassign

// In template, no .value needed
// <span>{{ count }}</span>
```

### reactive()
For objects that won't be reassigned:

```ts
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: { name: 'John' },
  items: []
})

// Direct access, no .value
state.count++
state.user.name = 'Jane'
state.items.push('item')

// ❌ Don't reassign the whole object
// state = { count: 1 } // Breaks reactivity!
```

### When to use which

| Use `ref()` | Use `reactive()` |
|-------------|------------------|
| Primitives (string, number, boolean) | Complex objects/state |
| Values that might be reassigned | Deeply nested state |
| Single values | Related state grouped together |
| Return from composables | Form state |

### shallowRef / shallowReactive
For performance with large objects:

```ts
import { shallowRef, shallowReactive, triggerRef } from 'vue'

// Only tracks .value changes, not nested
const bigData = shallowRef({ nested: { deep: 'value' } })
bigData.value.nested.deep = 'new'  // Not tracked
bigData.value = { nested: { deep: 'new' } }  // Tracked

// Or manually trigger
triggerRef(bigData)
```

---

## Computed Properties

### Basic computed

```ts
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// Read-only computed
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

console.log(fullName.value)  // "John Doe"
```

### Writable computed

```ts
const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (value: string) => {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last ?? ''
  }
})

fullName.value = 'Jane Smith'  // Updates both refs
```

### Computed with getter only (recommended)

```ts
// Derived state - always use computed
const itemCount = computed(() => items.value.length)
const hasItems = computed(() => items.value.length > 0)
const sortedItems = computed(() => 
  [...items.value].sort((a, b) => a.localeCompare(b))
)
```

---

## Watchers

### watch() - explicit sources

```ts
import { ref, watch } from 'vue'

const count = ref(0)

// Watch single ref
watch(count, (newValue, oldValue) => {
  console.log(`Changed from ${oldValue} to ${newValue}`)
})

// Watch multiple sources
const name = ref('Vue')
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('Either changed')
})

// Watch getter function
watch(
  () => state.user.name,
  (newName) => console.log('Name changed:', newName)
)
```

### watch() options

```ts
watch(source, callback, {
  immediate: true,    // Run callback immediately
  deep: true,         // Deep watch objects
  flush: 'post',      // Run after DOM update
  once: true,         // Run only once (Vue 3.4+)
})

// Deep watch example
watch(
  () => state.user,
  (newUser) => console.log('User changed deeply'),
  { deep: true }
)
```

### watchEffect() - automatic dependency tracking

```ts
import { watchEffect } from 'vue'

// Runs immediately, tracks all reactive deps used inside
watchEffect(() => {
  console.log('Count is:', count.value)
  console.log('Name is:', name.value)
})

// Cleanup function
watchEffect((onCleanup) => {
  const controller = new AbortController()
  fetch('/api/data', { signal: controller.signal })
  
  onCleanup(() => controller.abort())
})
```

### Stopping watchers

```ts
const stop = watch(source, callback)
const stopEffect = watchEffect(() => {})

// Later...
stop()
stopEffect()
```

---

## Lifecycle Hooks

```ts
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,      // <KeepAlive>
  onDeactivated,    // <KeepAlive>
} from 'vue'

// Most common
onMounted(() => {
  console.log('Component mounted, DOM available')
  // Fetch data, setup listeners, etc.
})

onUnmounted(() => {
  console.log('Cleanup: remove listeners, cancel requests')
})

// Error handling
onErrorCaptured((err, instance, info) => {
  console.error('Error in child:', err)
  return false  // Prevent propagation
})
```

### Lifecycle order

1. `setup()` runs
2. `onBeforeMount`
3. `onMounted`
4. `onBeforeUpdate` (on reactive changes)
5. `onUpdated`
6. `onBeforeUnmount`
7. `onUnmounted`

---

## Template Refs

### Basic ref

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" />
</template>
```

### Component ref

```vue
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

function callChildMethod() {
  childRef.value?.someMethod()
}
</script>

<template>
  <ChildComponent ref="childRef" />
</template>
```

### Refs in v-for

```vue
<script setup>
import { ref, onMounted } from 'vue'

const items = ref(['a', 'b', 'c'])
const itemRefs = ref<HTMLLIElement[]>([])

onMounted(() => {
  console.log(itemRefs.value)  // Array of elements
})
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item" ref="itemRefs">
      {{ item }}
    </li>
  </ul>
</template>
```

---

## Components

### Single File Component (SFC)

```vue
<script setup lang="ts">
// Composition API with <script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const count = ref(0)
</script>

<template>
  <div>
    <button @click="count++">{{ count }}</button>
    <ChildComponent :value="count" />
  </div>
</template>

<style scoped>
button {
  color: blue;
}
</style>
```

### Component registration

```ts
// Global (main.ts)
import { createApp } from 'vue'
import MyComponent from './MyComponent.vue'

const app = createApp(App)
app.component('MyComponent', MyComponent)

// Local (in <script setup>, just import)
import MyComponent from './MyComponent.vue'
// Automatically available in template
```

---

## Props

### Defining props with TypeScript

```vue
<script setup lang="ts">
// Interface approach
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
  items: () => [],  // Use factory for objects/arrays
})

// Access
console.log(props.title)
</script>
```

### Runtime validation (non-TypeScript)

```ts
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  items: {
    type: Array as PropType<string[]>,
    default: () => []
  }
})
```

---

## Events/Emits

### Defining emits

```vue
<script setup lang="ts">
// TypeScript approach
const emit = defineEmits<{
  update: [value: number]
  submit: [data: { name: string }]
  'custom-event': []  // No payload
}>()

// Call emits
emit('update', 42)
emit('submit', { name: 'test' })
emit('custom-event')
</script>
```

### Parent handling

```vue
<template>
  <ChildComponent
    @update="handleUpdate"
    @submit="handleSubmit"
    @custom-event="handleCustom"
  />
</template>

<script setup>
function handleUpdate(value: number) {
  console.log('Received:', value)
}
</script>
```

---

## v-model

### Basic v-model on component

```vue
<!-- Parent -->
<CustomInput v-model="searchText" />

<!-- CustomInput.vue -->
<script setup lang="ts">
const model = defineModel<string>()
</script>

<template>
  <input :value="model" @input="model = $event.target.value" />
</template>
```

### Multiple v-models

```vue
<!-- Parent -->
<UserForm v-model:firstName="first" v-model:lastName="last" />

<!-- UserForm.vue -->
<script setup>
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')
</script>
```

### v-model with modifiers

```vue
<!-- Parent -->
<CustomInput v-model.trim.uppercase="text" />

<!-- CustomInput.vue -->
<script setup>
const [model, modifiers] = defineModel<string, 'trim' | 'uppercase'>()

function handleInput(e: Event) {
  let value = (e.target as HTMLInputElement).value
  if (modifiers.trim) value = value.trim()
  if (modifiers.uppercase) value = value.toUpperCase()
  model.value = value
}
</script>
```

---

## Slots

### Default slot

```vue
<!-- Parent -->
<Card>
  <p>This goes in the default slot</p>
</Card>

<!-- Card.vue -->
<template>
  <div class="card">
    <slot>Default content if nothing provided</slot>
  </div>
</template>
```

### Named slots

```vue
<!-- Parent -->
<Card>
  <template #header>
    <h1>Title</h1>
  </template>
  
  <p>Default slot content</p>
  
  <template #footer>
    <button>Save</button>
  </template>
</Card>

<!-- Card.vue -->
<template>
  <div class="card">
    <header><slot name="header" /></header>
    <main><slot /></main>
    <footer><slot name="footer" /></footer>
  </div>
</template>
```

### Scoped slots

```vue
<!-- Parent -->
<ItemList :items="items">
  <template #item="{ item, index }">
    <span>{{ index }}: {{ item.name }}</span>
  </template>
</ItemList>

<!-- ItemList.vue -->
<script setup lang="ts">
defineProps<{ items: Array<{ name: string }> }>()
</script>

<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.name">
      <slot name="item" :item="item" :index="index" />
    </li>
  </ul>
</template>
```

### Checking slot content

```vue
<script setup>
import { useSlots } from 'vue'

const slots = useSlots()
const hasHeader = computed(() => !!slots.header)
</script>

<template>
  <header v-if="hasHeader">
    <slot name="header" />
  </header>
</template>
```
