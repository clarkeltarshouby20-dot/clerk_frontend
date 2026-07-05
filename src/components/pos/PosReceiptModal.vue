<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="admin-modal-panel w-full max-w-md max-h-[90vh] flex flex-col">
        <div class="admin-modal-header">
          <h3 class="text-lg font-bold">{{ modalTitle }}</h3>
          <button type="button" class="text-textSecondary" @click="$emit('close')">✕</button>
        </div>

        <div class="admin-modal-body space-y-4 overflow-y-auto">
          <div class="receipt-preview">
            <div class="receipt-preview-inner">
              <div class="brand">
                <h1>Clark</h1>
                <p>Not for everyone, welcome to the upper class</p>
              </div>

              <div class="divider" />

              <div class="meta">
                <div class="row">
                  <span>Receipt Number</span>
                  <strong>{{ sale.receipt_number }}</strong>
                </div>
                <div class="row">
                  <span>Transaction Date &amp; Time</span>
                  <strong>{{ formattedDate }}</strong>
                </div>
                <div v-if="sale.transaction_type === 'return'" class="badge-return">RETURN</div>
              </div>

              <div class="divider" />

              <p class="section-title">Items</p>
              <div v-for="item in sale.items" :key="item.id" class="item">
                <div class="item-name">{{ item.product_name }}</div>
                <div v-if="itemVariant(item)" class="item-variant">{{ itemVariant(item) }}</div>
                <div class="row">
                  <span>{{ item.quantity }} x {{ money(item.original_unit_price) }}</span>
                  <span>{{ money(item.original_unit_price * item.quantity) }}</span>
                </div>
                <div v-if="item.item_discount_amount > 0" class="row">
                  <span>Item Discount</span>
                  <span>-{{ money(item.item_discount_amount * item.quantity) }}</span>
                </div>
                <div class="row item-total">
                  <span>Line Total</span>
                  <span>{{ money(item.line_subtotal) }}</span>
                </div>
                <div class="item-unit-note">
                  Unit after discount: {{ money(item.final_unit_price) }}
                </div>
              </div>

              <div class="divider-solid" />

              <div class="summary">
                <div class="row">
                  <span>Subtotal Before Discount</span>
                  <strong>{{ money(sale.subtotal_before_discount) }}</strong>
                </div>
                <div class="row">
                  <span>Items Discount</span>
                  <strong>-{{ money(sale.items_discount_total) }}</strong>
                </div>
                <div class="row">
                  <span>After Item Discounts</span>
                  <strong>{{ money(afterItemDiscounts) }}</strong>
                </div>
                <div class="row">
                  <span>Total Discount</span>
                  <strong>-{{ money(sale.cart_discount_amount) }}</strong>
                </div>
                <div class="row final">
                  <span>Final Total</span>
                  <strong>{{ money(sale.final_total) }}</strong>
                </div>
                <div class="row">
                  <span>Payment Method</span>
                  <strong>Cash</strong>
                </div>
                <div class="row">
                  <span>Items Count</span>
                  <strong>{{ sale.items_count }}</strong>
                </div>
              </div>

              <div class="divider" />
              <p class="thanks">Thank You</p>
            </div>
          </div>

          <p class="text-xs text-textSecondary text-center">
            {{ $t("admin.pos.receiptPrintHint") }}
          </p>
        </div>

        <div class="admin-modal-footer">
          <button
            type="button"
            class="btn-primary w-full"
            :disabled="printing"
            @click="handlePrint"
          >
            {{ printing ? $t("admin.pos.processing") : $t("admin.pos.printReceipt") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  formatReceiptDate,
  formatReceiptMoney,
  printReceiptDocument,
} from "@/composables/useReceiptPrint.js";
import { useUI } from "@/composables/useUI.js";

const props = defineProps({
  sale: { type: Object, required: true },
});

defineEmits(["close"]);

const ui = useUI();
const { t } = useI18n();
const printing = ref(false);

const formattedDate = computed(() => formatReceiptDate(props.sale.created_at));

const modalTitle = computed(() =>
  props.sale?.transaction_type === "return"
    ? t("admin.pos.returnComplete")
    : t("admin.pos.saleComplete"),
);

const afterItemDiscounts = computed(
  () =>
    Number(props.sale.subtotal_before_discount) - Number(props.sale.items_discount_total),
);

function money(value) {
  return formatReceiptMoney(value);
}

function itemVariant(item) {
  return [item.selected_color_name, item.selected_size].filter(Boolean).join(" / ");
}

async function handlePrint() {
  if (printing.value) return;
  printing.value = true;
  try {
    await printReceiptDocument(props.sale);
  } catch {
    ui.showToast(t("admin.pos.receiptPrintFailed"), "error");
  } finally {
    printing.value = false;
  }
}
</script>

<style scoped>
.receipt-preview {
  background: #f5f5f5;
  border: 1px dashed rgb(var(--color-borderThin) / 1);
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.receipt-preview-inner {
  background: #fff;
  color: #000;
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  line-height: 1.35;
  padding: 0.75rem;
  max-width: 20rem;
  margin: 0 auto;
}

.brand {
  text-align: center;
  margin-bottom: 0.5rem;
}

.brand h1 {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.brand p {
  font-size: 0.62rem;
  line-height: 1.3;
}

.divider {
  border-top: 1px dashed #000;
  margin: 0.5rem 0;
}

.divider-solid {
  border-top: 1px solid #000;
  margin: 0.5rem 0;
}

.meta .row,
.summary .row,
.item .row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.15rem 0;
}

.meta .row span:first-child,
.summary .row span:first-child,
.item .row span:first-child {
  flex: 1;
}

.meta .row strong,
.summary .row strong,
.item .row span:last-child {
  text-align: right;
  white-space: nowrap;
}

.section-title {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}

.item {
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px dashed #ccc;
}

.item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 700;
}

.item-variant {
  font-size: 0.65rem;
  margin-bottom: 0.15rem;
}

.item-unit-note {
  font-size: 0.58rem;
  color: #333;
  margin-top: 0.15rem;
}

.item-total {
  font-weight: 700;
}

.summary .final {
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 0.35rem;
  padding-top: 0.35rem;
  border-top: 1px solid #000;
}

.thanks {
  text-align: center;
  font-weight: 700;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.badge-return {
  text-align: center;
  font-weight: 700;
  font-size: 0.65rem;
  margin: 0.25rem 0;
  padding: 0.15rem;
  border: 1px solid #000;
}
</style>
