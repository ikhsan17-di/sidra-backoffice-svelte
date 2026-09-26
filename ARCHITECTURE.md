# SvelteKit Architecture Documentation

Comprehensive guide to the Sidra Backoffice architecture, design patterns, and system components for SvelteKit.

## 🏗️ System Overview

Sidra Backoffice is a full-stack SvelteKit application that provides a user interface for the DB Management Service API. SvelteKit combines the best of both server and client-side development with file-based routing and built-in optimization.

```
┌─────────────────────────────────────────────────────────┐
│         Sidra Backoffice (SvelteKit Full-Stack)        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │     Server-Side Rendering + Client-Side (SSR)   │  │
│  │  +layout.svelte │ +page.svelte │ +server.ts     │  │
│  └──────────────────────────────────────────────────┘  │
│                           ▲                             │
│                           │                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Reusable Components (Svelte)               │  │
│  │  LoadingSpinner │ StatCard │ Charts │ Tables   │  │
│  └──────────────────────────────────────────────────┘  │
│                           ▲                             │
│                           │                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │           API Client Layer (Axios)              │  │
│  │     DBManagementAPI Class / Interceptors        │  │
│  └──────────────────────────────────────────────────┘  │
│                           │                             │
│                HTTP Proxying (Vite)                     │
│                           │                             │
└─────────────────────────────┼──────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  DB Management API  │
                    │  (Backend Service)  │
                    │  :8080              │
                    └─────────────────────┘
```

## 🎯 Architecture Layers

### 1. **Routing Layer** (File-Based Routes)

SvelteKit uses file-based routing. Each directory under `src/routes/` creates a route:

```
src/routes/
├── +layout.svelte          → Root layout (applied to all routes)
├── +page.svelte            → / (Dashboard)
├── +page.server.ts         → Server logic for /
├── orders/
│   ├── +page.svelte        → /orders
│   └── +page.server.ts     → Server logic for /orders
├── instances/
│   └── +page.svelte        → /instances
├── usage/
│   └── +page.svelte        → /usage
├── settings/
│   └── +page.svelte        → /settings
└── api/
    ├── orders/
    │   └── +server.ts      → POST /api/orders
    └── health/
        └── +server.ts      → GET /api/health
```

#### Page Files (`+page.svelte`)

Client-side component that renders the page:

```svelte
<script>
  export let data  // From +page.server.ts or +layout.server.ts
</script>

<div>
  {#each data.items as item}
    <Item {item} />
  {/each}
</div>
```

#### Server Files (`+page.server.ts`)

Server-side load function that fetches data before rendering:

```typescript
export async function load() {
  const orders = await dbAPI.getBackofficeOrders()
  return { orders: orders.data }
}
```

#### Layout Files (`+layout.svelte`)

Shared layout applied to all child routes. The root layout wraps the entire app with sidebar navigation.

### 2. **Presentation Layer** (Routes & Components)

#### Dashboard (`/`)
- Statistics display
- Order visualization
- Instance health monitoring
- Reactive state management

#### Orders (`/orders`)
- Order table with pagination
- Advanced filtering
- Action buttons
- Status management

#### Instances (`/instances`)
- Instance registration
- List view with filtering
- Capacity tracking

#### Usage (`/usage`)
- Usage analytics
- Cost tracking
- Storage visualization

#### Settings (`/settings`)
- API configuration
- JWT token management
- System operations

### 3. **Component Layer** (Reusable UI Components)

Located in `src/lib/components/`:

```
src/lib/components/
├── LoadingSpinner.svelte      # Loading indicator
├── StatCard.svelte            # Statistics card
├── DataTable.svelte           # Reusable table (if needed)
└── ...
```

**Component Pattern**:

```svelte
<script lang="ts">
  // Props
  export let title: string
  export let value: number
  export let variant: 'default' | 'success' | 'warning' = 'default'
  
  // Event handlers
  function handleClick() {
    // Handle click
  }
</script>

<div class="card p-6">
  <p class="text-gray-600">{title}</p>
  <p class="text-3xl font-bold">{value}</p>
</div>
```

### 4. **API Client Layer**

**File**: `src/lib/api.ts`

Centralized HTTP client using Axios:

```typescript
class DBManagementAPI {
  private client: AxiosInstance
  
  // Health & System
  async healthCheck(): Promise<string>
  
  // Orders
  async getBackofficeOrders(params: any): Promise<OrdersResponse>
  async createOrder(request: OrderRequest): Promise<Response>
  
  // Instances
  async getBackofficeInstances(params: any): Promise<InstancesResponse>
  async registerInstance(instance: Instance): Promise<Response>
  
  // Usage
  async getInstanceUsage(): Promise<InstanceUsage[]>
  async getUsageByGroup(groupId: string): Promise<GroupUsage>
}

export const dbAPI = new DBManagementAPI()
```

