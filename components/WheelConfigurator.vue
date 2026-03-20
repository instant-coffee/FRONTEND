<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
    <!-- Left — visual / summary panel -->
    <div class="space-y-6">
      <!-- Wheel graphic -->
      <div class="aspect-square bg-nobl-grey-muted rounded-lg flex flex-col items-center justify-center gap-4">
        <svg class="w-48 h-48 text-nobl-grey-border" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="currentColor" stroke-width="8" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="4" />
          <circle cx="100" cy="100" r="12" fill="currentColor" opacity="0.3" />
          <line v-for="n in 12" :key="n"
            :transform="`rotate(${n * 30} 100 100)`"
            x1="100" y1="16" x2="100" y2="40"
            stroke="currentColor" stroke-width="2" stroke-linecap="round"
          />
          <line v-for="n in 12" :key="`b${n}`"
            :transform="`rotate(${n * 30 + 15} 100 100)`"
            x1="100" y1="16" x2="100" y2="40"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"
          />
        </svg>
        <div class="text-center">
          <p class="text-xs font-semibold text-nobl-grey-light uppercase tracking-widest">
            {{ selectedVariant?.rimSize ?? '—' }}
          </p>
          <p class="text-xs text-nobl-grey-light mt-0.5">
            {{ selectedVariant?.position ?? 'Select options' }}
          </p>
        </div>
      </div>

      <!-- Selected configuration summary -->
      <div v-if="selectedVariant" class="border border-nobl-grey-border rounded-lg p-5 space-y-3">
        <p class="nobl-label">Selected configuration</p>
        <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <!-- Variant attributes -->
          <div v-for="(val, key) in selectedVariant.attributes" :key="String(key)">
            <span class="text-nobl-grey-light text-xs">{{ key }}</span>
            <div class="font-medium text-nobl-black mt-0.5">{{ val }}</div>
          </div>
          <!-- Chosen no-variant options -->
          <div v-for="option in visibleOptions" :key="`sel-${option.type}`">
            <span class="text-nobl-grey-light text-xs">{{ option.label }}</span>
            <div class="font-medium text-nobl-black mt-0.5">
              {{ selectedOptionLabels[option.type] || '—' }}
            </div>
          </div>
        </div>
        <div class="pt-2 border-t border-nobl-grey-border">
          <span class="text-xs font-mono text-nobl-grey-light">SKU: {{ selectedVariant.sku || '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Right — controls -->
    <div class="space-y-8">
      <!-- Name + description + price -->
      <div class="border-b border-nobl-grey-border pb-6">
        <h1 class="text-2xl font-bold text-nobl-black">{{ product.name }}</h1>
        <p v-if="product.description" class="text-nobl-grey text-sm mt-2 leading-relaxed max-w-prose">
          {{ stripHtml(product.description) }}
        </p>

        <div class="mt-5">
          <div v-if="selectedVariant" class="flex items-baseline gap-2">
            <span class="nobl-price">{{ totalPrice?.formatted ?? selectedVariant.price.formatted }}</span>
          </div>
          <div v-else class="nobl-price text-nobl-grey-light">
            From {{ minPriceFormatted }}
          </div>
          <p class="nobl-price-note mt-1">
            {{ product.currency }} · Retail price
          </p>
        </div>
      </div>

      <!-- ── Rim Size ── -->
      <div>
        <label for="rim-size" class="nobl-label">Rim Size</label>
        <select id="rim-size" v-model="selectedRimSize" class="nobl-select">
          <option value="" disabled>Select rim size</option>
          <option v-for="size in availableRimSizes" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>

      <!-- ── Wheelset Position ── -->
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
            @click="selectedPosition = pos"
          >
            <div class="text-xs leading-tight whitespace-pre-line">{{ posShortLabel(pos) }}</div>
            <div v-if="selectedRimSize && isPositionAvailable(pos)" class="text-xs mt-1 opacity-70">
              {{ priceFormattedForPosition(pos) }}
            </div>
          </button>
        </div>
      </div>

      <!-- ── No-variant options (freehub, brake, hub width, torque cap, etc.) ── -->
      <template v-for="option in visibleOptions" :key="option.type">
        <div>
          <label :for="`opt-${option.type}`" class="nobl-label">
            {{ option.label }}
            <span v-if="option.required" class="text-red-400 ml-0.5">*</span>
          </label>

          <!-- Checkbox style — single-value options like Torque Caps -->
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
              @change="toggleCheckboxOption(option)"
            />
            <span class="text-sm font-medium flex-1">{{ option.values[0]?.label }}</span>
            <span v-if="option.values[0]?.priceExtra" class="text-sm opacity-80 ml-auto">
              +{{ option.values[0].priceExtra.formatted }}
            </span>
          </label>

          <!-- Dropdown style — multi-value options -->
          <select
            v-else
            :id="`opt-${option.type}`"
            v-model="selectedOptionIds[option.type]"
            class="nobl-select"
          >
            <option :value="undefined" disabled>Select {{ option.label.toLowerCase() }}</option>
            <option
              v-for="val in allowedValuesForOption(option)"
              :key="val.id"
              :value="val.id"
            >
              {{ val.label }}
            </option>
          </select>

          <!-- Constraint notice — shown when values have been filtered -->
          <p
            v-if="activeConstraintNote(option.type)"
            class="text-xs text-amber-600 mt-1.5 flex items-center gap-1"
          >
            <span>⚠</span> {{ activeConstraintNote(option.type) }}
          </p>
          <p v-else-if="option.visibleFor.length && selectedPosition" class="text-xs text-nobl-grey-light mt-1.5">
            Applies to: {{ option.visibleFor.join(', ') }}
          </p>
        </div>
      </template>

      <!-- ── Add to Cart ── -->
      <div class="pt-2 space-y-3">
        <button
          type="button"
          class="nobl-btn-primary w-full"
          :disabled="!canAddToCart"
          @click="handleAddToCart"
        >
          <span v-if="cart.loading.value">Adding…</span>
          <span v-else-if="!selectedVariant">Select a configuration above</span>
          <span v-else-if="!allRequiredOptionsSelected">Choose all required options</span>
          <span v-else>Add to Cart — {{ totalPrice?.formatted ?? selectedVariant.price.formatted }}</span>
        </button>

        <p v-if="cart.error.value" class="text-red-600 text-xs">
          {{ cart.error.value }}
        </p>

        <div
          v-if="cart.lastOrder.value"
          class="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          ✓ Added to order <span class="font-mono">{{ cart.lastOrder.value.orderName }}</span>
        </div>
      </div>

      <!-- ── Add-ons ── -->
      <div v-if="product.addOns?.length" class="pt-4 border-t border-nobl-grey-border">
        <p class="nobl-label mb-3">Optional Add-ons</p>
        <div class="space-y-2">
          <label
            v-for="addon in product.addOns"
            :key="addon.id"
            class="flex items-center justify-between gap-3 p-3 border border-nobl-grey-border rounded cursor-pointer hover:border-nobl-black transition-colors"
          >
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                :value="addon.id"
                v-model="selectedAddonIds"
                class="rounded border-nobl-grey-border"
              />
              <div>
                <span class="text-sm font-medium text-nobl-black">{{ addon.name }}</span>
                <span class="text-xs text-nobl-grey-light ml-2">{{ addon.category }}</span>
              </div>
            </div>
            <span class="text-sm text-nobl-grey whitespace-nowrap">+{{ addon.price.formatted }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, ProductVariant, WheelOption } from '~/types/api'

const props = defineProps<{ product: Product }>()

// Explicit display order for option types.
// torqueCap sits directly under frontHub since it's conditional on that selection.
const OPTION_ORDER: Record<string, number> = {
  frontHub:       1,
  torqueCap:      2,   // sub-option of frontHub (only with 110x15)
  rearHub:        3,
  freehub:        4,
  brakeInterface: 5,
  valveBrand:     6,
  noblCapColour:  7,   // sub-option of valveBrand (only when NOBL selected)
  peatysColour:   8,   // sub-option of valveBrand (only when Peaty's selected)
}

const cart = useCart()

// ─── Selection state ──────────────────────────────────────────────────────────

const selectedRimSize  = ref('')
const selectedPosition = ref('')
// Keyed by option.type → selected PTAV id (number)
const selectedOptionIds = reactive<Record<string, number | undefined>>({})
const selectedAddonIds  = ref<number[]>([])

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

// Map from option.type → selected value label (for summary panel)
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
// Sums the price_extra of every currently-selected visible option (e.g. Torque
// Caps) on top of the selected variant's base price so the displayed total and
// the Add to Cart button always reflect the true cost.

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
//
// Super Boost axle widths are 6-bolt only — they don't accept Centerlock rotors.
//   Front:  110 x 20 mm  (standard Boost is 110 x 15)
//   Rear:   157 x 12 mm  (standard Boost is 148 x 12)
//
// When either is selected we filter the brakeInterface option to exclude any
// value whose label contains "centerlock", and auto-clear the current selection
// if it has become incompatible.

// True when any selected option forces a 6-bolt-only brake interface:
//   - Front hub 110 x 20 (Super Boost front)
//   - Rear hub  157 x 12 (Super Boost rear)
//   - Torque Caps (only compatible with 6-bolt rotors)
const requiresSixBoltBrake = computed<boolean>(() => {
  const frontHub  = props.product.options.find((o) => o.type === 'frontHub')
  const rearHub   = props.product.options.find((o) => o.type === 'rearHub')
  const torqueCap = props.product.options.find((o) => o.type === 'torqueCap')

  const frontLabel = frontHub?.values.find((v) => v.id === selectedOptionIds['frontHub'])?.label ?? ''
  const rearLabel  = rearHub?.values.find((v)  => v.id === selectedOptionIds['rearHub'])?.label  ?? ''
  const hasTorqueCap = !!torqueCap && selectedOptionIds['torqueCap'] !== undefined

  return frontLabel.toLowerCase().includes('x 20') || rearLabel.includes('157') || hasTorqueCap
})

// Returns the set of allowed PTAV IDs for each option type when a constraint
// is active, or null when there is no restriction.
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

// Returns filtered values for a given option, applying any active constraints.
function allowedValuesForOption(option: WheelOption) {
  const allowed = optionRestrictions.value.get(option.type)
  if (!allowed) return option.values
  return option.values.filter((v) => allowed.has(v.id))
}

// Returns a human-readable reason why values are restricted, or null if not.
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

    if (frontLabel.toLowerCase().includes('x 20')) {
      return `${frontLabel} axle requires 6-bolt — Centerlock not compatible`
    }
    if (rearLabel.includes('157')) {
      return `${rearLabel} axle requires 6-bolt — Centerlock not compatible`
    }
    if (hasTorqueCap) {
      return 'Torque Caps require 6-bolt rotor — Centerlock not compatible'
    }
  }
  return null
}

