export function getStatusBadge(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'badge-success',
    pending: 'badge-info',
    failed: 'badge-error',
    suspended: 'badge-warning',
    completed: 'badge-success',
  }
  return statusMap[status] || 'badge-info'
}

export function getDBTypeColor(dbType: string): string {
  const colorMap: Record<string, string> = {
    postgresql: 'text-blue-600',
    mysql: 'text-orange-600',
    mariadb: 'text-red-600',
    mongodb: 'text-green-600',
  }
  return colorMap[dbType] || 'text-gray-600'
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
  }
  return colorMap[status] || 'bg-blue-100 text-blue-800'
}