**Key Features**:
- Single source of truth for API calls
- Automatic error handling via interceptors
- TypeScript-typed responses
- Environment-based configuration

### 5. **Type System Layer**

**File**: `src/lib/types.ts`

Core interfaces for type safety:

```typescript
export interface Order {
  id: string
  db_name: string
  db_type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb'
  status: string
  // ...
}

export interface Instance {
  instance_name: string
  db_type: string
  host: string
  port: number
  // ...
}

export interface APIResponse<T> {
  data?: T
  message?: string
  total?: number
  page?: number
}
```

### 6. **Utility Layer**

**File**: `src/lib/utils.ts`

Common utilities:

```typescript
export function getStatusBadge(status: string): string
export function getDBTypeColor(type: string): string
export function formatStorage(bytes: number): string
```

## 🔄 Data Flow Patterns

### Pattern 1: Server-Side Data Loading (Recommended)

```
URL Navigation
    ↓
Browser navigates to /orders
    ↓
SvelteKit calls load() in +page.server.ts
    ↓
Server fetches data from API
    ↓
Data passed to +page.svelte as prop
    ↓
Page renders with data
    ↓
Svelte hydrates on client (interactive)
```

**Implementation**:

```typescript
// +page.server.ts
export async function load() {
  try {
    const orders = await dbAPI.getBackofficeOrders()
    return { orders: orders.data }
  } catch (error) {
    throw error('Failed to load orders')
  }
}
```

```svelte
<!-- +page.svelte -->
<script>
  export let data
</script>

{#each data.orders as order}
  <OrderRow {order} />
{/each}
```

### Pattern 2: Client-Side Data Fetching

For interactive updates after initial load:

```svelte
<script>
  import { onMount } from 'svelte'
  
  let items = $state<any[]>([])
  let loading = $state(true)
  
  onMount(async () => {
    try {
      items = await dbAPI.getItems()
    } finally {
      loading = false
    }
  })
</script>

{#if loading}
  <LoadingSpinner />
{:else}
  {#each items as item}
    <Item {item} />
  {/each}
{/if}
```

### Pattern 3: Form Submission with Server Actions

```typescript
// +page.server.ts
export const actions = {
  async default({ request }) {
    const formData = await request.formData()
    try {
      const result = await dbAPI.createOrder({
        db_name: formData.get('db_name'),
        db_type: formData.get('db_type'),
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
```

```svelte
<!-- +page.svelte -->
<script>
  import { enhance } from '$app/forms'
  
  export let form
</script>

{#if form?.success}
  <p>Order created successfully!</p>
{:else if form?.error}
  <p class="error">{form.error}</p>
{/if}

<form method="POST" use:enhance>
  <input name="db_name" required />
  <select name="db_type" required>
    <option value="postgresql">PostgreSQL</option>
    <option value="mysql">MySQL</option>
  </select>
  <button type="submit">Create Order</button>
</form>
```

### Pattern 4: Real-Time Updates with Polling

```svelte
<script>
  import { onMount } from 'svelte'
  
  let data = $state<any>(null)
  
  async function refresh() {
    data = await dbAPI.getStats()
  }
  
  onMount(async () => {
    await refresh()
    const interval = setInterval(refresh, 5000) // Refresh every 5 seconds
    
    return () => clearInterval(interval)
  })
</script>

<div>
  {#if data}
    <StatCard title="Orders" value={data.total} />
  {/if}
</div>
```

## 🔌 API Integration Architecture

### Request Flow

```
Page Component (or Server Load)
    ↓
dbAPI.getBackofficeOrders()
    ↓
axios.get('/api/v1/backoffice/orders')
    ↓
Request Interceptor (auth headers)
    ↓
Vite Dev Proxy (dev) / Direct HTTPS (prod)
    ↓
Backend API :8080
    ↓
Database / Services
```

### Environment Configuration

**Development** (`svelte.config.js`):
```javascript
vite: {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
}
```

**Production** (`.env.production`):
```
VITE_API_BASE_URL=https://api.production.com/api
```

### Error Handling

```typescript
// Response interceptor
this.client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data)
    // Could also dispatch to error store or show toast
    return Promise.reject(error)
  }
)
```

## 🧩 Component Composition

### Page with Server-Side Loading

```svelte
<script lang="ts">
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
  import OrderRow from '$lib/components/OrderRow.svelte'
  
  export let data
  
  let filters = $state({ page: 1, status: '' })
  
  async function applyFilters() {
    // Fetch new data client-side
  }
</script>

<div class="p-6">
  <!-- Filters -->
  <div class="mb-6">
    <select bind:value={filters.status} onchange={applyFilters}>
      <option value="">All Status</option>
      <option value="active">Active</option>
    </select>
  </div>
  
  <!-- Data -->
  {#each data.orders as order}
    <OrderRow {order} />
  {/each}
</div>
```

