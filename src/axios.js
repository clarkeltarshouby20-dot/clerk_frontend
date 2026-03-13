import axios from "axios";

// Create an Axios instance pointing at the Vite proxy (/api → localhost:5000/api)
// NOTE: Do NOT set a default Content-Type here.
// Axios auto-sets "application/json" for plain objects and
// "multipart/form-data; boundary=..." for FormData — setting it
// here would break file uploads (Multer would never see req.file).
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// ── Request interceptor ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // No manual token handling: HttpOnly cookies take care of it automatically
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────
// Handle 401 (token expired / invalid) and 503 (server down) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Remove stale token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    } else if (
      status === 503 ||
      status === 502 ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNREFUSED"
    ) {
      // Backend is down — redirect to the maintenance page
      if (!window.location.pathname.startsWith("/maintenance")) {
        window.location.href = "/maintenance";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
