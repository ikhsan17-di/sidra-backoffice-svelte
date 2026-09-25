import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Database, Settings, BarChart3, Servers } from 'lucide-react'

// Pages
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Instances from './pages/Instances'
import Usage from './pages/Usage'
import Settings from './pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
    },
  },
})

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">DB Backoffice</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        <ul className="p-4 space-y-2">
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              <Database className="w-5 h-5" />
              Orders
            </Link>
          </li>
          <li>
            <Link
              to="/instances"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              <Servers className="w-5 h-5" />
              Instances
            </Link>
          </li>
          <li>
            <Link
              to="/usage"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              <BarChart3 className="w-5 h-5" />
              Usage & Analytics
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/orders"
            element={
              <Layout>
                <Orders />
              </Layout>
            }
          />
          <Route
            path="/instances"
            element={
              <Layout>
                <Instances />
              </Layout>
            }
          />
          <Route
            path="/usage"
            element={
              <Layout>
                <Usage />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}
