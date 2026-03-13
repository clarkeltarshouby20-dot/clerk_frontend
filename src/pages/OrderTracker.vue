<template>
  <div class="section-container py-10 max-w-4xl mx-auto min-h-[70vh]">
    <div class="flex items-center gap-4 mb-8">
      <button
        @click="router.push('/orders')"
        class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
      >
        <ArrowLeft class="w-5 h-5 RTL-flip" />
      </button>
      <h1 class="text-2xl font-black text-gray-900 dark:text-white">
        {{ $t("orders.trackTitle") || "Track Order" }} #{{ route.params.id }}
      </h1>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center min-h-[60vh] py-24"
    >
      <LoadingSpinner :size="52" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="card p-12 text-center flex flex-col items-center"
    >
      <AlertTriangle class="w-16 h-16 text-red-500 mb-4 opacity-50" />
      <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">
        {{ error }}
      </p>
      <button @click="router.push('/orders')" class="btn-primary mt-6">
        {{ $t("orders.backToOrders") }}
      </button>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="space-y-8">
      <!-- Top Overview Card -->
      <div class="card p-6 md:p-8 relative overflow-hidden">
        <!-- Background Pattern -->
        <div
          class="absolute -right-10 -top-10 text-gray-50 dark:text-gray-800/50 transform rotate-12 pointer-events-none"
        >
          <Truck class="w-64 h-64" />
        </div>

        <div
          class="relative z-10 flex flex-wrap items-center justify-between gap-6"
        >
          <div>
            <p
              class="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase mb-1"
            >
              {{ $t("orders.tracker.orderDate") }}
            </p>
            <p class="font-medium text-gray-900 dark:text-gray-100">
              {{ new Date(order.created_at).toLocaleString() }}
            </p>
          </div>
          <div>
            <p
              class="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase mb-1"
            >
              {{ $t("orders.tracker.paymentMethod") }}
            </p>
            <div class="flex items-center gap-2">
              <span
                class="badge bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {{ order.payment_method.toUpperCase() }}
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
          </div>
          <div>
            <p
              class="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase mb-1"
            >
              {{ $t("orders.tracker.totalAmount") }}
            </p>
            <p
              class="text-2xl font-black text-primary-600 dark:text-primary-400"
            >
              ${{ Number(order.total_price).toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Rejection Alert Blur Modal Style -->
      <div
        v-if="order.status === 'rejected' || order.status === 'cancelled'"
        class="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 backdrop-blur-md flex gap-4 items-start shadow-sm"
      >
        <div
          class="p-3 bg-red-100 dark:bg-red-800/50 rounded-full flex-shrink-0"
        >
          <XCircle class="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-red-900 dark:text-red-300">
            {{
              order.status === "cancelled"
                ? $t("orders.tracker.orderCancelled")
                : $t("orders.tracker.orderRejected")
            }}
          </h3>
          <p
            class="text-red-700 dark:text-red-400 mt-1 font-medium leading-relaxed"
          >
            {{ $t("orders.tracker.rejectedDesc") }}
          </p>
          <div
            v-if="order.rejection_reason"
            class="mt-4 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-red-100 dark:border-red-900/30"
          >
            <p
              class="text-xs font-bold text-red-400 uppercase tracking-widest mb-1"
            >
              {{ $t("orders.tracker.rejectionReason") }}
            </p>
            <p
              class="text-gray-800 dark:text-gray-200 font-medium font-serif italic border-l-2 border-red-400 pl-3"
            >
              "{{ order.rejection_reason }}"
            </p>
          </div>
        </div>
      </div>

      <!-- Live Stepper Tracker (Obsidian & Gold) -->
      <div
        v-else
        class="card p-6 md:p-12 relative overflow-hidden bg-white/5 dark:bg-black/40 backdrop-blur-xl border-borderThin group/tracker"
      >
        <!-- Indigo Glow Effect -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none group-hover/tracker:bg-indigo-500/10 transition-colors duration-1000"></div>

        <h3
          class="text-xs font-black text-textSecondary uppercase tracking-[0.3em] mb-12 flex items-center gap-3"
        >
          <Activity class="w-4 h-4 text-indigo-500" />
          {{ $t("orders.tracker.liveStatus") }}
        </h3>

        <!-- Stepper Container -->
        <div class="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4">
          <!-- Connector Line (Desktop) -->
          <div class="hidden md:block absolute top-[22px] left-[5%] right-[5%] h-[2px] bg-borderThin z-0">
             <div 
              class="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-1000 ease-out"
              :style="{ width: progressWidth }"
            ></div>
          </div>

          <!-- Connector Line (Mobile) -->
          <div class="md:hidden absolute left-6 top-6 bottom-6 w-[2px] bg-borderThin z-0">
            <div 
              class="w-full bg-gradient-to-b from-indigo-500 via-indigo-400 to-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-1000 ease-out"
              :style="{ height: progressWidth }"
            ></div>
          </div>

          <!-- Stepper Nodes -->
          <div 
            v-for="(step, idx) in trackerSteps" 
            :key="step.id"
            class="relative z-10 flex flex-row md:flex-col items-center gap-6 md:gap-4 flex-1"
          >
            <!-- Node Circle -->
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 shadow-2xl"
              :class="[
                step.done
                  ? 'bg-indigo-500 border-indigo-400 text-[#0A0A0A] shadow-indigo-500/20 rotate-[-12deg]'
                  : step.active
                    ? 'bg-[#0A0A0A] dark:bg-white border-indigo-500 text-indigo-500 dark:text-[#0A0A0A] scale-110 shadow-indigo-500/10 active-pulse-indigo'
                    : 'bg-surface dark:bg-black/50 border-borderThin text-textSecondary',
              ]"
            >
              <component
                :is="step.icon"
                class="w-5 h-5"
                :class="{ 'animate-pulse': step.active }"
              />
            </div>

            <!-- Label & Meta -->
            <div class="text-left md:text-center">
              <p
                class="text-xs font-black uppercase tracking-[0.2em] transition-colors duration-500"
                :class="step.done || step.active ? 'text-textPrimary' : 'text-textSecondary/50'"
              >
                {{ $t(`orders.status.${step.id}`) }}
              </p>
              <p
                v-if="step.active"
                class="text-[9px] text-indigo-500 font-black uppercase tracking-[0.25em] mt-1.5 flex items-center gap-1 md:justify-center"
              >
                <span class="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></span>
                {{ $t("orders.tracker.currentStage") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Breakdown -->
      <div class="card p-6 md:p-8">
        <h3
          class="text-lg font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2"
        >
          <PackageOpen class="w-5 h-5 text-gray-500" />
          {{ $t("orders.tracker.includedItems") }}
        </h3>

        <ul class="space-y-4">
          <li
            v-for="item in order.items"
            :key="item.product_id"
            class="flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
          >
            <img
              :src="getImageUrl(item.main_image)"
              class="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-200/50 dark:border-gray-700 flex-shrink-0"
              @error="(e) => (e.target.src = 'https://placehold.co/64x64')"
            />
            <div class="flex flex-col justify-center flex-1 min-w-0">
              <span
                class="text-sm font-bold text-gray-900 dark:text-white truncate"
              >
                {{
                  ui.locale === "ar" && item.product_name_ar
                    ? item.product_name_ar
                    : item.product_name
                }}
              </span>
              <div class="flex items-center justify-between mt-1">
                <span
                  class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded font-medium"
                >
                  {{ $t("orders.tracker.qty") }}: {{ item.quantity }}
                </span>
                <span class="font-black text-sm text-gray-900 dark:text-white">
                  ${{ (Number(item.price) * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Receipt Viewer -->
      <div v-if="order.payment_receipt_url" class="card p-6 md:p-8">
        <h3
          class="text-lg font-black text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2"
        >
          <ImageIcon class="w-5 h-5 text-gray-500" />
          {{ $t("orders.tracker.paymentReceipt") }}
        </h3>
        <div
          class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex justify-center"
        >
          <img
            :src="getImageUrl(order.payment_receipt_url)"
            class="max-w-xs md:max-w-md w-full rounded-xl shadow-md border hover:scale-[1.02] transition-transform cursor-pointer"
            @click="lightboxImage = getImageUrl(order.payment_receipt_url)"
          />
        </div>
      </div>
    </div>

    <!-- Global Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxImage"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          @click="lightboxImage = null"
        >
          <img
            :src="lightboxImage"
            class="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
            @click.stop
          />
          <button
            @click="lightboxImage = null"
            class="absolute top-6 right-6 text-white/50 hover:text-white"
          >
            <X class="w-8 h-8" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, markRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUiStore } from "@/stores/ui.js";
import { useI18n } from "vue-i18n";
import api from "@/axios.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {
  ArrowLeft,
  Truck,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  Package,
  Activity,
  PackageOpen,
  XCircle,
  ImageIcon,
  X,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const { t } = useI18n();

const order = ref(null);
const loading = ref(true);
const error = ref("");
const lightboxImage = ref(null);

onMounted(async () => {
  try {
    const { data } = await api.get(`/orders/${route.params.id}/track`);
    order.value = data.data;
  } catch (err) {
    error.value =
      err.response?.data?.message || "Failed to load order track state.";
  } finally {
    loading.value = false;
  }
});

// Image Helper - handles both Cloudinary absolute paths and relative backend paths
function getImageUrl(path) {
  if (!path) return "https://placehold.co/80x80";
  if (path.startsWith("http")) return path;

  const backendBase =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";
  return `${backendBase}/${path}`;
}

function paymentStatusClass(status) {
  if (status === "paid")
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  if (status === "pending_verification")
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
}

const trackerSteps = computed(() => {
  if (!order.value) return [];
  const status = order.value.status;

  const stepsBase = [
    { id: "pending", label: "Processing", icon: markRaw(ClipboardList) },
    {
      id: "verified",
      label: "Verified & Confirmed",
      icon: markRaw(ShieldCheck),
    },
    { id: "shipped", label: "Out for Delivery", icon: markRaw(Truck) },
    { id: "delivered", label: "Delivered", icon: markRaw(Package) },
  ];

  // Map legacy 'confirmed' to 'verified', and 'out_for_delivery' to 'shipped' for tracker simplicity
  let mappedStatus = status;
  if (status === "confirmed") mappedStatus = "verified";
  if (status === "out_for_delivery") mappedStatus = "shipped";

  let currentIdx = stepsBase.findIndex((s) => s.id === mappedStatus);
  if (currentIdx === -1) currentIdx = 0; // Fallback mapping

  return stepsBase.map((step, idx) => ({
    ...step,
    done: idx < currentIdx || status === "delivered",
    active: idx === currentIdx && status !== "delivered",
  }));
});

const progressWidth = computed(() => {
  if (!order.value) return "0%";
  const status = order.value.status;
  const steps = ["pending", "verified", "shipped", "delivered"];
  
  // Custom mapping for legacy statuses
  let mappedStatus = status;
  if (status === "confirmed") mappedStatus = "verified";
  if (status === "out_for_delivery") mappedStatus = "shipped";

  const idx = steps.indexOf(mappedStatus);
  if (idx === -1) return "0%";
  if (status === "delivered") return "100%";
  
  // Return percentage based on 3 segments
  return `${(idx / (steps.length - 1)) * 100}%`;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.RTL-flip {
  transform: scaleX(1);
}
[dir="rtl"] .RTL-flip {
  transform: scaleX(-1);
}

.active-pulse-indigo {
  box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  animation: pulse-indigo 2s infinite;
}

@keyframes pulse-indigo {
  0% {
    transform: scale(1.1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  70% {
    transform: scale(1.15);
    box-shadow: 0 0 0 15px rgba(99, 102, 241, 0);
  }
  100% {
    transform: scale(1.1);
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}
</style>
