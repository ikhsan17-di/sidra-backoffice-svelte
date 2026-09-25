<script lang="ts">
  import { onMount } from 'svelte'
  import LoadingSpinner from '../lib/components/LoadingSpinner.svelte'
  import { dbAPI } from '../lib/api'

  let loading = $state(true)
  let instanceUsage = $state<any[]>([])
  let userUsage = $state<any[]>([])
  let selectedGroup = $state('')

  onMount(async () => {
    try {
      const [instRes, userRes] = await Promise.all([
        dbAPI.getInstanceUsage(),
        dbAPI.getUserUsage(),
      ])
      instanceUsage = Array.isArray(instRes) ? instRes : instRes.data || []
      userUsage = Array.isArray(userRes) ? userRes : userRes.data || []
    } catch (error) {
      console.error('Failed to load usage:', error)
    } finally {
      loading = false
    }
  })
</script>

<div class="p-6">
  {#if loading}
    <LoadingSpinner />
  {:else}
    <div class="space-y-6">
      <!-- Instance Usage -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Instance Usage</h2>
        <div class="h-80 flex items-center justify-center text-gray-500">
          <p>Chart will be implemented by Team B (Analytics)</p>
        </div>
      </div>

      <!-- User Usage -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">User Usage</h2>
        <div class="h-80 flex items-center justify-center text-gray-500">
          <p>Chart will be implemented by Team B (Analytics)</p>
        </div>
      </div>

      <!-- Instance Usage Table -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Instance Usage Detail</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Instance Name</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Usage (GB)</th>
              </tr>
            </thead>
            <tbody>
              {#each instanceUsage as item}
                <tr class="border-b border-gray-100">
                  <td class="py-3 px-4 text-gray-900">{item.name}</td>
                  <td class="py-3 px-4 text-gray-700">{item.usage_gb} GB</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Group Usage -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Group Usage</h3>
        <p class="text-sm text-gray-600">Select group to view usage details (to be implemented)</p>
      </div>
    </div>
  {/if}
</div>
