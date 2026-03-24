<template>
  <div class="space-y-8">
    <!-- ── Product header (always visible) ── -->
    <div>
      <h1 class="text-2xl font-bold text-nobl-black">{{ product.name }}</h1>
      <div v-if="product.description || product.discipline || product.weightGrams" class="mt-3">
        <WheelDescription
          :description="product.description"
          :discipline="product.discipline"
          :weight-grams="product.weightGrams"
        />
      </div>
    </div>

    <!-- ── Step indicator + price bar ── -->
    <ConfiguratorStepIndicator
      :steps="STEPS"
      :current-step="currentStep"
      :total-price="totalPrice?.formatted"
      :currency="product.currency"
      @update:current-step="currentStep = $event"
    />

    <!-- ── Step content ── -->
    <div class="min-h-[400px]">
      <!-- Step 1 — Build Spec -->
      <ConfiguratorBuildSpecStep
        v-if="currentStep === 1"
        :product="product"
        :selected-rim-size="selectedRimSize"
        :selected-position="selectedPosition"
        :selected-variant="selectedVariant"
        :visible-options="buildSpecOptions"
        :selected-option-ids="selectedOptionIds"
        :available-rim-sizes="availableRimSizes"
        :available-positions="availablePositions"
        :is-position-available="isPositionAvailable"
        :price-formatted-for-position="priceFormattedForPosition"
        :is-checkbox-option="isCheckboxOption"
        :allowed-values-for-option="allowedValuesForOption"
        :active-constraint-note="activeConstraintNote"
        @update:rim-size="selectedRimSize = $event"
        @update:position="selectedPosition = $event"
        @update:option-id="handleOptionUpdate"
        @next="currentStep = 2"
      />

      <!-- Step 2 — Graphics -->
      <ConfiguratorGraphicsStep
        v-else-if="currentStep === 2"
        :visible-options="graphicsOptions"
        :selected-option-ids="selectedOptionIds"
        :allowed-values-for-option="allowedValuesForOption"
        :is-checkbox-option="isCheckboxOption"
        @update:option-id="handleOptionUpdate"
        @next="currentStep = 3"
        @back="currentStep = 1"
      />

      <!-- Step 3 — Accessories -->
      <ConfiguratorAccessoriesStep
        v-else-if="currentStep === 3"
        :visible-options="accessoriesOptions"
        :selected-option-ids="selectedOptionIds"
        :allowed-values-for-option="allowedValuesForOption"
        :is-checkbox-option="isCheckboxOption"
        @update:option-id="handleOptionUpdate"
        @next="currentStep = 4"
        @back="currentStep = 2"
      />

      <!-- Step 4 — Review -->
      <ConfiguratorReviewStep
        v-else-if="currentStep === 4"
        :product="product"
        :selected-variant="selectedVariant"
        :selected-option-labels="selectedOptionLabels"
        :total-price="totalPrice"
        :bike-details="bikeDetails"
        :can-add-to-cart="canAddToCart"
        :cart-loading="cart.loading.value"
        :cart-error="cart.error.value"
        :last-order-name="cart.lastOrder.value?.orderName ?? null"
        :review-sections="reviewSections"
        @update:bike-details="(field, val) => (bikeDetails[field] = val)"
        @go-to-step="currentStep = $event"
        @add-to-cart="handleAddToCart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductVariant, WheelOption, BikeDetails } from '~/types/api'
import type { ReviewSection } from './configurator/ReviewStep.vue'

const props = defineProps<{ product: Product }>()

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { key: 1, label: 'Build' },
  { key: 2, label: 'Graphics' },
  { key: 3, label: 'Accessories' },
  { key: 4, label: 'Review' },
] as const

const currentStep = ref(1)

// ─── Option type → step grouping ──────────────────────────────────────────────
// Step 1: manufacturing spec. Step 2: visual. Step 3: accessories.

const STEP_1_TYPES = new Set(['frontHub', 'torqueCap', 'rearHub', 'freehub', 'brakeInterface'])
const STEP_2_TYPES = new Set(['graphicOption', 'decalColour'])
const STEP_3_TYPES = new Set(['valveBrand', 'noblCapColour', 'peatysColour'])

