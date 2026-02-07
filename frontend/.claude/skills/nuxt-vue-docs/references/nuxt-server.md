# Nuxt Server Routes & API

## Table of Contents
1. [Server Directory Structure](#server-directory-structure)
2. [Defining Event Handlers](#defining-event-handlers)
3. [Route Parameters](#route-parameters)
4. [HTTP Methods](#http-methods)
5. [Request Handling](#request-handling)
6. [Response Handling](#response-handling)
7. [Error Handling](#error-handling)
8. [Server Middleware](#server-middleware)
9. [Server Utils](#server-utils)
10. [Database & Storage](#database--storage)
11. [Nitro Features](#nitro-features)

---

## Server Directory Structure

```
server/
├── api/                    # API routes (/api/*)
│   ├── posts/
│   │   ├── index.get.ts    # GET /api/posts
│   │   ├── index.post.ts   # POST /api/posts
│   │   └── [id].get.ts     # GET /api/posts/:id
│   └── users.ts            # All methods /api/users
├── routes/                 # Non-API routes
│   └── sitemap.xml.ts      # /sitemap.xml
├── middleware/             # Server middleware (runs on all requests)
│   └── log.ts
├── plugins/                # Nitro plugins
│   └── database.ts
└── utils/                  # Server utilities (auto-imported)
    └── auth.ts
```

---

## Defining Event Handlers

### Basic handler

```ts
// server/api/hello.ts
export default defineEventHandler((event) => {
  return { message: 'Hello World' }
})
```

### Async handler

```ts
// server/api/posts.ts
export default defineEventHandler(async (event) => {
  const posts = await db.query('SELECT * FROM posts')
  return posts
})
```

### Handler with object syntax

```ts
// server/api/posts.ts
export default defineEventHandler({
  onRequest: [
    // Pre-request hooks
    (event) => console.log('Request started'),
  ],
  onBeforeResponse: [
    // Pre-response hooks
    (event, response) => console.log('Sending response'),
  ],
  handler: async (event) => {
    return { posts: [] }
  }
})
```

---

## Route Parameters

### Dynamic routes

```ts
// server/api/posts/[id].ts → /api/posts/123
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return { id }
})
```

### Multiple parameters

```ts
// server/api/users/[userId]/posts/[postId].ts
export default defineEventHandler((event) => {
  const userId = getRouterParam(event, 'userId')
  const postId = getRouterParam(event, 'postId')
  return { userId, postId }
})
```

### Catch-all routes

```ts
// server/api/[...path].ts → /api/any/nested/path
export default defineEventHandler((event) => {
  const path = getRouterParam(event, 'path')
  return { path }  // 'any/nested/path'
})
```

### Validated parameters

```ts
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, 
    z.object({
      id: z.string().regex(/^\d+$/).transform(Number)
    }).parse
  )
  
  return { id: params.id }  // number
})
```

---

## HTTP Methods

### Method-specific files

```
server/api/posts/
├── index.get.ts     # GET /api/posts
├── index.post.ts    # POST /api/posts
├── [id].get.ts      # GET /api/posts/:id
├── [id].put.ts      # PUT /api/posts/:id
├── [id].patch.ts    # PATCH /api/posts/:id
└── [id].delete.ts   # DELETE /api/posts/:id
```

### Check method in handler

```ts
export default defineEventHandler((event) => {
  const method = getMethod(event)
  
  if (method === 'GET') {
    return getAllPosts()
  } else if (method === 'POST') {
    return createPost(event)
  }
})
```

---

## Request Handling

### Read body

```ts
export default defineEventHandler(async (event) => {
  // JSON body
  const body = await readBody(event)
  
  // Validated body
  const validated = await readValidatedBody(event, 
    z.object({
      title: z.string().min(1),
      content: z.string()
    }).parse
  )
  
  return { received: validated }
})
```

### Query parameters

```ts
export default defineEventHandler((event) => {
  // Get all query params
  const query = getQuery(event)
  // { page: '1', limit: '10' }
  
  // Validated query
  const validated = await getValidatedQuery(event,
    z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10)
    }).parse
  )
  
  return { page: validated.page }
})
```

### Headers

```ts
export default defineEventHandler((event) => {
  // Single header
  const auth = getHeader(event, 'authorization')
  
  // All headers
  const headers = getHeaders(event)
  
  // Request info
  const url = getRequestURL(event)
  const ip = getRequestIP(event)
  const host = getRequestHost(event)
  
  return { auth, url: url.pathname }
})
```

### Cookies

```ts
export default defineEventHandler((event) => {
  // Read cookie
  const sessionId = getCookie(event, 'session')
  
  // Set cookie
  setCookie(event, 'session', 'new-session-id', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7  // 1 week
  })
  
  // Delete cookie
  deleteCookie(event, 'session')
  
  return { sessionId }
})
```

### Form data / multipart

```ts
export default defineEventHandler(async (event) => {
  // Form data (application/x-www-form-urlencoded)
  const formData = await readFormData(event)
  
  // Multipart (file upload)
  const files = await readMultipartFormData(event)
  
  if (files) {
    for (const file of files) {
      console.log(file.name, file.filename, file.type)
      // file.data is Buffer
    }
  }
  
  return { success: true }
})
```

---

## Response Handling

### Return types

```ts
// JSON (default)
export default defineEventHandler(() => {
  return { message: 'JSON response' }
})

// String
export default defineEventHandler(() => {
  return 'Plain text'
})

// HTML
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/html')
  return '<h1>HTML</h1>'
})
```

### Set headers

```ts
export default defineEventHandler((event) => {
  setHeader(event, 'Cache-Control', 'max-age=3600')
  setHeader(event, 'X-Custom-Header', 'value')
  
  // Multiple headers
  setHeaders(event, {
    'X-Header-1': 'value1',
    'X-Header-2': 'value2'
  })
  
  return { data: 'response' }
})
```

### Status codes

```ts
export default defineEventHandler((event) => {
  setResponseStatus(event, 201)  // Created
  return { created: true }
})
```

### Redirects

```ts
import { sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  return sendRedirect(event, '/new-location', 302)
})
```

### Streams

```ts
import { sendStream } from 'h3'
import fs from 'node:fs'

export default defineEventHandler((event) => {
  const stream = fs.createReadStream('/path/to/file')
  return sendStream(event, stream)
})
```

---

## Error Handling

### Throw errors

```ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'ID is required'
    })
  }
  
  const post = await getPost(id)
  
  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Post ${id} not found`
    })
  }
  
  return post
})
```

### Error response format

```json
{
  "statusCode": 404,
  "statusMessage": "Not Found",
  "message": "Post 123 not found",
  "stack": "..." // Only in development
}
```

### Custom error data

```ts
throw createError({
  statusCode: 422,
  statusMessage: 'Validation Error',
  data: {
    errors: [
      { field: 'title', message: 'Title is required' },
      { field: 'email', message: 'Invalid email format' }
    ]
  }
})
```

---

## Server Middleware

Runs before every request to the server.

### Basic middleware

```ts
// server/middleware/log.ts
export default defineEventHandler((event) => {
  console.log(`[${new Date().toISOString()}] ${event.method} ${event.path}`)
  // Don't return anything - continue to route handler
})
```

### Auth middleware

```ts
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  // Skip for public routes
  if (event.path.startsWith('/api/public')) {
    return
  }
  
  const token = getHeader(event, 'authorization')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  // Add user to context
  event.context.user = verifyToken(token)
})
```

### CORS middleware

```ts
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  setHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  
  // Handle preflight
  if (event.method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }
})
```

---

## Server Utils

Auto-imported from `server/utils/`.

### Creating utilities

```ts
// server/utils/auth.ts
import type { H3Event } from 'h3'

export function requireAuth(event: H3Event) {
  const token = getHeader(event, 'authorization')
  
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  
  const user = verifyToken(token)
  event.context.user = user
  
  return user
}

export function requireRole(event: H3Event, roles: string[]) {
  const user = requireAuth(event)
  
  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  
  return user
}
```

### Using utilities

```ts
// server/api/admin/users.ts
export default defineEventHandler((event) => {
  // Use utility (auto-imported)
  const user = requireRole(event, ['admin'])
  
  return { users: await getUsers() }
})
```

---

## Database & Storage

### Nitro storage (KV)

```ts
// server/api/cache.ts
export default defineEventHandler(async (event) => {
  const storage = useStorage()
  
  // Set value
  await storage.setItem('key', { data: 'value' })
  
  // Get value
  const value = await storage.getItem('key')
  
  // Check exists
  const has = await storage.hasItem('key')
  
  // List keys
  const keys = await storage.getKeys('prefix:')
  
  // Remove
  await storage.removeItem('key')
  
  return { value }
})
```

### Configure storage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        url: process.env.REDIS_URL
      },
      db: {
        driver: 'fs',
        base: './.data/db'
      }
    }
  }
})

// Usage
const redis = useStorage('redis')
const db = useStorage('db')
```

### Database with Drizzle

```ts
// server/utils/db.ts
import { drizzle } from 'drizzle-orm/...'
import * as schema from './schema'

export const db = drizzle(connection, { schema })

// server/api/posts.ts
export default defineEventHandler(async () => {
  const posts = await db.query.posts.findMany()
  return posts
})
```

---

## Nitro Features

### Scheduled tasks

```ts
// server/tasks/cleanup.ts
export default defineTask({
  meta: {
    name: 'cleanup',
    description: 'Clean old records'
  },
  run: async () => {
    await cleanupOldRecords()
    return { result: 'success' }
  }
})
```

### Server plugins

```ts
// server/plugins/database.ts
export default defineNitroPlugin((nitroApp) => {
  // Initialize database on startup
  nitroApp.hooks.hook('request', (event) => {
    // Run on each request
  })
  
  nitroApp.hooks.hook('close', async () => {
    // Cleanup on shutdown
    await db.close()
  })
})
```

### Cached event handlers

```ts
// server/api/stats.ts
export default defineCachedEventHandler(async (event) => {
  // Expensive computation
  const stats = await computeStats()
  return stats
}, {
  maxAge: 60 * 10,  // Cache for 10 minutes
  staleMaxAge: 60 * 60,  // Serve stale while revalidating
  swr: true
})
```

### Route rules (caching)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/api/static/**': { 
      cache: { maxAge: 60 * 60 } 
    },
    '/api/user': {
      cache: false  // No caching
    }
  }
})
```
