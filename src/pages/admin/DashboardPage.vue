<template>
  <div class="space-y-8">
    <h2
      class="text-xl sm:text-2xl font-extrabold text-textPrimary tracking-tight"
    >
      {{ $t("admin.dashboard") }}
    </h2>

    <!-- ── Visual Analytics ───────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      <!-- Skeleton placeholders while loading -->
      <template v-if="loading">
        <div
          v-for="n in auth.isOwner ? 6 : 5"
          :key="n"
          class="card p-6 flex flex-col gap-4"
        >
          <div class="flex items-center justify-between">
            <div class="bg-borderThin h-4 w-1/3 rounded animate-pulse" />
            <div class="bg-borderThin w-10 h-10 rounded-2xl animate-pulse" />
          </div>
          <div class="bg-borderThin h-8 w-1/2 rounded mt-2 animate-pulse" />
          <div class="mt-4 flex items-end gap-1.5 h-10 opacity-50">
            <div
              v-for="i in 12"
              :key="i"
              class="flex-1 bg-borderThin rounded-t-sm animate-pulse"
              :style="{ height: `${Math.floor(Math.random() * 60) + 20}%` }"
            />
          </div>
        </div>
      </template>

      <!-- Stat cards with Sparklines -->
      <template v-else>
        <div
          v-for="stat in visibleStats"
          :key="stat.key"
          class="card p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-surface"
        >
          <div class="relative z-10 flex items-start justify-between">
            <div>
              <p
                class="text-xs font-extrabold uppercase tracking-widest text-textSecondary mb-3 drop-shadow-sm"
              >
                {{ $t(stat.label) }}
              </p>
              <p class="text-3xl font-black text-textPrimary tracking-tight">
                {{ stat.value }}
              </p>
            </div>
            <div
              :class="[
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm',
                stat.iconBg,
              ]"
            >
              <component :is="stat.icon" :class="['w-6 h-6', stat.iconColor]" />
            </div>
          </div>

          <!-- Decorative Sparkline -->
          <div
            class="relative z-10 mt-6 h-12 flex items-end justify-between gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div
              v-for="bar in stat.sparkline"
              :key="bar.id"
              class="flex-1 rounded-t-md transition-all duration-500 ease-out origin-bottom"
              :class="[
                stat.iconBg,
                'group-hover:brightness-110',
                stat.neonGlowClass,
              ]"
              :style="{ height: `${bar.height}%` }"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- ── Recent Orders Table ──────────────────────────────── -->
    <div class="card overflow-hidden bg-surface border-none shadow-sm">
      <div
          class="px-6 py-5 border-b border-borderThin flex items-center justify-between bg-background/60"
      >
        <h3 class="font-extrabold text-lg text-textPrimary">
          {{ $t("admin.recentOrders") }}
        </h3>
        <RouterLink
          to="/admin/orders"
          class="text-xs text-primary-700 dark:text-primary-300 font-bold uppercase tracking-widest hover:text-primary-500 transition-colors"
        >
          {{ $t("common.viewAll") }}
        </RouterLink>
      </div>

      <div class="overflow-x-auto subtle-scrollbar">
        <!-- Skeleton rows while loading -->
        <table
          v-if="loading"
          class="w-full text-left text-sm text-textSecondary"
        >
          <tbody>
            <tr v-for="n in 5" :key="n" class="border-b border-borderThin">
              <td v-for="c in 6" :key="c" class="p-4">
                <div class="bg-borderThin h-3 w-full rounded animate-pulse" />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Actual table -->
        <table v-else class="w-full text-left text-sm text-textSecondary">
          <thead
            class="text-xs uppercase bg-background font-extrabold tracking-wider text-textSecondary border-b border-borderThin"
          >
            <tr>
              <th class="px-6 py-4">#</th>
              <th class="px-6 py-4">{{ $t("admin.users.name") }}</th>
              <th class="px-6 py-4">{{ $t("orders.orderStatus") }}</th>
              <th class="px-6 py-4">{{ $t("orders.paymentStatus") }}</th>
              <th class="px-6 py-4">{{ $t("common.total") }}</th>
              <th class="px-6 py-4">{{ $t("orders.orderDate") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentOrders.length === 0">
              <td
                colspan="6"
                class="text-center py-16 text-textSecondary font-bold"
              >
                <div
                  class="w-16 h-16 rounded-full bg-background flex justify-center items-center mx-auto mb-4"
                >
                  <ShoppingBag class="w-8 h-8 text-textSecondary/50" />
                </div>
                {{ $t("common.noResults") }}
              </td>
            </tr>
            <tr
              v-for="(order, idx) in recentOrders"
              :key="order.id"
              class="border-b border-borderThin hover:bg-background/50 transition-colors"
            >
              <td class="px-6 py-4 font-mono text-xs font-bold">
                {{ idx + 1 }}
              </td>
              <td class="px-6 py-4 font-bold text-textPrimary">
                {{ order.name || order.email }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    statusClass(order.status),
                    'badge px-3 py-1 font-bold text-xs capitalize',
                  ]"
                >
                  {{ $t(`orders.status.${order.status}`, order.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    paymentClass(order.payment_status),
                    'badge px-3 py-1 font-bold text-xs capitalize',
                  ]"
                >
                  {{ order.payment_status?.replace(/_/g, " ") }}
                </span>
              </td>
              <td class="px-6 py-4 font-black text-textPrimary">
                {{ formatCurrency(Number(order.total_price)) }}
              </td>
              <td
                class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-textSecondary/70"
              >
                {{ new Date(order.created_at).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  BarChart2,
  ShoppingBag,
  CreditCard,
  Package,
  Users,
  Wallet,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth.js";
import { useCurrency } from "@/composables/useCurrency.js";
import api from "@/axios.js";

const { t } = useI18n();
const showToast = inject("showToast");
const auth = useAuthStore();
const { formatCurrency } = useCurrency();

const loading = ref(true);
const recentOrders = ref([]);
const totals = ref({
  orders: 0,
  revenue: 0,
  netProfit: 0,
  pending: 0,
  products: 0,
  users: 0,
});

const buildSparkline = (seed) =>
  Array.from({ length: 10 }, (_, i) => ({
    id: i,
    height: 26 + ((Math.max(8, Number(seed || 0)) + i * 11) % 54),
  }));

const allStats = computed(() => [
  {
    key: "orders",
    label: "admin.totalOrders",
    value: totals.value.orders,
    icon: ShoppingBag,
    iconBg: "bg-primary-100 dark:bg-primary-900/30",
    iconColor: "text-primary-700 dark:text-primary-300",
    neonGlowClass: "group-hover:bg-primary-200 dark:group-hover:bg-primary-800",
    sparkline: buildSparkline(totals.value.orders),
  },
  {
    key: "revenue",
    label: "admin.totalRevenue",
    value: formatCurrency(totals.value.revenue, { minimumFractionDigits: 0 }),
    icon: BarChart2,
    iconBg: "bg-[#efe3ce] dark:bg-[#4d3c2e]",
    iconColor: "text-[#8d6431] dark:text-[#e5c493]",
    neonGlowClass: "group-hover:bg-[#e2cbab] dark:group-hover:bg-[#6b5139]",
    sparkline: buildSparkline(totals.value.revenue),
  },
  {
    key: "netProfit",
    label: "admin.totalNetProfit",
    value: formatCurrency(totals.value.netProfit, { minimumFractionDigits: 0 }),
    icon: Wallet,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    neonGlowClass:
      "group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
    sparkline: buildSparkline(totals.value.netProfit),
  },
  {
    key: "pending",
    label: "admin.pendingPayments",
    value: totals.value.pending,
    icon: CreditCard,
    iconBg: "bg-[#f1dcc0] dark:bg-[#574028]",
    iconColor: "text-[#8a5b20] dark:text-[#e3bc79]",
    neonGlowClass: "group-hover:bg-[#e3c091] dark:group-hover:bg-[#73532f]",
    sparkline: buildSparkline(totals.value.pending),
  },
  {
    key: "products",
    label: "admin.totalProducts",
    value: totals.value.products,
    icon: Package,
    iconBg: "bg-[#e7d6bd] dark:bg-[#463628]",
    iconColor: "text-[#7a5630] dark:text-[#d8bd95]",
    neonGlowClass: "group-hover:bg-[#dcc2a1] dark:group-hover:bg-[#624730]",
    sparkline: buildSparkline(totals.value.products),
  },
  {
    key: "users",
    label: "admin.totalUsers",
    value: totals.value.users,
    icon: Users,
    iconBg: "bg-[#f3e7d3] dark:bg-[#514032]",
    iconColor: "text-[#8b6947] dark:text-[#ebd4b2]",
    neonGlowClass: "group-hover:bg-[#e7d4bc] dark:group-hover:bg-[#6d5641]",
    sparkline: buildSparkline(totals.value.users),
    ownerOnly: true,
  },
]);

const visibleStats = computed(() =>
  allStats.value.filter((s) => !s.ownerOnly || auth.isOwner),
);

// ── Badge helpers ───────────────────────────────────────────────
function statusClass(s) {
  return s === "completed" || s === "delivered"
    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
    : s === "returned"
      ? "bg-[#efe5d2] text-[#8f6f41] dark:bg-[#4d3f2f] dark:text-[#e6c99b]"
    : s === "cancelled"
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : "bg-[#efe3ce] text-[#8d6431] dark:bg-[#4d3c2e] dark:text-[#e5c493]";
}
function paymentClass(s) {
  return s === "paid"
    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
    : s === "pending_verification"
      ? "bg-[#e9ddc8] text-[#75522a] dark:bg-[#4f3b2b] dark:text-[#e5c493]"
      : "bg-[#ede3d3] text-[#755d44] dark:bg-[#433326] dark:text-[#d4b897]";
}

// ── Fetch all dashboard data in parallel ────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get("/dashboard/stats");
    const stats = data.data || {};

    recentOrders.value = stats.recent_orders || [];
    totals.value.orders = Number(stats.total_orders || 0);
    totals.value.revenue = Number(stats.delivered_revenue || 0);
    totals.value.netProfit = Number(stats.delivered_net_profit || 0);
    totals.value.products = Number(stats.total_products || 0);
    totals.value.pending = Number(stats.pending_payments || 0);
    totals.value.users = Number(stats.total_users || 0);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
});
</script>
