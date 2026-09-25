import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dbAPI } from '@/services/api'
import { Trash2, Pause, Play, Edit2, Plus, Search } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Order } from '@/types'

export default function Orders() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', page, pageSize, search, filterStatus, filterType],
    queryFn: () =>
      dbAPI.getBackofficeOrders({
        page,
        page_size: pageSize,
        status: filterStatus || undefined,
        db_type: filterType || undefined,
        db_name: search || undefined,
      }),
  })

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => dbAPI.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const suspendMutation = useMutation({
    mutationFn: (orderId: string) => dbAPI.suspendOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const continueMutation = useMutation({
    mutationFn: (orderId: string) => dbAPI.continueOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-error',
      suspended: 'badge-info',
    }
    return colors[status] || 'badge-info'
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
          <h1 className="text-3xl font-bold text-gray-900">Database Orders</h1>
          <p className="text-gray-600 mt-2">Manage all database orders</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Order
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search DB Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="suspended">Suspended</option>
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
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-600 font-semibold">
              <th className="px-6 py-4">Database Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Storage</th>
              <th className="px-6 py-4">Host</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.data?.map((order: Order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{order.db_name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getDBTypeColor(order.db_type)}`}>
                    {order.db_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
                </td>
                <td className="px-6 py-4">{order.storage_size} GB</td>
                <td className="px-6 py-4 text-gray-600">{order.assigned_host}:{order.assigned_port}</td>
                <td className="px-6 py-4 text-gray-600">{order.assigned_db_user}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {order.status === 'suspended' ? (
                      <button
                        onClick={() => continueMutation.mutate(order.id)}
                        disabled={continueMutation.isPending}
                        className="p-2 hover:bg-green-100 rounded-lg transition"
                        title="Continue"
                      >
                        <Play className="w-4 h-4 text-green-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => suspendMutation.mutate(order.id)}
                        disabled={suspendMutation.isPending}
                        className="p-2 hover:bg-yellow-100 rounded-lg transition"
                        title="Suspend"
                      >
                        <Pause className="w-4 h-4 text-yellow-600" />
                      </button>
                    )}
                    <button
                      onClick={() => cancelMutation.mutate(order.id)}
                      disabled={cancelMutation.isPending || order.status === 'completed'}
                      className="p-2 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {page} of {Math.ceil((orders?.total || 0) / pageSize)}
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
            disabled={!orders || page * pageSize >= orders.total}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
