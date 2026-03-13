import { defineStore } from "pinia";
import api from "@/axios.js";
import { useAuthStore } from "./auth.js";

export const useWishlistStore = defineStore("wishlist", {
  state: () => ({
    items: [],
    wishlistIds: [],
    loading: false,
    error: null,
  }),

  getters: {
    isInWishlist: (state) => (productId) => {
      return state.wishlistIds.includes(Number(productId));
    },
    count: (state) => state.items.length,
  },

  actions: {
    async fetchWishlist() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      this.loading = true;
      try {
        const { data } = await api.get("/wishlist");
        this.items = data.data;
        this.wishlistIds = this.items.map((item) => item.id);
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to fetch wishlist";
      } finally {
        this.loading = false;
      }
    },

    async fetchWishlistIds() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) return;

      try {
        const { data } = await api.get("/wishlist/ids");
        this.wishlistIds = data.ids.map(Number);
      } catch (err) {
        console.error("Failed to fetch wishlist IDs", err);
      }
    },

    async toggleWishlist(product) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) {
        // Handle redirect or toast in components
        throw new Error("unauthenticated");
      }

      const productId = Number(product.id);
      const exists = this.isInWishlist(productId);

      try {
        if (exists) {
          await api.delete(`/wishlist/${productId}`);
          this.wishlistIds = this.wishlistIds.filter((id) => id !== productId);
          this.items = this.items.filter((item) => item.id !== productId);
        } else {
          await api.post("/wishlist", { product_id: productId });
          this.wishlistIds.push(productId);
          // If we are on the wishlist page, we'd want the full item. 
          // For now, partial reload or let the caller handle it.
        }
        return !exists; // Returns true if added, false if removed
      } catch (err) {
        console.error("Wishlist toggle error", err);
        throw err;
      }
    },

    clearWishlist() {
      this.items = [];
      this.wishlistIds = [];
    },
  },
});
