<template>
  <div class="max-w-[1600px] mx-auto space-y-6">
    <PosSectionNav />

    <div class="flex flex-col sm:flex-row sm:items-end gap-4">
      <div class="flex-1">
        <label class="form-label">{{ $t("admin.pos.searchReceipt") }}</label>
        <input
          v-model="filters.search"
          type="text"
          class="form-input"
          :placeholder="$t('admin.pos.receiptPlaceholder')"
          @keyup.enter="fetchSales"
        />
      </div>
      <div>
        <label class="form-label">{{ $t("admin.pos.dateFrom") }}</label>
        <input v-model="filters.dateFrom" type="date" class="form-input" />
      </div>
      <div>
        <label class="form-label">{{ $t("admin.pos.dateTo") }}</label>
        <input v-model="filters.dateTo" type="date" class="form-input" />
      </div>
      <button type="button" class="btn-primary h-[42px]" @click="fetchSales">
        {{ $t("admin.pos.search") }}
      </button>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-textSecondary">
        {{ $t("admin.pos.loading") }}
      </div>

      <div v-else-if="!sales.length" class="p-8 text-center text-textSecondary">
        {{ $t("admin.pos.noSales") }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-surface/60 text-textSecondary uppercase text-xs">
            <tr>
              <th class="text-start p-3">{{ $t("admin.pos.receiptNo") }}</th>
              <th class="text-start p-3">{{ $t("admin.pos.type") }}</th>
              <th class="text-start p-3">{{ $t("admin.pos.date") }}</th>
              <th class="text-end p-3">{{ $t("admin.pos.finalTotal") }}</th>
              <th class="text-center p-3">{{ $t("admin.pos.itemsCount") }}</th>
              <th class="text-start p-3">{{ $t("admin.pos.cashier") }}</th>
              <th class="text-end p-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sale in sales"
              :key="sale.id"
              class="border-t border-borderThin hover:bg-surface/40"
            >
              <td class="p-3 font-mono font-semibold">{{ sale.receipt_number }}</td>
              <td class="p-3">
                <span
                  class="badge"
                  :class="sale.transaction_type === 'return' ? 'bg-orange-500/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'"
                >
                  {{ sale.transaction_type === "return" ? "Return" : "Sale" }}
                </span>
              </td>
              <td class="p-3">{{ formatDate(sale.created_at) }}</td>
              <td class="p-3 text-end font-bold">{{ formatCurrency(sale.final_total) }}</td>
              <td class="p-3 text-center">{{ sale.items_count }}</td>
              <td class="p-3">{{ sale.cashier_name || "—" }}</td>
              <td class="p-3 text-end">
                <button
                  type="button"
                  class="text-primary-500 font-semibold text-xs hover:underline"
                  @click="viewSale(sale.id)"
                >
                  {{ $t("admin.pos.view") }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <PaginationBar
      v-if="pagination.pages > 1"
      :current="pagination.page"
      :pages="pagination.pages"
      @change="changePage"
    />

    <PosReceiptModal
      v-if="selectedSale"
      :sale="selectedSale"
      @close="selectedSale = null"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import api from "@/axios.js";
import { useCurrency } from "@/composables/useCurrency.js";
import { useUI } from "@/composables/useUI.js";
import PaginationBar from "@/components/PaginationBar.vue";
import PosReceiptModal from "@/components/pos/PosReceiptModal.vue";
import PosSectionNav from "@/components/pos/PosSectionNav.vue";

const { formatCurrency } = useCurrency();
const ui = useUI();

const sales = ref([]);
const loading = ref(true);
const selectedSale = ref(null);
const pagination = reactive({ page: 1, pages: 1, total: 0, limit: 20 });
const filters = reactive({
  search: "",
  dateFrom: "",
  dateTo: "",
});

function formatDate(value) {
  return new Date(value).toLocaleString();
}

async function fetchSales() {
  loading.value = true;
  try {
    const { data } = await api.get("/pos/sales", {
      params: {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
      },
    });
    sales.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (error) {
    ui.showToast(error.response?.data?.message || "Failed to load sales.", "error");
  } finally {
    loading.value = false;
  }
}

async function viewSale(id) {
  try {
    const { data } = await api.get(`/pos/sales/${id}`);
    selectedSale.value = data.data;
  } catch (error) {
    ui.showToast(error.response?.data?.message || "Failed to load sale.", "error");
  }
}

function changePage(page) {
  pagination.page = page;
  fetchSales();
}

onMounted(fetchSales);
</script>