### Reusable Component

```svelte
<script lang="ts">
  import { CheckCircle } from '@lucide/svelte'
  
  export let title: string
  export let value: number
  export let icon: any = CheckCircle
  export let variant: 'default' | 'success' | 'warning' = 'default'
</script>

<div class="card p-6 {`variant-${variant}`}">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-gray-600">{title}</p>
      <p class="text-3xl font-bold">{value}</p>
    </div>
    <svelte:component this={icon} class="w-8 h-8 text-gray-400" />
  </div>
</div>
```

## 🎨 Styling Architecture

### Tailwind CSS Utility-First

```svelte
<div class="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
  <h1 class="text-2xl font-bold text-gray-900">Title</h1>
  <p class="text-gray-600 mt-2">Description</p>
</div>
```

### Responsive Design

```svelte
<!-- Grid that adapts to screen size -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {#each items as item}
    <Card {item} />
  {/each}
</div>
```

### Global Styles (`src/app.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200;
  }
  
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition;
  }
}
```

## 🔐 Security Architecture

### Authentication

JWT tokens stored in `localStorage`:

```svelte
<script>
  let token = localStorage.getItem('jwtToken')
  
  function saveToken(newToken: string) {
    localStorage.setItem('jwtToken', newToken)
    // Token automatically included in API requests
  }
</script>
```

### API Request Authentication

```typescript
// src/lib/api.ts
this.client.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### HTTPS in Production

All production deployments enforce HTTPS. SvelteKit handles redirects automatically.

## 📊 State Management

### Local Component State (Runes)

```svelte
<script>
  let count = $state(0)
  let items = $state<string[]>([])
  
  $effect(() => {
    console.log('Count changed:', count)
  })
</script>

<button onclick={() => count++}>
  Clicked {count} times
</button>
```

### Derived State

```svelte
<script>
  export let orders = []
  
  $: activeCount = orders.filter(o => o.status === 'active').length
  $: totalStorage = orders.reduce((sum, o) => sum + o.storage_size, 0)
</script>

<p>Active: {activeCount}, Total Storage: {totalStorage}GB</p>
```

### Svelte Stores (if needed)

```typescript
// src/lib/stores.ts
import { writable } from 'svelte/store'

export const currentUser = writable<User | null>(null)
export const notifications = writable<Notification[]>([])
```

```svelte
<script>
  import { currentUser, notifications } from '$lib/stores'
</script>

<p>User: {$currentUser?.name}</p>
```

## 🚀 Performance Optimization

### Code Splitting

SvelteKit automatically code-splits by route:

```
dist/
├── _app/       # Shared code
├── orders/     # /orders route
├── instances/  # /instances route
└── ...
```

### Server-Side Rendering Benefits

- Initial HTML contains data (faster FCP)
- Reduced JavaScript bundle
- Better SEO support
- Better accessibility

### Image Optimization

```svelte
<img src="/image.webp" alt="Description" loading="lazy" />
```

### Caching Headers

Configure in deployment layer (Nginx, CloudFlare, etc.):

```nginx
location / {
  # HTML - no cache
  add_header Cache-Control "public, max-age=0, must-revalidate";
}

location /_app/ {
  # Assets - cache forever (versioned)
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## 🚢 Deployment Architecture

### Development
```
localhost:3000 (SvelteKit dev server)
    ↓ proxies /api
localhost:8080 (Backend API)
```

### Production
```
Node.js App (port 3000)
    ↓ HTTP/2
CDN/Load Balancer
    ↓
API Server (https://api.example.com)
    ↓
Database & Services
```

### Docker Build

```dockerfile
# Multi-stage build
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
EXPOSE 3000
CMD ["node", "build"]
```

## 🔍 Debugging & Monitoring

### Development

```svelte
<script>
  console.log('Component mounted')
  $effect(() => {
    console.log('State changed:', someValue)
  })
</script>
```

### Production

```typescript
// Server-side logging
import { error } from '@sveltejs/kit'

export async function load() {
  try {
    return await dbAPI.getOrders()
  } catch (err) {
    console.error('Load failed:', err)
    throw error(500, 'Failed to load orders')
  }
}
```

## 📁 Best Practices

### File Organization

- Group related files together
- Use clear naming conventions
- Keep components focused and small
- Separate concerns (UI, logic, types)

### Naming Conventions

- Components: `PascalCase` (e.g., `OrderRow.svelte`)
- Utilities: `camelCase` (e.g., `formatStorage.ts`)
- Types: `PascalCase` (e.g., `Order.ts`)
- Routes: `lowercase-with-hyphens` (e.g., `/my-orders`)

### Code Quality

```bash
# Type checking
npm run type-check

# Build check
npm run build

# Test before commit
npm run type-check && npm run build
```

---

**Architecture Version**: 2.0 (SvelteKit)  
**Last Updated**: 2026-09-26
