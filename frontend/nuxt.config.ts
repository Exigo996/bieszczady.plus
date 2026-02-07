// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxtjs/i18n", "@vite-pwa/nuxt", "@pinia/nuxt"],

  components: {
    dirs: [
      {
        path: "./components",
        pathPrefix: false,
      },
    ],
  },

  app: {
    head: {
      title: "Bieszczady.plus",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Odkryj atrakcje i wydarzenia w Bieszczadach",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        "https://content.zrobie.jutro.net/api/v1",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
      mapsTileUrl:
        process.env.NUXT_PUBLIC_MAPS_TILE_URL ||
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
  },

  i18n: {
    defaultLocale: "pl",
    locales: [
      { code: "pl", name: "", flag: "🇵🇱", file: "pl.json" },
      { code: "en", name: "", flag: "🇬🇧", file: "en.json" },
      { code: "de", name: "", flag: "🇩🇪", file: "de.json" },
      { code: "uk", name: "", flag: "🇺🇦", file: "uk.json" },
    ],
    strategy: "no_prefix",
    detectBrowserLanguage: false,
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Bieszczady.plus",
      short_name: "Bieszczady",
      description: "Odkryj atrakcje i wydarzenia w Bieszczadach",
      theme_color: "#10b981",
      background_color: "#ffffff",
      display: "standalone",
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },

  css: ["~/assets/css/main.css"],

  vite: {
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // Run manually with `npm run typecheck`
  },
});