// Auto-clear brake selection when it becomes incompatible.
watch(requiresSixBoltBrake, (active) => {
  if (!active) return
  const allowed = optionRestrictions.value.get('brakeInterface')
  const current = selectedOptionIds['brakeInterface']
  if (allowed && current !== undefined && !allowed.has(current)) {
    delete selectedOptionIds['brakeInterface']
  }
})

// ─── Conditional option visibility ────────────────────────────────────────────
//
// Some options are only relevant when a parent option has a specific value.
// We compute a set of hidden type keys and filter them out of visibleOptions.
// The auto-clear watcher below ensures stale selections are removed when an
// option becomes hidden (e.g. switching valve brand clears the old cap colour).

const hiddenOptionTypes = computed<Set<string>>(() => {
  const hidden = new Set<string>()

  // ── Torque Cap: only available with 110 x 15 front axle ───────────────────
  const frontHub   = props.product.options.find((o) => o.type === 'frontHub')
  const frontLabel = frontHub?.values.find((v) => v.id === selectedOptionIds['frontHub'])?.label ?? ''
  if (!frontLabel || frontLabel.toLowerCase().includes('x 20')) {
    hidden.add('torqueCap')
  }

  // ── Valve cap colour: gated on valve brand selection ──────────────────────
  // Neither sub-selector shows until a valve brand is chosen.
  // Once chosen, only the matching brand's colour selector appears.
  const valveBrandOpt = props.product.options.find((o) => o.type === 'valveBrand')
  const valveLabel    = valveBrandOpt?.values.find((v) => v.id === selectedOptionIds['valveBrand'])?.label ?? ''
  if (!valveLabel.toLowerCase().includes('nobl'))  hidden.add('noblCapColour')
  if (!valveLabel.toLowerCase().includes('peaty')) hidden.add('peatysColour')

  return hidden
})

