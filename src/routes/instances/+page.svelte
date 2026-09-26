<script lang="ts">
	import { onMount } from 'svelte'
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
	import { dbAPI } from '$lib/api'
	import type { Instance } from '$lib/types'

	let loading = $state(false)
	let instances = $state<Instance[]>([])
	let total = $state(0)
	let page = $state(1)
	let pageSize = $state(10)
	let showForm = $state(false)
	let formData = $state<Partial<Instance>>({
		db_type: 'postgresql',
	})

	async function loadInstances() {
		loading = true
		try {
			const res = await dbAPI.getBackofficeInstances({
				page,
				page_size: pageSize,
			})
			instances = res.data
			total = res.total
		} catch (error) {
			console.error('Failed to load instances:', error)
		} finally {
			loading = false
		}
	}

	async function handleRegister() {
		if (!formData.instance_name || !formData.host) return

		try {
			await dbAPI.registerInstance(formData as Instance)
			await loadInstances()
			showForm = false
			formData = { db_type: 'postgresql' }
		} catch (error) {
			console.error('Failed to register instance:', error)
		}
	}

	onMount(() => loadInstances())

	$effect(() => {
		page
		pageSize
		loadInstances()
	})

	const totalPages = Math.ceil(total / pageSize)
</script>

<div class="p-6">
	{#if loading}
		<LoadingSpinner />
	{:else}
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Database Instances</h1>
			<button
				onclick={() => (showForm = !showForm)}
				class="btn-primary px-4 py-2"
			>
				{showForm ? 'Cancel' : 'Register Instance'}
			</button>
		</div>

		{#if showForm}
			<div class="card p-6 mb-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Register New Instance</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<input
						bind:value={formData.instance_name}
						type="text"
						placeholder="Instance Name"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
					<select bind:value={formData.db_type} class="px-4 py-2 border border-gray-300 rounded-lg">
						<option value="postgresql">PostgreSQL</option>
						<option value="mysql">MySQL</option>
						<option value="mariadb">MariaDB</option>
						<option value="mongodb">MongoDB</option>
					</select>
					<input
						bind:value={formData.host}
						type="text"
						placeholder="Host"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
					<input
						bind:value={formData.port}
						type="number"
						placeholder="Port"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
					<input
						bind:value={formData.root_username}
						type="text"
						placeholder="Root Username"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
					<input
						bind:value={formData.root_password}
						type="password"
						placeholder="Root Password"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
					<input
						bind:value={formData.total_storage}
						type="number"
						placeholder="Total Storage (GB)"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
					<input
						bind:value={formData.max_users}
						type="number"
						placeholder="Max Users"
						class="px-4 py-2 border border-gray-300 rounded-lg"
					/>
				</div>
				<button onclick={handleRegister} class="btn-primary mt-4">
					Register
				</button>
			</div>
		{/if}

		<!-- Instances Table -->
		<div class="card overflow-hidden">
			<table class="w-full">
				<thead class="border-b border-gray-200 bg-gray-50">
					<tr>
						<th class="text-left py-3 px-4 font-medium text-gray-700">Name</th>
						<th class="text-left py-3 px-4 font-medium text-gray-700">Type</th>
						<th class="text-left py-3 px-4 font-medium text-gray-700">Host</th>
						<th class="text-left py-3 px-4 font-medium text-gray-700">Port</th>
						<th class="text-left py-3 px-4 font-medium text-gray-700">Storage (GB)</th>
						<th class="text-left py-3 px-4 font-medium text-gray-700">Max Users</th>
					</tr>
				</thead>
				<tbody>
					{#each instances as instance}
						<tr class="border-b border-gray-100 hover:bg-gray-50">
							<td class="py-3 px-4 text-gray-900 font-medium">{instance.instance_name}</td>
							<td class="py-3 px-4">{instance.db_type}</td>
							<td class="py-3 px-4 text-gray-700">{instance.host}</td>
							<td class="py-3 px-4 text-gray-700">{instance.port}</td>
							<td class="py-3 px-4 text-gray-700">{instance.total_storage}</td>
							<td class="py-3 px-4 text-gray-700">{instance.max_users}</td>
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
