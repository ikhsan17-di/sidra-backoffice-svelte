import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type {
  Order,
  Instance,
  OrderRequest,
  ResizeRequest,
  GroupUsage,
  InstanceUsage,
  PaginationParams,
  APIResponse,
} from './types'

class DBManagementAPI {
  private client: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || '/api') {
    this.baseURL = baseURL
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // Health Check
  async healthCheck(): Promise<string> {
    const { data } = await this.client.get('/')
    return data
  }

  // Order Management
  async getAvailableClasses() {
    const { data } = await this.client.get<APIResponse<Record<string, any>>>('/classes')
    return data
  }

  async createOrder(request: OrderRequest): Promise<{ order_id: string; message: string }> {
    const { data } = await this.client.post<{ order_id: string; message: string }>(
      '/db/order',
      request
    )
    return data
  }

  async getAllOrders(
    groupId: string,
    params?: PaginationParams
  ): Promise<{ data: Order[]; total?: number; page?: number; page_size?: number }> {
    const { data } = await this.client.get<APIResponse<Order[]>>('/db/orders', {
      params: {
        group_id: groupId,
        ...params,
      },
    })
    return {
      data: Array.isArray(data) ? data : data.data || [],
      total: data.total,
      page: data.page,
      page_size: data.page_size,
    }
  }

  async getOrderStatus(orderId: string): Promise<Order> {
    const { data } = await this.client.get<Order>(`/db/status/${orderId}`)
    return data
  }

  async cancelOrder(orderId: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>(`/db/cancel/${orderId}`)
    return data
  }

  async suspendOrder(orderId: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>(`/db/suspend/${orderId}`)
    return data
  }

  async continueOrder(orderId: string): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>(`/db/continue/${orderId}`)
    return data
  }

  async resizeOrder(request: ResizeRequest): Promise<{ order_id: string; message: string }> {
    const { data } = await this.client.post<{ order_id: string; message: string }>(
      '/db/resize',
      request
    )
    return data
  }

  async getExtensions(dbType?: string): Promise<any[]> {
    const { data } = await this.client.get('/db/extensions', {
      params: dbType ? { db_type: dbType } : {},
    })
    return Array.isArray(data) ? data : data.data || []
  }

  async syncRedis(): Promise<{ message: string }> {
    const { data } = await this.client.get<{ message: string }>('/db/sync-redis')
    return data
  }

  // Instance Management
  async registerInstance(instance: Instance): Promise<{ token: string; message: string }> {
    const { data } = await this.client.post<{ token: string; message: string }>(
      '/instance/register',
      instance
    )
    return data
  }

  async recheckOrders(): Promise<{ message: string }> {
    const { data } = await this.client.post<{ message: string }>('/instance/recheck-orders')
    return data
  }

  // Usage & Monitoring
  async getInstanceUsage(): Promise<InstanceUsage[]> {
    const { data } = await this.client.get<APIResponse<InstanceUsage[]>>('/usage/instance')
    return Array.isArray(data) ? data : data.data || []
  }

  async getUserUsage(): Promise<any[]> {
    const { data } = await this.client.get<APIResponse<any[]>>('/usage/user')
    return Array.isArray(data) ? data : data.data || []
  }

  async getUsageByDBName(dbName: string): Promise<any> {
    const { data } = await this.client.get(`/db/usage-by-db-name/${dbName}`)
    return data
  }

  async getUsageByGroup(groupId: string): Promise<GroupUsage> {
    const { data } = await this.client.get<GroupUsage>(`/db/usage-by-group/${groupId}`)
    return data
  }

  // Backoffice
  async getBackofficeOrders(
    params?: PaginationParams & {
      group_id?: string
      db_type?: string
      status?: string
      db_name?: string
      assigned_host?: string
    }
  ): Promise<{ data: Order[]; total: number; page: number; page_size: number }> {
    const { data } = await this.client.get<APIResponse<Order[]>>('/backoffice/orders', {
      params,
    })
    return {
      data: Array.isArray(data) ? data : data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      page_size: data.page_size || 10,
    }
  }

  async getBackofficeInstances(
    params?: PaginationParams & { db_type?: string; instance_name?: string }
  ): Promise<{ data: Instance[]; total: number; page: number; page_size: number }> {
    const { data } = await this.client.get<APIResponse<Instance[]>>('/backoffice/instances', {
      params,
    })
    return {
      data: Array.isArray(data) ? data : data.data || [],
      total: data.total || 0,
      page: data.page || 1,
      page_size: data.page_size || 10,
    }
  }

  async getOrdersByDBType(): Promise<any[]> {
    const { data } = await this.client.get('/backoffice/orders/group-by-db-type')
    return Array.isArray(data) ? data : data.data || []
  }

  async getOrdersByStatus(): Promise<any[]> {
    const { data } = await this.client.get('/backoffice/orders/group-by-status')
    return Array.isArray(data) ? data : data.data || []
  }

  async getStats(): Promise<{ today: number }> {
    const { data } = await this.client.get<APIResponse<{ today: number }>>('/backoffice/stats')
    return data.data || { today: 0 }
  }
}

export const dbAPI = new DBManagementAPI()
export default DBManagementAPI
