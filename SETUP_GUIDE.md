# Sidra Backoffice - SvelteKit Setup Guide

Comprehensive guide for setting up, configuring, and developing the Sidra Backoffice application with SvelteKit.

## 📋 Quick Start (5 minutes)

### Prerequisites
- **Node.js**: v18 or higher
- **npm** or **yarn**: Latest version
- **Git**: For cloning the repository
- **Backend API**: Running at `http://localhost:8080` (development)

### Installation Steps

#### 1. Clone Repository
```bash
git clone https://github.com/ikhsan17-di/sidra-backoffice-svelte.git
cd sidra-backoffice-svelte
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Start Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

> **Important**: Ensure the backend API is running at `http://localhost:8080`. The development server automatically proxies `/api` requests to the backend.

## 🎯 What is SvelteKit?

SvelteKit is a full-stack framework built on top of Svelte and Vite. Key differences from plain Svelte:

- **File-based Routing**: Routes are automatically created based on directory structure
- **Server-side Rendering (SSR)**: Built-in support for server-side rendering
- **API Routes**: Create backend API endpoints in `src/routes/api/`
- **Layouts & Nested Routes**: Automatic layout inheritance
- **Form Actions**: Server-side form handling with progressive enhancement
- **Hooks**: Global request/response handling

### Project Structure

```
src/
├── routes/                 # File-based routing
│   ├── +layout.svelte      # Root layout (sidebar, navigation)
│   ├── +page.svelte        # Dashboard page (/)
│   ├── orders/
│   │   └── +page.svelte    # Orders page (/orders)
│   ├── instances/
│   │   └── +page.svelte    # Instances page (/instances)
│   ├── usage/
│   │   └── +page.svelte    # Usage page (/usage)
│   ├── settings/
│   │   └── +page.svelte    # Settings page (/settings)
│   └── api/                # API routes (optional)
│       ├── orders/
│       │   └── +server.ts  # POST /api/orders
│       └── health/
│           └── +server.ts  # GET /api/health
├── lib/
│   ├── components/         # Reusable components
│   ├── api.ts             # API client
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Utilities
├── app.html               # HTML shell
└── app.css               # Global styles
```

## 📖 Features & Pages Overview

### Dashboard (`/`)
**Real-time overview of your database infrastructure**

- 📊 **Statistics Cards**: Key metrics at a glance
- 📈 **Order Charts**: Orders by type and status
- 📋 **Recent Instances Table**: Latest registered instances
- ⚡ **Real-time Updates**: Optional WebSocket support

### Orders (`/orders`)
**Comprehensive database order management**

- 🗂️ **Order List View**: All database orders
- 🔍 **Advanced Filtering**: By name, type, status
- ⚙️ **Order Actions**: Suspend, resume, resize, delete
- 📄 **Pagination**: Navigate large datasets
- 🔄 **Auto-refresh**: Configurable polling

### Instances (`/instances`)
**Database instance registration and management**

- 📝 **Instance Registration**: Register new instances
- ⚙️ **Configuration**: Host, port, credentials
- 🔍 **Discovery**: Search and filter instances
- 📊 **Health Monitoring**: Instance status indicators

### Usage & Analytics (`/usage`)
**Detailed resource consumption and cost tracking**

- 💾 **Disk Usage Analytics**: By instance and user
- 💰 **Cost Analysis**: Group-based tracking
- 📊 **Usage Tables**: Detailed breakdowns
- 📈 **Trend Analysis**: Historical data

### Settings (`/settings`)
**System configuration and administration**

- 🔌 **API Configuration**: Endpoint management
- 🔐 **JWT Token Management**: Authentication setup
- 🛠️ **System Operations**: Redis sync, order recheck
- 📚 **API Documentation**: Endpoint reference

## 🔌 API Integration

### Development Setup

The SvelteKit development server automatically proxies API requests via `svelte.config.js`:

```typescript
// svelte.config.js
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

**How it works**:
```
Client Request: http://localhost:3000/api/orders
    ↓
Vite Proxy
    ↓
Backend: http://localhost:8080/api/v1/orders
```

### Production Setup

For production deployments, configure the API base URL via environment variable:

```bash
# Build with custom API base URL
VITE_API_BASE_URL=https://api.example.com/api npm run build

