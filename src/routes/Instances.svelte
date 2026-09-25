<script lang="ts">
  import { onMount } from 'svelte'
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte'
  import { dbAPI } from '../lib/api'
  import { Search, Plus } from '@lucide/svelte'

  let loading = $state(false)
  let instances = $state<any[]>([])
  let total = $state(0)
  let page = $state(1)
  let pageSize = $state(10)
  let search = $state('')
  let filterType = $state('')
  let showForm = $state(false)

  async function loadInstances() {
    loading = true
    try {
      const res = await dbAPI.getBackofficeInstances({
        page,
        page_size: pageSize,
        instance_name: search || undefined,
        db_type: filterType || undefined,
      })
      instances = res.data
      total = res.total
    } catch (error) {
      console.error('Failed to load instances:', error)
    } finally {
      loading = false
    }
  }

  onMount(() => loadInstances())

  $effect(() => {
    page
    pageSize
    search
    filterType
    loadInstances()
  })

  const totalPages = Math.ceil(total / pageSize)
</script>

<div class="p-6">
  {#if loading}
    <LoadingSpinner />
  {:else}
    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="relative">
          <Search class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            bind:value={search}
            type="text"
            placeholder="Search instances..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
        <button onclick={() => (showForm = !showForm)} class="btn-primary flex items-center justify-center gap-2">
          <Plus class="w-4 h-4" />
          Register Instance
        </button>
      </div>
    </div>

    <!-- Register Form Placeholder -->
    {#if showForm}
      <div class="card p-6 mb-6 bg-blue-50">
        <h3 class="text-lg font-semibold mb-4">Register New Instance</h3>
        <p class="text-gray-600">Form will be implemented by Team A (Data Management)</p>
      </div>
    {/if}

    <!-- Instances Table -->
    <div class="card overflow-hidden">
      <table class="w-full">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Instance Name</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Type</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Host</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Port</th>
            <th class="text-left py-3 px-4 font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each instances as instance}
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 text-gray-900 font-medium">{instance.instance_name}</td>
              <td class="py-3 px-4 text-gray-700">{instance.db_type}</td>
              <td class="py-3 px-4 text-gray-700">{instance.host}</td>
              <td class="py-3 px-4 text-gray-700">{instance.port}</td>
              <td class="py-3 px-4">
                <span class={`badge ${instance.is_active ? 'badge-success' : 'badge-warning'}`}>
                  {instance.is_active ? 'Active' : 'Inactive'}
                </span>
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
