import { useQuery } from '@tanstack/react-query'
import { dbAPI } from '@/services/api'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import StatCard from '@/components/StatCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dbAPI.getStats(),
  })

  const { data: ordersByType, isLoading: typeLoading } = useQuery({
    queryKey: ['orders-by-type'],
    queryFn: () => dbAPI.getOrdersByDBType(),
  })

  const { data: ordersByStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['orders-by-status'],
    queryFn: () => dbAPI.getOrdersByStatus(),
  })

  const { data: instances, isLoading: instancesLoading } = useQuery({
    queryKey: ['instances-overview'],
    queryFn: () => dbAPI.getBackofficeInstances({ page_size: 5 }),
  })

  const isLoading = statsLoading || typeLoading || statusLoading || instancesLoading

  if (isLoading) return <LoadingSpinner />

  const statusColors: Record<string, string> = {
    completed: '#10b981',
    pending: '#f59e0b',
    failed: '#ef4444',
    suspended: '#6b7280',
  }

  const dbTypeColors: Record<string, string> = {
    postgresql: '#336791',
    mysql: '#00758f',
    mariadb: '#003545',
    mongodb: '#13aa52',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to DB Management Backoffice</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Orders Today"
          value={stats?.today || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          trend="↑ 12%"
        />
        <StatCard
          title="Total Instances"
          value={instances?.total || 0}
          icon={<AlertCircle className="w-6 h-6" />}
        />
        <StatCard
          title="Active Orders"
          value={(ordersByStatus?.find((s) => s.status === 'completed')?.count || 0)}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title="Failed Orders"
          value={(ordersByStatus?.find((s) => s.status === 'failed')?.count || 0)}
          icon={<XCircle className="w-6 h-6" />}
          variant="danger"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Database Type */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Database Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersByType || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="db_type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {ordersByStatus?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#cccccc'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Instances */}
      <div className="mt-6 card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Instances</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="pb-3 font-semibold">Instance Name</th>
                <th className="pb-3 font-semibold">DB Type</th>
                <th className="pb-3 font-semibold">Host</th>
                <th className="pb-3 font-semibold">Storage</th>
              </tr>
            </thead>
            <tbody>
              {instances?.data?.slice(0, 5).map((instance) => (
                <tr key={instance.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">{instance.instance_name}</td>
                  <td className="py-3">
                    <span className="badge badge-info">{instance.db_type}</span>
                  </td>
                  <td className="py-3 text-gray-600">{instance.host}</td>
                  <td className="py-3">{instance.total_storage} GB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