// Explicit display order within each step
const OPTION_ORDER: Record<string, number> = {
  frontHub:       1,
  torqueCap:      2,
  rearHub:        3,
  freehub:        4,
  brakeInterface: 5,
  graphicOption:  6,
  decalColour:    7,
  valveBrand:     8,
  noblCapColour:  9,
  peatysColour:   10,
}

const cart = useCart()

// ─── Selection state ──────────────────────────────────────────────────────────

const selectedRimSize  = ref('')
const selectedPosition = ref('')
const selectedOptionIds = reactive<Record<string, number | undefined>>({})
const selectedAddonIds  = ref<number[]>([])
const bikeDetails = reactive<BikeDetails>({ make: '', model: '', year: '', notes: '' })

// ─── Derived — available rim sizes & positions ────────────────────────────────

const availableRimSizes = computed(() =>
  [...new Set(
    props.product.variants
      .filter((v) => v.available)
      .map((v) => v.rimSize),
  )].sort(),
)

const availablePositions = computed(() =>
  [...new Set(
    props.product.variants
      .filter((v) => v.available)
      .map((v) => v.position),
  )],
)

// ─── Derived — selected variant ───────────────────────────────────────────────

const selectedVariant = computed<ProductVariant | undefined>(() => {
  if (!selectedRimSize.value || !selectedPosition.value) return undefined
  return props.product.variants.find(
    (v) => v.available &&
           v.rimSize   === selectedRimSize.value &&
           v.position  === selectedPosition.value,
  )
})

// ─── Derived — visible no-variant options ─────────────────────────────────────

const visibleOptions = computed<WheelOption[]>(() => {
  return props.product.options
    .filter((opt) => {
      if (!opt || !opt.type) return false
      if (hiddenOptionTypes.value.has(opt.type)) return false
      if (!opt.visibleFor || opt.visibleFor.length === 0) return true
      if (!selectedPosition.value) return true
      return opt.visibleFor.includes(selectedPosition.value)
    })
    .sort((a, b) => (OPTION_ORDER[a.type] ?? 99) - (OPTION_ORDER[b.type] ?? 99))
})

// Filtered per step
const buildSpecOptions   = computed(() => visibleOptions.value.filter(o => STEP_1_TYPES.has(o.type)))
const graphicsOptions    = computed(() => visibleOptions.value.filter(o => STEP_2_TYPES.has(o.type)))
const accessoriesOptions = computed(() => visibleOptions.value.filter(o => STEP_3_TYPES.has(o.type)))

// Map from option.type → selected value label (for summary + review)
const selectedOptionLabels = computed(() => {
  const out: Record<string, string> = {}
  for (const opt of visibleOptions.value) {
    const id = selectedOptionIds[opt.type]
    if (id !== undefined) {
      const found = opt.values.find((v) => v.id === id)
      if (found) out[opt.type] = found.label
    }
  }
  return out
})

const allRequiredOptionsSelected = computed(() =>
  visibleOptions.value
    .filter((o) => o.required)
    .every((o) => selectedOptionIds[o.type] !== undefined),
)

// ─── Price including no-variant extras ────────────────────────────────────────

const totalPrice = computed<{ amount: number; formatted: string } | null>(() => {
  if (!selectedVariant.value) return null

  const extraAmount = visibleOptions.value.reduce((sum, opt) => {
    const selectedId = selectedOptionIds[opt.type]
    if (selectedId === undefined) return sum
    const val = opt.values.find((v) => v.id === selectedId)
    return sum + (val?.priceExtra?.amount ?? 0)
  }, 0)

  const total   = selectedVariant.value.price.amount + extraAmount
  const currency = selectedVariant.value.price.currency
  const locale   = currency === 'CAD' ? 'en-CA' : 'en-US'
  const formatted = new Intl.NumberFormat(locale, { style: 'currency', currency }).format(total)
    + ` ${currency}`

  return { amount: total, formatted }
})

// ─── Hub width → brake interface constraint ───────────────────────────────────

