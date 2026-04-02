<template>
  <div class="section-container py-10">
    <h1 class="section-title mb-8">{{ $t("orders.title") }}</h1>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center min-h-[60vh] py-24"
    >
      <LoadingSpinner :size="52" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="orders.length === 0"
      class="flex flex-col items-center justify-center py-24 text-gray-400 gap-4"
    >
      <Package class="w-20 h-20 opacity-30" />
      <p class="text-xl">{{ $t("orders.noOrders") }}</p>
      <RouterLink to="/products" class="btn-primary">{{
        $t("home.shopNow")
      }}</RouterLink>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="card p-5 space-y-5">
        <!-- Header row -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-center gap-3 flex-wrap">
            <h2 class="font-bold text-gray-900 dark:text-white">
              {{ $t("orders.orderId") }}{{ order.id }}
            </h2>
            <!-- Translated status badges -->
            <span :class="orderStatusClass(order.status)" class="badge">
              {{ $t(`orders.status.${order.status}`) || order.status }}
            </span>
            <span
              :class="paymentStatusClass(order.payment_status)"
              class="badge"
            >
              {{
                $t(`orders.paymentStatusLabels.${order.payment_status}`) ||
                order.payment_status
              }}
            </span>
          </div>
          <div class="text-xs text-gray-400">
            {{ new Date(order.created_at).toLocaleDateString() }}
          </div>
        </div>

        <!-- ── Order Status Timeline ─────────────────────── -->
        <div class="flex items-center gap-0">
          <template v-for="(step, i) in getTimeline(order)" :key="i">
            <!-- Step node -->
            <div class="flex flex-col items-center gap-1.5 min-w-[70px]">
              <div
                :class="[
                  'flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors duration-300',
                  step.error
                    ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-600 dark:text-red-400'
                    : step.done
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : step.active
                        ? 'border-primary-600 text-primary-600 bg-white dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-900',
                ]"
              >
                <component :is="step.icon" class="w-4 h-4" />
              </div>
              <p
                :class="[
                  'text-[10px] font-medium text-center leading-tight',
                  step.done || step.active
                    ? 'text-gray-700 dark:text-gray-200'
                    : 'text-gray-400 dark:text-gray-600',
                ]"
              >
                {{ step.label }}
              </p>
            </div>

            <!-- Connector line (not after last) -->
            <div
              v-if="i < getTimeline(order).length - 1"
              :class="[
                'flex-1 h-0.5 transition-colors duration-300 mb-5',
                step.done ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700',
              ]"
            />
          </template>
        </div>

        <!-- Item list -->
        <ul class="space-y-1.5">
          <li
            v-for="item in order.items"
            :key="item.id"
            class="flex justify-between gap-3 text-sm text-gray-600 dark:text-gray-400"
          >
            <div class="min-w-0">
              <span>
                {{
                  $i18n.locale === "ar" && item.product_name_ar
                    ? item.product_name_ar
                    : item.product_name
                }}
                <span class="text-gray-400">x {{ item.quantity }}</span>
              </span>
              <div
                v-if="item.selected_color_name || item.selected_size"
                class="mt-1 flex flex-wrap items-center gap-2"
              >
                <span
                  v-if="item.selected_color_name"
                  class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  <span
                    class="h-2.5 w-2.5 rounded-full border border-white/40"
                    :style="{ backgroundColor: item.selected_color_value || '#c8a96b' }"
                  ></span>
                  {{ item.selected_color_name }}
                </span>
                <span
                  v-if="item.selected_size"
                  class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  {{ item.selected_size }}
                </span>
              </div>
            </div>
            <span>{{ formatCurrency(Number(item.price) * item.quantity) }}</span>
          </li>
        </ul>

        <div class="grid gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm dark:border-gray-800 dark:bg-gray-900/30">
          <div class="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>{{ $t("cart.subtotal") }}</span>
            <span>{{ formatCurrency(Number(order.items_total || order.total_price)) }}</span>
          </div>
          <div class="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>{{ $t("checkout.shippingFee") }}</span>
            <span>{{ formatCurrency(Number(order.shipping_fee || 0)) }}</span>
          </div>
          <div
            v-if="Number(order.discount_amount || 0) > 0"
            class="flex items-center justify-between text-emerald-600 dark:text-emerald-400"
          >
            <span>{{ $t("checkout.discount") }}</span>
            <span>- {{ formatCurrency(Number(order.discount_amount || 0)) }}</span>
          </div>
          <div
            v-if="order.shipping_governorate"
            class="flex items-center justify-between text-gray-500 dark:text-gray-400"
          >
            <span>{{ $t("checkout.governorate") }}</span>
            <span>{{ governorateLabel(order.shipping_governorate) }}</span>
          </div>
        </div>

        <!-- Footer row -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700"
        >
          <span
            class="font-black text-gray-900 dark:text-white flex items-center gap-3"
          >
            {{ $t("common.total") }}:
            {{ formatCurrency(Number(order.total_price)) }}

            <!-- Show Payment Method -->
            <span
              class="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700"
            >
              {{
                order.payment_method === "cod"
                  ? $t("checkout.codLabel")
                  : $t("checkout.walletLabel")
              }}
            </span>
          </span>

          <!-- Track Order button -->
          <RouterLink
            :to="`/orders/${order.id}/track`"
            class="btn-primary !py-2 !px-4 !text-sm"
          >
            <Activity class="w-4 h-4" />
            {{ $t("orders.trackOrder") }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw, onMounted, inject } from "vue";
