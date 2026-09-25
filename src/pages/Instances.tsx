import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbAPI } from '@/services/api'
import { Plus, Search, Server } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Instance } from '@/types'

export default function Instances() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: instances, isLoading } = useQuery({
    queryKey: ['instances', page, pageSize, search, filterType],
    queryFn: () =>
      dbAPI.getBackofficeInstances({
        page,
        page_size: pageSize,
        instance_name: search || undefined,
        db_type: filterType || undefined,
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: Instance) => dbAPI.registerInstance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] })
      setShowForm(false)
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const instance: Instance = {
      instance_name: formData.get('instance_name') as string,
      db_type: formData.get('db_type') as any,
      host: formData.get('host') as string,
      port: parseInt(formData.get('port') as string),
      root_username: formData.get('root_username') as string,
      root_password: formData.get('root_password') as string,
      total_storage: parseInt(formData.get('total_storage') as string),
      max_users: parseInt(formData.get('max_users') as string),
      extension: (formData.get('extension') as any) === 'on',
    }
    createMutation.mutate(instance)
  }

  const getDBTypeColor = (dbType: string) => {
    const colors: Record<string, string> = {
      postgresql: 'bg-blue-100 text-blue-800',
      mysql: 'bg-orange-100 text-orange-800',
      mariadb: 'bg-red-100 text-red-800',
      mongodb: 'bg-green-100 text-green-800',
    }
    return colors[dbType] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Instances</h1>
          <p className="text-gray-600 mt-2">Manage database instances</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Instance
        </button>
      </div>

      {/* Register Instance Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Register New Instance</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="instance_name"
              placeholder="Instance Name"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <select
              name="db_type"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select DB Type</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="mariadb">MariaDB</option>
              <option value="mongodb">MongoDB</option>
            </select>
            <input
              type="text"
              name="host"
              placeholder="Host"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              name="port"
              placeholder="Port"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              name="root_username"
              placeholder="Root Username"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              name="root_password"
              placeholder="Root Password"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              name="total_storage"
              placeholder="Total Storage (GB)"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="number"
              name="max_users"
              placeholder="Max Users"
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="extension"
                id="extension"
                className="w-4 h-4"
              />
              <label htmlFor="extension" className="text-gray-700">
                Enable Extensions
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Instance</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">DB Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="mariadb">MariaDB</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value))
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-600 font-semibold">
              <th className="px-6 py-4">Instance Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Host:Port</th>
              <th className="px-6 py-4">Storage</th>
              <th className="px-6 py-4">Max Users</th>
              <th className="px-6 py-4">Extensions</th>
            </tr>
          </thead>
          <tbody>
            {instances?.data?.map((instance: Instance) => (
              <tr key={instance.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-400" />
                  {instance.instance_name}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getDBTypeColor(instance.db_type)}`}>
                    {instance.db_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {instance.host}:{instance.port}
                </td>
                <td className="px-6 py-4">{instance.total_storage} GB</td>
                <td className="px-6 py-4">{instance.max_users}</td>
                <td className="px-6 py-4">
                  {instance.extension ? (
                    <span className="badge badge-success">Enabled</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-800">Disabled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {page} of {Math.ceil((instances?.total || 0) / pageSize)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!instances || page * pageSize >= instances.total}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
