# Sidra Backoffice - Setup Guide

Comprehensive guide for setting up, configuring, and developing the Sidra Backoffice application.

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

## 🎯 Features & Pages Overview

### Dashboard (`/`)
**Real-time overview of your database infrastructure**

- 📊 **Statistics Cards**: Key metrics at a glance
  - Total orders
  - Active instances
  - Total storage usage
  - System health status
  
- 📈 **Order Charts**:
  - Orders grouped by database type (bar chart)
  - Orders grouped by status (pie chart)
  
- 📋 **Recent Instances Table**: Latest registered instances
  - Instance name and type
  - Host and port information
  - Health status indicator

### Orders (`/orders`)
**Comprehensive database order management**

- 🗂️ **Order List View**:
  - All database orders with detailed information
  - Database name, type, status
  - Assigned host and port
  - Storage allocation
  
- 🔍 **Advanced Filtering**:
  - Filter by database name
  - Filter by database type (PostgreSQL, MySQL, MariaDB, MongoDB)
  - Filter by status (active, suspended, pending, etc.)
  - Search functionality
  
- ⚙️ **Order Actions**:
  - **Suspend**: Pause database operations
  - **Resume/Continue**: Reactivate suspended databases
  - **Resize**: Increase storage allocation
  - **Delete/Cancel**: Remove database orders
  
- 📄 **Pagination & Sorting**:
  - Navigate through large datasets
  - Sort by any column
  - Configurable page size

### Instances (`/instances`)
**Database instance registration and management**

- 📝 **Instance Registration**:
  - Register new database instances
  - Supported database types:
    - PostgreSQL
    - MySQL
    - MariaDB
    - MongoDB
  
- ⚙️ **Configuration**:
  - Host and port configuration
  - Root credentials
  - Total storage capacity
  - Maximum users limit
  - Optional: Skip health checks
  - Optional: Enable extensions
  
- 🔍 **Instance Discovery**:
  - View all registered instances
  - Filter by type
  - Search by instance name
  - Display capacity information
  
- 📊 **Health Monitoring**:
  - Instance status indicator
  - Connectivity verification
  - Performance metrics

### Usage & Analytics (`/usage`)
**Detailed resource consumption and cost tracking**

- 💾 **Instance Disk Usage**:
  - Storage consumption by instance
  - Visual charts and graphs
  - GB and MB breakdowns
  - Capacity vs. usage comparison
  
- 👥 **User Disk Usage**:
  - Per-user storage analytics
  - Detailed usage tables
  - User-level cost allocation
  - Storage trend analysis
  
- 💰 **Cost Analysis**:
  - Group-based cost tracking
  - Storage allocation costs
  - Billing information
  - Cost breakdown by database type
  
- 📊 **Usage Tables**:
  - Comprehensive data tables
  - Detailed breakdown by database
  - Export-ready format
  - Sortable and filterable columns

### Settings (`/settings`)
**System configuration and administration**

- 🔌 **API Configuration**:
  - View current API base URL
  - Modify API endpoint
  - Health check endpoint testing
  - API connectivity status
  
- 🔐 **JWT Token Management**:
  - Enter JWT authentication token
  - Token validation
  - Secure storage in localStorage
  - Automatic token inclusion in API requests
  
- 🛠️ **System Operations**:
  - **Sync Redis Cache**: Refresh cached data
  - **Recheck Pending Orders**: Reprocess orders in pending state
  - Operation status feedback
  - Bulk operation management
  
- 📚 **API Documentation**:
  - Available endpoints reference
  - Request/response formats
  - Authentication requirements
  - Example payloads

## 🔌 API Integration

### Development Setup

The Vite development server automatically proxies API requests:

```bash
# Any request to /api is proxied to http://localhost:8080/api
# Example:
# http://localhost:3000/api/v1/backoffice/orders
# → http://localhost:8080/api/v1/backoffice/orders
```

**Proxy Configuration** (in `vite.config.ts`):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
    },
  },
}
```

### Production Setup

For production deployments, configure the API base URL via environment variable:

```bash
# Build with custom API base URL
VITE_API_BASE_URL=https://api.example.com/api npm run build

# Or set in .env file
VITE_API_BASE_URL=https://api.production.com/api
```

### API Client Architecture

The API client is implemented in `src/lib/api.ts` using Axios:

```typescript
import { dbAPI } from '$lib/api'

// Use throughout the application
const orders = await dbAPI.getBackofficeOrders()
const instance = await dbAPI.getBackofficeInstances()
const stats = await dbAPI.getStats()
```

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

### Docker Deployment

#### Dockerfile
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
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
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
# .env.development (optional)
VITE_API_BASE_URL=/api
```

#### Production
```bash
# .env.production (optional)
VITE_API_BASE_URL=https://api.example.com/api
```

