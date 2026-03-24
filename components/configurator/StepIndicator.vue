<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────────
// StepIndicator — clickable step pill nav + running price bar
//
// Fully generic — knows nothing about wheel building.
// Parent controls the step state; this component just renders and emits.
// ─────────────────────────────────────────────────────────────────────────────

export interface Step {
  key:   number
  label: string
}

const props = defineProps<{
  steps:        Step[]
  currentStep:  number
  totalPrice?:  string   // formatted price string, e.g. "$3,069.00 CAD"
  currency?:    string   // e.g. "CAD"
}>()

const emit = defineEmits<{
  'update:currentStep': [step: number]
}>()

function isCompleted(stepKey: number): boolean {
  return stepKey < props.currentStep
}
</script>

<template>
  <div class="space-y-4">
    <!-- Step pills -->
    <nav class="flex items-center gap-0 overflow-x-auto" aria-label="Configurator steps">
      <template v-for="(step, i) in steps" :key="step.key">
        <!-- Connector line (between pills) -->
        <div v-if="i > 0" class="w-6 sm:w-10 h-0.5 bg-nobl-grey-border flex-shrink-0" />

        <button
          type="button"
          :aria-current="step.key === currentStep ? 'step' : undefined"
          class="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150"
          :class="[
            step.key === currentStep
              ? 'bg-nobl-black text-white'
              : isCompleted(step.key)
                ? 'bg-nobl-grey-muted text-nobl-black hover:bg-gray-200'
                : 'bg-nobl-grey-muted text-nobl-grey-light hover:bg-gray-200 hover:text-nobl-grey',
          ]"
          @click="emit('update:currentStep', step.key)"
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            :class="[
              step.key === currentStep
                ? 'bg-white/20'
                : isCompleted(step.key)
                  ? 'bg-nobl-black/10'
                  : 'bg-black/5 text-nobl-grey-light',
            ]"
          >
            <!-- Checkmark for completed steps -->
            <svg v-if="isCompleted(step.key)" class="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else>{{ step.key }}</span>
          </span>
          {{ step.label }}
        </button>
      </template>
    </nav>

    <!-- Running price bar -->
    <div
      v-if="totalPrice"
      class="flex items-center justify-between px-5 py-3 bg-nobl-grey-muted rounded-lg"
    >
      <span class="text-xs font-medium text-nobl-grey-light uppercase tracking-wider">
        Running total
      </span>
      <span class="text-lg font-bold text-nobl-black">
        {{ totalPrice }}
      </span>
    </div>
  </div>
</template>
