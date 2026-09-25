# Architecture Documentation

Comprehensive guide to the Sidra Backoffice architecture, design patterns, and system components.

## 🏗️ System Overview

Sidra Backoffice is a single-page application (SPA) built with Svelte + Vite that provides a user interface for the DB Management Service API. The system follows a layered architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│                  Sidra Backoffice (SPA)                 │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Routes/Pages (Svelte)                │  │
│  │  Dashboard │ Orders │ Instances │ Usage │ Sett. │  │
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

### 1. **Presentation Layer** (Routes & Components)

Routes are the top-level page components in `src/routes/`:

#### Dashboard.svelte
- Real-time statistics display
- Order visualization (bar and pie charts)
- Instance health monitoring
- **Data Flow**:
  1. Component mounts → fetch stats and orders
  2. Display loading state
  3. Render charts with Chart.js
  4. Update every N seconds (optional polling)

#### Orders.svelte
- Order table with pagination
- Advanced filtering and search
- Action buttons (suspend, resume, resize, delete)
- **State Management**:
  - `orders`: Current page of orders
  - `filters`: Active filter criteria
  - `loading`: Loading state
  - `pagination`: Page info (page, page_size, total)

#### Instances.svelte
- Instance registration form
- Instance list with filtering
- Capacity tracking
- **Form Handling**:
  - Validate input before submit
  - Show loading state during submission
  - Display success/error messages

#### Usage.svelte
- Usage charts (instance and user)
- Cost analysis tables
- Group-based analytics
- **Data Visualization**:
  - Multiple Chart.js instances
  - Responsive container sizing
  - Legend and tooltip configuration

#### Settings.svelte
- API configuration
- JWT token management
- System operations (sync cache, recheck orders)
- **Security Features**:
  - Token stored in localStorage
  - Automatic inclusion in requests
  - Validation on save

### 2. **Component Layer** (Reusable UI Components)

Located in `src/lib/components/`:

#### LoadingSpinner.svelte
```svelte
<!-- Animated loading indicator -->
<!-- Used across all pages during data fetching -->
```

#### StatCard.svelte
```svelte
<!-- Display single metric -->
<!-- Props: title, value, icon, trend -->
<!-- Used in Dashboard for statistics -->
```

#### Other Components
- Data tables with sorting/pagination
- Form components with validation
- Error display components
- Modal dialogs (if needed)

### 3. **API Client Layer**

**File**: `src/lib/api.ts`

```typescript
class DBManagementAPI {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string)
  
  // Health & System
  async healthCheck(): Promise<string>
  async syncRedis(): Promise<{ message: string }>
  
  // Orders
  async getBackofficeOrders(params: any): Promise<OrdersResponse>
  async createOrder(request: OrderRequest): Promise<CreationResponse>
  async suspendOrder(orderId: string): Promise<Response>
  async continueOrder(orderId: string): Promise<Response>
  async resizeOrder(request: ResizeRequest): Promise<Response>
  
  // Instances
  async getBackofficeInstances(params: any): Promise<InstancesResponse>
  async registerInstance(instance: Instance): Promise<RegistrationResponse>
  
  // Usage & Analytics
  async getInstanceUsage(): Promise<InstanceUsage[]>
  async getUserUsage(): Promise<any[]>
  async getUsageByGroup(groupId: string): Promise<GroupUsage>
  
  // Statistics
  async getOrdersByDBType(): Promise<any[]>
  async getOrdersByStatus(): Promise<any[]>
  async getStats(): Promise<{ today: number }>
}
```

**Key Features**:
- Centralized HTTP client using Axios
- Automatic error handling and logging
- Response interceptors for standardized handling
- Typed responses with TypeScript interfaces
- Base URL configurable via environment variables

### 4. **Type System Layer**

**File**: `src/lib/types.ts`

Core interfaces:

```typescript
// Domain Models
interface Order { ... }
interface Instance { ... }
interface InstanceUsage { ... }
interface GroupUsage { ... }
interface UsageByDB { ... }

// Request/Response Types
interface OrderRequest { ... }
interface ResizeRequest { ... }
interface APIResponse<T> { ... }
interface PaginationParams { ... }
```

**Type Safety Benefits**:
- Compile-time error catching
- IDE autocomplete support
- API contract documentation
- Type-safe form handling

### 5. **Utility Layer**

**File**: `src/lib/utils.ts`

Common utilities for:
- Date formatting
- Number formatting (storage sizes, costs)
- Status badge rendering
- Data transformation
- Validation helpers

## 🔄 Data Flow Patterns

