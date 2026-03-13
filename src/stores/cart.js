import { defineStore } from "pinia";

/**
 * Cart store — persists to localStorage so cart survives page refresh.
 * Cart items are stored locally; the actual order is created via API on checkout.
 */
export const useCartStore = defineStore("cart", {
  state: () => ({
    /** @type {Array<{ id, name, name_ar, price, main_image, quantity, stock }>} */
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
      const existing = this.items.find((i) => i.id === product.id);
      if (existing) {
        // Respect stock limit
        existing.quantity = Math.min(existing.quantity + qty, product.stock);
      } else {
        this.items.push({
          id: product.id,
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
     * @param {number} productId
     * @param {number} quantity
     */
    updateQty(productId, quantity) {
      const item = this.items.find((i) => i.id === productId);
      if (!item) return;
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = Math.min(quantity, item.stock);
        this._persist();
      }
    },

    /**
     * Remove an item by product ID.
     * @param {number} productId
     */
    removeItem(productId) {
      this.items = this.items.filter((i) => i.id !== productId);
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
