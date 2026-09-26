<script lang="ts">
	import { onMount } from 'svelte'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
	import { dbAPI } from '$lib/api'

	let loading = $state(true)
	let instanceUsage = $state<any[]>([])
	let userUsage = $state<any[]>([])

	onMount(async () => {
		try {
			loading = true
			const [instanceRes, userRes] = await Promise.all([
				dbAPI.getInstanceUsage(),
				dbAPI.getUserUsage(),
			])

			instanceUsage = Array.isArray(instanceRes) ? instanceRes : instanceRes.data || []
			userUsage = Array.isArray(userRes) ? userRes : userRes.data || []
		} catch (error) {
			console.error('Failed to load usage data:', error)
		} finally {
			loading = false
		}
	})
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold text-gray-900 mb-6">Usage & Analytics</h1>

	{#if loading}
		<LoadingSpinner />
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
			<!-- Instance Usage -->
			<div class="card p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Instance Disk Usage</h2>
				<div class="space-y-4">
					{#each instanceUsage as usage}
						<div>
							<div class="flex justify-between mb-2">
								<span class="text-sm font-medium text-gray-700">{usage.name}</span>
								<span class="text-sm text-gray-600">{usage.usage_gb} GB</span>
							</div>
							<div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									class="h-full bg-blue-500"
									style={`width: ${Math.min((usage.usage_gb / 1000) * 100, 100)}%`}
								/>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- User Usage -->
			<div class="card p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">User Disk Usage</h2>
				<div class="space-y-4">
					{#each userUsage.slice(0, 5) as usage}
						<div>
							<div class="flex justify-between mb-2">
								<span class="text-sm font-medium text-gray-700">{usage.username || 'Unknown'}</span>
								<span class="text-sm text-gray-600">{usage.usage_gb || 0} GB</span>
							</div>
							<div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
								<div
									class="h-full bg-green-500"
									style={`width: ${Math.min(((usage.usage_gb || 0) / 100) * 100, 100)}%`}
								/>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Usage Tables -->
		<div class="card p-6">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Detailed Usage Data</h2>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b border-gray-200">
						<tr>
							<th class="text-left py-3 px-4 font-medium text-gray-700">Instance / User</th>
							<th class="text-left py-3 px-4 font-medium text-gray-700">Usage (GB)</th>
							<th class="text-left py-3 px-4 font-medium text-gray-700">Type</th>
						</tr>
					</thead>
					<tbody>
						{#each instanceUsage as usage}
							<tr class="border-b border-gray-100">
								<td class="py-3 px-4">{usage.name}</td>
								<td class="py-3 px-4">{usage.usage_gb} GB</td>
								<td class="py-3 px-4">
									<span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
										Instance
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
