<script lang="ts">
  import type { Component } from 'svelte'

  interface Props {
    title: string
    value: string | number
    icon: Component
    trend?: string
    variant?: 'default' | 'danger' | 'success' | 'warning'
  }

  let { title, value, icon: Icon, trend = undefined, variant = 'default' }: Props = $props()

  const bgColors = {
    default: 'bg-blue-50',
    danger: 'bg-red-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
  }

  const iconColors = {
    default: 'text-blue-600',
    danger: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  }
</script>

<div class="card p-6">
  <div class="flex items-start justify-between">
    <div>
      <p class="text-gray-600 text-sm font-medium">{title}</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {#if trend}
        <p class="text-green-600 text-sm mt-2">{trend}</p>
      {/if}
    </div>
    <div class={`${bgColors[variant]} p-3 rounded-lg`}>
      <div class={`${iconColors[variant]} w-6 h-6`}>
        <Icon />
      </div>
    </div>
  </div>
</div>
