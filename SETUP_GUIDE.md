# Sidra Backoffice - Setup Guide

## 📋 Quick Setup (5 minutes)

### 1. Clone Repository
```bash
git clone git@github.com:ikhsan17-di/sidra-backoffice.git
cd sidra-backoffice
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

> **Note**: The backend API should be running at `http://localhost:8080`

## 🎯 What's Included

### Dashboard Pages

#### 1. **Dashboard** (`/`)
- Overview statistics cards
- Orders by database type (bar chart)
- Orders by status (pie chart)
- Recent instances table
- Real-time health monitoring

#### 2. **Orders** (`/orders`)
- Manage database orders
- Filter by: DB name, type, status
- Actions: suspend, resume, delete
- Pagination & sorting
- Status indicators

#### 3. **Instances** (`/instances`)
- Register new database instances
- Support for: PostgreSQL, MySQL, MariaDB, MongoDB
- Filter and search instances
- View instance details
- Track storage and max users

#### 4. **Usage & Analytics** (`/usage`)
- Instance disk usage charts
- User disk usage analytics
- Detailed usage tables
- Group-based cost analysis
- Storage allocation tracking

#### 5. **Settings** (`/settings`)
- API configuration
- JWT token management
- Health check endpoint
- System operations:
  - Sync Redis cache
  - Recheck pending orders
- API documentation

## 🔌 API Integration

The backoffice automatically connects to the DB Management Service API.

### Proxying
- **Development**: Requests to `/api` are proxied to `http://localhost:8080/api`
- **Production**: Configure via `VITE_API_BASE_URL` environment variable

### Example:
```bash
# Development (automatic proxy)
curl http://localhost:3000/api/v1/backoffice/orders

# Production
VITE_API_BASE_URL=https://api.example.com/api npm run build
```

## 🚀 Production Deployment

### Build
```bash
npm run build
```

Output: `dist/` folder ready for deployment

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

### Docker Build & Run
```bash
docker build -t sidra-backoffice .
docker run -p 3000:3000 -e VITE_API_BASE_URL=http://api:8080/api sidra-backoffice
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sidra-backoffice
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
---
apiVersion: v1
kind: Service
metadata:
  name: sidra-backoffice
spec:
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: sidra-backoffice
```

## 🔧 Development

### Scripts
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run type-check   # TypeScript check
```

### Project Structure
```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── services/       # API client
├── types/          # TypeScript definitions
├── App.tsx         # Main app
└── main.tsx        # Entry point
```

### Adding New Pages

1. Create page in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in sidebar

Example:
```tsx
// src/pages/NewPage.tsx
import { useQuery } from '@tanstack/react-query'
import { dbAPI } from '@/services/api'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function NewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['new-data'],
    queryFn: () => dbAPI.someEndpoint(),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-8">
      {/* Content here */}
    </div>
  )
}
```

### Adding API Methods

Add methods to `src/services/api.ts`:

```tsx
async getNewData(): Promise<any> {
  const { data } = await this.client.get('/new-endpoint')
  return data
}
```

## 🎨 Styling

Uses **Tailwind CSS** with custom components:

```tsx
// Button
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Card
<div className="card p-6">Content</div>

// Badges
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
```

## 📊 Charts & Visualization

Using **Recharts**:

```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>
```

## 🔐 Authentication

JWT token can be configured in Settings page:
1. Go to Settings
2. Paste JWT token in the input field
3. Save settings

Token is stored in `localStorage` and used for authenticated endpoints.

## 🐛 Troubleshooting

### API Connection Error
1. Check if backend is running: `http://localhost:8080`
2. Verify API base URL in Settings
3. Check browser console for errors

### Port Already in Use
```bash
# Change port in vite.config.ts or:
npm run dev -- --port 3001
```

### Build Fails
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist

# Rebuild
npm run build
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vite Docs](https://vitejs.dev)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit
3. Push to GitHub: `git push origin feature/name`
4. Create Pull Request

## 📝 License

Proprietary - All rights reserved

## 👨‍💻 Support

For questions or issues, contact the development team.
