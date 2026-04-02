import { defineStore } from "pinia";

/**
 * Cart store — persists to localStorage so cart survives page refresh.
 * Cart items are stored locally; the actual order is created via API on checkout.
 */
export const useCartStore = defineStore("cart", {
  state: () => ({
    /** @type {Array<{ id, cart_key, variant_id, selected_size, selected_color_name, selected_color_value, selected_image, name, name_ar, price, main_image, quantity, stock }>} */
    items: JSON.parse(localStorage.getItem("cart") || "[]"),
  }),

  getters: {
    // Total number of items (sum of quantities)
    itemCount: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),

    // Total order price
    total: (state) =>
      state.items.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0,
      ),
  },

  actions: {
    /**
     * Add a product to the cart (or increase quantity if already present).
     * @param {object} product - Full product object from the API
     * @param {number} [qty=1] - Quantity to add
     */
    addItem(product, qty = 1) {
      const cartKey = `${product.id}:${product.variant_id || "base"}`;
      const existing = this.items.find((item) => item.cart_key === cartKey);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, product.stock);
      } else {
        this.items.push({
          id: product.id,
          cart_key: cartKey,
          variant_id: product.variant_id || null,
          selected_size: product.selected_size || null,
          selected_color_name: product.selected_color_name || null,
          selected_color_value: product.selected_color_value || null,
          selected_image: product.selected_image || "",
          name: product.name,
          name_ar: product.name_ar,
          price: product.price,
          main_image:
            product.main_image || product.images?.[0]?.image_url || "",
          quantity: qty,
          stock: product.stock,
        });
      }
      this._persist();
    },

    /**
     * Set the exact quantity of a cart item (used by the qty input).
     * @param {string} cartKey
     * @param {number} quantity
     */
    updateQty(cartKey, quantity) {
      const item = this.items.find((entry) => entry.cart_key === cartKey);
      if (!item) return;
      if (quantity <= 0) {
        this.removeItem(cartKey);
      } else {
        item.quantity = Math.min(quantity, item.stock);
        this._persist();
      }
    },

    /**
     * Remove an item by product ID.
     * @param {string} cartKey
     */
    removeItem(cartKey) {
      this.items = this.items.filter((item) => item.cart_key !== cartKey);
      this._persist();
    },

    /**
     * Empty the entire cart (called after order is placed).
     */
    clearCart() {
      this.items = [];
      this._persist();
    },

    /** Sync state to localStorage */
    _persist() {
      localStorage.setItem("cart", JSON.stringify(this.items));
    },
  },
});
