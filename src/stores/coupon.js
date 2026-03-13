import { defineStore } from "pinia";
import api from "@/axios.js";

export const useCouponStore = defineStore("coupons", {
  state: () => ({
    coupons: [],
    loading: false,
    activeCoupon: null, // Applied coupon during checkout
  }),

  actions: {
    async fetchAllCoupons() {
      this.loading = true;
      try {
        const { data } = await api.get("/coupons");
        this.coupons = data.data;
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        this.loading = false;
      }
    },

    async createCoupon(payload) {
      const { data } = await api.post("/coupons", payload);
      await this.fetchAllCoupons();
      return data;
    },

    async updateCoupon(id, payload) {
      const { data } = await api.patch(`/coupons/${id}`, payload);
      await this.fetchAllCoupons();
      return data;
    },

    async deleteCoupon(id) {
      const { data } = await api.delete(`/coupons/${id}`);
      await this.fetchAllCoupons();
      return data;
    },

    async validateCoupon(code, subtotal) {
      try {
        const { data } = await api.post("/coupons/validate", { code, subtotal });
        this.activeCoupon = data.data;
        return data;
      } catch (error) {
        this.activeCoupon = null;
        throw error;
      }
    },

    clearActiveCoupon() {
      this.activeCoupon = null;
    }
  }
});
