# Sidra Backoffice - DB Management System

Modern web-based backoffice dashboard for managing database instances and orders across multiple database types (PostgreSQL, MySQL, MariaDB, MongoDB).

## Features

- 📊 **Dashboard**: Real-time overview with statistics and analytics
- 🗄️ **Orders Management**: Create, view, suspend, and delete database orders
- 🖥️ **Instances Management**: Register and manage database instances
- 📈 **Usage Analytics**: Monitor disk usage per instance, user, and group
- ⚙️ **System Operations**: Sync Redis cache and recheck pending orders
- 🎨 **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- 🔄 **Real-time Data**: Powered by React Query for efficient data fetching

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: Axios + React Query
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: Zustand

## Prerequisites

- Node.js 16+ (or 18 LTS recommended)
- npm or yarn
- Running DB Management Service API (http://localhost:8080)

## Getting Started

### Installation

```bash
# Clone the repository
git clone git@github.com:ikhsan17-di/sidra-backoffice.git
cd sidra-backoffice

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
# API requests are proxied to http://localhost:8080/api
```

### Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview

# Type checking
npm run type-check
```

## Project Structure

```
sidra-backoffice/
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── Orders.tsx          # Orders management
│   │   ├── Instances.tsx       # Instances management
│   │   ├── Usage.tsx           # Usage analytics
│   │   └── Settings.tsx        # Settings & operations
│   ├── services/             # API services
│   │   └── api.ts            # DB Management API client
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── package.json              # Project dependencies
```

## Pages Overview

### Dashboard
- Display overall statistics
- Orders grouped by database type and status
- Recent instances overview
- Visual charts and analytics

### Orders
- List all database orders with filtering
- Filter by database name, type, and status
- Search functionality with pagination
- Actions: suspend, resume, and delete orders
- Real-time status updates

### Instances
- List all registered database instances
- Register new database instances
- Filter by type and name
- View instance details (host, port, storage, max users)
- Extension status indicator

### Usage & Analytics
- Instance disk usage visualization
- User disk usage tracking
- Detailed usage tables
- Group-based usage analysis with cost breakdown
- Storage allocation vs actual usage

### Settings
- API configuration
- JWT token management
- System operations:
  - Sync Redis cache
  - Recheck pending orders
- Health check endpoint
- API documentation

## API Integration

The backoffice connects to the DB Management Service API with the following endpoints:

### Orders
- `GET /db/orders` - List orders
- `GET /db/status/{id}` - Get order status
- `POST /db/order` - Create order
- `POST /db/cancel/{id}` - Cancel order
- `POST /db/suspend/{id}` - Suspend order
- `POST /db/continue/{id}` - Resume order
- `POST /db/resize` - Resize order

### Instances
- `GET /backoffice/instances` - List instances
- `POST /instance/register` - Register instance
- `POST /instance/recheck-orders` - Recheck orders

### Usage
- `GET /usage/instance` - Instance usage
- `GET /usage/user` - User usage
- `GET /db/usage-by-group/{groupId}` - Group usage

### System
- `GET /` - Health check
- `GET /db/sync-redis` - Sync Redis
- `GET /backoffice/stats` - Daily stats
- `GET /backoffice/orders/group-by-db-type` - Orders by type
- `GET /backoffice/orders/group-by-status` - Orders by status

## Environment Configuration

### Development
The app is configured to proxy API requests to `http://localhost:8080/api` (see `vite.config.ts`).

### Production
Set the API base URL in Settings page or via environment variable:
```bash
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

## Features Details

### Orders Management
- **Create Orders**: Register new database instances with custom resources
- **Monitor Status**: Real-time status tracking
- **Control Lifecycle**: Suspend, resume, or delete orders
- **Resize Storage**: Increase storage allocation on-demand
- **Filter & Search**: Advanced filtering by multiple criteria

### Instance Management
- **Register Instances**: Add new database instances
- **Multi-type Support**: PostgreSQL, MySQL, MariaDB, MongoDB
- **Capacity Planning**: Track total storage and max users
- **Extension Support**: Enable/disable extensions per instance

### Analytics & Monitoring
- **Usage Tracking**: Monitor disk usage per instance and user
- **Cost Analysis**: Track costs per group and database
- **Storage Allocation**: Compare ordered vs actual usage
- **Trends**: Historical data visualization

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Lazy loading of routes
- React Query caching strategy
- Optimistic updates
- Request deduplication
- Pagination support

## Contributing

1. Create a feature branch (`git checkout -b feature/feature-name`)
2. Commit changes (`git commit -am 'Add feature'`)
3. Push to branch (`git push origin feature/feature-name`)
4. Create a Pull Request

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, contact the development team.

## Related Services

- **DB Management Service**: https://github.com/ikhsan17-di/db-management-service
- **API Documentation**: See `openapi.yaml` in DB Management Service repo
- **Postman Collection**: Available in DB Management Service repo

## Deployment

### Docker
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
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
      - VITE_API_BASE_URL=http://api:8080/api
    depends_on:
      - api
  api:
    image: db-management-service:latest
    ports:
      - "8080:8080"
```

## Getting Help

- Check the Settings page for API documentation
- Review the Postman collection from DB Management Service
- Check browser console for detailed error messages
- Verify API connectivity via Health Check in Settings
