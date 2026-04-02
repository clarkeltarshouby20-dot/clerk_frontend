import { defineStore } from "pinia";
import api from "@/axios.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    /** @type {object|null} Logged-in user object */
    user: null,
  }),

  getters: {
    /** True if a valid user object exists (implies cookie is likely present) */
    isLoggedIn: (state) => !!state.user,

    /** True only when the user is the platform Owner */
    isOwner: (state) => state.user?.role === "owner",

    /** True for both admin and owner roles */
    isAdmin: (state) =>
      state.user?.role === "admin" || state.user?.role === "owner",
  },

  actions: {
    /**
     * Restore user profile from localStorage on app startup.
     */
    initFromStorage() {
      const raw = localStorage.getItem("user");
      try {
        if (raw && raw !== "undefined") {
          this.user = JSON.parse(raw);
        }
      } catch {
        localStorage.removeItem("user");
      }
    },

    async refreshSession() {
      try {
        const { data } = await api.get("/users/me", {
          skipAuthRedirect: true,
        });
        if (data?.user) {
          this._setSession({ user: data.user });
        }
        return data?.user || null;
      } catch {
        this.user = null;
        localStorage.removeItem("user");
        return null;
      }
    },

    /**
     * Log in with email + password.
     * Token is auto-set by the server in an HttpOnly cookie.
     */
    async login(email, password) {
      const { data } = await api.post("/users/login", { email, password });
      // The backend returns { success, message, user }
      if (data?.user) {
        this._setSession({ user: data.user });
      } else {
        throw new Error("Login failed: Invalid data format from server");
      }
      return data;
    },

    /**
     * Register a new account.
     */
    async register(formData) {
      const { data } = await api.post("/users/register", formData);
      return data;
    },

    /**
     * Clear session data.
     */
    async logout() {
      try {
        await api.post("/users/logout");
      } catch (err) {
        console.warn("Server logout failed, clearing local state anyway.", err);
      } finally {
        this.user = null;
        localStorage.removeItem("user");
      }
    },

    /**
     * Internal helper — save user to state and localStorage.
     * @param {{ user: object }} payload
     */
    _setSession({ user }) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
});
