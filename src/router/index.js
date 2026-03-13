import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

// Lazy-loaded page components for code splitting
const HomePage = () => import("@/pages/HomePage.vue");
const ProductListPage = () => import("@/pages/ProductListPage.vue");
const ProductDetailPage = () => import("@/pages/ProductDetailPage.vue");
const LoginPage = () => import("@/pages/LoginPage.vue");
const RegisterPage = () => import("@/pages/RegisterPage.vue");
const CartPage = () => import("@/pages/CartPage.vue");
const CheckoutPage = () => import("@/pages/CheckoutPage.vue");
const OrdersPage = () => import("@/pages/OrdersPage.vue");
const OrderTracker = () => import("@/pages/OrderTracker.vue");
const ProfilePage = () => import("@/pages/ProfilePage.vue");
const NotFoundPage = () => import("@/pages/NotFoundPage.vue");
const WishlistPage = () => import("@/pages/WishlistPage.vue");
const ContactPage = () => import("@/pages/ContactPage.vue");
const MaintenancePage = () => import("@/pages/MaintenancePage.vue");

// Admin pages
const AdminLayout = () => import("@/layouts/AdminLayout.vue");
const AdminDashboard = () => import("@/pages/admin/DashboardPage.vue");
const AdminProducts = () => import("@/pages/admin/ProductsPage.vue");
const AdminCategories = () => import("@/pages/admin/CategoriesPage.vue");
const AdminOrders = () => import("@/pages/admin/OrdersPage.vue");
const AdminPayments = () => import("@/pages/admin/PaymentsPage.vue");
const AdminSettings = () => import("@/pages/admin/SettingsPage.vue");
const AdminUsers = () => import("@/pages/admin/UsersPage.vue");
const AdminReviews = () => import("@/pages/admin/ReviewsPage.vue");
const AdminMessages = () => import("@/pages/admin/MessagesPage.vue");
const AdminCoupons = () => import("@/pages/admin/CouponsPage.vue");

const routes = [
  // ── Maintenance / Error Boundary ──────────────────────────
  {
    path: "/maintenance",
    name: "maintenance",
    component: MaintenancePage,
  },
  // ── Public routes ─────────────────────────────────────────
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/products",
    name: "products",
    component: ProductListPage,
  },
  {
    path: "/products/:id",
    name: "product-detail",
    component: ProductDetailPage,
  },
  {
    path: "/contact",
    name: "contact",
    component: ContactPage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { guestOnly: true }, // Redirect logged-in users away
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
    meta: { guestOnly: true },
  },

  // ── User-protected routes ─────────────────────────────────
  {
    path: "/cart",
    name: "cart",
    component: CartPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/checkout",
    name: "checkout",
    component: CheckoutPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "orders",
    component: OrdersPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id/track",
    name: "order-tracker",
    component: OrderTracker,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/wishlist",
    name: "wishlist",
    component: WishlistPage,
  },

  // ── Admin routes ──────────────────────────────────────────
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        name: "admin-dashboard",
        component: AdminDashboard,
      },
      {
        path: "products",
        name: "admin-products",
        component: AdminProducts,
      },
      {
        path: "categories",
        name: "admin-categories",
        component: AdminCategories,
      },
      {
        path: "orders",
        name: "admin-orders",
        component: AdminOrders,
      },
      {
        path: "payments",
        name: "admin-payments",
        component: AdminPayments,
      },
      {
        path: "settings",
        name: "admin-settings",
        component: AdminSettings,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: "users",
        name: "admin-users",
        component: AdminUsers,
        // Hard-guarded at route level — only owner role gets through
        meta: { requiresAuth: true, requiresOwner: true },
      },
      {
        path: "reviews",
        name: "admin-reviews",
        component: AdminReviews,
      },
      {
        path: "messages",
        name: "admin-messages",
        component: AdminMessages,
      },
      {
        path: "coupons",
        name: "admin-coupons",
        component: AdminCoupons,
      },
    ],
  },

  // ── Catch-all 404 ─────────────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll to top on each navigation
  scrollBehavior: () => ({ top: 0 }),
});

// ── Navigation guards ─────────────────────────────────────
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  // Route requires authentication
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  // Route requires admin role
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next({ name: "home" });
  }

  // Route requires owner role (strictest guard)
  if (to.meta.requiresOwner && !auth.isOwner) {
    // Admins are redirected to the dashboard; regular users to home
    return next({ name: auth.isAdmin ? "admin-dashboard" : "home" });
  }

  // Route for guests only (e.g., login/register) — redirect logged-in users
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return next({ name: "home" });
  }

  next();
});

export default router;
