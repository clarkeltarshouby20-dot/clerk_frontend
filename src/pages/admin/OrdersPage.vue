<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2
        class="text-base sm:text-lg lg:text-xl font-bold text-textPrimary tracking-tight flex items-center gap-3"
      >
        <button
          v-if="selectedOrder"
          @click="selectedOrder = null"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title="Back to Orders"
        >
          <ArrowRight
            class="w-5 h-5 rtl:rotate-180"
            v-if="$i18n.locale === 'ar'"
          />
          <ArrowLeft class="w-5 h-5" v-else />
        </button>
        {{
          selectedOrder
            ? `${$t("orders.orderId") || "Order #"} ${selectedOrder.id}`
            : $t("admin.orders")
        }}
      </h2>
    </div>

    <!-- View 1: Main Table -->
    <Transition name="fade" mode="out-in">
      <div v-if="!selectedOrder" class="space-y-4">
        <!-- Kanban Board Filters & Actions -->
        <div
          class="flex flex-col sm:flex-row gap-4 mb-4 justify-between bg-surface p-4 rounded-xl border-[0.5px] border-slate-200/50 dark:border-white/10 shadow-sm"
        >
          <div class="flex gap-4 flex-1">
            <div class="relative w-full max-w-sm">
              <Search
                class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary rtl:right-3 rtl:left-auto"
              />
              <input
                v-model="filters.search"
                @input="onSearchInput"
                type="text"
                :placeholder="$t('common.search') || 'Search Orders...'"
                class="input-field w-full pl-9 rtl:pr-9 bg-gray-50 dark:bg-[#050505] border-transparent focus:border-amber-500/50"
              />
            </div>
          </div>
          <div class="text-sm font-medium text-textSecondary flex items-center">
            {{ $t("admin.kanbanView") }}
          </div>
        </div>

        <!-- Kanban Board Area -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-4 items-start min-h-[60vh]"
        >
          <!-- Column Loop -->
          <div
            v-for="col in kanbanColumns"
            :key="col.id"
            class="flex flex-col gap-4 bg-gray-50/50 dark:bg-[#050505] rounded-xl p-4 border-[0.5px] border-slate-200/50 dark:border-white/5 min-h-[400px]"
            @dragover.prevent
            @dragenter.prevent="dragEnterCol = col.id"
            @dragleave="dragEnterCol === col.id ? (dragEnterCol = null) : null"
            @drop="onDrop($event, col.id)"
            :class="{
              'ring-2 ring-amber-500/50 bg-amber-50/10 dark:bg-amber-900/10':
                dragEnterCol === col.id,
            }"
          >
            <!-- Column Header -->
            <div
              class="flex items-center justify-between pb-2 border-b border-borderThin shrink-0"
            >
              <div class="flex items-center gap-2">
                <component :is="col.icon" class="w-4 h-4" :class="col.color" />
                <h3
                  class="font-bold text-textPrimary tracking-tight uppercase tracking-wider text-sm"
                >
                  {{ $t(`admin.kanban.columns.${col.id}`) }}
                </h3>
              </div>
              <span
                class="bg-gray-200 dark:bg-white/10 text-textSecondary text-xs font-bold px-2 py-0.5 rounded-full"
              >
                {{ getFilteredOrders(col.statuses).length }}
              </span>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="space-y-3">
              <div
                v-for="i in 3"
                :key="i"
                class="skeleton h-24 w-full rounded-lg"
              />
            </div>

            <!-- Empty State -->
            <div
              v-else-if="getFilteredOrders(col.statuses).length === 0"
              class="flex-1 flex flex-col items-center justify-center text-textSecondary opacity-50 border-2 border-dashed border-borderThin rounded-lg p-6"
            >
              <Package class="w-8 h-8 mb-2" />
              <p
                class="text-xs font-medium uppercase tracking-widest text-center"
              >
                {{ $t("admin.emptyColumn") }}
              </p>
            </div>

            <!-- Cards Loop -->
            <TransitionGroup
              name="kanban-list"
              tag="div"
              class="flex flex-col gap-3 relative min-h-[50px]"
            >
              <div
                v-for="order in getFilteredOrders(col.statuses)"
                :key="order.id"
                draggable="true"
                @dragstart="onDragStart($event, order)"
                @dragend="onDragEnd"
                @click="viewOrder(order)"
                class="bg-surface p-4 rounded-xl border border-borderThin shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden"
              >
                <!-- Selection indicator -->
                <div
                  class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />

                <div class="flex justify-between items-start mb-2">
                  <span
                    class="font-mono text-xs font-bold text-textPrimary tracking-tight border px-1.5 py-0.5 rounded border-borderThin bg-gray-50 dark:bg-gray-900"
                  >
                    #{{ order.id }}
                  </span>
                  <span
                    :class="[
                      'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                      paymentClass(order.payment_status),
                    ]"
                  >
                    {{ $t(`orders.paymentStatusLabels.${order.payment_status?.toLowerCase()}`) || order.payment_status?.replace(/_/g, " ") }}
                  </span>
                </div>

                <h4
                  class="font-medium text-sm text-textPrimary tracking-tight truncate"
                  :title="order.name"
                >
                  {{ order.name }}
                </h4>
                <p
                  class="text-[10px] text-textSecondary font-medium truncate mb-3"
                >
                  {{ order.email }}
                </p>

                <div class="flex items-center justify-between mt-auto">
                  <div
                    class="text-[10px] text-textSecondary flex items-center gap-1 font-mono"
                  >
                    <Clock class="w-3 h-3" />
                    {{ new Date(order.created_at).toLocaleDateString() }}
                  </div>
                  <div
                    class="font-black text-textPrimary tracking-tight tabular-nums"
                  >
                    ${{ Number(order.total_price).toFixed(2) }}
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <!-- View 2: Deep Dive (Split Layout) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Side: Informational -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Status Tracker -->
          <div class="card p-6 shadow-sm">
            <h3
              class="font-serif text-xl text-[#1A1A1A] dark:text-[#FDFDFD] font-bold mb-8"
            >
              {{ $t("orders.orderStatus") || "Order Status" }}
            </h3>
            <div
              class="relative flex justify-between items-center w-full max-w-xl mx-auto px-4"
            >
              <!-- Connecting Line -->
              <div
                class="absolute top-5 left-8 right-8 h-[2px] bg-slate-200 dark:bg-slate-800 z-0"
              ></div>
              <div
                class="absolute top-5 left-8 h-[2px] bg-[#1A1A1A] dark:bg-[#FDFDFD] z-0 transition-all duration-700 ease-out"
                :style="{ width: trackerProgress }"
              ></div>

              <!-- Steps -->
              <div
                v-for="(step, index) in trackerSteps"
                :key="index"
                class="relative z-10 flex flex-col items-center gap-3"
              >
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-surface',
                    step.completed
                      ? 'border-[#1A1A1A] text-[#1A1A1A] dark:border-[#FDFDFD] dark:text-[#FDFDFD]'
                      : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600',
                  ]"
                >
                  <component :is="step.icon" class="w-4 h-4" />
                </div>
                <span
                  :class="[
                    'text-[10px] font-bold uppercase tracking-wider',
                    step.completed
                      ? 'text-[#1A1A1A] dark:text-[#FDFDFD]'
                      : 'text-slate-400 dark:text-slate-600',
                  ]"
                  >{{ step.label }}</span
                >
              </div>
            </div>
          </div>

          <!-- Customer Details -->
          <div class="card p-6 shadow-sm">
            <div
              class="flex items-center gap-3 border-b border-borderThin pb-4 mb-5"
            >
              <div
                class="p-2 bg-primary-100 dark:bg-primary-900/40 text-primary-600 rounded-lg"
              >
                <User class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-textPrimary tracking-tight text-lg">
                {{ $t("admin.customerInfo") }}
              </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div
                class="bg-background p-3 rounded-xl border border-borderThin"
              >
                <p
                  class="text-[11px] text-textSecondary font-medium mb-1 uppercase font-bold tracking-wider"
                >
                  {{ $t("orders.tracker.orderDate") }}
                </p>
                <p
                  class="font-semibold text-textPrimary tracking-tight flex items-center gap-2"
                >
                  <Calendar class="w-3.5 h-3.5 text-textSecondary" />
                  {{ new Date(selectedOrder.created_at).toLocaleString() }}
                </p>
              </div>
              <div
                class="bg-background p-3 rounded-xl border border-borderThin"
              >
                <p
                  class="text-[11px] text-textSecondary font-medium mb-1 uppercase font-bold tracking-wider"
                >
                  {{ $t("checkout.fullName") }}
                </p>
                <p class="font-semibold text-textPrimary tracking-tight">
                  {{ selectedOrder.name }}
                </p>
              </div>
              <div
                class="bg-background p-3 rounded-xl border border-borderThin"
              >
                <p
                  class="text-[11px] text-textSecondary font-medium mb-1 uppercase font-bold tracking-wider"
                >
                  {{ $t("auth.email") }}
                </p>
                <p class="font-semibold text-textPrimary tracking-tight">
                  {{ selectedOrder.email }}
                </p>
              </div>
              <div
                class="bg-background p-3 rounded-xl border border-borderThin"
              >
                <p
                  class="text-[11px] text-textSecondary font-medium mb-1 uppercase font-bold tracking-wider"
                >
                  {{ $t("checkout.phone") }}
                </p>
                <p
                  class="font-semibold text-textPrimary tracking-tight flex items-center gap-2"
                >
                  <Phone class="w-3.5 h-3.5 text-textSecondary" />
                  <span dir="ltr">{{ selectedOrder.shipping_phone || selectedOrder.phone || "N/A" }}</span>
                </p>
              </div>

              <!-- Shipping Address -->
              <div
                class="bg-background p-3 rounded-xl border border-borderThin sm:col-span-2 mt-2"
              >
                <p
                  class="text-[11px] text-textSecondary font-medium mb-1 uppercase font-bold tracking-wider"
                >
                  {{ $t("checkout.detailedAddress") || "Shipping Address" }}
                </p>
                <p
                  class="font-semibold text-textPrimary tracking-tight flex items-start gap-2"
                >
                  <MapPin class="w-4 h-4 text-textSecondary shrink-0 mt-0.5" />
                  <span class="text-sm font-medium">{{ selectedOrder.shipping_address || "N/A" }}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card p-6 shadow-sm">
            <div
              class="flex items-center gap-3 border-b border-borderThin pb-4 mb-5"
            >
              <div
                class="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-lg"
              >
                <ShoppingBag class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-textPrimary tracking-tight text-lg">
                {{ $t("admin.purchasedItems") }}
              </h3>
            </div>

            <ul class="space-y-3">
              <li
                v-for="item in selectedOrder.items"
                :key="item.product_id"
                class="flex items-center justify-between gap-4 p-3 rounded-xl border border-borderThin bg-background hover:border-borderThin dark:hover:border-gray-600 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <img
                    :src="item.main_image || 'https://placehold.co/100x100'"
                    class="w-12 h-12 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
                  />
                  <div>
                    <p class="font-bold text-textPrimary tracking-tight text-sm">
                      {{ item.product_name }}
                    </p>
                    <p class="text-xs text-textSecondary mt-0.5 font-medium">
                      Qty: {{ item.quantity }} × ${{
                        Number(item.price).toFixed(2)
                      }}
                    </p>
                  </div>
                </div>
                <div class="font-black text-textPrimary tracking-tight text-base">
                  ${{ (item.quantity * Number(item.price)).toFixed(2) }}
                </div>
              </li>
            </ul>
            <div
              class="mt-5 flex justify-between items-center text-xl font-black border-t border-borderThin pt-5 text-textPrimary tracking-tight"
            >
              <span>{{ $t("orders.tracker.totalAmount") }}</span>
              <span class="text-primary-600 dark:text-primary-400"
                >${{ Number(selectedOrder.total_price).toFixed(2) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Right Side: Action Control Center -->
        <div class="lg:col-span-1 space-y-6">
          <div class="card p-6 shadow-sm sticky top-6">
            <div
              class="flex items-center gap-3 border-b border-borderThin pb-4 mb-5"
            >
              <div
                class="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-lg"
              >
                <ShieldCheck class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-textPrimary tracking-tight text-lg">
                {{ $t("admin.controlCenter") }}
              </h3>
            </div>

            <!-- Payment Info Module -->
            <div class="mb-6 space-y-4">
              <div
                class="flex items-center justify-between p-3 rounded-xl border border-borderThin bg-gray-50/50 dark:bg-gray-800/30"
              >
                <span
                  class="text-[11px] font-bold text-textSecondary font-medium uppercase tracking-wider"
                  >{{ $t("orders.tracker.paymentMethod") }}</span
                >
                <span
                  class="text-[11px] uppercase font-black text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700/80 px-2 py-1 rounded shadow-sm"
                >
                  {{
                    selectedOrder.payment_method === "cod"
                      ? $t("checkout.codLabel")
                      : $t("checkout.electronicWallet")
                  }}
                </span>
              </div>
              <div
                class="flex items-center justify-between p-3 rounded-xl border border-borderThin bg-gray-50/50 dark:bg-gray-800/30"
              >
                <span
                  class="text-[11px] font-bold text-textSecondary font-medium uppercase tracking-wider"
                  >{{ $t("orders.paymentStatus") }}</span
                >
                <span
                  :class="[
                    'badge font-bold',
                    paymentClass(selectedOrder.payment_status),
                  ]"
                >
                  {{
                    $t(
                      `orders.paymentStatusLabels.${selectedOrder.payment_status}`,
                    ) || selectedOrder.payment_status?.replace(/_/g, " ")
                  }}
                </span>
              </div>

              <!-- Wallet Proof Lightbox -->
              <div
                v-if="selectedOrder.payment_method === 'wallet'"
                class="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30"
              >
                <h4
                  class="text-xs font-black text-blue-900 dark:text-blue-300 mb-3 uppercase tracking-wider flex items-center gap-2"
                >
                  <FileImage class="w-3.5 h-3.5" />
                  {{ $t("admin.transactionProof") }}
                </h4>

                <div
                  v-if="selectedOrder.transaction_id"
                  class="flex justify-between items-center mb-3 bg-surface p-2 rounded-lg border border-borderThin"
                >
                  <span class="text-[10px] uppercase font-bold text-textSecondary"
                    >{{ $t("admin.refId") }}:</span
                  >
                  <span
                    class="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold tracking-wider"
                    >{{ selectedOrder.transaction_id }}</span
                  >
                </div>

                <div
                  v-if="selectedOrder.payment_receipt_url"
                  class="relative group cursor-pointer overflow-hidden rounded-xl border border-borderThin shadow-sm bg-surface p-1"
                  @click="lightboxImage = selectedOrder.payment_receipt_url"
                >
                  <img
                    :src="selectedOrder.payment_receipt_url"
                    class="w-full h-40 object-cover rounded-lg group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div
                    class="absolute inset-1 rounded-lg bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"
                  >
                    <ZoomIn class="w-8 h-8 text-white mb-2" />
                    <span class="text-white text-xs font-bold tracking-wide"
                      >Click to Zoom</span
                    >
                  </div>
                </div>
                <div
                  v-else
                  class="text-xs px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center font-medium"
                >
                  {{ $t("admin.noReceipt") }}
                </div>
              </div>
            </div>

            <!-- Status Modification Action Buttons -->
            <div
              class="border-t border-borderThin pt-5 space-y-3"
            >
              <label
                class="form-label text-xs font-bold uppercase tracking-wider mb-2 block"
              >
                {{ $t("admin.orderActions") }}
              </label>

              <!-- Approve / Verify -->
              <button
                v-if="['pending', 'confirmed'].includes(selectedOrder.status)"
                @click="saveOrderStatus('verified')"
                :disabled="isSaving"
                class="btn-success w-full py-3 shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50"
              >
                <LoadingSpinner
                  v-if="isSaving && targetStatus === 'verified'"
                  :size="20"
                />
                <ShieldCheck v-else class="w-5 h-5" />
                {{ $t("admin.verifyApprove") }}
              </button>

              <!-- Mark Shipped -->
              <button
                v-if="['verified', 'confirmed'].includes(selectedOrder.status)"
                @click="saveOrderStatus('shipped')"
                :disabled="isSaving"
                class="bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 font-medium transition-all disabled:opacity-50"
              >
                <LoadingSpinner
                  v-if="isSaving && targetStatus === 'shipped'"
                  :size="20"
                />
                <Package v-else class="w-5 h-5" />
                {{ $t("admin.markShipped") }}
              </button>

              <!-- Mark Delivered -->
              <button
                v-if="
                  ['shipped', 'out_for_delivery'].includes(selectedOrder.status)
                "
                @click="saveOrderStatus('delivered')"
                :disabled="isSaving"
                class="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl shadow-lg flex justify-center items-center gap-2 font-medium transition-all disabled:opacity-50"
              >
                <LoadingSpinner
                  v-if="isSaving && targetStatus === 'delivered'"
                  :size="20"
                />
                <CheckCircle v-else class="w-5 h-5" />
                {{ $t("admin.markDelivered") }}
              </button>

              <!-- Reject Order -->
              <button
                v-if="
                  !['delivered', 'cancelled', 'rejected'].includes(
                    selectedOrder.status,
                  )
                "
                @click="attemptRejectOrder"
                :disabled="isSaving"
                class="btn-danger w-full py-3 shadow-sm flex justify-center items-center gap-2 transition-all disabled:opacity-50 mt-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
              >
                <LoadingSpinner
                  v-if="isSaving && targetStatus === 'rejected'"
                  :size="20"
                />
                <X v-else class="w-5 h-5" />
                {{ $t("admin.rejectOrder") }}
              </button>

              <!-- Completion state badges -->
              <div
                v-if="
                  ['delivered', 'cancelled', 'rejected'].includes(
                    selectedOrder.status,
                  )
                "
                class="text-center py-4 text-sm font-bold text-textSecondary bg-gray-50 rounded-xl dark:bg-gray-800"
              >
                {{ $t("admin.orderClosed") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Lightbox Modal -->
    <Transition name="fade">
      <div
        v-if="lightboxImage"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/95 backdrop-blur-md p-4"
        @click.self="lightboxImage = null"
      >
        <button
          @click="lightboxImage = null"
          class="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/20"
        >
          <X class="w-6 h-6" />
        </button>
        <img
          :src="lightboxImage"
          class="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-white/10"
          @click.stop
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Package,
  Search,
  Eye,
  ArrowLeft,
  ArrowRight,
  X,
  ZoomIn,
  Save,
  ShieldCheck,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Calendar,
  FileImage,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
} from "lucide-vue-next";
import PaginationBar from "@/components/PaginationBar.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import api from "@/axios.js";

import { useUI } from "@/composables/useUI.js";

const { t } = useI18n();
const ui = useUI();
const showToast = ui.showToast;

const orders = ref([]);
const loading = ref(true);
const isSaving = ref(false);

const pagination = reactive({ page: 1, pages: 1, total: 0 });
// No more status filter here since Kanban displays them all
const filters = reactive({ search: "" });

// Kanban State
const draggedOrder = ref(null);
const dragEnterCol = ref(null);

const kanbanColumns = [
  {
    id: "new",
    label: "New / Pending",
    statuses: ["pending", "confirmed"],
    icon: Clock,
    color: "text-amber-500",
  },
  {
    id: "verified",
    label: "Verified",
    statuses: ["verified"],
    icon: ShieldCheck,
    color: "text-blue-500",
  },
  {
    id: "shipped",
    label: "Shipped",
    statuses: ["shipped", "out_for_delivery"],
    icon: Truck,
    color: "text-purple-500",
  },
  {
    id: "completed",
    label: "Completed",
    statuses: ["delivered"],
    icon: CheckCircle,
    color: "text-emerald-500",
  },
];

function getFilteredOrders(statuses) {
  return orders.value.filter((o) => statuses.includes(o.status));
}

function onDragStart(event, order) {
  draggedOrder.value = order;
  event.dataTransfer.effectAllowed = "move";
  event.target.style.opacity = "0.5";
}

function onDragEnd(event) {
  draggedOrder.value = null;
  dragEnterCol.value = null;
  event.target.style.opacity = "1";
}

async function onDrop(event, columnId) {
  dragEnterCol.value = null;
  if (!draggedOrder.value) return;

  const targetStatusMap = {
    verified: "verified",
    shipped: "shipped",
    completed: "delivered",
  };

  const newStatus = targetStatusMap[columnId];
  if (!newStatus) return; // Ignore drag to 'new' or unknown

  // Optimistic UI update
  const originalStatus = draggedOrder.value.status;
  if (originalStatus !== newStatus) {
    selectedOrder.value = draggedOrder.value; // temporarily select to use existing function
    await saveOrderStatus(newStatus);
    selectedOrder.value = null; // deselect
  }
}

// Deep Dive Logic
const selectedOrder = ref(null);
const lightboxImage = ref(null);
const targetStatus = ref(""); // Tracks which button is loading

// Tracker computed properties
const trackerSteps = computed(() => {
  const status = selectedOrder.value?.status || "pending";
  const map = {
    pending: 0,
    confirmed: 0,
    verified: 1,
    shipped: 2,
    out_for_delivery: 2,
    delivered: 3,
    cancelled: -1,
    rejected: -1,
  };
  const currentStepNum = map[status] ?? 0;

  return [
    {
      icon: Clock,
      label: t("orders.status.pending") || "Pending",
      completed: currentStepNum >= 0,
    },
    {
      icon: PackageCheck,
      label: t("orders.status.verified") || "Verified",
      completed: currentStepNum >= 1,
    },
    {
      icon: Truck,
      label: t("orders.status.shipped") || "Shipped",
      completed: currentStepNum >= 2,
    },
    {
      icon: CheckCircle,
      label: t("orders.status.delivered") || "Delivered",
      completed: currentStepNum >= 3,
    },
  ];
});

const trackerProgress = computed(() => {
  const status = selectedOrder.value?.status || "pending";
  const map = {
    pending: 0,
    confirmed: 0,
    verified: 33,
    shipped: 66,
    out_for_delivery: 66,
    delivered: 100,
  };
  return (map[status] || 0) + "%";
});

let searchTimeout;
function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchOrders(1);
  }, 500);
}

