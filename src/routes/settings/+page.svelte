<script lang="ts">
	import { onMount } from 'svelte'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
	import { dbAPI } from '$lib/api'
	import { CheckCircle, AlertCircle } from '@lucide/svelte'

	let loading = $state(false)
	let apiUrl = $state('')
	let jwtToken = $state('')
	let healthStatus = $state<string | null>(null)
	let healthLoading = $state(false)
	let message = $state<{ type: 'success' | 'error'; text: string } | null>(null)

	onMount(() => {
		apiUrl = localStorage.getItem('apiUrl') || ''
		jwtToken = localStorage.getItem('jwtToken') || ''
	})

	async function handleSaveSettings() {
		try {
			localStorage.setItem('apiUrl', apiUrl)
			localStorage.setItem('jwtToken', jwtToken)
			message = { type: 'success', text: 'Settings saved successfully' }
			setTimeout(() => (message = null), 3000)
		} catch (error) {
			message = { type: 'error', text: 'Failed to save settings' }
		}
	}

	async function handleHealthCheck() {
		healthLoading = true
		try {
			await dbAPI.healthCheck()
			healthStatus = 'healthy'
			setTimeout(() => (healthStatus = null), 3000)
		} catch (error) {
			healthStatus = 'unhealthy'
			setTimeout(() => (healthStatus = null), 3000)
		} finally {
			healthLoading = false
		}
	}

	async function handleSyncRedis() {
		loading = true
		try {
			const res = await dbAPI.syncRedis()
			message = { type: 'success', text: res.message }
			setTimeout(() => (message = null), 3000)
		} catch (error) {
			message = { type: 'error', text: 'Failed to sync Redis' }
			setTimeout(() => (message = null), 3000)
		} finally {
			loading = false
		}
	}

	async function handleRecheckOrders() {
		loading = true
		try {
			const res = await dbAPI.recheckOrders()
			message = { type: 'success', text: res.message }
			setTimeout(() => (message = null), 3000)
		} catch (error) {
			message = { type: 'error', text: 'Failed to recheck orders' }
			setTimeout(() => (message = null), 3000)
		} finally {
			loading = false
		}
	}
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

	{#if message}
		<div
			class={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
				message.type === 'success'
					? 'bg-green-50 text-green-800 border border-green-200'
					: 'bg-red-50 text-red-800 border border-red-200'
			}`}
		>
			{#if message.type === 'success'}
				<CheckCircle class="w-5 h-5" />
			{:else}
				<AlertCircle class="w-5 h-5" />
			{/if}
			<span>{message.text}</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- API Configuration -->
		<div class="card p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
					<input
						bind:value={apiUrl}
						type="text"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="http://localhost:8080/api"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
					<input
						bind:value={jwtToken}
						type="password"
						class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Your JWT token"
					/>
				</div>
				<button
					onclick={handleSaveSettings}
					disabled={loading}
					class="w-full btn-primary py-2"
				>
					Save Settings
				</button>
				<button
					onclick={handleHealthCheck}
					disabled={healthLoading}
					class="w-full btn-secondary py-2"
				>
					{#if healthLoading}
						Checking...
					{:else if healthStatus === 'healthy'}
						✓ API Healthy
					{:else if healthStatus === 'unhealthy'}
						✗ API Unhealthy
					{:else}
						Health Check
					{/if}
				</button>
			</div>
		</div>

		<!-- System Operations -->
		<div class="card p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">System Operations</h2>
			<div class="space-y-4">
				<button
					onclick={handleSyncRedis}
					disabled={loading}
					class="w-full btn-primary py-2"
				>
					{loading ? 'Syncing...' : 'Sync Redis Cache'}
				</button>
				<button
					onclick={handleRecheckOrders}
					disabled={loading}
					class="w-full btn-primary py-2"
				>
					{loading ? 'Rechecking...' : 'Recheck Pending Orders'}
				</button>
			</div>
		</div>
	</div>

	<!-- API Documentation -->
	<div class="card p-6 mt-6">
		<h2 class="text-lg font-semibold text-gray-900 mb-4">API Documentation</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
			<div>
				<p class="font-medium text-gray-900 mb-2">Core Endpoints</p>
				<ul class="space-y-1 text-gray-600">
					<li>• GET /backoffice/orders</li>
					<li>• GET /backoffice/instances</li>
					<li>• GET /backoffice/stats</li>
					<li>• POST /db/order</li>
					<li>• POST /db/suspend/{'{'}orderId{'}'}</li>
					<li>• POST /db/continue/{'{'}orderId{'}'}</li>
					<li>• POST /instance/register</li>
				</ul>
			</div>
			<div>
				<p class="font-medium text-gray-900 mb-2">Usage Endpoints</p>
				<ul class="space-y-1 text-gray-600">
					<li>• GET /usage/instance</li>
					<li>• GET /usage/user</li>
					<li>• GET /db/usage-by-group/{'{'}groupId{'}'}</li>
					<li>• GET /backoffice/orders/group-by-db-type</li>
					<li>• GET /backoffice/orders/group-by-status</li>
					<li>• GET /db/sync-redis</li>
					<li>• POST /instance/recheck-orders</li>
				</ul>
			</div>
		</div>
	</div>
</div>