# Or in .env file
VITE_API_BASE_URL=https://api.production.com/api
```

### API Client Architecture

The API client in `src/lib/api.ts` uses Axios for HTTP requests:

```typescript
import { dbAPI } from '$lib/api'

// Use throughout the application
const orders = await dbAPI.getBackofficeOrders()
const instances = await dbAPI.getBackofficeInstances()
const stats = await dbAPI.getStats()
```

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory. The output is a Node.js application.

### Docker Deployment

#### Dockerfile for SvelteKit
```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
```

#### Build and Run
```bash
# Build image
docker build -t sidra-backoffice:latest .

# Run container
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=http://api:8080/api \
  sidra-backoffice:latest
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backoffice:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://db-management-service:8080/api
      NODE_ENV: production
    depends_on:
      - db-management-service

  db-management-service:
    image: your-db-service:latest
    ports:
      - "8080:8080"
```

### Kubernetes Deployment

#### Deployment & Service
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sidra-backoffice
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sidra-backoffice
  template:
    metadata:
      labels:
        app: sidra-backoffice
    spec:
      containers:
      - name: backoffice
        image: sidra-backoffice:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: VITE_API_BASE_URL
          value: "http://db-management-service:8080/api"
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: sidra-backoffice
  namespace: default
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
    name: http
  selector:
    app: sidra-backoffice
```

### Environment Variables

#### Development
```bash
# Optional .env.development
VITE_API_BASE_URL=/api
```

#### Production
```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com/api
NODE_ENV=production
```

## 🔧 Development

### Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check without emit
npm run type-check

# Sync SvelteKit configuration
npm run sync
```

### Adding New Pages

#### Step 1: Create Page Component

Create `src/routes/analytics/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { dbAPI } from '$lib/api'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'

  let data: any = null
  let loading = true
  let error: string | null = null

  onMount(async () => {
    try {
      data = await dbAPI.getBackofficeOrders()
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading = false
    }
  })
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold mb-6">Analytics</h1>
  
  {#if loading}
    <LoadingSpinner />
  {:else if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  {:else}
    <!-- Page content -->
  {/if}
</div>
```

#### Step 2: Add Navigation

Update `src/routes/+layout.svelte`:

```svelte
<script>
  import { AnalyticsIcon } from '@lucide/svelte'

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/orders', label: 'Orders', icon: Database },
    { href: '/instances', label: 'Instances', icon: Server },
    { href: '/usage', label: 'Usage & Analytics', icon: BarChart3 },
    { href: '/analytics', label: 'Analytics', icon: AnalyticsIcon },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ]
</script>
```

### Server-Side Data Loading (Advanced)

SvelteKit allows loading data on the server before rendering:

#### Step 1: Create `+page.server.ts`

```typescript
// src/routes/analytics/+page.server.ts
import { dbAPI } from '$lib/api'

export async function load() {
  try {
    const orders = await dbAPI.getBackofficeOrders()
    return {
      orders: orders.data,
    }
  } catch (error) {
    return {
      status: 500,
      error: 'Failed to load analytics',
    }
  }
}
```

#### Step 2: Use Data in Page

```svelte
<!-- src/routes/analytics/+page.svelte -->
<script>
  export let data
</script>

{#each data.orders as order}
  <div>{order.db_name}</div>
{/each}
```

**Benefits**:
- Data loads before page renders (better UX)
- Server-side caching support
- Error handling at server level
- Better SEO (if needed)

### Adding API Methods

Extend `src/lib/api.ts`:

```typescript
async getAnalyticsData(dateRange: string): Promise<any> {
  const { data } = await this.client.get<APIResponse<any>>(
    '/analytics',
    { params: { dateRange } }
  )
  return data.data || []
}
```

### Styling with Tailwind CSS

#### Utility Classes

```svelte
<!-- Direct Tailwind utilities -->
<div class="p-6 bg-white rounded-lg shadow-lg">
  <h1 class="text-2xl font-bold text-gray-900">Title</h1>
  <p class="text-gray-600 mt-2">Description</p>
</div>
```

#### Responsive Design

```svelte
<!-- Mobile-first responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards scale based on screen size -->
</div>
```

#### Component-Level Styles

```svelte
<script>
  let count = 0
</script>

<button class="btn-primary" onclick={() => count++}>
  Clicked {count} times
</button>

<style>
  :global(.btn-primary) {
    @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition;
  }
</style>
```

## 📊 Charts & Data Visualization

### Using Chart.js

```svelte
<script lang="ts">
  import { Bar } from 'svelte-chartjs'
  import type { ChartOptions } from 'chart.js'

  const chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  }

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Orders Created',
        data: [10, 20, 15, 25, 30],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  }
