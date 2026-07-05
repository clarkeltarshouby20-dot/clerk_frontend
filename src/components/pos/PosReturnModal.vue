<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="admin-modal-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="admin-modal-header">
        <h3 class="text-lg font-bold">{{ $t("admin.pos.returnTitle") }}</h3>
        <button type="button" class="text-textSecondary" @click="$emit('close')">✕</button>
      </div>

      <div class="admin-modal-body space-y-4">
        <div class="flex gap-2">
          <input
            v-model="receiptNumber"
            type="text"
            class="form-input flex-1"
            :placeholder="$t('admin.pos.receiptPlaceholder')"
            @keyup.enter="lookupReceipt"
          />
          <button type="button" class="btn-secondary" :disabled="loading" @click="lookupReceipt">
            {{ $t("admin.pos.search") }}
          </button>
        </div>

        <div v-if="sale" class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-textSecondary">
                {{ sale.receipt_number }} · {{ formatCurrency(sale.final_total) }}
              </p>
              <p class="mt-1 text-xs font-bold text-primary-600 dark:text-primary-300">
                {{
                  isFullReturn
                    ? $t("admin.pos.returnFullInvoice")
                    : $t("admin.pos.returnPartialInvoice", { count: selectedCount })
                }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-borderThin bg-background text-textSecondary transition-colors hover:border-primary-300 hover:text-primary-600"
              :title="editMode ? $t('admin.pos.doneCustomizeReturn') : $t('admin.pos.customizeReturn')"
              @click="editMode = !editMode"
            >
              <Pencil v-if="!editMode" class="h-4 w-4" />
              <Check v-else class="h-4 w-4" />
            </button>
          </div>

          <template v-if="!editMode">
            <div
              v-for="item in selectedItems"
              :key="item.id"
              class="admin-panel-muted flex items-center justify-between gap-3 rounded-xl p-3"
            >
              <div>
                <p class="font-semibold">{{ item.product_name }}</p>
                <p class="text-xs text-textSecondary">
                  {{ formatItemVariant(item) }}
                </p>
              </div>
              <span class="text-sm font-bold text-textPrimary">
                × {{ returnQty[item.id] }}
              </span>
            </div>

            <p
              v-if="selectedCount === 0"
              class="rounded-xl border border-dashed border-borderThin px-4 py-3 text-center text-sm text-textSecondary"
            >
              {{ $t("admin.pos.noReturnItemsSelected") }}
            </p>
          </template>

          <template v-else>
            <div
              v-for="item in returnableItems"
              :key="item.id"
              class="admin-panel-muted flex items-center justify-between gap-3 rounded-xl p-3"
            >
              <label class="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-borderThin text-primary-600 focus:ring-primary-500"
                  :checked="Number(returnQty[item.id]) > 0"
                  @change="toggleItemSelection(item, $event.target.checked)"
                />
                <div class="min-w-0">
                  <p class="font-semibold">{{ item.product_name }}</p>
                  <p class="text-xs text-textSecondary">
                    {{ formatItemVariant(item) }}
                    · {{ $t("admin.pos.returnable") }}: {{ item.returnable_quantity }}
                  </p>
                </div>
              </label>
              <input
                v-model.number="returnQty[item.id]"
                type="number"
                min="0"
                :max="item.returnable_quantity"
                class="form-input w-20"
                :disabled="Number(returnQty[item.id]) <= 0"
                @input="clampReturnQty(item)"
              />
            </div>
          </template>
        </div>
      </div>

      <div class="admin-modal-footer">
        <button
          type="button"
          class="btn-primary w-full"
          :disabled="!canSubmit || submitting"
          @click="submitReturn"
        >
          {{ submitting ? $t("admin.pos.processing") : $t("admin.pos.processReturn") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { Check, Pencil } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import api from "@/axios.js";
import { useCurrency } from "@/composables/useCurrency.js";
import { useUI } from "@/composables/useUI.js";

const emit = defineEmits(["close", "completed"]);

const { formatCurrency } = useCurrency();
const ui = useUI();
const { t } = useI18n();

const receiptNumber = ref("");
const sale = ref(null);
const loading = ref(false);
const submitting = ref(false);
const editMode = ref(false);
const returnQty = reactive({});

const returnableItems = computed(
  () => sale.value?.items.filter((row) => row.returnable_quantity > 0) || [],
);

const selectedItems = computed(() =>
  returnableItems.value.filter((item) => Number(returnQty[item.id]) > 0),
);

const selectedCount = computed(() => selectedItems.value.length);

const isFullReturn = computed(() => {
  if (!returnableItems.value.length) return false;
  return returnableItems.value.every(
    (item) => Number(returnQty[item.id]) === item.returnable_quantity,
  );
});

const canSubmit = computed(() => selectedCount.value > 0);

function formatItemVariant(item) {
  return [item.selected_color_name, item.selected_size].filter(Boolean).join(" / ") || "—";
}

function applyFullReturn() {
  returnableItems.value.forEach((item) => {
    returnQty[item.id] = item.returnable_quantity;
  });
}

function toggleItemSelection(item, checked) {
  returnQty[item.id] = checked ? item.returnable_quantity : 0;
}

function clampReturnQty(item) {
  const qty = Number(returnQty[item.id]) || 0;
  if (qty <= 0) {
    returnQty[item.id] = 0;
    return;
  }
  returnQty[item.id] = Math.min(qty, item.returnable_quantity);
}

async function lookupReceipt() {
  if (!receiptNumber.value.trim()) return;
  loading.value = true;
  editMode.value = false;
  try {
    const { data } = await api.get(
      `/pos/sales/receipt/${encodeURIComponent(receiptNumber.value.trim())}`,
    );
    sale.value = data.data;
    if (sale.value.transaction_type !== "sale") {
      sale.value = null;
      ui.showToast(t("admin.pos.returnSaleOnly"), "error");
      return;
    }
    applyFullReturn();
  } catch (error) {
    sale.value = null;
    ui.showToast(
      error.response?.data?.message || t("admin.pos.receiptNotFound"),
      "error",
    );
  } finally {
    loading.value = false;
  }
}

async function submitReturn() {
  if (!canSubmit.value) return;
  submitting.value = true;

  const items = selectedItems.value.map((item) => ({
    pos_sale_item_id: item.id,
    quantity: Number(returnQty[item.id]),
  }));

  try {
    const { data } = await api.post("/pos/returns", {
      receipt_number: sale.value.receipt_number,
      items,
    });
    ui.showToast(t("admin.pos.returnCompleted"), "success");
    emit("completed", data.data);
    emit("close");
  } catch (error) {
    ui.showToast(error.response?.data?.message || t("admin.pos.returnFailed"), "error");
  } finally {
    submitting.value = false;
  }
}
</script>
