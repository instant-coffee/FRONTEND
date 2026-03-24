<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────────
// ReviewStep — Step 4: full summary + bike details + Add to Cart
//
// Shows the complete build summary grouped by step, with "Edit" links that
// jump back to the relevant step. Bike details form and final CTA.
// ─────────────────────────────────────────────────────────────────────────────

import type { Product, ProductVariant, WheelOption, AddOn, BikeDetails } from '~/types/api'

export interface ReviewSection {
  title:    string
  stepKey:  number
  rows:     { label: string; value: string }[]
}

const props = defineProps<{
  product:             Product
  selectedVariant:     ProductVariant | undefined
  selectedOptionLabels: Record<string, string>
  totalPrice:          { amount: number; formatted: string } | null
  bikeDetails:         BikeDetails
  canAddToCart:         boolean
  cartLoading:         boolean
  cartError:           string | null
  lastOrderName:       string | null
  // Grouped summary sections built by the parent
  reviewSections:      ReviewSection[]
}>()

const emit = defineEmits<{
  'update:bikeDetails': [field: keyof BikeDetails, value: string]
  'goToStep':           [step: number]
  'addToCart':          []
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Summary cards -->
    <div
      v-for="section in reviewSections"
      :key="section.title"
      class="rounded-lg border border-nobl-grey-border overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-3 bg-nobl-grey-muted border-b border-nobl-grey-border">
        <span class="text-xs font-semibold uppercase tracking-widest text-nobl-grey-light">
          {{ section.title }}
        </span>
        <button
          type="button"
          class="text-xs font-semibold text-nobl-blue hover:underline"
          @click="emit('goToStep', section.stepKey)"
        >
          Edit &rarr;
        </button>
      </div>
      <div>
        <div
          v-for="(row, i) in section.rows"
          :key="row.label"
          class="flex justify-between px-5 py-3 text-sm"
          :class="i < section.rows.length - 1 ? 'border-b border-nobl-grey-border/50' : ''"
        >
          <span class="text-nobl-grey-light font-medium">{{ row.label }}</span>
          <span class="font-semibold text-nobl-black">{{ row.value }}</span>
        </div>
        <div v-if="!section.rows.length" class="px-5 py-3 text-sm text-nobl-grey-light">
          No selections made
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-nobl-grey-border" />

    <!-- Bike Details -->
    <div class="space-y-4">
      <div>
        <p class="nobl-label">What bike are these wheels for?</p>
        <p class="text-xs text-nobl-grey-light mt-0.5">
          Optional — helps our build team spec the wheel correctly
        </p>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div>
          <label for="bike-make" class="text-xs font-semibold uppercase tracking-wider text-nobl-grey-light block mb-1">Make</label>
          <input
            id="bike-make"
            type="text"
            :value="bikeDetails.make"
            placeholder="e.g. Forbidden"
            class="nobl-input"
            @input="emit('update:bikeDetails', 'make', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label for="bike-model" class="text-xs font-semibold uppercase tracking-wider text-nobl-grey-light block mb-1">Model</label>
          <input
            id="bike-model"
            type="text"
            :value="bikeDetails.model"
            placeholder="e.g. Reya"
            class="nobl-input"
            @input="emit('update:bikeDetails', 'model', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div>
          <label for="bike-year" class="text-xs font-semibold uppercase tracking-wider text-nobl-grey-light block mb-1">Year</label>
          <input
            id="bike-year"
            type="text"
            :value="bikeDetails.year"
            placeholder="e.g. 2026"
            maxlength="4"
            class="nobl-input"
            @input="emit('update:bikeDetails', 'year', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <div>
        <label for="bike-notes" class="text-xs font-semibold uppercase tracking-wider text-nobl-grey-light block mb-1">Additional Questions</label>
        <textarea
          id="bike-notes"
          :value="bikeDetails.notes"
          rows="3"
          placeholder="Any other details or questions for our build team..."
          class="nobl-input resize-none"
          @input="emit('update:bikeDetails', 'notes', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </div>

    <!-- Price + CTA -->
    <div class="space-y-3">
      <div v-if="totalPrice">
        <span class="text-2xl font-bold text-nobl-black">{{ totalPrice.formatted }}</span>
        <p class="nobl-price-note mt-1">{{ product.currency }} · Retail price · Includes all selected options</p>
      </div>

      <button
        type="button"
        class="nobl-btn-primary w-full"
        :disabled="!canAddToCart"
        @click="emit('addToCart')"
      >
        <span v-if="cartLoading">Adding...</span>
        <span v-else-if="!selectedVariant">Select a configuration above</span>
        <span v-else-if="!canAddToCart">Choose all required options</span>
        <span v-else>Add to Cart — {{ totalPrice?.formatted }}</span>
      </button>

      <p v-if="cartError" class="text-red-600 text-xs">{{ cartError }}</p>

      <div
        v-if="lastOrderName"
        class="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800"
      >
        Added to order <span class="font-mono">{{ lastOrderName }}</span>
      </div>
    </div>

    <!-- Back nav -->
    <div class="pt-4 border-t border-nobl-grey-border flex justify-start">
      <button type="button" class="nobl-btn-ghost" @click="emit('goToStep', 3)">
        &larr; Back to Accessories
      </button>
    </div>
  </div>
</template>
