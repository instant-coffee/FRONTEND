<template>
  <div>
    <!-- Top nav -->
    <header class="border-b border-nobl-grey-border bg-white sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="font-bold text-lg tracking-tight text-nobl-black">NOBL</span>
          <span class="text-xs text-nobl-grey-light font-medium uppercase tracking-widest mt-0.5">Wheels</span>
        </NuxtLink>

        <!-- Site context switcher (dev helper) -->
        <div class="flex items-center gap-3">
          <span class="text-xs text-nobl-grey-light">Site context:</span>
          <select
            v-model="siteContext"
            class="text-xs border border-nobl-grey-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-nobl-blue"
          >
            <option value="nobl_us">nobl_us (USD)</option>
            <option value="nobl_ca">nobl_ca (CAD)</option>
            <option value="wb_us">wb_us (USD)</option>
            <option value="wb_ca">wb_ca (CAD)</option>
          </select>
        </div>
      </div>
    </header>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Provide site context globally so all pages / composables can read it
const siteContext = useState('siteContext', () => {
  const config = useRuntimeConfig()
  return config.public.defaultSiteContext as string
})
</script>
