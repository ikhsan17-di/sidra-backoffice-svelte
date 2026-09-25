<script lang="ts">
  import { onMount } from 'svelte'
  import StatCard from '../lib/components/StatCard.svelte'
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte'
  import { dbAPI } from '../lib/api'
  import { BarChart3, AlertCircle, CheckCircle, Clock, XCircle } from '@lucide/svelte'

  let loading = $state(true)
  let stats = $state<any>(null)
  let ordersByType = $state<any[]>([])
  let ordersByStatus = $state<any[]>([])
  let instances = $state<any[]>([])

  onMount(async () => {
    try {
      loading = true
      const [statsRes, typeRes, statusRes, instanceRes] = await Promise.all([
        dbAPI.getStats(),
        dbAPI.getOrdersByDBType(),
        dbAPI.getOrdersByStatus(),
        dbAPI.getBackofficeInstances({ page_size: 5 }),
      ])

      stats = statsRes
      ordersByType = Array.isArray(typeRes) ? typeRes : typeRes.data || []
      ordersByStatus = Array.isArray(statusRes) ? statusRes : statusRes.data || []
      instances = instanceRes.data || []
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      loading = false
    }
  })

  const statusColors: Record<string, string> = {
    active: '#10b981',
    pending: '#3b82f6',
    failed: '#ef4444',
    suspended: '#f59e0b',
    completed: '#10b981',
  }

  function getStatusColor(status: string): string {
    return statusColors[status] || '#6b7280'
  }

  const activeCount = ordersByStatus.find((s) => s.status === 'active')?.count || 0
  const failedCount = ordersByStatus.find((s) => s.status === 'failed')?.count || 0
</script>

<div class="p-6">
  {#if loading}
    <LoadingSpinner />
  {:else}
    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Today Orders"
        value={stats?.today || 0}
        icon={BarChart3}
        variant="default"
      />
      <StatCard
        title="Active Orders"
        value={activeCount}
        icon={CheckCircle}
        variant="success"
      />
      <StatCard
        title="Pending Orders"
        value={ordersByStatus.find((s) => s.status === 'pending')?.count || 0}
        icon={Clock}
        variant="warning"
      />
      <StatCard
        title="Failed Orders"
        value={failedCount}
        icon={AlertCircle}
        variant="danger"
      />
    </div>

    <!-- Charts Placeholder -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Orders by Type</h2>
        <div class="h-80 flex items-center justify-center text-gray-500">
          <p>Chart will be implemented in Analytics package</p>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
        <div class="h-80 flex items-center justify-center text-gray-500">
          <p>Chart will be implemented in Analytics package</p>
        </div>
      </div>
    </div>

    <!-- Recent Instances -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Instances</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-gray-200">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Instance Name</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Type</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Host</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Port</th>
            </tr>
          </thead>
          <tbody>
            {#each instances.slice(0, 5) as instance}
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4 text-gray-900">{instance.instance_name}</td>
                <td class="py-3 px-4 text-gray-700">{instance.db_type}</td>
                <td class="py-3 px-4 text-gray-700">{instance.host}</td>
                <td class="py-3 px-4 text-gray-700">{instance.port}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