import {
  Package,
  CreditCard,
  ClipboardList,
  CheckCircle,
  Truck,
  XCircle,
  AlertTriangle,
  Activity,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import api from "@/axios.js";
import { getGovernorateDisplayName } from "@/utils/governorates.js";
import { useCurrency } from "@/composables/useCurrency.js";

const { t, locale } = useI18n();
const showToast = inject("showToast");
const { formatCurrency } = useCurrency();

const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { data } = await api.get("/orders/my-orders");
    orders.value = data.data;
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
});

// ── Status badge classes ─────────────────────────────────────
function orderStatusClass(status) {
  if (status === "delivered" || status === "completed")
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  if (status === "returned")
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
  if (status === "confirmed")
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  if (status === "out_for_delivery")
    return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
  if (status === "cancelled" || status === "problem")
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
}

function paymentStatusClass(status) {
  if (status === "paid")
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  if (status === "pending_verification")
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
}

function governorateLabel(value) {
  return getGovernorateDisplayName(value, locale.value);
}

// ── Order Status Timeline ────────────────────────────────────
function getTimeline(order) {
  const steps = [
    {
      id: "pending",
      icon: markRaw(ClipboardList),
      label: t("orders.timeline.pending") || "Pending",
    },
    {
      id: "confirmed",
      icon: markRaw(CheckCircle),
      label: t("orders.timeline.confirmed") || "Confirmed",
    },
    {
      id: "out_for_delivery",
      icon: markRaw(Truck),
      label: t("orders.timeline.outForDelivery") || "Out for Delivery",
    },
    {
      id: "delivered",
      icon: markRaw(Package),
      label: t("orders.timeline.delivered") || "Delivered",
    },
  ];

  let currentIdx = steps.findIndex((s) => s.id === order.status);

  // Handled cancelled/problem separately
  if (
    order.status === "cancelled" ||
    order.status === "problem" ||
    order.status === "returned"
  ) {
    return [
      {
        icon: markRaw(
          order.status === "cancelled"
            ? XCircle
            : order.status === "returned"
              ? Package
              : AlertTriangle,
        ),
        label: t(`orders.status.${order.status}`),
        done: false,
        active: true,
        error: order.status !== "returned",
      },
    ];
  }

  // Fallback if status unrecognized
  if (currentIdx === -1) currentIdx = 0;

  return steps.map((step, idx) => ({
    ...step,
    done: idx < currentIdx || order.status === "delivered",
    active: idx === currentIdx && order.status !== "delivered",
  }));
}
</script>

