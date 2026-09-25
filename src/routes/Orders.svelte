<script lang="ts">
  import { onMount } from 'svelte'
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte'
  import { dbAPI } from '../lib/api'
  import { Search, Play, Pause, Trash2, Plus } from '@lucide/svelte'
  import { getStatusBadge, getDBTypeColor } from '../lib/utils'

  let loading = $state(false)
  let orders = $state<any[]>([])
  let total = $state(0)
  let page = $state(1)
  let pageSize = $state(10)
  let search = $state('')
  let filterStatus = $state('')
  let filterType = $state('')

  async function loadOrders() {
    loading = true
    try {
      const res = await dbAPI.getBackofficeOrders({
        page,
        page_size: pageSize,
        db_name: search || undefined,
        status: filterStatus || undefined,
        db_type: filterType || undefined,
      })
      orders = res.data
      total = res.total
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      loading = false
    }
  }

  async function handleCancel(orderId: string) {
    try {
      await dbAPI.cancelOrder(orderId)
      await loadOrders()
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  async function handleSuspend(orderId: string) {
    try {
      await dbAPI.suspendOrder(orderId)
      await loadOrders()
    } catch (error) {
      console.error('Failed to suspend order:', error)
    }
  }

  async function handleContinue(orderId: string) {
    try {
      await dbAPI.continueOrder(orderId)
      await loadOrders()
    } catch (error) {
      console.error('Failed to continue order:', error)
    }
  }

  onMount(() => loadOrders())

  $effect(() => {
    page
    pageSize
    search
    filterStatus
    filterType
    loadOrders()
  })

  const totalPages = Math.ceil(total / pageSize)
</script>

<div class="p-6">
  {#if loading}
    <LoadingSpinner />
  {:else}
    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="relative">
          <Search class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            bind:value={search}
            type="text"
            placeholder="Search orders..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select bind:value={filterStatus} class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <select bind:value={filterType} class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="mariadb">MariaDB</option>
          <option value="mongodb">MongoDB</option>
        </select>
        <select bind:value={pageSize} class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
        <button class="btn-primary flex items-center justify-center gap-2">
          <Plus class="w-4 h-4" />
          New Order
        </button>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card overflow-hidden">
      <table class="w-full">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="text-left py-3 px-4 font-medium text-gray-700">DB Name</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Type</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Status</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Host</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each orders as order}
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 text-gray-900 font-medium">{order.db_name}</td>
              <td class="py-3 px-4">
                <span class={`${getDBTypeColor(order.db_type)}`}>{order.db_type}</span>
              </td>
              <td class="py-3 px-4">
                <span class={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
              </td>
              <td class="py-3 px-4 text-gray-700">{order.assigned_host}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  {#if order.status === 'suspended'}
                    <button
                      onclick={() => handleContinue(order.id)}
                      class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Resume"
                    >
                      <Play class="w-4 h-4" />
                    </button>
                  {:else}
                    <button
                      onclick={() => handleSuspend(order.id)}
                      class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Suspend"
                    >
                      <Pause class="w-4 h-4" />
                    </button>
                  {/if}
                  <button
                    onclick={() => handleCancel(order.id)}
                    disabled={order.status === 'completed'}
                    class="p-2 rounded-lg transition"
                    class:text-gray-300={order.status === 'completed'}
                    class:cursor-not-allowed={order.status === 'completed'}
                    class:text-gray-600={order.status !== 'completed'}
                    class:hover:bg-gray-100={order.status !== 'completed'}
                    title={order.status === 'completed' ? 'Cannot cancel completed order' : 'Cancel'}
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total}
      </div>
      <div class="flex gap-2">
        <button
          onclick={() => (page = Math.max(1, page - 1))}
          disabled={page === 1}
          class="btn-secondary"
          class:opacity-50={page === 1}
          class:cursor-not-allowed={page === 1}
        >
          Previous
        </button>
        <span class="flex items-center px-4 text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          onclick={() => (page = Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          class="btn-secondary"
          class:opacity-50={page >= totalPages}
          class:cursor-not-allowed={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</div>
