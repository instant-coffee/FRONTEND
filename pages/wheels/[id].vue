<template>
  <div>
    <!-- Breadcrumb -->
    <div class="border-b border-nobl-grey-border bg-white">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-nobl-grey-light">
        <NuxtLink to="/" class="hover:text-nobl-blue transition-colors">Wheelsets</NuxtLink>
        <span>›</span>
        <span class="text-nobl-black">{{ data?.name ?? '…' }}</span>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-10">
      <!-- Loading skeleton -->
      <div v-if="pending" class="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div class="aspect-square bg-nobl-grey-muted rounded-lg" />
        <div class="space-y-6">
          <div class="space-y-2">
            <div class="h-7 bg-nobl-grey-muted rounded w-2/3" />
            <div class="h-4 bg-nobl-grey-muted rounded w-full" />
            <div class="h-4 bg-nobl-grey-muted rounded w-3/4" />
          </div>
          <div class="h-10 bg-nobl-grey-muted rounded w-1/3" />
          <div class="h-12 bg-nobl-grey-muted rounded" />
          <div class="h-12 bg-nobl-grey-muted rounded" />
          <div class="h-14 bg-nobl-grey-muted rounded" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-sm">
        <p class="font-semibold text-red-700 mb-1">Could not load product</p>
        <p class="text-red-600">{{ error.message }}</p>
      </div>

      <!-- Configurator -->
      <WheelConfigurator
        v-else-if="data"
        :product="data"
        :currency="currency"
      />
    </div>

    <!-- Debug panel (dev mode only) -->
    <details v-if="data" class="max-w-7xl mx-auto px-6 py-6">
      <summary class="text-xs text-nobl-grey-light cursor-pointer select-none hover:text-nobl-blue">
        API response (debug)
      </summary>
      <pre class="mt-3 text-xs bg-nobl-grey-muted rounded-lg p-4 overflow-x-auto text-nobl-grey leading-relaxed">{{ JSON.stringify(data, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/api'

const route = useRoute()
const siteContext = useState<string>('siteContext')
const { fetchProduct } = useProducts()

const { data, pending, error } = await useAsyncData<Product>(
  `product-${route.params.id}`,
  () => fetchProduct(route.params.id as string),
  { watch: [siteContext] },
)

// Derive currency from site context
const currency = computed(() => {
  const ctx = siteContext.value
  return ctx === 'nobl_ca' || ctx === 'wb_ca' ? 'CAD' : 'USD'
})

useSeoMeta({
  title: () => data.value ? `${data.value.name} — NOBL` : 'Configure — NOBL',
})
</script>
