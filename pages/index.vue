<template>
  <div class="max-w-7xl mx-auto px-6 py-12">
    <!-- Page header -->
    <div class="mb-10">
      <p class="nobl-label">Configure your ride</p>
      <h1 class="text-3xl font-bold text-nobl-black">Wheelsets</h1>
      <p class="text-nobl-grey mt-2 text-sm">
        Select a wheelset to configure rim size, position, and options.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="nobl-card animate-pulse">
        <div class="aspect-[4/3] bg-nobl-grey-muted" />
        <div class="p-5 space-y-3">
          <div class="h-4 bg-nobl-grey-muted rounded w-3/4" />
          <div class="h-3 bg-nobl-grey-muted rounded w-full" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 text-sm">
      <p class="font-semibold text-red-700 mb-1">Could not load products</p>
      <p class="text-red-600">{{ error.message }}</p>
      <p class="text-red-500 mt-2 text-xs">
        Make sure the NestJS API is running on <code>localhost:3000</code>.
      </p>
    </div>

    <!-- Product grid -->
    <template v-else-if="data && data.length">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-sm text-nobl-grey">{{ data.length }} products</span>
        <span class="text-nobl-grey-border">·</span>
        <span class="text-xs text-nobl-grey-light font-mono">{{ siteContext }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in data"
          :key="product.id"
          :product="product"
        />
      </div>
    </template>

    <p v-else class="text-nobl-grey text-sm">No products found.</p>
  </div>
</template>

<script setup lang="ts">
import type { ProductListItem } from '~/types/api'

const siteContext = useState<string>('siteContext')
const { fetchProducts } = useProducts()

const { data, pending, error } = await useAsyncData<ProductListItem[]>(
  'products',
  () => fetchProducts(),
  { watch: [siteContext] },
)

useSeoMeta({
  title: 'Wheelsets — NOBL',
  description: 'Configure your NOBL carbon wheelset',
})
</script>
