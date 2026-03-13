import { defineStore } from "pinia";
import i18n from "@/i18n/index.js";

/**
 * UI store — manages dark mode and locale (language/direction).
 */
export const useUiStore = defineStore("ui", {
  state: () => ({
    /** @type {boolean} True = dark mode enabled */
    darkMode: false,
    /** @type {'en'|'ar'} Active locale */
    locale: "en",
  }),

  actions: {
    /**
     * Load persisted settings from localStorage and apply them to the DOM.
     */
    initFromStorage() {
      const savedDark = localStorage.getItem("darkMode");
      const savedLocale = localStorage.getItem("locale") || "en";

      this.darkMode = savedDark === "true";
      this.locale = savedLocale;

      this._applyDark();
      this._applyLocale();
    },

    /**
     * Toggle between dark and light mode.
     */
    toggleDark() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this._applyDark();
    },

    /**
     * Switch the app locale between 'en' and 'ar'.
     * Updates vue-i18n, html[lang], and html[dir].
     * @param {'en'|'ar'} locale
     */
    setLocale(locale) {
      this.locale = locale;
      localStorage.setItem("locale", locale);
      i18n.global.locale.value = locale;
      this._applyLocale();
    },

    /** Apply dark class to <html> */
    _applyDark() {
      if (this.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    /** Apply dir and lang to <html> */
    _applyLocale() {
      const isArabic = this.locale === "ar";
      document.documentElement.setAttribute("lang", this.locale);
      document.documentElement.setAttribute("dir", isArabic ? "rtl" : "ltr");
    },
  },
});
