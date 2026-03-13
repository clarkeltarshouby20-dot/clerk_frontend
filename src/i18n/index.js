// i18n — last updated 2026-03-08
import { createI18n } from "vue-i18n";
import en from "./locales/en.js";
import ar from "./locales/ar.js";

// Create i18n instance with English as default locale
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  globalInjection: true, // Inject $t, $locale globally
  locale: localStorage.getItem("locale") || "en",
  fallbackLocale: "en",
  messages: {
    en,
    ar,
  },
});

export default i18n;
