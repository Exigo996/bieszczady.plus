# Nuxt Core Fundamentals

## Table of Contents
1. [Project Structure](#project-structure)
2. [File-based Routing](#file-based-routing)
3. [Layouts](#layouts)
4. [Pages](#pages)
5. [Components](#components)
6. [Auto-imports](#auto-imports)
7. [Middleware](#middleware)
8. [Plugins](#plugins)
9. [Runtime Config](#runtime-config)
10. [App Config](#app-config)

---

## Project Structure

Nuxt 4 directory structure:

```
my-nuxt-app/
├── app/                    # Application source (Nuxt 4)
│   ├── pages/              # File-based routing
│   ├── components/         # Auto-imported components
│   ├── composables/        # Auto-imported composables
│   ├── layouts/            # Page layouts
│   ├── middleware/         # Route middleware
│   ├── plugins/            # Vue plugins
│   ├── assets/             # Build-processed assets
│   ├── app.vue             # Root component
│   └── error.vue           # Error page
├── server/                 # Server-side code
│   ├── api/                # API routes (/api/*)
│   ├── routes/             # Server routes
│   ├── middleware/         # Server middleware
│   ├── plugins/            # Nitro plugins
│   └── utils/              # Server utilities
├── public/                 # Static files (served as-is)
├── nuxt.config.ts          # Nuxt configuration
├── app.config.ts           # Runtime app config
└── package.json
```

Note: In Nuxt 3, `app/` contents are in the root directory.

---

## File-based Routing

### Basic routes

```
app/pages/
├── index.vue           → /
├── about.vue           → /about
├── contact.vue         → /contact
└── blog/
    ├── index.vue       → /blog
    └── [slug].vue      → /blog/:slug
```

### Dynamic routes

```
app/pages/
├── users/
│   ├── [id].vue        → /users/:id
│   └── [id]/
│       ├── index.vue   → /users/:id
│       └── edit.vue    → /users/:id/edit
├── posts/
│   └── [...slug].vue   → /posts/* (catch-all)
└── [[optional]].vue    → /:optional? (optional param)
```

### Route parameters

```vue
<!-- pages/users/[id].vue -->
<script setup lang="ts">
const route = useRoute()

// Access params
const userId = route.params.id

// Typed params
const route = useRoute('users-id')  // Auto-generated type
console.log(route.params.id)  // TypeScript knows this exists
</script>
```

### Navigation

```vue
<script setup>
const router = useRouter()

// Programmatic navigation
function goToUser(id: string) {
  router.push(`/users/${id}`)
  // or
  router.push({ name: 'users-id', params: { id } })
}
</script>

<template>
  <!-- Link component -->
  <NuxtLink to="/about">About</NuxtLink>
  <NuxtLink :to="{ name: 'users-id', params: { id: '123' } }">
    User 123
  </NuxtLink>
  
  <!-- External link -->
  <NuxtLink to="https://nuxt.com" external>Nuxt</NuxtLink>
</template>
```

---

## Layouts

### Default layout

```vue
<!-- app/layouts/default.vue -->
<template>
  <div>
    <Header />
    <main>
      <slot />  <!-- Page content -->
    </main>
    <Footer />
  </div>
</template>
```

### Custom layouts

```vue
<!-- app/layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="admin-content">
      <slot />
    </div>
  </div>
</template>
```

### Using layouts in pages

```vue
<!-- app/pages/dashboard.vue -->
<script setup>
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>Dashboard content</div>
</template>
```

### Dynamic layout

```vue
<script setup>
const route = useRoute()

// Change layout based on route
definePageMeta({
  layout: false  // Disable default
})

const layout = computed(() => 
  route.query.admin ? 'admin' : 'default'
)
</script>

<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>
```

---

## Pages

### Page metadata

```vue
<script setup>
definePageMeta({
  // Route middleware
  middleware: ['auth'],
  
  // Layout
  layout: 'admin',
  
  // Custom meta
  title: 'My Page',
  
  // Route validation
  validate: async (route) => {
    return /^\d+$/.test(route.params.id as string)
  },
  
  // Keep alive
  keepalive: true,
  
  // Disable page transition
  pageTransition: false,
  
  // Custom key for caching
  key: route => route.fullPath
})
</script>
```

### Page transitions

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  }
})
```

```css
/* app/assets/css/main.css */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
```

---

## Components

### Auto-import from components/

```
app/components/
├── Button.vue           → <Button />
├── card/
│   ├── Card.vue         → <CardCard /> or <Card /> with prefix
│   ├── CardHeader.vue   → <CardHeader />
│   └── CardBody.vue     → <CardBody />
└── ui/
    └── Input.vue        → <UiInput />
```

### Component naming

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false  // Remove path from component name
      }
    ]
  }
})
```

### Lazy loading components

```vue
<template>
  <!-- Prefix with "Lazy" to lazy-load -->
  <LazyHeavyChart v-if="showChart" />
</template>
```

### Client-only / server-only

```vue
<template>
  <!-- Only render on client -->
  <ClientOnly>
    <BrowserOnlyChart />
    <template #fallback>
      <p>Loading chart...</p>
    </template>
  </ClientOnly>
  
  <!-- Only render on server -->
  <ServerOnly>
    <ServerInfo />
  </ServerOnly>
</template>

<!-- Or use .client.vue / .server.vue suffix -->
<!-- components/Analytics.client.vue - only loaded on client -->
```

---

## Auto-imports

### What's auto-imported

- All exports from `composables/` directory
- All exports from `utils/` directory
- Vue APIs: `ref`, `computed`, `watch`, etc.
- Nuxt composables: `useRoute`, `useFetch`, `useHead`, etc.
- Components from `components/` directory

### Custom auto-imports

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  imports: {
    dirs: [
      'stores',  // Auto-import from stores/
    ],
    imports: [
      { name: 'defineStore', from: 'pinia' }
    ]
  }
})
```

### Explicit imports

```ts
// When you need explicit imports
import { ref, computed } from '#imports'
```

---

## Middleware

### Route middleware

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore()
  
  if (!user.isLoggedIn) {
    return navigateTo('/login')
  }
})
```

### Using middleware

```vue
<script setup>
definePageMeta({
  middleware: ['auth']
})
</script>
```

### Global middleware

```ts
// app/middleware/analytics.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Runs on every route change
  trackPageView(to.path)
})
```

### Inline middleware

```vue
<script setup>
definePageMeta({
  middleware: [
    function (to, from) {
      // Inline middleware logic
    }
  ]
})
</script>
```

### Middleware navigation

```ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Redirect
  if (to.path === '/old') {
    return navigateTo('/new')
  }
  
  // External redirect
  if (to.path === '/external') {
    return navigateTo('https://example.com', { external: true })
  }
  
  // Abort navigation
  if (to.path === '/forbidden') {
    return abortNavigation()
  }
  
  // Abort with error
  return abortNavigation(createError({
    statusCode: 403,
    message: 'Forbidden'
  }))
})
```

---

## Plugins

### Client/server plugins

```ts
// app/plugins/myPlugin.ts
export default defineNuxtPlugin((nuxtApp) => {
  // Access Vue app
  nuxtApp.vueApp.use(someVuePlugin)
  
  // Provide helper
  return {
    provide: {
      hello: (msg: string) => `Hello ${msg}!`
    }
  }
})

// Usage: const { $hello } = useNuxtApp()
```

### Plugin suffixes

- `myPlugin.client.ts` - Client only
- `myPlugin.server.ts` - Server only
- `myPlugin.ts` - Both

### Plugin dependencies

```ts
export default defineNuxtPlugin({
  name: 'my-plugin',
  dependsOn: ['other-plugin'],
  async setup(nuxtApp) {
    // Runs after 'other-plugin'
  }
})
```

### Plugin hooks

```ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', (vueApp) => {
    // App created
  })
  
  nuxtApp.hook('page:start', () => {
    // Page navigation started
  })
  
  nuxtApp.hook('page:finish', () => {
    // Page navigation finished
  })
})
```

---

## Runtime Config

For environment variables and configuration.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private (server-only)
    apiSecret: process.env.API_SECRET,
    
    // Public (exposed to client)
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  }
})
```

### Using runtime config

```vue
<script setup>
const config = useRuntimeConfig()

// Server-side only
// config.apiSecret

// Client and server
// config.public.apiBase
</script>
```

### Environment variables

```env
# .env
NUXT_API_SECRET=my-secret
NUXT_PUBLIC_API_BASE=https://api.example.com
```

---

## App Config

For build-time, non-sensitive configuration.

```ts
// app.config.ts
export default defineAppConfig({
  title: 'My App',
  theme: {
    primaryColor: '#3B82F6'
  },
  ui: {
    button: {
      default: {
        size: 'md'
      }
    }
  }
})
```

### Using app config

```vue
<script setup>
const appConfig = useAppConfig()

console.log(appConfig.title)
console.log(appConfig.theme.primaryColor)
</script>
```

### Difference: runtimeConfig vs appConfig

| Feature | runtimeConfig | appConfig |
|---------|---------------|-----------|
| Environment variables | ✅ | ❌ |
| Secrets | ✅ (private keys) | ❌ |
| HMR support | ❌ | ✅ |
| Typed | ✅ | ✅ |
| Reactive | ✅ | ✅ |
| Build-time only | ❌ | ✅ |