### Pattern 1: Page Load with Data Fetching

```
Component Mount
    ↓
onMount() hook triggers
    ↓
Set loading = true
    ↓
await dbAPI.getBackofficeOrders()
    ↓
Handle error/success
    ↓
Set loading = false
    ↓
Svelte reactivity updates template
    ↓
Render component
```

### Pattern 2: Form Submission

```
User submits form
    ↓
Validate input
    ↓
Set loading = true
    ↓
await dbAPI.createOrder(formData)
    ↓
On success: Show message & refresh data
On error: Display error message
    ↓
Set loading = false
```

### Pattern 3: Filtering & Pagination

```
User changes filter/page
    ↓
Update filter state
    ↓
Calculate new query params
    ↓
Trigger data fetch with new params
    ↓
Update results & pagination info
    ↓
Component reactivity updates view
```

### Pattern 4: Real-time Monitoring

```
Component mount
    ↓
Start polling interval (setInterval)
    ↓
Every N seconds: fetch latest data
    ↓
Update component state
    ↓
Svelte reactivity updates display
    ↓
Component unmount: clear interval
```

## 🔌 API Integration Architecture

### Request Flow

```
Svelte Component
    ↓
dbAPI method call
    ↓
axios.get/post/put/delete()
    ↓
Request Interceptor (add headers, auth)
    ↓
Vite Proxy (/api → http://localhost:8080/api)
    ↓
Backend API receives request
    ↓
Response received
    ↓
Response Interceptor (handle errors)
    ↓
Component receives typed data
```

### Environment Configuration

```javascript
// src/lib/api.ts
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

// vite.config.ts (development)
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
  }
}

// .env (production)
VITE_API_BASE_URL=https://api.production.com/api
```

### Error Handling

```typescript
// Response interceptor
this.client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message)
    // Can implement global error handling here
    return Promise.reject(error)
  }
)
```

## 🧩 Component Composition

### Page Component Structure

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { dbAPI } from '$lib/api'
  
  let data: any[] = []
  let loading = true
  let error: string | null = null
  let filters = { page: 1, page_size: 10 }
  
  onMount(async () => {
    await loadData()
  })
  
  async function loadData() {
    loading = true
    try {
      const response = await dbAPI.someMethod(filters)
      data = response.data
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading = false
    }
  }
</script>

