<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h2 class="text-base sm:text-lg lg:text-xl font-bold text-textPrimary tracking-tight">
        {{ $t("admin.expenses.title") }}
      </h2>
    </div>

    <div class="card p-6">
      <p class="text-xs font-extrabold uppercase tracking-widest text-textSecondary">
        {{ $t("admin.expenses.summaryTotal") }}
      </p>
      <p class="mt-2 text-3xl font-black text-textPrimary">
        {{ formatCurrency(totalExpenses, { minimumFractionDigits: 0 }) }}
      </p>
    </div>

    <form
      class="card p-4 flex flex-col sm:flex-row gap-3 sm:items-end"
      @submit.prevent="addExpense"
    >
      <div class="flex-1">
        <label class="form-label mb-1.5 text-xs uppercase tracking-wider opacity-70">
          {{ $t("admin.expenses.amount") }}
        </label>
        <input
          v-model.number="newAmount"
          type="number"
          min="0.01"
          step="0.01"
          required
          class="form-input"
          :placeholder="$t('admin.expenses.amountPlaceholder')"
        />
      </div>
      <button type="submit" class="btn-primary w-full sm:w-auto min-w-[120px]" :disabled="adding">
        <LoadingSpinner v-if="adding" :size="18" />
        <Plus v-else class="w-4 h-4" />
        {{ $t("admin.expenses.add") }}
      </button>
    </form>

    <div v-if="loading" class="text-center py-12 text-textSecondary">
      {{ $t("common.loading") }}
    </div>

    <div
      v-else-if="!expenses.length"
      class="card p-12 text-center text-textSecondary"
    >
      {{ $t("admin.expenses.empty") }}
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto subtle-scrollbar">
        <table class="w-full text-sm">
          <thead class="border-b border-borderThin bg-background text-xs font-extrabold uppercase tracking-wider text-textSecondary">
            <tr>
              <th class="px-4 py-3 text-start">#</th>
              <th class="px-4 py-3 text-start">{{ $t("admin.expenses.amount") }}</th>
              <th class="px-4 py-3 text-start">{{ $t("admin.expenses.date") }}</th>
              <th class="px-4 py-3 text-end">{{ $t("common.actions") || "Actions" }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in expenses"
              :key="item.id"
              class="border-b border-borderThin last:border-0"
            >
              <td class="px-4 py-3 font-mono text-xs text-textSecondary">
                {{ index + 1 }}
              </td>
              <td class="px-4 py-3 font-bold text-textPrimary">
                {{ formatCurrency(Number(item.amount)) }}
              </td>
              <td class="px-4 py-3 text-textSecondary">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="p-2 rounded-lg text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    @click="openEdit(item)"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    @click="askDelete(item)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmModal
      v-model="deleteModal"
      :title="$t('admin.expenses.deleteTitle')"
      :message="$t('admin.expenses.deleteConfirm')"
      @confirm="deleteExpense"
    />

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editModal"
          class="admin-modal-shell"
          @click.self="editModal = false"
        >
          <div class="admin-modal-panel max-w-md">
            <div class="admin-modal-header">
              <h3 class="text-lg font-bold">{{ $t("admin.expenses.editTitle") }}</h3>
              <button type="button" class="text-textSecondary" @click="editModal = false">✕</button>
            </div>
            <form @submit.prevent="saveEdit">
              <div class="admin-modal-body">
                <label class="form-label mb-1.5 text-xs uppercase tracking-wider opacity-70">
                  {{ $t("admin.expenses.amount") }}
                </label>
                <input
                  v-model.number="editAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  class="form-input"
                />
                <p v-if="editError" class="mt-2 text-xs font-bold text-red-500">{{ editError }}</p>
              </div>
              <div class="admin-modal-footer">
                <button type="button" class="btn-secondary w-full sm:w-auto" @click="editModal = false">
                  {{ $t("common.cancel") }}
                </button>
                <button type="submit" class="btn-primary w-full sm:w-auto" :disabled="savingEdit">
                  <LoadingSpinner v-if="savingEdit" :size="18" />
                  {{ $t("common.update") }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from "vue";
import { Edit2, Plus, Trash2 } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import api from "@/axios.js";
import { useCurrency } from "@/composables/useCurrency.js";

const { t, locale } = useI18n();
const { formatCurrency } = useCurrency();
const showToast = inject("showToast");

const expenses = ref([]);
const totalExpenses = ref(0);
const loading = ref(true);
const adding = ref(false);
const newAmount = ref("");
const deleteModal = ref(false);
const expenseToDelete = ref(null);
const editModal = ref(false);
const editingExpense = ref(null);
const editAmount = ref("");
const editError = ref("");
const savingEdit = ref(false);

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(locale.value === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function fetchExpenses() {
  loading.value = true;
  try {
    const { data } = await api.get("/expenses");
    expenses.value = data.data?.items || [];
    totalExpenses.value = Number(data.data?.total_expenses || 0);
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

async function addExpense() {
  const amount = Number(newAmount.value);
  if (!amount || amount <= 0) return;

  adding.value = true;
  try {
    await api.post("/expenses", { amount });
    newAmount.value = "";
    await fetchExpenses();
    showToast?.(t("admin.expenses.addSuccess"), "success");
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  } finally {
    adding.value = false;
  }
}

function openEdit(item) {
  editingExpense.value = item;
  editAmount.value = Number(item.amount);
  editError.value = "";
  editModal.value = true;
}

async function saveEdit() {
  const amount = Number(editAmount.value);
  if (!amount || amount <= 0) {
    editError.value = t("admin.expenses.invalidAmount");
    return;
  }

  savingEdit.value = true;
  try {
    await api.put(`/expenses/${editingExpense.value.id}`, { amount });
    editModal.value = false;
    await fetchExpenses();
    showToast?.(t("admin.expenses.updateSuccess"), "success");
  } catch (error) {
    editError.value = error.response?.data?.message || t("common.error");
  } finally {
    savingEdit.value = false;
  }
}

function askDelete(item) {
  expenseToDelete.value = item;
  deleteModal.value = true;
}

async function deleteExpense() {
  try {
    await api.delete(`/expenses/${expenseToDelete.value.id}`);
    deleteModal.value = false;
    await fetchExpenses();
    showToast?.(t("admin.expenses.deleteSuccess"), "success");
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
    deleteModal.value = false;
  }
}

onMounted(fetchExpenses);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