</script>

<div class="w-full h-96">
  <Bar data={chartData} options={chartOptions} />
</div>
```

## 🔐 Authentication & Security

### JWT Token Configuration

1. Navigate to **Settings** page
2. Locate **API Configuration** section
3. Enter your JWT token
4. Click **Save**

Token is automatically:
- Stored in `localStorage`
- Included in all API requests
- Refreshed on application load

### Security Best Practices

- ✅ Always use HTTPS in production
- ✅ Rotate JWT tokens regularly
- ✅ Never commit tokens to git
- ✅ Use environment variables for sensitive data
- ✅ Keep dependencies updated
- ✅ Enable CORS only for trusted domains

## 🧪 Testing

### Type Checking

```bash
npm run type-check
```

Ensures TypeScript types are correct before building.

### Unit Testing (Optional)

To add Vitest:

```bash
npm install -D vitest @testing-library/svelte
```

Then create test files:
```typescript
// src/lib/api.test.ts
import { describe, it, expect } from 'vitest'
import DBManagementAPI from './api'

describe('DBManagementAPI', () => {
  it('should initialize with default base URL', () => {
    const api = new DBManagementAPI()
    expect(api).toBeDefined()
  })
})
```

Run tests:
```bash
npm run test
```

## 🐛 Troubleshooting

### API Connection Error

**Issue**: Getting "Failed to fetch API"

**Solutions**:
1. Verify backend is running: `http://localhost:8080`
2. Check API base URL in Settings page
3. Inspect browser console (F12) for detailed errors
4. Ensure CORS headers on backend:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

### Port Already in Use

**Issue**: "Port 3000 already in use"

**Solutions**:
```bash
# Use different port
npm run dev -- --port 3001

# Kill process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Build Fails

**Issue**: `npm run build` fails

**Solutions**:
```bash
# Clear all caches
rm -rf node_modules package-lock.json .svelte-kit dist

# Reinstall dependencies
npm install

# Type check
npm run type-check

# Rebuild
npm run build
```

### TypeScript Errors

**Issue**: Type checking errors during build

**Solutions**:
```bash
# Check TypeScript configuration
npm run type-check

# Review errors and fix type issues
# Common fixes:
# - Add type annotations
# - Import types correctly
# - Update tsconfig.json if needed
```

### HMR Not Working

**Issue**: Changes not reflecting without refresh

**Solutions**:
1. Restart development server:
   ```bash
   npm run dev
   ```

2. Clear browser cache:
   - Press Ctrl+Shift+Delete
   - Close DevTools and reopen
   - Refresh (Ctrl+Shift+R)

3. Check terminal for errors

### Node Build Memory Issues

**Issue**: Build fails with "JavaScript heap out of memory"

**Solutions**:
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Or in PowerShell (Windows):
$env:NODE_OPTIONS="--max-old-space-size=4096"; npm run build
```

## 📚 Resources & Documentation

### Framework Documentation
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte Docs](https://svelte.dev/docs)
- [Vite Docs](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Libraries
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Axios](https://axios-http.com/docs/intro)
- [Chart.js](https://www.chartjs.org/docs/latest/)
- [date-fns](https://date-fns.org/docs/Getting-Started)
- [Lucide Icons](https://lucide.dev)

### Related Projects
- [DB Management Service](https://github.com/your-org/db-management-service) - Backend API
- [Database CLI](https://github.com/your-org/db-cli) - Command-line tools

## 🤝 Contributing

### Development Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes**:
   - Follow SvelteKit conventions
   - Write clean, readable code
   - Add TypeScript types

3. **Test Changes**:
   ```bash
   npm run type-check
   npm run build
   ```

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push & Create PR**:
   ```bash
   git push origin feature/your-feature
   ```

### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `style:` Formatting
- `test:` Testing
- `chore:` Dependencies, build setup

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Support & Contact

For questions or issues:
- Review the [Troubleshooting](#-troubleshooting) section
- Check API documentation in Settings page
- Review SvelteKit documentation
- Contact the development team

---

**Last Updated**: 2026-09-26  
**Version**: 0.0.1  
**Framework**: SvelteKit
