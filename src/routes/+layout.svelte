<script lang="ts">
	import { page } from '$app/stores'
	import { Database, Settings as SettingsIcon, BarChart3, Server } from '@lucide/svelte'
	import '../app.css'

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: BarChart3 },
		{ href: '/orders', label: 'Orders', icon: Database },
		{ href: '/instances', label: 'Instances', icon: Server },
		{ href: '/usage', label: 'Usage & Analytics', icon: BarChart3 },
		{ href: '/settings', label: 'Settings', icon: SettingsIcon },
	]

	function isActive(path: string): boolean {
		return $page.url.pathname === path
	}
</script>

<div class="flex h-screen bg-gray-50">
	<!-- Sidebar -->
	<nav class="w-64 bg-white shadow-sm border-r border-gray-200">
		<div class="p-6 border-b border-gray-200">
			<div class="flex items-center gap-3">
				<Database class="w-8 h-8 text-blue-600" />
				<div>
					<h1 class="text-xl font-bold text-gray-900">DB Backoffice</h1>
					<p class="text-xs text-gray-500">Management System</p>
				</div>
			</div>
		</div>

		<ul class="p-4 space-y-2">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition"
						class:bg-blue-50={isActive(item.href)}
						class:text-blue-700={isActive(item.href)}
						class:text-gray-700={!isActive(item.href)}
						class:hover:bg-blue-50={!isActive(item.href)}
					>
						<svelte:component this={item.icon} class="w-5 h-5" />
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Main Content -->
	<main class="flex-1 overflow-auto">
		<slot />
	</main>
</div>