## 🔧 Development

### Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check without emit
npm run type-check
```

### Project Structure

```
src/
├── routes/                 # Page components (Svelte)
│   ├── Dashboard.svelte
│   ├── Orders.svelte
│   ├── Instances.svelte
│   ├── Usage.svelte
│   └── Settings.svelte
├── lib/
│   ├── components/         # Reusable UI components
│   │   ├── LoadingSpinner.svelte
│   │   ├── StatCard.svelte
│   │   └── ...
│   ├── api.ts             # API client
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Utility functions
├── App.svelte             # Root component
├── app.css                # Global styles
└── main.ts                # Entry point
```

### Adding New Pages

#### Step 1: Create Page Component

Create `src/routes/NewPage.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { dbAPI } from '$lib/api'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
  import type { Order } from '$lib/types'

  let orders: Order[] = []
  let loading = true
  let error: string | null = null

  onMount(async () => {
    try {
      const response = await dbAPI.getBackofficeOrders()
      orders = response.data
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading = false
    }
  })
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold mb-6">New Page</h1>
  
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

#### Step 2: Add Route

Update `src/App.svelte`:

```typescript
import NewPage from './routes/NewPage.svelte'

const routes = {
  '/': Dashboard,
  '/orders': Orders,
  '/instances': Instances,
  '/usage': Usage,
  '/settings': Settings,
  '/new-page': NewPage,  // Add new route
}
```

#### Step 3: Add Navigation

Update `src/App.svelte` navItems:

```typescript
const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/orders', label: 'Orders', icon: Database },
  { href: '/instances', label: 'Instances', icon: Server },
  { href: '/usage', label: 'Usage & Analytics', icon: BarChart3 },
  { href: '/new-page', label: 'New Page', icon: YourIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
]
```

### Adding API Methods

Extend `src/lib/api.ts`:

```typescript
async getNewData(params?: PaginationParams): Promise<any[]> {
  const { data } = await this.client.get<APIResponse<any[]>>(
    '/new-endpoint',
    { params }
  )
  return Array.isArray(data) ? data : data.data || []
}
```

### Styling with Tailwind CSS

#### Using Tailwind Classes

```svelte
<!-- Buttons -->
<button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Action
</button>

<!-- Cards -->
<div class="bg-white rounded-lg shadow p-6">
  Card content
</div>

<!-- Badges -->
<span class="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
  Success
</span>
```

#### Custom Components

```svelte
<!-- Reusable component in src/lib/components/ -->
<script lang="ts">
  export let title: string
  export let value: number
</script>

<div class="bg-white rounded-lg shadow p-6">
  <p class="text-gray-600">{title}</p>
  <p class="text-3xl font-bold">{value}</p>
</div>
```

## 📊 Charts & Data Visualization

### Using Chart.js

```svelte
<script lang="ts">
  import { Bar } from 'svelte-chartjs'
  import { ChartOptions } from 'chart.js'

  const chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  }

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Orders',
        data: [10, 20, 15],
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

## 🧪 Testing

### Type Checking

```bash
npm run type-check
```

Ensures TypeScript types are correct before building.

### Manual Testing

1. **Verify API Connection**:
   - Navigate to Settings
   - Check "Health Check" status
   - Verify API URL is correct

2. **Test Each Page**:
   - Dashboard: Check statistics load
   - Orders: Test filters and actions
   - Instances: Register test instance
   - Usage: Verify charts render
   - Settings: Test API configuration

## 🐛 Troubleshooting

### API Connection Error

**Issue**: Getting "Failed to fetch API"

**Solutions**:
1. Verify backend is running: `http://localhost:8080`
2. Check API base URL in Settings page
3. Inspect browser console (F12) for detailed errors
4. Ensure CORS headers are configured on backend:
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

# Or kill process using port 3000
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
rm -rf node_modules package-lock.json dist .vite

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

# Review errors in src/
# Fix type issues before building

# Ensure all imports have correct types
```

### Hot Module Replacement (HMR) Not Working

**Issue**: Changes not reflecting without refresh

**Solutions**:
1. Restart development server:
   ```bash
   npm run dev
   ```

2. Clear browser cache:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Close DevTools and reopen
   - Refresh page (Ctrl+Shift+R)

3. Check terminal for errors:
   - Look for error messages in terminal
   - Fix any TypeScript errors

## 📚 Resources & Documentation

### Framework Documentation
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
   - Follow project conventions
   - Write clean, readable code
   - Add comments for complex logic

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push & Create PR**:
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

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Support & Contact

For questions or issues:
- Review the [Troubleshooting](#-troubleshooting) section
- Check API documentation in Settings page
- Contact the development team

---

**Last Updated**: 2026-09-26  
**Version**: 0.0.1
