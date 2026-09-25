import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dbAPI } from '@/services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Usage() {
  const [selectedGroup, setSelectedGroup] = useState('')

  const { data: instanceUsage, isLoading: instanceLoading } = useQuery({
    queryKey: ['instance-usage'],
    queryFn: () => dbAPI.getInstanceUsage(),
  })

  const { data: userUsage, isLoading: userLoading } = useQuery({
    queryKey: ['user-usage'],
    queryFn: () => dbAPI.getUserUsage(),
  })

  const { data: groupUsage, isLoading: groupLoading } = useQuery({
    queryKey: ['group-usage', selectedGroup],
    queryFn: () => (selectedGroup ? dbAPI.getUsageByGroup(selectedGroup) : Promise.resolve(null)),
    enabled: !!selectedGroup,
  })

  const isLoading = instanceLoading || userLoading || groupLoading

  if (isLoading && !selectedGroup) return <LoadingSpinner />

  const instanceChartData = instanceUsage?.map((item: any) => ({
    name: item.name,
    usage: parseFloat(item.usage_gb),
  })) || []

  const userChartData = userUsage?.map((item: any) => ({
    name: item.username,
    usage: parseFloat(item.usage_gb),
  })) || []

  const dbColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Usage & Analytics</h1>
        <p className="text-gray-600 mt-2">Monitor disk usage across instances and users</p>
      </div>

      {/* Instance Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Instance Disk Usage</h2>
          {instanceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={instanceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} GB`} />
                <Bar dataKey="usage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Disk Usage</h2>
          {userChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(4)} GB`} />
                <Bar dataKey="usage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Instance Usage Table */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Instance Usage Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="pb-3 font-semibold">Instance Name</th>
                <th className="pb-3 font-semibold">Usage (GB)</th>
                <th className="pb-3 font-semibold">Usage (Human Readable)</th>
              </tr>
            </thead>
            <tbody>
              {instanceUsage?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3">{parseFloat(item.usage_gb).toFixed(4)} GB</td>
                  <td className="py-3 text-gray-600">{item.usage_mb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Usage Table */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Usage Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-gray-600">
                <th className="pb-3 font-semibold">Username</th>
                <th className="pb-3 font-semibold">Usage (GB)</th>
                <th className="pb-3 font-semibold">Usage (Human Readable)</th>
              </tr>
            </thead>
            <tbody>
              {userUsage?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium">{item.username}</td>
                  <td className="py-3">{parseFloat(item.usage_gb).toFixed(4)} GB</td>
                  <td className="py-3 text-gray-600">{item.usage_mb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Usage */}
      {groupUsage && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Group Usage: {groupUsage.group_id}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{groupUsage.total_order}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Used (GB)</p>
              <p className="text-2xl font-bold text-green-600">
                {parseFloat(groupUsage.total_used_gb).toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Ordered (GB)</p>
              <p className="text-2xl font-bold text-orange-600">{groupUsage.storage_ordered_gb}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-purple-600">${groupUsage.total_cost}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-gray-600">
                  <th className="pb-3 font-semibold">Database Name</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Used (GB)</th>
                  <th className="pb-3 font-semibold">Ordered (GB)</th>
                  <th className="pb-3 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {groupUsage.databases?.map((db: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium">{db.db_name}</td>
                    <td className="py-3">{db.db_type}</td>
                    <td className="py-3">{parseFloat(db.storage_used_gb).toFixed(2)} GB</td>
                    <td className="py-3">{db.storage_ordered_gb} GB</td>
                    <td className="py-3 font-medium">${db.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
