<template>
  <NuxtLink :to="cardLink" class="nobl-card group block">
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
        <span class="text-xs text-nobl-grey-light font-mono">
          {{ product.familyTag ? product.familyTag.replace('family:', '') : product.id }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ProductListItem } from '~/types/api'

const props = defineProps<{
  product: ProductListItem
}>()

// Route to the family page if this product has a family tag,
// otherwise fall back to the single-template product page.
const cardLink = computed(() =>
  props.product.familyTag
    ? `/wheels/family/${encodeURIComponent(props.product.familyTag)}`
    : `/wheels/${props.product.id}`,
)

const categoryLabel = computed(() => {
  const name = props.product.name.toLowerCase()
  if (name.includes('ethos'))     return 'Ethos Series'
  if (name.includes('signature')) return 'Signature Series'
  if (name.includes('sinewave'))  return 'Sinewave Series'
  if (name.includes('dropbar'))   return 'Dropbar'
  return 'Wheelset'
})
</script>