// Auto-clear selections for options that become hidden
watch(hiddenOptionTypes, (hiddenSet) => {
  for (const type of hiddenSet) {
    if (selectedOptionIds[type] !== undefined) {
      delete selectedOptionIds[type]
    }
  }
})

// ─── Checkbox-style options ───────────────────────────────────────────────────
// Options with a single value (like Torque Caps) are rendered as checkboxes
// rather than dropdowns — checked = that value selected, unchecked = cleared.

function isCheckboxOption(option: WheelOption): boolean {
  return option.values.length === 1
}

function toggleCheckboxOption(option: WheelOption) {
  const val = option.values[0]
  if (!val) return
  if (selectedOptionIds[option.type] === val.id) {
    delete selectedOptionIds[option.type]
  } else {
    selectedOptionIds[option.type] = val.id
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const minPriceFormatted = computed(() => {
  const prices = props.product.variants
    .filter((v) => v.available)
    .map((v) => v.price.amount)
  if (!prices.length) return ''
  const min = Math.min(...prices)
  return props.product.variants.find((v) => v.price.amount === min)?.price.formatted ?? ''
})

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// ─── Defaults on mount ────────────────────────────────────────────────────────

onMounted(() => {
  // Prefer 29" if available, else first rim size
  selectedRimSize.value =
    availableRimSizes.value.find((s) => s.includes('29')) ??
    availableRimSizes.value[0] ??
    ''

  // Prefer Complete Wheelset, else first position
  selectedPosition.value =
    availablePositions.value.find((p) => p === 'Complete Wheelset') ??
    availablePositions.value[0] ??
    ''
})

// Clear hidden options when position changes
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

  // Collect selected PTAV IDs for all visible options
  const noVariantValueIds = visibleOptions.value
    .map((o) => selectedOptionIds[o.type])
    .filter((id): id is number => id !== undefined)

  await cart.addToCart({
    lines: [{
      variantId:         selectedVariant.value.id,
      quantity:          1,
      noVariantValueIds: noVariantValueIds.length ? noVariantValueIds : undefined,
    }],
  })
}
</script>