{#if loading}
  <LoadingSpinner />
{:else if error}
  <ErrorDisplay message={error} />
{:else}
  <!-- Main content -->
{/if}
```

### Reusable Component Pattern

```svelte
<script lang="ts">
  // Props
  export let title: string
  export let value: number
  export let icon: any
  export let trend: number | null = null
  
  // Computed
  $: trendClass = trend ? (trend > 0 ? 'text-green-600' : 'text-red-600') : ''
</script>

<div class="card p-6">
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

### Tailwind CSS Utility-First Approach

```svelte
<!-- Direct utility classes -->
<div class="p-6 bg-white rounded-lg shadow">
  <h2 class="text-2xl font-bold text-gray-900">Title</h2>
  <p class="text-gray-600 mt-2">Description</p>
</div>
```

### Responsive Design

```svelte
<!-- Mobile-first responsive utilities -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>
```

### Component-Level Styles

```svelte
<style>
  :global(.btn-primary) {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition;
  }
</style>
```

## 🔐 Security Architecture

### Authentication

```
LocalStorage: JWT Token
    ↓
Every API Request: Token in Authorization header
    ↓
Backend validates token
    ↓
Allow/Reject request
```

### Secure Data Handling

- **Environment Variables**: Sensitive URLs via `VITE_*` variables
- **No Secrets in Code**: Configuration via env files
- **HTTPS in Production**: Enforced for all API communication
- **Token Storage**: localStorage with proper expiration

## 📊 State Management

### Local Component State

```svelte
<script>
  let data = []           // Mutable local state
  let loading = false
  let filters = {}
  
  // Reactive declarations
  $: filteredData = filterData(data, filters)
</script>
```

### Derived State

```svelte
<script>
  export let orders = []
  
  // Computed property updates automatically
  $: activeOrders = orders.filter(o => o.status === 'active')
  $: totalStorage = activeOrders.reduce((sum, o) => sum + o.storage_size, 0)
</script>
```

### No Global State Library

Currently, Svelte component state is sufficient. If needed, Svelte Stores can be added:

```typescript
// Example: src/lib/stores.ts
import { writable } from 'svelte/store'

export const authToken = writable<string | null>(
  localStorage.getItem('token')
)

export const currentUser = writable<User | null>(null)
```

## 🚀 Performance Optimization

### Code Splitting

Svelte automatically code-splits by route (with lazy loading):

```typescript
const routes = {
  '/': Dashboard,        // Loaded on demand
  '/orders': Orders,
  '/instances': Instances,
  '/usage': Usage,
  '/settings': Settings,
}
```

### Image & Asset Optimization

- Use WebP format for images
- Compress SVGs
- Lazy load images with `loading="lazy"`

### API Optimization

- **Pagination**: Avoid loading all data at once
- **Filtering Server-side**: Reduce payload size
- **Caching**: Implement Redis cache on backend
- **Request Debouncing**: Debounce search inputs

### Bundle Size

```bash
npm run build

# Generates:
# dist/index.html       (~50KB gzipped)
# dist/index.*.js       (~150KB gzipped)
# dist/*.*.js           (lazy chunks)
```

## 📁 File Organization Best Practices

### Routes Structure
```
src/routes/
├── Dashboard.svelte       # /
├── Orders.svelte          # /orders
├── Instances.svelte       # /instances
├── Usage.svelte           # /usage
└── Settings.svelte        # /settings
```

### Components Structure
```
src/lib/components/
├── LoadingSpinner.svelte
├── StatCard.svelte
├── DataTable.svelte
├── ErrorDisplay.svelte
├── Modal.svelte
└── ...
```

### Core Library Structure
```
src/lib/
├── api.ts             # API client class
├── types.ts           # TypeScript interfaces
├── utils.ts           # Helper functions
└── stores.ts          # Svelte stores (if needed)
```

## 🔄 Routing Architecture

### SPA Router Configuration

```typescript
// src/App.svelte
import Router from 'svelte-spa-router'

const routes = {
  '/': Dashboard,
  '/orders': Orders,
  '/instances': Instances,
  '/usage': Usage,
  '/settings': Settings,
  '*': NotFound,  // Fallback route
}
```

### Navigation

```svelte
<!-- Navigate with hash URLs -->
<a href="/#/orders">Orders</a>
<a href="/#/settings">Settings</a>

<!-- Or using link component -->
<a href="/orders">Orders</a>
```

### Route Guards (Optional)

Can be implemented in page components:

```svelte
<script lang="ts">
  onMount(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      // Redirect to settings
      window.location.hash = '#/settings'
    }
  })
</script>
```

## 🧪 Testing Architecture

### Unit Tests (Future)

```typescript
// src/lib/__tests__/api.test.ts
import { describe, it, expect, vi } from 'vitest'
import DBManagementAPI from '../api'

describe('DBManagementAPI', () => {
  it('should fetch orders', async () => {
    // Mock axios
    // Test API client
  })
})
```

### Component Tests (Future)

```typescript
// src/routes/__tests__/Orders.test.ts
import { render } from '@testing-library/svelte'
import Orders from '../Orders.svelte'

describe('Orders Component', () => {
  it('should render order table', () => {
    // Render and assert
  })
})
```

## 🚢 Deployment Architecture

### Development Environment
```
localhost:3000 (Vite dev server)
    ↓ (proxies /api)
localhost:8080 (Backend API)
```

### Production Environment
```
CDN/Nginx (serves dist/)
    ↓ (HTTP requests)
API Server (https://api.example.com/api)
    ↓
Database & Services
```

### Docker Architecture
```
Dockerfile (multi-stage build)
├── Builder stage (npm install, npm run build)
└── Runtime stage (node serve dist/)
```

## 📈 Scalability Considerations

### Current Limitations
- Single browser tab application
- No offline support
- All state in memory

### Future Enhancements
1. **Service Worker**: Add offline support
2. **State Management**: Implement Svelte Stores at scale
3. **Data Caching**: LocalStorage cache with TTL
4. **Virtualization**: Virtual scrolling for large lists
5. **WebSockets**: Real-time updates for live data

## 🔍 Monitoring & Debugging

### Browser DevTools
- Svelte DevTools (Chrome extension)
- Network tab for API calls
- Console for error logs
- Application tab for localStorage

### Debug Output
```svelte
<script>
  console.log('Component mounted', { data, loading })
  $: console.log('Filter changed', filters)
</script>
```

### API Error Logging

All API errors are logged to browser console via interceptors.

## 📚 Related Documentation

- **README.md**: Project overview and features
- **SETUP_GUIDE.md**: Setup and usage instructions
- **API Integration**: See `src/lib/api.ts` comments
- **Type Definitions**: See `src/lib/types.ts`

---

**Architecture Version**: 1.0  
**Last Updated**: 2026-09-26
