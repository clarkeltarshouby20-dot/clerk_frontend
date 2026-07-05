<template>
  <div class="card p-5 space-y-4">
    <h2 class="font-bold text-lg">{{ $t("admin.pos.totals") }}</h2>

    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span>{{ $t("admin.pos.subtotalBefore") }}</span>
        <span>{{ formatCurrency(subtotalBeforeDiscount) }}</span>
      </div>
      <div class="flex justify-between text-red-500">
        <span>{{ $t("admin.pos.itemsDiscount") }}</span>
        <span>-{{ formatCurrency(itemsDiscountTotal) }}</span>
      </div>
      <div class="flex justify-between font-semibold border-t border-borderThin pt-2">
        <span>{{ $t("admin.pos.itemsSubtotal") }}</span>
        <span>{{ formatCurrency(itemsSubtotal) }}</span>
      </div>
    </div>

    <div class="admin-panel-muted p-4 rounded-xl space-y-3">
      <p class="font-semibold text-sm">{{ $t("admin.pos.cartDiscount") }}</p>
      <div class="flex gap-2">
        <button
          type="button"
          class="btn-secondary text-sm flex-1"
          :class="{ 'ring-2 ring-primary-500': localType === 'percent' }"
          @click="localType = 'percent'"
        >
          %
        </button>
        <button
          type="button"
          class="btn-secondary text-sm flex-1"
          :class="{ 'ring-2 ring-primary-500': localType === 'fixed' }"
          @click="localType = 'fixed'"
        >
          {{ $t("admin.pos.fixed") }}
        </button>
        <button
          type="button"
          class="btn-secondary text-sm"
          @click="clearDiscount"
        >
          {{ $t("admin.pos.clear") }}
        </button>
      </div>
      <input
        v-model.number="localValue"
        type="number"
        min="0"
        data-pos-manual-input
        class="form-input"
        @input="emitDiscount"
        @change="emitDiscount"
      />
      <div class="flex justify-between text-sm text-red-500">
        <span>{{ $t("admin.pos.cartDiscountAmount") }}</span>
        <span>-{{ formatCurrency(cartDiscountAmount) }}</span>
      </div>
    </div>

    <div class="flex justify-between items-center text-xl font-bold border-t border-borderThin pt-4">
      <span>{{ $t("admin.pos.finalTotal") }}</span>
      <span class="text-primary-500">{{ formatCurrency(finalTotal) }}</span>
    </div>

    <p class="text-sm text-textSecondary">
      {{ $t("admin.pos.itemsCount") }}: {{ itemsCount }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useCurrency } from "@/composables/useCurrency.js";

const props = defineProps({
  subtotalBeforeDiscount: { type: Number, default: 0 },
  itemsDiscountTotal: { type: Number, default: 0 },
  itemsSubtotal: { type: Number, default: 0 },
  cartDiscountAmount: { type: Number, default: 0 },
  finalTotal: { type: Number, default: 0 },
  itemsCount: { type: Number, default: 0 },
  cartDiscountType: { type: String, default: "none" },
  cartDiscountValue: { type: Number, default: 0 },
});

const emit = defineEmits(["update-discount"]);

const { formatCurrency } = useCurrency();
const localType = ref(props.cartDiscountType === "none" ? "percent" : props.cartDiscountType);
const localValue = ref(props.cartDiscountValue || 0);

function emitDiscount() {
  if (!localValue.value || localValue.value <= 0) {
    emit("update-discount", "none", 0);
    return;
  }
  emit("update-discount", localType.value, localValue.value);
}

function clearDiscount() {
  localValue.value = 0;
  emit("update-discount", "none", 0);
}

watch(localType, emitDiscount);
</script>
