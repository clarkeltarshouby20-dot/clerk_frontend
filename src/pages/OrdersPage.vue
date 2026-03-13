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
            class="flex justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <span
              >{{
                $i18n.locale === "ar" && item.product_name_ar
                  ? item.product_name_ar
                  : item.product_name
              }}
              <span class="text-gray-400">× {{ item.quantity }}</span></span
            >
            <span>${{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
          </li>
        </ul>

        <!-- Footer row -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700"
        >
          <span
            class="font-black text-gray-900 dark:text-white flex items-center gap-3"
          >
            {{ $t("common.total") }}: ${{
              Number(order.total_price).toFixed(2)
            }}

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

const { t } = useI18n();
const showToast = inject("showToast");

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
  if (order.status === "cancelled" || order.status === "problem") {
    return [
      {
        icon: markRaw(order.status === "cancelled" ? XCircle : AlertTriangle),
        label:
          order.status === "cancelled"
            ? t("orders.status.cancelled")
            : t("orders.status.problem"),
        done: false,
        active: true,
        error: true,
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
