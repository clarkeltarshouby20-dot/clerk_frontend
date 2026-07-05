<template>
  <div class="max-w-[1600px] mx-auto space-y-6">
    <PosSectionNav />

    <PosScannerInput ref="scannerRef" :enabled="scannerEnabled" @scan="handleScan" />

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 space-y-6">
        <PosCartTable :items="cart.items" @remove="cart.removeItem" />
        <PosActionBar
          :disabled="!cart.items.length"
          :loading="selling"
          @sell="handleSell"
          @return="showReturnModal = true"
          @cancel="handleCancel"
        />
      </div>

      <PosTotalsPanel
        :subtotal-before-discount="cart.subtotalBeforeDiscount"
        :items-discount-total="cart.itemsDiscountTotal"
        :items-subtotal="cart.itemsSubtotal"
        :cart-discount-amount="cart.cartDiscountAmount"
        :final-total="cart.finalTotal"
        :items-count="cart.itemsCount"
        :cart-discount-type="cart.cartDiscountType"
        :cart-discount-value="cart.cartDiscountValue"
        @update-discount="cart.setCartDiscount"
      />
    </div>

    <PosProductModal
      v-if="activeProduct"
      :product="activeProduct"
      @add="handleAdd"
      @close="closeProductModal"
    />

    <PosReturnModal
      v-if="showReturnModal"
      @close="showReturnModal = false"
      @completed="handleReturnCompleted"
    />

    <PosReceiptModal
      v-if="completedSale"
      :sale="completedSale"
      @close="completedSale = null"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/axios.js";
import { usePosCart } from "@/composables/usePosCart.js";
import { useUI } from "@/composables/useUI.js";
import PosScannerInput from "@/components/pos/PosScannerInput.vue";
import PosProductModal from "@/components/pos/PosProductModal.vue";
import PosCartTable from "@/components/pos/PosCartTable.vue";
import PosTotalsPanel from "@/components/pos/PosTotalsPanel.vue";
import PosActionBar from "@/components/pos/PosActionBar.vue";
import PosReceiptModal from "@/components/pos/PosReceiptModal.vue";
import PosReturnModal from "@/components/pos/PosReturnModal.vue";
import PosSectionNav from "@/components/pos/PosSectionNav.vue";

const cart = usePosCart();
const ui = useUI();
const { t } = useI18n();

const scannerRef = ref(null);
const scannerEnabled = computed(
  () => !activeProduct.value && !showReturnModal.value && !completedSale.value,
);
const activeProduct = ref(null);
const showReturnModal = ref(false);
const completedSale = ref(null);
const selling = ref(false);

function buildAutoAddPayload(product, variant) {
  const color = product.colors?.find((c) => c.id === variant?.product_color_id);
  const image =
    color?.image_url ||
    product.images?.[0]?.image_url ||
    null;

  return {
    product_id: product.id,
    variant_id: variant?.id || null,
    product_name: product.name,
    selected_size: variant?.size_value || null,
    selected_color_name: color?.name || variant?.color_name || null,
    selected_color_value: color?.value || variant?.color_value || null,
    selected_image_url: image,
    quantity: 1,
    original_unit_price: product.price,
    item_discount_type: "none",
    item_discount_value: 0,
  };
}

function closeProductModal() {
  activeProduct.value = null;
  nextTick(() => scannerRef.value?.focusInput());
}

function openProductModal(product) {
  activeProduct.value = product;
}

async function handleScan(code) {
  if (!scannerEnabled.value) return;

  try {
    const { data } = await api.get(`/pos/products/barcode/${encodeURIComponent(code)}`);
    const product = data.data;
    const variants = product.variants || [];

    if (!variants.length) {
      if ((product.stock || 0) < 1) {
        ui.showToast(t("admin.pos.outOfStock", { name: product.name }), "error");
        return;
      }
      cart.addItem(buildAutoAddPayload(product, null));
      ui.showToast(t("admin.pos.productAdded", { name: product.name }), "success");
      return;
    }

    if (variants.length === 1) {
      if ((variants[0].stock || 0) < 1) {
        ui.showToast(t("admin.pos.outOfStock", { name: product.name }), "error");
        return;
      }
      cart.addItem(buildAutoAddPayload(product, variants[0]));
      ui.showToast(t("admin.pos.productAdded", { name: product.name }), "success");
      return;
    }

    openProductModal(product);
  } catch (error) {
    ui.showToast(
      error.response?.data?.message || t("admin.pos.productNotFound"),
      "error",
    );
  } finally {
    nextTick(() => scannerRef.value?.focusInput());
  }
}

function handleAdd(payload) {
  cart.addItem(payload);
  ui.showToast(t("admin.pos.productAdded", { name: payload.product_name }), "success");
}

async function handleSell() {
  if (!cart.items.length) return;

  const confirmed = await ui.confirmAction({
    title: t("admin.pos.confirmSellTitle"),
    message: t("admin.pos.confirmSellMessage", {
      total: cart.finalTotal.toFixed(2),
    }),
    confirmLabel: t("admin.pos.sellBtn"),
    variant: "primary",
  });
  if (!confirmed) return;

  selling.value = true;
  try {
    const { data } = await api.post("/pos/sales", cart.toApiPayload());
    cart.clearCart();
    completedSale.value = data.data;
    ui.showToast(t("admin.pos.saleCompleted"), "success");
  } catch (error) {
    ui.showToast(error.response?.data?.message || t("admin.pos.saleFailed"), "error");
  } finally {
    selling.value = false;
  }
}

async function handleCancel() {
  if (!cart.items.length) return;
  const confirmed = await ui.confirmAction({
    title: t("admin.pos.confirmCancelTitle"),
    message: t("admin.pos.confirmCancelMessage"),
    confirmLabel: t("admin.pos.clear"),
    variant: "danger",
  });
  if (confirmed) cart.clearCart();
}

function handleReturnCompleted(sale) {
  completedSale.value = sale;
}

watch(showReturnModal, (open) => {
  if (!open) nextTick(() => scannerRef.value?.focusInput());
});

watch(completedSale, (sale) => {
  if (!sale) nextTick(() => scannerRef.value?.focusInput());
});
</script>
