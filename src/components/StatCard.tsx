interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: string
  variant?: 'default' | 'danger' | 'success' | 'warning'
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const bgColors = {
    default: 'bg-blue-50',
    danger: 'bg-red-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
  }

  const iconColors = {
    default: 'text-blue-600',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-green-600 text-sm mt-2">{trend}</p>}
        </div>
        <div className={`${bgColors[variant]} p-3 rounded-lg`}>
          <div className={iconColors[variant]}>{icon}</div>
        </div>
      </div>
    </div>
  )
}
