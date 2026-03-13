import { watch } from "vue";
import { useSettingsStore } from "@/stores/settings.js";

/**
 * useSEO.js — Dynamic Meta Tag Manager
 * 
 * Provides a simple function to update document title and meta description.
 * It automatically appends the Site Name from settings to the title.
 * 
 * Usage:
 *   const { setMeta } = useSEO()
 *   setMeta("Product Name", "Product description specifically for SEO...")
 */
export function useSEO() {
  const settingsStore = useSettingsStore();

  function setMeta(title, description = "") {
    // ── Update Title ──────────────────────────────────────────
    const siteName = settingsStore.siteName || "ShopWave";
    const finalTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = finalTitle;

    // ── Update Meta Description ────────────────────────────────
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }
    
    // ── OpenGraph Tags (Optional but recommended) ─────────────
    const setOG = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (title) setOG("og:title", finalTitle);
    if (description) setOG("og:description", description);
    setOG("og:site_name", siteName);
  }

  return { setMeta };
}