function statusClass(s) {
  return s === "completed" || s === "delivered"
    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
    : s === "cancelled" || s === "problem"
      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
      : s === "out_for_delivery"
        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
        : s === "verified" || s === "confirmed"
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
          : s === "shipped"
            ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
}

function paymentClass(s) {
  return s === "paid"
    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
    : s === "pending_verification"
      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
      : "bg-background text-textSecondary font-medium border border-borderThin";
}

async function fetchOrders(page = 1) {
  loading.value = true;
  pagination.page = page;
  try {
    const { data } = await api.get("/orders", {
      params: {
        page,
        limit: 20,
        search: filters.search,
        status: filters.status,
      },
    });
    orders.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

function viewOrder(order) {
  selectedOrder.value = order;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function attemptRejectOrder() {
  const reason = await ui.promptAction({
    title: "Reject Order",
    message: "Please enter a reason for rejecting this order (optional):",
    confirmLabel: "Reject Order",
    variant: "danger",
  });

  if (reason === null) return; // User cancelled modal
  await saveOrderStatus("rejected", reason);
}

async function saveOrderStatus(statusToApply, reason = "") {
  if (!selectedOrder.value) return;

  isSaving.value = true;
  targetStatus.value = statusToApply;
  try {
    const orderId = selectedOrder.value.id;
    const { data } = await api.put(`/orders/${orderId}/status`, {
      status: statusToApply,
      reason: reason,
    });

    showToast?.(
      t("admin.statusUpdated", { status: t(`orders.status.${statusToApply}`) }),
      "success",
    );

    // Hot-reload the local state without a full refetch
    selectedOrder.value.status = statusToApply;
    const index = orders.value.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders.value[index].status = statusToApply;
    }
  } catch (e) {
    showToast?.(
      e.response?.data?.message || "Failed to update status",
      "error",
    );
  } finally {
    isSaving.value = false;
    targetStatus.value = "";
  }
}

onMounted(() => fetchOrders());
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Kanban List Transitions */
.kanban-list-move,
.kanban-list-enter-active,
.kanban-list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.kanban-list-enter-from {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.kanban-list-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(-30px, 0);
}

.kanban-list-leave-active {
  position: absolute;
  width: 100%;
}

@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
    text-shadow: none;
    box-shadow: none;
  }
  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 4px rgba(var(--color-primary-500), 0.2);
  }
}
</style>
