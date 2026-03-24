<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────────
// BuildSpecStep — Step 1: the engineering decisions
//
// Rim Size, Position Cards, Hub Spacing, Brake Interface, Freehub, Torque Caps
//
// This is a thin view component. All business logic (constraints, visibility,
// filtering) lives in the parent orchestrator. We receive pre-filtered options
// and emit user interactions back up.
// ─────────────────────────────────────────────────────────────────────────────

import type { Product, ProductVariant, WheelOption, AttributeValueDto } from '~/types/api'

const props = defineProps<{
  product:            Product
  selectedRimSize:    string
  selectedPosition:   string
  selectedVariant:    ProductVariant | undefined
  visibleOptions:     WheelOption[]       // already filtered to step 1 types
  selectedOptionIds:  Record<string, number | undefined>
  // Helpers from parent
  availableRimSizes:  string[]
  availablePositions: string[]
  // Functions from parent
  isPositionAvailable:    (pos: string) => boolean
  priceFormattedForPosition: (pos: string) => string
  isCheckboxOption:       (opt: WheelOption) => boolean
  allowedValuesForOption: (opt: WheelOption) => AttributeValueDto[]
  activeConstraintNote:   (type: string) => string | null
}>()

const emit = defineEmits<{
  'update:rimSize':   [value: string]
  'update:position':  [value: string]
  'update:optionId':  [type: string, id: number | undefined]
  'next':             []
}>()

function posShortLabel(pos: string): string {
  const map: Record<string, string> = {
    'Complete Wheelset': 'Complete\nWheelset',
    'Front Wheel':       'Front\nWheel',
    'Rear Wheel':        'Rear\nWheel',
    'Front Only':        'Front\nOnly',
    'Rear Only':         'Rear\nOnly',
  }
  return map[pos] ?? pos
}

function handleSelect(type: string, event: Event) {
  const val = (event.target as HTMLSelectElement).value
  emit('update:optionId', type, val === '' ? undefined : Number(val))
}

function handleCheckboxToggle(opt: WheelOption) {
  const val = opt.values[0]
  if (!val) return
  const current = props.selectedOptionIds[opt.type]
  emit('update:optionId', opt.type, current === val.id ? undefined : val.id)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Rim Size -->
    <div>
      <label for="rim-size" class="nobl-label">Rim Size</label>
      <select
        id="rim-size"
        :value="selectedRimSize"
        class="nobl-select"
        @change="emit('update:rimSize', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>Select rim size</option>
        <option v-for="size in availableRimSizes" :key="size" :value="size">{{ size }}</option>
      </select>
    </div>

    <!-- Position Cards -->
    <div>
      <label class="nobl-label">Wheelset Options</label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="pos in availablePositions"
          :key="pos"
          type="button"
          :disabled="!isPositionAvailable(pos)"
          :class="[
            'border rounded px-3 py-3 text-sm font-medium text-center transition-all duration-150',
            selectedPosition === pos
              ? 'border-nobl-black bg-nobl-black text-white'
              : 'border-nobl-grey-border text-nobl-grey hover:border-nobl-black',
            !isPositionAvailable(pos) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          ]"
          @click="emit('update:position', pos)"
        >
          <div class="text-xs leading-tight whitespace-pre-line">{{ posShortLabel(pos) }}</div>
          <div v-if="selectedRimSize && isPositionAvailable(pos)" class="text-xs mt-1 opacity-70">
            {{ priceFormattedForPosition(pos) }}
          </div>
        </button>
      </div>
    </div>

    <!-- No-variant options (hub spacing, brake, freehub, torque caps) -->
    <template v-for="option in visibleOptions" :key="option.type">
      <div>
        <label :for="`opt-${option.type}`" class="nobl-label">
          {{ option.label }}
          <span v-if="option.required" class="text-red-400 ml-0.5">*</span>
        </label>

        <!-- Checkbox style (single-value options like Torque Caps) -->
        <label
          v-if="isCheckboxOption(option)"
          :for="`opt-${option.type}`"
          class="flex items-center gap-3 p-3 mt-1 border rounded cursor-pointer transition-colors"
          :class="selectedOptionIds[option.type] !== undefined
            ? 'border-nobl-black bg-nobl-black text-white'
            : 'border-nobl-grey-border hover:border-nobl-black'"
        >
          <input
            type="checkbox"
            :id="`opt-${option.type}`"
            :checked="selectedOptionIds[option.type] !== undefined"
            class="rounded border-nobl-grey-border accent-white"
            @change="handleCheckboxToggle(option)"
          />
          <span class="text-sm font-medium flex-1">{{ option.values[0]?.label }}</span>
          <span v-if="option.values[0]?.priceExtra" class="text-sm opacity-80 ml-auto">
            +{{ option.values[0].priceExtra.formatted }}
          </span>
        </label>

        <!-- Dropdown style (multi-value options) -->
        <select
          v-else
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

        <!-- Constraint note -->
        <p
          v-if="activeConstraintNote(option.type)"
          class="text-xs text-amber-600 mt-1.5 flex items-center gap-1"
        >
          <span>&#9888;</span> {{ activeConstraintNote(option.type) }}
        </p>
        <p v-else-if="option.visibleFor.length && selectedPosition" class="text-xs text-nobl-grey-light mt-1.5">
          Applies to: {{ option.visibleFor.join(', ') }}
        </p>
      </div>
    </template>

    <!-- Continue button -->
    <div class="pt-4 border-t border-nobl-grey-border flex justify-end">
      <button type="button" class="nobl-btn-primary" @click="emit('next')">
        Continue to Graphics &rarr;
      </button>
    </div>
  </div>
</template>
