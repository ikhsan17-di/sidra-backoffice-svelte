<script lang="ts">
  import { onMount } from 'svelte'
  import { AlertCircle, CheckCircle, RefreshCw } from '@lucide/svelte'
  import { dbAPI } from '../lib/api'

  let apiUrl = $state('')
  let jwtToken = $state('')
  let message = $state('')
  let messageType = $state<'success' | 'error' | 'info'>('info')

  let healthLoading = $state(false)
  let syncLoading = $state(false)
  let recheckLoading = $state(false)

  onMount(() => {
    apiUrl = localStorage.getItem('apiUrl') || import.meta.env.VITE_API_BASE_URL || '/api'
    jwtToken = localStorage.getItem('jwtToken') || ''
  })

  function handleSave() {
    localStorage.setItem('apiUrl', apiUrl)
    localStorage.setItem('jwtToken', jwtToken)
    message = 'Settings saved successfully'
    messageType = 'success'
    setTimeout(() => (message = ''), 3000)
  }

  async function handleHealthCheck() {
    healthLoading = true
    try {
      const result = await dbAPI.healthCheck()
      message = `Health check passed: ${result}`
      messageType = 'success'
    } catch (error) {
      message = `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      messageType = 'error'
    } finally {
      healthLoading = false
      setTimeout(() => (message = ''), 3000)
    }
  }

  async function handleSyncRedis() {
    syncLoading = true
    try {
      const result = await dbAPI.syncRedis()
      message = result.message
      messageType = 'success'
    } catch (error) {
      message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      messageType = 'error'
    } finally {
      syncLoading = false
    }
  }

  async function handleRecheckOrders() {
    recheckLoading = true
    try {
      const result = await dbAPI.recheckOrders()
      message = result.message
      messageType = 'success'
    } catch (error) {
      message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      messageType = 'error'
    } finally {
      recheckLoading = false
    }
  }
</script>

<div class="p-6 max-w-2xl">
  {#if message}
    <div class={`card p-4 mb-6 flex items-start gap-3 ${messageType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      {#if messageType === 'success'}
        <CheckCircle class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <p class="text-green-800">{message}</p>
      {:else}
        <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p class="text-red-800">{message}</p>
      {/if}
    </div>
  {/if}

  <!-- API Configuration -->
  <div class="card p-6 mb-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
        <input
          bind:value={apiUrl}
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
        <textarea
          bind:value={jwtToken}
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          placeholder="Required for data plane endpoints (/data/*)"
        ></textarea>
      </div>
      <button onclick={handleSave} class="btn-primary">Save Settings</button>
    </div>
  </div>

  <!-- System Operations -->
  <div class="card p-6 mb-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">System Operations</h2>
    <div class="space-y-4">
      <button
        onclick={handleHealthCheck}
        disabled={healthLoading}
        class="btn-primary w-full flex items-center justify-center gap-2"
      >
        {#if healthLoading}
          <RefreshCw class="w-4 h-4 animate-spin" />
        {/if}
        Health Check
      </button>
      <button
        onclick={handleSyncRedis}
        disabled={syncLoading}
        class="btn-secondary w-full flex items-center justify-center gap-2"
      >
        {#if syncLoading}
          <RefreshCw class="w-4 h-4 animate-spin" />
        {/if}
        Sync Redis
      </button>
      <button
        onclick={handleRecheckOrders}
        disabled={recheckLoading}
        class="btn-secondary w-full flex items-center justify-center gap-2"
      >
        {#if recheckLoading}
          <RefreshCw class="w-4 h-4 animate-spin" />
        {/if}
        Recheck Orders
      </button>
    </div>
  </div>

  <!-- API Documentation -->
  <div class="card p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">API Documentation</h2>
    <p class="text-gray-600 mb-3">Base endpoint available at:</p>
    <code class="block bg-gray-100 p-3 rounded mb-4 font-mono text-sm overflow-x-auto">{apiUrl}</code>
    <p class="text-sm text-gray-600">For detailed API documentation, contact the backend team.</p>
  </div>
</div>
