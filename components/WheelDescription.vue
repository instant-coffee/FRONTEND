<script setup lang="ts">
// ─────────────────────────────────────────────────────────────────────────────
// WheelDescription — product hero description block
//
// Renders the structured metadata block shown at the top of the configurator:
//
//   E-MTB  |  GRAVITY          ← discipline (optional, pipe-separated)
//   1971 GRAMS                 ← weight (optional)
//   Redefine going big. ...    ← first paragraph from the HTML description
//
// discipline: sourced from product tags (e.g. "discipline:e-mtb|gravity")
// weightGrams: sourced from product tags (e.g. "weight:1971") or custom field
// description: raw HTML from Odoo's description_ecommerce field
// ─────────────────────────────────────────────────────────────────────────────

const props = defineProps<{
  description:  string
  discipline?:  string        // e.g. "E-MTB | GRAVITY"
  weightGrams?: number        // e.g. 1971
}>()

// ── Parse the short description from Odoo HTML ──────────────────────────────
// Odoo's description_ecommerce is an HTML blob like:
//   <div data-oe-version="2.0">First paragraph.<br><br>Second paragraph...</div>
//
// Strategy: strip all tags, collapse whitespace, take text up to the first
// double-newline or ≤120 characters — whichever comes first — to get the
// punchy headline sentence.

const shortDescription = computed(() => {
  if (!props.description) return ''

  // Strip HTML tags cleanly (works in both SSR and CSR contexts)
  const stripped = props.description
    .replace(/<br\s*\/?>/gi, '\n')          // <br> → newline
    .replace(/<\/p>/gi, '\n')               // </p> → newline
    .replace(/<[^>]+>/g, '')               // strip remaining tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()

  // Take everything up to the first double-newline (paragraph break)
  const firstParagraph = (stripped.split(/\n\n+/)[0] ?? '').replace(/\n/g, ' ').trim()
  return firstParagraph
})

// ── Format discipline for display ───────────────────────────────────────────
// "e-mtb|gravity" → "E-MTB | GRAVITY"  (normalises whatever case comes in)
const disciplineDisplay = computed(() => {
  if (!props.discipline) return null
  return props.discipline
    .split('|')
    .map(d => d.trim().toUpperCase())
    .join('  |  ')
})

// ── Format weight ────────────────────────────────────────────────────────────
const weightDisplay = computed(() => {
  if (!props.weightGrams) return null
  return `${props.weightGrams.toLocaleString()} GRAMS`
})
</script>

<template>
  <div class="space-y-2">
    <!-- Discipline + weight meta row -->
    <div
      v-if="disciplineDisplay || weightDisplay"
      class="flex flex-col gap-1"
    >
      <p
        v-if="disciplineDisplay"
        class="text-sm font-bold uppercase tracking-widest text-nobl-black leading-tight"
      >
        {{ disciplineDisplay }}
      </p>
      <p
        v-if="weightDisplay"
        class="text-sm font-bold uppercase tracking-widest text-nobl-black leading-tight"
      >
        {{ weightDisplay }}
      </p>
    </div>

    <!-- Short description -->
    <p
      v-if="shortDescription"
      class="text-sm text-nobl-grey leading-relaxed max-w-prose"
    >
      {{ shortDescription }}
    </p>
  </div>
</template>