const requiresSixBoltBrake = computed<boolean>(() => {
  const frontHub  = props.product.options.find((o) => o.type === 'frontHub')
  const rearHub   = props.product.options.find((o) => o.type === 'rearHub')
  const torqueCap = props.product.options.find((o) => o.type === 'torqueCap')

  const frontLabel = frontHub?.values.find((v) => v.id === selectedOptionIds['frontHub'])?.label ?? ''
  const rearLabel  = rearHub?.values.find((v)  => v.id === selectedOptionIds['rearHub'])?.label  ?? ''
  const hasTorqueCap = !!torqueCap && selectedOptionIds['torqueCap'] !== undefined

  return frontLabel.toLowerCase().includes('x 20') || rearLabel.includes('157') || hasTorqueCap
})

const optionRestrictions = computed<Map<string, Set<number>>>(() => {
  const map = new Map<string, Set<number>>()

  if (requiresSixBoltBrake.value) {
    const brakeOption = props.product.options.find((o) => o.type === 'brakeInterface')
    if (brakeOption) {
      const allowed = new Set(
        brakeOption.values
          .filter((v) => !v.label.toLowerCase().includes('centerlock'))
          .map((v) => v.id),
      )
      map.set('brakeInterface', allowed)
    }
  }

  return map
})

function allowedValuesForOption(option: WheelOption) {
  const allowed = optionRestrictions.value.get(option.type)
  if (!allowed) return option.values
  return option.values.filter((v) => allowed.has(v.id))
}

function activeConstraintNote(optionType: string): string | null {
  if (!optionRestrictions.value.has(optionType)) return null
  if (optionType === 'brakeInterface') {
    const frontLabel = props.product.options
      .find((o) => o.type === 'frontHub')
      ?.values.find((v) => v.id === selectedOptionIds['frontHub'])?.label ?? ''
    const rearLabel = props.product.options
      .find((o) => o.type === 'rearHub')
      ?.values.find((v) => v.id === selectedOptionIds['rearHub'])?.label ?? ''
    const hasTorqueCap = selectedOptionIds['torqueCap'] !== undefined

    if (frontLabel.toLowerCase().includes('x 20'))
      return `${frontLabel} axle requires 6-bolt — Centerlock not compatible`
    if (rearLabel.includes('157'))
      return `${rearLabel} axle requires 6-bolt — Centerlock not compatible`
    if (hasTorqueCap)
      return 'Torque Caps require 6-bolt rotor — Centerlock not compatible'
  }
  return null
}

watch(requiresSixBoltBrake, (active) => {
  if (!active) return
  const allowed = optionRestrictions.value.get('brakeInterface')
  const current = selectedOptionIds['brakeInterface']
  if (allowed && current !== undefined && !allowed.has(current)) {
    delete selectedOptionIds['brakeInterface']
  }
})

// ─── Conditional option visibility ────────────────────────────────────────────

const hiddenOptionTypes = computed<Set<string>>(() => {
  const hidden = new Set<string>()

  // Torque Cap: only with 110 x 15 front axle
  const frontHub   = props.product.options.find((o) => o.type === 'frontHub')
  const frontLabel = frontHub?.values.find((v) => v.id === selectedOptionIds['frontHub'])?.label ?? ''
  if (!frontLabel || frontLabel.toLowerCase().includes('x 20')) {
    hidden.add('torqueCap')
  }

  // Valve cap colour: gated on valve brand
  const valveBrandOpt = props.product.options.find((o) => o.type === 'valveBrand')
  const valveLabel    = valveBrandOpt?.values.find((v) => v.id === selectedOptionIds['valveBrand'])?.label ?? ''
  if (!valveLabel.toLowerCase().includes('nobl'))  hidden.add('noblCapColour')
  if (!valveLabel.toLowerCase().includes('peaty')) hidden.add('peatysColour')

  // Decal Colour: only when Full Letter Decals is chosen
  const graphicOpt   = props.product.options.find((o) => o.type === 'graphicOption')
  const graphicLabel = graphicOpt?.values.find((v) => v.id === selectedOptionIds['graphicOption'])?.label ?? ''
  if (!graphicLabel.toLowerCase().includes('full letter')) {
    hidden.add('decalColour')
  }

  return hidden
})

