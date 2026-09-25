# 🗄️ Sidra Backoffice - DB Management System

Professional web-based backoffice for managing database orders, instances, and usage analytics. Built with Svelte + Vite for fast, reactive UI and seamless integration with the DB Management Service API.

## 🎯 Overview

Sidra Backoffice is a comprehensive management interface for database provisioning and administration. It provides real-time monitoring, order management, instance registration, and detailed usage analytics for multiple database types.

### Key Features

- **📊 Dashboard**: Real-time statistics and order monitoring
- **📦 Order Management**: Create, modify, and track database orders
- **🖥️ Instance Management**: Register and monitor database instances
- **📈 Usage Analytics**: Track storage consumption and costs
- **⚙️ System Settings**: Configure API endpoints and JWT tokens

## 🛠️ Technology Stack

- **Frontend Framework**: [Svelte 5](https://svelte.dev)
- **Build Tool**: [Vite](https://vitejs.dev)
- **Routing**: [svelte-spa-router](https://github.com/ItalyPaleAle/svelte-spa-router)
- **HTTP Client**: [Axios](https://axios-http.com)
- **UI Framework**: [Tailwind CSS](https://tailwindcss.com)
- **Icons**: [Lucide Icons](https://lucide.dev)
- **Charts**: [Chart.js](https://www.chartjs.org)
- **Date Handling**: [date-fns](https://date-fns.org)
- **Language**: [TypeScript](https://www.typescriptlang.org)

## 📁 Project Structure

```
sidra-backoffice-svelte/
├── src/
│   ├── routes/                 # Page components (Svelte)
│   │   ├── Dashboard.svelte
│   │   ├── Orders.svelte
│   │   ├── Instances.svelte
│   │   ├── Usage.svelte
│   │   └── Settings.svelte
│   ├── lib/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── LoadingSpinner.svelte
│   │   │   ├── StatCard.svelte
│   │   │   └── ...
│   │   ├── api.ts             # API client (Axios wrapper)
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── utils.ts           # Utility functions
│   ├── App.svelte             # Main app component
│   ├── app.css                # Global styles
│   └── main.ts                # Entry point
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind configuration
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API running at `http://localhost:8080`

### Installation

```bash
# Clone repository
git clone https://github.com/ikhsan17-di/sidra-backoffice-svelte.git
cd sidra-backoffice-svelte

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

## 📖 Features & Pages

### Dashboard (`/`)
- **Statistics Cards**: Display key metrics (total orders, active instances, etc.)
- **Orders by Database Type**: Bar chart visualization of order distribution
- **Orders by Status**: Pie chart showing order status breakdown
- **Recent Instances**: Table showing latest registered instances
- **Real-time Health Monitoring**: Instance status indicators

### Orders (`/orders`)
- **Order Management**: View all database orders
- **Advanced Filtering**: Filter by DB name, type, and status
- **Order Actions**: Suspend, resume, cancel, or resize orders
- **Pagination & Sorting**: Navigate through large datasets
- **Status Indicators**: Visual status badges for quick identification

### Instances (`/instances`)
- **Instance Registration**: Register new database instances
- **Supported Types**: PostgreSQL, MySQL, MariaDB, MongoDB
- **Instance Filtering**: Search and filter by instance name or type
- **Capacity Tracking**: Monitor storage and user limits
- **Health Status**: Real-time instance health indicators

### Usage & Analytics (`/usage`)
- **Instance Disk Usage**: Visualize storage consumption by instance
- **User Disk Usage**: Detailed per-user storage analytics
- **Cost Analysis**: Group-based cost tracking and allocation
- **Usage Tables**: Detailed breakdown of resource consumption
- **Export Ready**: Data structured for reporting

### Settings (`/settings`)
- **API Configuration**: View and modify API base URL
- **JWT Token Management**: Configure authentication tokens
- **Health Check**: Test API connectivity
- **System Operations**:
  - Sync Redis cache
  - Recheck pending orders
- **API Documentation**: Quick reference to available endpoints

## 🔌 API Integration

The backoffice communicates with the DB Management Service API. All API requests are centralized in `src/lib/api.ts`.

### API Base URL Configuration

**Development**:
```bash
npm run dev
# Automatically proxied to http://localhost:8080/api
```

**Production**:
```bash
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

### Core API Methods

```typescript
// Order Management
dbAPI.createOrder(request)
dbAPI.getAllOrders(groupId, params)
dbAPI.getOrderStatus(orderId)
dbAPI.suspendOrder(orderId)
dbAPI.continueOrder(orderId)
dbAPI.resizeOrder(request)

// Instance Management
dbAPI.registerInstance(instance)
dbAPI.getBackofficeInstances(params)

// Usage Monitoring
dbAPI.getInstanceUsage()
dbAPI.getUserUsage()
dbAPI.getUsageByGroup(groupId)

// Dashboard Stats
dbAPI.getBackofficeOrders(params)
dbAPI.getOrdersByDBType()
dbAPI.getOrdersByStatus()
dbAPI.getStats()
```

## 🎨 Styling & Components

### Tailwind CSS Integration

The project uses Tailwind CSS for styling with custom component utilities:

```svelte
<!-- Buttons -->
<button class="btn-primary">Primary Button</button>
<button class="btn-secondary">Secondary Button</button>

<!-- Cards -->
<div class="card p-6">Card content</div>

<!-- Badges -->
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

### Lucide Icons

Lucide icons are used throughout the application:

```svelte
<script>
  import { Database, Settings, BarChart3 } from '@lucide/svelte'
</script>

<Database class="w-6 h-6" />
```

## 📊 Charts & Data Visualization

Charts are implemented using Chart.js via `svelte-chartjs`:

```svelte
<script>
  import { Bar } from 'svelte-chartjs'
  import type { ChartConfiguration } from 'chart.js'
</script>

<Bar data={chartData} options={chartOptions} />
```

## 🔐 Authentication

JWT tokens are used for API authentication:

1. Navigate to **Settings** page
2. Enter your JWT token in the API configuration section
3. Token is stored in `localStorage` (configurable)
4. Automatically included in all API requests via Axios interceptors

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript validation without emit
```

### Adding New Pages

1. Create a new Svelte component in `src/routes/NewPage.svelte`:

```svelte
<script lang="ts">
  import { dbAPI } from '$lib/api'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'

  let data: any = null
  let loading = true
  let error: string | null = null

  onMount(async () => {
    try {
      data = await dbAPI.getBackofficeOrders()
    } catch (err) {
      error = err.message
    } finally {
      loading = false
    }
  })
</script>

<div class="p-8">
  {#if loading}
    <LoadingSpinner />
  {:else if error}
    <div class="text-red-600">Error: {error}</div>
  {:else}
    <!-- Page content -->
  {/if}
</div>
```

2. Add route to `src/App.svelte`:

```typescript
const routes = {
  '/': Dashboard,
  '/new-page': NewPage,
  // ...
}
```

3. Add navigation item:

```typescript
const navItems = [
  { href: '/new-page', label: 'New Page', icon: IconComponent },
  // ...
]
```

### Adding API Methods

Extend `src/lib/api.ts`:

```typescript
async getNewData(): Promise<any> {
  const { data } = await this.client.get('/new-endpoint')
  return data
}
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t sidra-backoffice:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e VITE_API_BASE_URL=http://api:8080/api \
  sidra-backoffice:latest
```

### Docker Compose

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
```

## ☸️ Kubernetes Deployment

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
        ports:
        - containerPort: 3000
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
    protocol: TCP
  selector:
    app: sidra-backoffice
```

## 🧪 Testing

### Type Checking

```bash
npm run type-check
```

Ensure TypeScript types are correct before building.

### Linting (Optional)

To add linting, install ESLint:

```bash
npm install -D eslint svelte-eslint-parser
```

## 🐛 Troubleshooting

### API Connection Error
- Verify backend is running: `http://localhost:8080`
- Check API base URL in Settings page
- Inspect browser console for detailed error messages
- Ensure CORS headers are configured correctly on backend

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Fails
```bash
# Clear dependencies
rm -rf node_modules package-lock.json

# Reinstall and rebuild
npm install
npm run build

# Clear build cache
rm -rf dist
npm run build
```

### HMR Not Working
- Check Vite server is running
- Verify browser console for connection errors
- Clear browser cache
- Restart development server

## 📚 Documentation References

- [Svelte Documentation](https://svelte.dev/docs)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes following project conventions
3. Commit with clear messages: `git commit -m "feat: add new feature"`
4. Push to remote: `git push origin feature/your-feature`
5. Create Pull Request for review

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Support

For questions or issues:
- Check [Troubleshooting](#-troubleshooting) section
- Review API documentation in Settings page
- Contact the development team

---

**Last Updated**: 2026-09-26  
**Version**: 0.0.1
