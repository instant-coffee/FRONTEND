<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────────
// GraphicsStep — Step 2: visual personalization
//
// Graphic style (image card grid) + conditional decal colour.
// Will use ImageCardSelector once product images are available.
// ─────────────────────────────────────────────────────────────────────────────

import type { WheelOption, AttributeValueDto } from '~/types/api'

const props = defineProps<{
  visibleOptions:     WheelOption[]       // pre-filtered to step 2 types
  selectedOptionIds:  Record<string, number | undefined>
  allowedValuesForOption: (opt: WheelOption) => AttributeValueDto[]
  isCheckboxOption:       (opt: WheelOption) => boolean
}>()

const emit = defineEmits<{
  'update:optionId': [type: string, id: number | undefined]
  'next':            []
  'back':            []
}>()

function handleSelect(type: string, event: Event) {
  const val = (event.target as HTMLSelectElement).value
  emit('update:optionId', type, val === '' ? undefined : Number(val))
}
</script>

<template>
  <div class="space-y-6">
    <template v-for="option in visibleOptions" :key="option.type">
      <div>
        <label :for="`opt-${option.type}`" class="nobl-label">
          {{ option.label }}
          <span v-if="option.required" class="text-red-400 ml-0.5">*</span>
        </label>

        <!--
          TODO: Swap to <ImageCardSelector> when product images are available
          in Odoo for graphic options. For now, using dropdown as the existing
          working interface.
        -->
        <select
          :id="`opt-${option.type}`"
          :value="selectedOptionIds[option.type] ?? ''"
          class="nobl-select"
          @change="handleSelect(option.type, $event)"
        >
          <option value="" disabled>Select {{ option.label.toLowerCase() }}</option>
          <option
            v-for="val in allowedValuesForOption(option)"
            :key="val.id"
            :value="val.id"
          >
            {{ val.label }}
          </option>
        </select>

        <p v-if="option.visibleFor.length" class="text-xs text-nobl-grey-light mt-1.5">
          Applies to: {{ option.visibleFor.join(', ') }}
        </p>
      </div>
    </template>

    <p v-if="!visibleOptions.length" class="text-sm text-nobl-grey-light py-4">
      No graphic options available for this product.
    </p>

    <!-- Navigation -->
    <div class="pt-4 border-t border-nobl-grey-border flex justify-between">
      <button type="button" class="nobl-btn-ghost" @click="emit('back')">
        &larr; Back to Build
      </button>
      <button type="button" class="nobl-btn-primary" @click="emit('next')">
        Continue to Accessories &rarr;
      </button>
    </div>
  </div>
</template>