watch(hiddenOptionTypes, (hiddenSet) => {
  for (const type of hiddenSet) {
    if (selectedOptionIds[type] !== undefined) {
      delete selectedOptionIds[type]
    }
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCheckboxOption(option: WheelOption): boolean {
  return option.values.length === 1
}

function handleOptionUpdate(type: string, id: number | undefined) {
  if (id === undefined) {
    delete selectedOptionIds[type]
  } else {
    selectedOptionIds[type] = id
  }
}

function isPositionAvailable(position: string): boolean {
  if (!selectedRimSize.value) return true
  return props.product.variants.some(
    (v) => v.available && v.rimSize === selectedRimSize.value && v.position === position,
  )
}

function priceFormattedForPosition(position: string): string {
  const v = props.product.variants.find(
    (v) => v.available && v.rimSize === selectedRimSize.value && v.position === position,
  )
  return v?.price.formatted ?? ''
}

// ─── Review sections (built for ReviewStep) ──────────────────────────────────

const reviewSections = computed<ReviewSection[]>(() => {
  const sections: ReviewSection[] = []

  // Build Spec
  const specRows: { label: string; value: string }[] = []
  if (selectedVariant.value) {
    specRows.push({ label: 'Product', value: props.product.name })
    specRows.push({ label: 'Position', value: selectedVariant.value.position })
    specRows.push({ label: 'Rim Size', value: selectedVariant.value.rimSize })
  }
  for (const opt of buildSpecOptions.value) {
    const label = selectedOptionLabels.value[opt.type]
    if (label) specRows.push({ label: opt.label, value: label })
  }
  sections.push({ title: 'Build Spec', stepKey: 1, rows: specRows })

  // Graphics
  const gfxRows: { label: string; value: string }[] = []
  for (const opt of graphicsOptions.value) {
    const label = selectedOptionLabels.value[opt.type]
    if (label) gfxRows.push({ label: opt.label, value: label })
  }
  sections.push({ title: 'Graphics', stepKey: 2, rows: gfxRows })

  // Accessories
  const accRows: { label: string; value: string }[] = []
  for (const opt of accessoriesOptions.value) {
    const label = selectedOptionLabels.value[opt.type]
    if (label) accRows.push({ label: opt.label, value: label })
  }
  sections.push({ title: 'Accessories', stepKey: 3, rows: accRows })

  return sections
})

// ─── Defaults on mount ────────────────────────────────────────────────────────

onMounted(() => {
  selectedRimSize.value =
    availableRimSizes.value.find((s) => s.includes('29')) ??
    availableRimSizes.value[0] ??
    ''

  selectedPosition.value =
    availablePositions.value.find((p) => p === 'Complete Wheelset') ??
    availablePositions.value[0] ??
    ''
})

watch(selectedPosition, () => {
  for (const key of Object.keys(selectedOptionIds)) {
    const stillVisible = visibleOptions.value.some((o) => o.type === key)
    if (!stillVisible) delete selectedOptionIds[key]
  }
})

// ─── Cart ─────────────────────────────────────────────────────────────────────

const canAddToCart = computed(
  () => !!selectedVariant.value && allRequiredOptionsSelected.value && !cart.loading.value,
)

async function handleAddToCart() {
  if (!selectedVariant.value) return

  const noVariantValueIds = visibleOptions.value
    .map((o) => selectedOptionIds[o.type])
    .filter((id): id is number => id !== undefined)

  const hasAnyBikeDetail =
    bikeDetails.make?.trim() ||
    bikeDetails.model?.trim() ||
    bikeDetails.year?.trim() ||
    bikeDetails.notes?.trim()

  await cart.addToCart({
    lines: [{
      variantId:         selectedVariant.value.id,
      quantity:          1,
      noVariantValueIds: noVariantValueIds.length ? noVariantValueIds : undefined,
      unitPrice:         totalPrice.value?.amount ?? selectedVariant.value.price.amount,
    }],
    ...(hasAnyBikeDetail ? {
      bikeDetails: {
        make:  bikeDetails.make?.trim()  || undefined,
        model: bikeDetails.model?.trim() || undefined,
        year:  bikeDetails.year?.trim()  || undefined,
        notes: bikeDetails.notes?.trim() || undefined,
      },
    } : {}),
  })
}
</script>
