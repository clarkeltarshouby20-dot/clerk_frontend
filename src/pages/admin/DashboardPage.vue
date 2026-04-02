<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-textPrimary tracking-tight">
          {{ $t("admin.dashboard") }}
        </h2>
        <p class="mt-2 text-sm font-medium text-textSecondary">
          {{ activeRangeLabel }}
        </p>
      </div>

      <section
        class="w-full max-w-4xl rounded-[2rem] border border-borderThin bg-surface/95 p-4 shadow-[0_20px_50px_-35px_rgba(95,67,38,0.45)] backdrop-blur"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in filterModes"
              :key="option.value"
              type="button"
              class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition-all duration-200"
              :class="
                filterMode === option.value
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-background text-textSecondary hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20'
              "
              @click="setFilterMode(option.value)"
            >
              <component :is="option.icon" class="h-4 w-4" />
              <span>{{ $t(option.label) }}</span>
            </button>
          </div>

          <div
            class="grid gap-4 rounded-[1.6rem] border border-borderThin bg-background/80 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-primary-600 dark:bg-primary-900/20 dark:text-primary-300"
                >
                  <CalendarRange class="h-3.5 w-3.5" />
                  {{ $t("admin.filters.panelTitle") }}
                </span>
                <span
                  class="inline-flex rounded-full bg-surface px-3 py-1 text-xs font-bold text-textSecondary"
                >
                  {{ activeModeLabel }}
                </span>
              </div>

              <div v-if="filterMode === 'all'" class="rounded-2xl bg-surface px-4 py-4">
                <p class="text-sm font-bold text-textPrimary">
                  {{ $t("admin.filters.allTimeDescription") }}
                </p>
              </div>

              <div v-else class="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
                <label class="space-y-2">
                  <span class="text-[11px] font-black uppercase tracking-[0.18em] text-textSecondary">
                    {{ detailFieldLabel }}
                  </span>
                  <input
                    :key="filterMode"
                    :type="detailInputType"
                    v-model="filterValue"
                    :min="detailInputMin"
                    :max="detailInputMax"
                    :step="detailInputStep"
                    class="form-input text-sm font-bold"
                  />
                </label>

                <div class="rounded-2xl bg-surface px-4 py-4">
                  <p class="text-[11px] font-black uppercase tracking-[0.18em] text-textSecondary">
                    {{ $t("admin.filters.selectedRange") }}
                  </p>
                  <p class="mt-2 text-sm font-bold text-textPrimary">
                    {{ activeRangeLabel }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 md:min-w-[156px]">
              <button
                type="button"
                class="btn-primary justify-center"
                :disabled="loading"
                @click="fetchDashboardStats"
              >
                <RefreshCcw class="h-4 w-4" />
                <span>{{ $t("admin.filters.apply") }}</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-2xl border border-borderThin bg-background px-4 py-3 text-sm font-bold text-textSecondary transition-colors hover:text-textPrimary"
                @click="resetFilters"
              >
                <RotateCcw class="h-4 w-4" />
                <span>{{ $t("admin.filters.reset") }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6">
      <template v-if="loading">
        <div
          v-for="n in auth.isOwner ? 7 : 6"
          :key="n"
          class="card flex flex-col gap-4 p-6"
        >
          <div class="flex items-center justify-between">
            <div class="h-4 w-1/3 animate-pulse rounded bg-borderThin" />
            <div class="h-10 w-10 animate-pulse rounded-2xl bg-borderThin" />
          </div>
          <div class="mt-2 h-8 w-1/2 animate-pulse rounded bg-borderThin" />
          <div class="mt-4 flex h-10 items-end gap-1.5 opacity-50">
            <div
              v-for="i in 12"
              :key="i"
              class="flex-1 animate-pulse rounded-t-sm bg-borderThin"
              :style="{ height: `${Math.floor(Math.random() * 60) + 20}%` }"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="stat in visibleStats"
          :key="stat.key"
          class="card group relative overflow-hidden border-none bg-surface p-6 transition-all duration-300 hover:shadow-lg"
        >
          <div class="relative z-10 flex items-start justify-between">
            <div>
              <p class="mb-3 text-xs font-extrabold uppercase tracking-widest text-textSecondary drop-shadow-sm">
                {{ $t(stat.label) }}
              </p>
              <p class="text-3xl font-black tracking-tight text-textPrimary">
                {{ stat.value }}
              </p>
            </div>
            <div
              :class="[
                'flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-500 group-hover:scale-110',
                stat.iconBg,
              ]"
            >
              <component :is="stat.icon" :class="['h-6 w-6', stat.iconColor]" />
            </div>
          </div>

          <div class="relative z-10 mt-6 flex h-12 items-end justify-between gap-1 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
            <div
              v-for="bar in stat.sparkline"
              :key="bar.id"
              class="origin-bottom flex-1 rounded-t-md transition-all duration-500 ease-out"
              :class="[stat.iconBg, 'group-hover:brightness-110', stat.neonGlowClass]"
              :style="{ height: `${bar.height}%` }"
            />
          </div>
        </div>
      </template>
    </div>

    <div class="card overflow-hidden border-none bg-surface shadow-sm">
      <div class="flex items-center justify-between border-b border-borderThin bg-background/60 px-6 py-5">
        <div>
          <h3 class="text-lg font-extrabold text-textPrimary">
            {{ $t("admin.recentOrders") }}
          </h3>
          <p class="mt-1 text-xs font-bold uppercase tracking-widest text-textSecondary">
            {{ activeRangeLabel }}
          </p>
        </div>
        <RouterLink
          to="/admin/orders"
          class="text-xs font-bold uppercase tracking-widest text-primary-700 transition-colors hover:text-primary-500 dark:text-primary-300"
        >
          {{ $t("common.viewAll") }}
        </RouterLink>
      </div>

      <div class="overflow-x-auto subtle-scrollbar">
        <table v-if="loading" class="w-full text-left text-sm text-textSecondary">
          <tbody>
            <tr v-for="n in 5" :key="n" class="border-b border-borderThin">
              <td v-for="c in 6" :key="c" class="p-4">
                <div class="h-3 w-full animate-pulse rounded bg-borderThin" />
              </td>
            </tr>
          </tbody>
        </table>

        <table v-else class="w-full text-left text-sm text-textSecondary">
          <thead class="border-b border-borderThin bg-background text-xs font-extrabold uppercase tracking-wider text-textSecondary">
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
              <td colspan="6" class="py-16 text-center font-bold text-textSecondary">
                <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background">
                  <ShoppingBag class="h-8 w-8 text-textSecondary/50" />
                </div>
                {{ $t("common.noResults") }}
              </td>
            </tr>
            <tr
              v-for="(order, idx) in recentOrders"
              :key="order.id"
              class="border-b border-borderThin transition-colors hover:bg-background/50"
            >
              <td class="px-6 py-4 font-mono text-xs font-bold">
                {{ idx + 1 }}
              </td>
              <td class="px-6 py-4 font-bold text-textPrimary">
                {{ order.name || order.email }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[statusClass(order.status), 'badge px-3 py-1 text-xs font-bold capitalize']"
                >
                  {{ $t(`orders.status.${order.status}`, order.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[paymentClass(order.payment_status), 'badge px-3 py-1 text-xs font-bold capitalize']"
                >
                  {{ order.payment_status?.replace(/_/g, " ") }}
                </span>
              </td>
              <td class="px-6 py-4 font-black text-textPrimary">
                {{ formatCurrency(Number(order.total_price)) }}
              </td>
              <td class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-textSecondary/70">
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
import { computed, inject, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  BarChart2,
  Calendar,
  CalendarDays,
  CalendarRange,
  CreditCard,
  Package,
  RefreshCcw,
  RotateCcw,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth.js";
import { useCurrency } from "@/composables/useCurrency.js";
import api from "@/axios.js";

const { t, locale } = useI18n();
const showToast = inject("showToast");
const auth = useAuthStore();
const { formatCurrency } = useCurrency();

const loading = ref(true);
const recentOrders = ref([]);
const totals = ref({
  orders: 0,
  revenue: 0,
  netProfit: 0,
  returns: 0,
  pending: 0,
  products: 0,
  users: 0,
});

const filterMode = ref("all");
const filterValue = ref("");

const filterModes = [
  { value: "all", label: "admin.filters.allTime", icon: CalendarRange },
  { value: "day", label: "admin.filters.byDay", icon: CalendarDays },
  { value: "week", label: "admin.filters.byWeek", icon: CalendarRange },
  { value: "month", label: "admin.filters.byMonth", icon: Calendar },
  { value: "year", label: "admin.filters.byYear", icon: Calendar },
];

const currentYear = new Date().getFullYear();

const activeModeLabel = computed(() => {
  const selected = filterModes.find((item) => item.value === filterMode.value);
  return selected ? t(selected.label) : "";
});

const detailInputType = computed(() => {
  if (filterMode.value === "day") return "date";
  if (filterMode.value === "week") return "week";
  if (filterMode.value === "month") return "month";
  if (filterMode.value === "year") return "number";
  return "text";
});

const detailInputMin = computed(() =>
  filterMode.value === "year" ? "2020" : undefined,
);

const detailInputMax = computed(() =>
  filterMode.value === "year" ? String(currentYear + 10) : undefined,
);

const detailInputStep = computed(() =>
  filterMode.value === "year" ? "1" : undefined,
);

const detailFieldLabel = computed(() => {
  if (filterMode.value === "day") return t("admin.filters.dayLabel");
  if (filterMode.value === "week") return t("admin.filters.weekLabel");
  if (filterMode.value === "month") return t("admin.filters.monthLabel");
  if (filterMode.value === "year") return t("admin.filters.yearLabel");
  return "";
});

const activeRangeLabel = computed(() => describeRange());

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
    neonGlowClass: "group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800",
    sparkline: buildSparkline(totals.value.netProfit),
  },
  {
    key: "returns",
    label: "admin.totalReturns",
    value: totals.value.returns,
    icon: RotateCcw,
    iconBg: "bg-[#f2e6d4] dark:bg-[#4e3f30]",
    iconColor: "text-[#8b6739] dark:text-[#ebcf9e]",
    neonGlowClass: "group-hover:bg-[#e5cfaa] dark:group-hover:bg-[#69533b]",
    sparkline: buildSparkline(totals.value.returns),
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
  allStats.value.filter((stat) => !stat.ownerOnly || auth.isOwner),
);

function pad(value) {
  return String(value).padStart(2, "0");
}

function getCurrentWeekValue(date = new Date()) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNumber = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3);
  const weekNumber =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
  return `${target.getFullYear()}-W${pad(weekNumber)}`;
}

function setDefaultFilterValue(mode) {
  const now = new Date();
  if (mode === "day") {
    filterValue.value = now.toISOString().slice(0, 10);
    return;
  }
  if (mode === "week") {
    filterValue.value = getCurrentWeekValue(now);
    return;
  }
  if (mode === "month") {
    filterValue.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    return;
  }
  if (mode === "year") {
    filterValue.value = String(now.getFullYear());
    return;
  }
  filterValue.value = "";
}

function setFilterMode(mode) {
  if (filterMode.value === mode) return;
  filterMode.value = mode;
}

function resetFilters() {
  const shouldFetchImmediately = filterMode.value === "all";
  filterMode.value = "all";
  filterValue.value = "";
  if (shouldFetchImmediately) {
    fetchDashboardStats();
  }
}

watch(filterMode, (mode) => {
  if (mode === "all") {
    filterValue.value = "";
    fetchDashboardStats();
    return;
  }
  setDefaultFilterValue(mode);
});

watch(filterValue, (value) => {
  if (filterMode.value !== "all" && value) {
    fetchDashboardStats();
  }
});

function getDateRange() {
  const mode = filterMode.value;
  const value = String(filterValue.value || "").trim();
  if (mode === "all" || !value) return null;

  const setStart = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };
  const setEnd = (date) => {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  };

  try {
    if (mode === "day") {
      const date = new Date(value);
      return {
        start_date: setStart(date).toISOString(),
        end_date: setEnd(date).toISOString(),
      };
    }

    if (mode === "week") {
      const [yearPart, weekPart] = value.split("-W");
      const year = Number(yearPart);
      const week = Number(weekPart);
      const januaryFourth = new Date(year, 0, 4);
      const januaryDay = (januaryFourth.getDay() + 6) % 7;
      const start = new Date(januaryFourth);
      start.setDate(januaryFourth.getDate() - januaryDay + (week - 1) * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        start_date: setStart(start).toISOString(),
        end_date: setEnd(end).toISOString(),
      };
    }

    if (mode === "month") {
      const [yearPart, monthPart] = value.split("-");
      const year = Number(yearPart);
      const month = Number(monthPart);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return {
        start_date: setStart(start).toISOString(),
        end_date: setEnd(end).toISOString(),
      };
    }

    if (mode === "year") {
      const year = Number(value);
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return {
        start_date: setStart(start).toISOString(),
        end_date: setEnd(end).toISOString(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function formatWeekLabel(weekValue) {
  const range = getDateRange();
  if (!range) return weekValue;
  const start = new Date(range.start_date);
  const end = new Date(range.end_date);
  return `${start.toLocaleDateString(locale.value)} - ${end.toLocaleDateString(locale.value)}`;
}

function describeRange() {
  if (filterMode.value === "all") {
    return t("admin.filters.allTimeDescription");
  }

  const value = String(filterValue.value || "").trim();
  if (!value) return t("admin.filters.chooseRangePrompt");

  if (filterMode.value === "day") {
    return `${t("admin.filters.byDay")}: ${new Date(value).toLocaleDateString(locale.value)}`;
  }

  if (filterMode.value === "week") {
    return `${t("admin.filters.byWeek")}: ${formatWeekLabel(value)}`;
  }

  if (filterMode.value === "month") {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return `${t("admin.filters.byMonth")}: ${date.toLocaleDateString(locale.value, {
      month: "long",
      year: "numeric",
    })}`;
  }

  if (filterMode.value === "year") {
    return `${t("admin.filters.byYear")}: ${value}`;
  }

  return t("admin.filters.allTimeDescription");
}

function statusClass(status) {
  return status === "completed" || status === "delivered"
    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
    : status === "returned"
      ? "bg-[#efe5d2] text-[#8f6f41] dark:bg-[#4d3f2f] dark:text-[#e6c99b]"
      : status === "cancelled"
        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        : "bg-[#efe3ce] text-[#8d6431] dark:bg-[#4d3c2e] dark:text-[#e5c493]";
}

function paymentClass(status) {
  return status === "paid"
    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
    : status === "pending_verification"
      ? "bg-[#e9ddc8] text-[#75522a] dark:bg-[#4f3b2b] dark:text-[#e5c493]"
      : "bg-[#ede3d3] text-[#755d44] dark:bg-[#433326] dark:text-[#d4b897]";
}

async function fetchDashboardStats() {
  loading.value = true;
  try {
    const range = getDateRange();
    const params = range || {};
    const { data } = await api.get("/dashboard/stats", { params });
    const stats = data.data || {};

    recentOrders.value = stats.recent_orders || [];
    totals.value.orders = Number(stats.total_orders || 0);
    totals.value.revenue = Number(stats.delivered_revenue || 0);
    totals.value.netProfit = Number(stats.delivered_net_profit || 0);
    totals.value.returns = Number(stats.total_returns || 0);
    totals.value.products = Number(stats.total_products || 0);
    totals.value.pending = Number(stats.pending_payments || 0);
    totals.value.users = Number(stats.total_users || 0);
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDashboardStats();
});
</script>
