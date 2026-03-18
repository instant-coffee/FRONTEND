<template>
  <NuxtLink :to="`/wheels/${product.id}`" class="nobl-card group block">
    <!-- Image placeholder -->
    <div class="aspect-[4/3] bg-nobl-grey-muted flex items-center justify-center">
      <div class="text-center space-y-1">
        <div class="text-nobl-grey-light text-xs font-semibold tracking-widest uppercase">
          {{ categoryLabel }}
        </div>
        <div class="text-nobl-grey-border text-xs font-mono">{{ product.currency }}</div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <h3 class="font-semibold text-nobl-black text-base leading-snug group-hover:text-nobl-blue transition-colors">
        {{ product.name }}
      </h3>

      <!-- CTA -->
      <div class="mt-4 pt-4 border-t border-nobl-grey-border flex items-center justify-between">
        <span class="text-xs font-semibold text-nobl-blue group-hover:underline">
          Configure →
        </span>
        <span class="text-xs text-nobl-grey-light font-mono">{{ product.id }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ProductListItem } from '~/types/api'

const props = defineProps<{
  product: ProductListItem
}>()

const categoryLabel = computed(() => {
  const name = props.product.name.toLowerCase()
  if (name.includes('ethos'))     return 'Carbon · Ethos'
  if (name.includes('signature')) return 'Carbon · Signature'
  if (name.includes('sinewave'))  return 'Alloy · Sinewave'
  if (name.includes('dropbar'))   return 'Dropbar'
  return 'Wheelset'
})
</script>
