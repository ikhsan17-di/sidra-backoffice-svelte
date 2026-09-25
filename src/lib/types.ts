export interface Order {
  id: string
  username: string
  instance_id: number
  db_type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb'
  storage_size: number
  db_name: string
  status: string
  assigned_host: string
  assigned_port: number
  assigned_db_user: string
  assigned_db_pass: string
  error_message: string
  extension: boolean
  group_id: string
  extensions: string[]
  created_at: string
  updated_at: string
  class?: string
}

export interface Instance {
  id?: number
  instance_name: string
  db_type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb'
  host: string
  port: number
  root_username: string
  root_password: string
  total_storage: number
  max_users: number
  extension?: boolean
  is_active?: boolean
  skip_health_check?: boolean
  created_at?: string
  updated_at?: string
}

export interface OrderRequest {
  username: string
  type?: 'shared' | 'dedicated'
  db_type: 'postgresql' | 'mysql' | 'mariadb' | 'mongodb'
  storage_size: number
  db_name: string
  group_id: string
  extension?: boolean
  extensions?: string[]
  cpu_cores?: number
  memory_mb?: number
  disk_mb?: number
  version?: string
  class?: string
}

export interface ResizeRequest {
  order_id: string
  increase_storage_size: number
}

export interface UsageByDB {
  db_name: string
  db_type: string
  status: string
  storage_used_gb: number
  storage_used_mb: string
  storage_ordered_gb: number
  cost: number
}

export interface GroupUsage {
  group_id: string
  total_order: number
  total_used_gb: number
  total_used_mb: string
  storage_ordered_gb: number
  databases: UsageByDB[]
  total_cost: number
}

export interface InstanceUsage {
  name: string
  usage_gb: number
  usage_mb: string
}

export interface APIResponse<T> {
  data?: T
  message?: string
  error?: string
  total?: number
  page?: number
  page_size?: number
}

export interface PaginationParams {
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
