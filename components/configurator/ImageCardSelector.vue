<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────────
// ImageCardSelector — reusable image/swatch card grid
//
// Used for decals, valve colours, tires — anything where the user picks from
// a visual grid of options. Fully generic.
//
// Supports three display modes:
//   'image'  — product image with label below (decals, tires)
//   'swatch' — tall colour swatch with label (valve colours)
//   'card'   — bordered card with label + optional price (generic fallback)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImageCardOption {
  id:         number | string
  label:      string
  imageUrl?:  string       // product image URL (optional — shows placeholder if missing)
  swatchColor?: string     // CSS colour for swatch mode
  priceExtra?:  string     // formatted price delta, e.g. "+$24.40 CAD"
}

const props = withDefaults(defineProps<{
  options:    ImageCardOption[]
  selected?:  number | string | null
  mode?:      'image' | 'swatch' | 'card'
  columns?:   number        // grid columns (default varies by mode)
  label?:     string        // optional section label
  required?:  boolean
}>(), {
  mode:     'card',
  selected: null,
  required: false,
})

const emit = defineEmits<{
  select: [id: number | string]
}>()

const gridClass = computed(() => {
  const cols = props.columns ?? (props.mode === 'swatch' ? 6 : props.mode === 'image' ? 4 : 3)
  return `grid-cols-${cols}`
})
</script>

<template>
  <div>
    <p v-if="label" class="nobl-label">
      {{ label }}
      <span v-if="required" class="text-red-400 ml-0.5">*</span>
    </p>

    <div class="grid gap-3" :class="gridClass">
      <button
        v-for="opt in options"
        :key="opt.id"
        type="button"
        class="text-left transition-all duration-150 rounded-lg overflow-hidden border-2"
        :class="[
          selected === opt.id
            ? 'border-nobl-blue ring-2 ring-nobl-blue/20'
            : 'border-nobl-grey-border hover:border-nobl-grey',
        ]"
        @click="emit('select', opt.id)"
      >
        <!-- Image mode -->
        <template v-if="mode === 'image'">
          <div class="aspect-square bg-nobl-grey-muted flex items-center justify-center overflow-hidden">
            <img
              v-if="opt.imageUrl"
              :src="opt.imageUrl"
              :alt="opt.label"
              class="w-full h-full object-cover"
            />
            <div v-else class="text-nobl-grey-light text-xs font-medium text-center px-2">
              {{ opt.label }}
            </div>
          </div>
          <div class="px-3 py-2 text-center">
            <p class="text-xs font-semibold text-nobl-black truncate">{{ opt.label }}</p>
            <p v-if="opt.priceExtra" class="text-xs text-nobl-grey-light mt-0.5">{{ opt.priceExtra }}</p>
          </div>
        </template>

        <!-- Swatch mode -->
        <template v-else-if="mode === 'swatch'">
          <div
            class="aspect-[2/5] rounded-md"
            :style="opt.swatchColor ? { backgroundColor: opt.swatchColor } : undefined"
            :class="{ 'bg-nobl-grey-muted': !opt.swatchColor }"
          >
            <img
              v-if="opt.imageUrl"
              :src="opt.imageUrl"
              :alt="opt.label"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="px-1 py-2 text-center">
            <p class="text-[11px] font-medium text-nobl-grey leading-tight">{{ opt.label }}</p>
          </div>
        </template>

        <!-- Card mode (default) -->
        <template v-else>
          <div class="px-4 py-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <div
                v-if="opt.swatchColor || opt.imageUrl"
                class="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-nobl-grey-border"
                :style="opt.swatchColor ? { backgroundColor: opt.swatchColor } : undefined"
              >
                <img v-if="opt.imageUrl" :src="opt.imageUrl" :alt="opt.label" class="w-full h-full object-cover"/>
              </div>
              <span class="text-sm font-medium text-nobl-black truncate">{{ opt.label }}</span>
            </div>
            <span v-if="opt.priceExtra" class="text-xs text-nobl-grey-light whitespace-nowrap">
              {{ opt.priceExtra }}
            </span>
          </div>
        </template>
      </button>
    </div>
  </div>
</template>
