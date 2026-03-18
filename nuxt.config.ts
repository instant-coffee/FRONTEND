// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE env var in production
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api/v1',
      // Default site context header sent with every request
      // Override per-tenant in production via env
      defaultSiteContext: process.env.NUXT_PUBLIC_SITE_CONTEXT || 'nobl_us',
    },
  },

  // Proxy API calls in dev to avoid CORS friction
  nitro: {
    devProxy: {
      '/api/v1': {
        target: 'http://localhost:3000/api/v1',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/v1/, ''),
      },
    },
  },

  tailwindcss: {
    exposeConfig: true,
  },

  typescript: {
    strict: true,
    typeCheck: false, // enable when ready
  },

  compatibilityDate: '2024-09-19',
})