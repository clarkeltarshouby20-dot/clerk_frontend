/**
 * settings.js — Global Site Settings Pinia Store
 *
 * Fetches GET /api/settings once per session (guarded by `isLoaded`).
 * Exposes computed accessors for commonly used fields so any component
 * can read them reactively without digging into `data` directly.
 *
 * updateSettings(payload) sends a partial PUT /api/settings and immediately
 * syncs the store state from the full response.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/axios.js";

export const useSettingsStore = defineStore("settings", () => {
  /** Raw settings object as returned by the API */
  const data = ref({});

  /** Prevents duplicate network calls across hot-reloads / route changes */
  const isLoaded = ref(false);

  /** True while a fetch or save is in-flight */
  const loading = ref(false);

  // ── Convenience computed accessors ─────────────────────────────────────────

  const siteName = computed(() => data.value.site_name || "ShopWave");
  const logoUrl = computed(() => data.value.logo_url || null);
  const faviconUrl = computed(() => data.value.favicon_url || null);
  
  const currencyCode = computed(() => data.value.currency_code || "USD");
  const contactEmail = computed(() => data.value.contact_email || "");
  const whatsappNumber = computed(() => data.value.whatsapp_number || "");
  const googleAnalyticsId = computed(
    () => data.value.google_analytics_id || "",
  );
  const googleAdsClientId = computed(
    () => data.value.google_ads_client_id || "",
  );
  const headerScripts = computed(() => data.value.header_scripts || "");
  const footerScripts = computed(() => data.value.footer_scripts || "");
  
  const socialFacebook = computed(() => data.value.social_facebook || "");
  const socialX = computed(() => data.value.social_x || "");
  const socialTelegram = computed(() => data.value.social_telegram || "");
  const socialGmail = computed(() => data.value.social_gmail || "");
  const socialWhatsapp = computed(() => data.value.social_whatsapp || "");

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch settings from the public endpoint.
   * Safe to call multiple times — after the first successful load it becomes
   * a no-op unless `force` is true.
   *
   * @param {boolean} [force=false] Re-fetch even if already loaded
   */
  async function fetchSettings(force = false) {
    if (isLoaded.value && !force) return;
    loading.value = true;
    try {
      const { data: res } = await api.get("/settings");
      data.value = res.data || {};
      isLoaded.value = true;
    } catch (err) {
      console.warn("[settings] Failed to load site settings:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Partially update settings on the server.
   * Accepts any subset of the settings fields.
   * On success, syncs the full returned row back into the store.
   *
   * @param {object} payload  Fields to update (any subset)
   * @returns {Promise<object>}  Updated settings data
   */
  async function updateSettings(payload) {
    loading.value = true;
    try {
      const { data: res } = await api.put("/settings", payload);
      // Sync full returned row so all accessors update immediately
      data.value = res.data || {};
      return res.data;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    data,
    isLoaded,
    loading,

    // Computed accessors
    siteName,
    logoUrl,
    faviconUrl,
    currencyCode,
    contactEmail,
    whatsappNumber,
    googleAnalyticsId,
    googleAdsClientId,
    headerScripts,
    footerScripts,
    socialFacebook,
    socialX,
    socialTelegram,
    socialGmail,
    socialWhatsapp,

    // Actions
    fetchSettings,
    updateSettings,
  };
});
