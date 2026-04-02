/**
 * useConversion.js — Marketing Conversion Tracker
 * 
 * Provides functions to fire standard marketing events (Purchase, AddToCart, etc.)
 * primarily for Google Ads and Analytics (gtag.js).
 */
import { useSettingsStore } from "@/stores/settings.js";
import { normalizeCurrencyCode } from "@/composables/useCurrency.js";

export function useConversion() {
  const settingsStore = useSettingsStore();
  /**
   * Fires a 'purchase' event to Google.
   * 
   * @param {Object} order  The order object from the backend
   */
  function trackPurchase(order) {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "purchase", {
      transaction_id: order.id || order.order_id,
      value: parseFloat(order.total_price),
      currency: normalizeCurrencyCode(settingsStore.currencyCode),
      items: (order.items || []).map((item) => ({
        item_id: item.product_id,
        item_name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
      })),
    });
  }

  return { trackPurchase };
}
