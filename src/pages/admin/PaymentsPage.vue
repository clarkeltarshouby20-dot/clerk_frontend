<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8"
    >
      <div class="flex items-center gap-4">
        <div
          class="p-3 bg-surface border-[0.5px] border-slate-200/50 dark:border-slate-800 shadow-sm"
        >
          <CreditCard class="w-6 h-6 text-[#1A1A1A] dark:text-[#FDFDFD]" />
        </div>
        <div>
          <h2
            class="text-3xl font-serif font-bold text-[#1A1A1A] dark:text-[#FDFDFD]"
          >
            {{ $t("admin.financeControl") }}
          </h2>
          <p
            class="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold text-[#1A1A1A]/60 dark:text-[#FDFDFD]/60"
          >
            {{ $t("admin.walletInstaPay") }}
          </p>
        </div>
      </div>
      <span
        class="badge bg-transparent border-[0.5px] border-slate-200 dark:border-slate-800 text-[#1A1A1A] dark:text-[#FDFDFD] text-xs px-4 py-2 self-start sm:self-auto shadow-sm"
      >
        {{ pagination.total }} {{ $t("admin.pendingPayments") }}
      </span>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && proofs.length === 0"
      class="card p-12 text-center text-textSecondary"
    >
      <CheckCircle class="w-16 h-16 mx-auto opacity-30 mb-3" />
      <p>{{ $t("admin.noProofs") }}</p>
    </div>

    <!-- Proofs table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t("admin.paymentsTable.txn") }}</th>
              <th>{{ $t("admin.paymentsTable.order") }}</th>
              <th>{{ $t("admin.paymentsTable.user") }}</th>
              <th>{{ $t("admin.paymentsTable.amount") }}</th>
              <th>{{ $t("admin.paymentsTable.orderTotal") }}</th>
              <th>{{ $t("admin.paymentsTable.reference") }}</th>
              <th>{{ $t("admin.paymentsTable.screenshot") }}</th>
              <th>{{ $t("admin.paymentsTable.submitted") }}</th>
              <th>{{ $t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="text-center py-10 text-textSecondary">
                {{ $t("common.loading") }}
              </td>
            </tr>
            <tr v-for="proof in proofs" :key="proof.id">
              <td class="font-mono text-xs">
                #{{ proof.transaction_id || "—" }}
              </td>
              <td class="font-mono text-xs">#{{ proof.id }}</td>
              <td>
                <div class="font-medium text-sm">{{ proof.name }}</div>
                <div class="text-xs text-textSecondary">{{ proof.email }}</div>
              </td>
              <td class="font-bold text-primary-600 dark:text-primary-400">
                ${{ Number(proof.total_price).toFixed(2) }}
              </td>
              <td class="text-sm text-textSecondary font-medium">
                ${{ Number(proof.total_price).toFixed(2) }}
              </td>
              <td class="text-xs text-textSecondary font-mono">
                {{ proof.transaction_id || "—" }}
              </td>
              <td>
                <button
                  @click="openScreenshot(proof.payment_receipt_url)"
                  class="flex items-center justify-center min-h-[44px] px-2 rounded-lg gap-1 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <ImageIcon class="w-4 h-4" />
                  {{ $t("admin.viewScreenshot") }}
                </button>
              </td>
              <td class="text-xs text-textSecondary">
                {{ new Date(proof.created_at).toLocaleDateString() }}
              </td>
              <td>
                <div class="flex gap-2">
                  <button
                    @click="verifyPayment(proof, 'paid')"
                    :disabled="verifyingId === proof.id"
                    class="btn-success min-h-[44px] !px-4 !text-xs flex items-center gap-1"
                  >
                    <LoadingSpinner
                      v-if="verifyingId === proof.id && verifyType === 'paid'"
                      :size="14"
                    />
                    <CheckCircle v-else class="w-3.5 h-3.5" />
                    {{ $t("admin.approve") }}
                  </button>
                  <button
                    @click="verifyPayment(proof, 'rejected')"
                    :disabled="verifyingId === proof.id"
                    class="btn-danger min-h-[44px] !px-4 !text-xs flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <LoadingSpinner
                      v-if="
                        verifyingId === proof.id && verifyType === 'rejected'
                      "
                      :size="14"
                    />
                    <X v-else class="w-3.5 h-3.5" />
                    {{ $t("common.reject") }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-borderThin">
        <PaginationBar
          :current="pagination.page"
          :pages="pagination.pages"
          @change="fetchProofs"
        />
      </div>
    </div>

    <!-- Screenshot lightbox -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="screenshotUrl"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          @click="screenshotUrl = ''"
        >
          <div class="relative max-w-2xl w-full" @click.stop>
            <button
              @click="screenshotUrl = ''"
              class="absolute -top-10 end-0 text-white/70 hover:text-white"
            >
              <X class="w-7 h-7" />
            </button>
            <img
              :src="screenshotUrl"
              class="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, inject, onMounted } from "vue";
import { CheckCircle, ImageIcon, X, CreditCard } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import PaginationBar from "@/components/PaginationBar.vue";
import api from "@/axios.js";
import { useUI } from "@/composables/useUI.js";

const { t } = useI18n();
const ui = useUI();
const showToast = ui.showToast;

const proofs = ref([]);
const loading = ref(true);
const pagination = reactive({ page: 1, pages: 1, total: 0 });
const screenshotUrl = ref("");
const verifyingId = ref(null);
const verifyType = ref("");

async function fetchProofs(page = 1) {
  loading.value = true;
  pagination.page = page;
  try {
    const { data } = await api.get("/payments/admin/pending", {
      params: { page, limit: 20 },
    });
    proofs.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

function openScreenshot(url) {
  if (!url) return;
  if (url.startsWith("http")) {
    screenshotUrl.value = url;
  } else {
    const backendBase =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    screenshotUrl.value = `${backendBase}/${url}`;
  }
}

async function verifyPayment(proof, status) {
  let rejection_reason = "";
  if (status === "rejected") {
    const reason = await ui.promptAction({
      title: t("common.reject"),
      message:
        t("admin.rejectReasonPrompt") ||
        "Please enter a reason for rejection (optional):",
      confirmLabel: t("common.reject"),
      variant: "danger",
    });

    if (reason === null) return; // User cancelled
    rejection_reason = reason;
  }

  verifyingId.value = proof.id;
  verifyType.value = status;
  try {
    const { data } = await api.put(`/payments/${proof.id}/verify`, {
      status,
      rejection_reason,
    });
    showToast?.(data.message || t("admin.verifySuccess"), "success");
    // Remove from list
    proofs.value = proofs.value.filter((p) => p.id !== proof.id);
    pagination.total = Math.max(0, pagination.total - 1);
  } catch (e) {
    showToast?.(e.response?.data?.message || "Verification failed", "error");
  } finally {
    verifyingId.value = null;
    verifyType.value = "";
  }
}

onMounted(fetchProofs);
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.25s ease;
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
