import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { dbAPI } from '@/services/api'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('apiUrl') || import.meta.env.VITE_API_BASE_URL || '/api'
  )
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken') || '')
  const [message, setMessage] = useState('')

  const { data: health, refetch: refetchHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['health-check'],
    queryFn: () => dbAPI.healthCheck(),
    enabled: false,
  })

  const syncRedisMutation = useMutation({
    mutationFn: () => dbAPI.syncRedis(),
    onSuccess: () => {
      setMessage('Redis synced successfully!')
      setTimeout(() => setMessage(''), 3000)
    },
    onError: (error) => {
      setMessage(`Error syncing Redis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  const recheckOrdersMutation = useMutation({
    mutationFn: () => dbAPI.recheckOrders(),
    onSuccess: () => {
      setMessage('Orders recheck triggered successfully!')
      setTimeout(() => setMessage(''), 3000)
    },
    onError: (error) => {
      setMessage(`Error rechecking orders: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  const handleSaveSettings = () => {
    localStorage.setItem('apiUrl', apiUrl)
    localStorage.setItem('jwtToken', jwtToken)
    setMessage('Settings saved successfully!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleHealthCheck = () => {
    refetchHealth()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure the backoffice application</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`card p-4 mb-6 flex items-center gap-3 ${message.includes('Error') ? 'bg-red-50' : 'bg-green-50'}`}>
          {message.includes('Error') ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          <p className={message.includes('Error') ? 'text-red-800' : 'text-green-800'}>{message}</p>
        </div>
      )}

      {/* API Configuration */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="http://localhost:8080/api"
            />
            <p className="text-xs text-gray-500 mt-2">Default: /api (proxied to localhost:8080)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token (Optional)</label>
            <input
              type="password"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Your JWT token for authenticated endpoints"
            />
            <p className="text-xs text-gray-500 mt-2">
              Required for data plane endpoints (/data/*)
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSaveSettings} className="btn-primary">
              Save Settings
            </button>
            <button onClick={handleHealthCheck} disabled={healthLoading} className="btn-secondary flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
              {healthLoading ? 'Checking...' : 'Health Check'}
            </button>
          </div>

          {health && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">✓ Service is healthy: {health}</p>
            </div>
          )}
        </div>
      </div>

      {/* System Operations */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Operations</h2>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-medium text-gray-900 mb-2">Sync Orders to Redis</h3>
            <p className="text-sm text-gray-600 mb-4">
              Synchronize all orders from the database to Redis cache. This is useful for
              improving performance and ensuring the cache is up-to-date.
            </p>
            <button
              onClick={() => syncRedisMutation.mutate()}
              disabled={syncRedisMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncRedisMutation.isPending ? 'animate-spin' : ''}`} />
              {syncRedisMutation.isPending ? 'Syncing...' : 'Sync Redis'}
            </button>
          </div>

          <div className="pb-4">
            <h3 className="font-medium text-gray-900 mb-2">Recheck Pending Orders</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manually trigger a recheck of all pending orders. This will verify the status
              of orders that are waiting to be processed.
            </p>
            <button
              onClick={() => recheckOrdersMutation.mutate()}
              disabled={recheckOrdersMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${recheckOrdersMutation.isPending ? 'animate-spin' : ''}`} />
              {recheckOrdersMutation.isPending ? 'Rechecking...' : 'Recheck Orders'}
            </button>
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h2>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Available Endpoints</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>GET /api/v1/</strong> - Health check
              </li>
              <li>
                <strong>GET /api/v1/backoffice/orders</strong> - List all orders
              </li>
              <li>
                <strong>GET /api/v1/backoffice/instances</strong> - List all instances
              </li>
              <li>
                <strong>POST /api/v1/db/order</strong> - Create new order
              </li>
              <li>
                <strong>GET /api/v1/usage/instance</strong> - Get instance usage
              </li>
              <li>
                <strong>GET /api/v1/usage/user</strong> - Get user usage
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs">
              For complete API documentation, see the OpenAPI spec at{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">openapi.yaml</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
