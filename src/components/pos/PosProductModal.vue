<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="admin-modal-panel w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div class="admin-modal-header">
        <h3 class="text-lg font-bold">{{ product.name }}</h3>
        <button type="button" class="text-textSecondary hover:text-textPrimary" @click="$emit('close')">
          ✕
        </button>
      </div>

      <div class="admin-modal-body space-y-5">
        <div class="flex gap-4">
          <img
            v-if="displayImage"
            :src="displayImage"
            :alt="product.name"
            class="w-28 h-28 object-cover rounded-xl border border-borderThin"
          />
          <div>
            <p class="text-2xl font-bold">{{ formatCurrency(product.price) }}</p>
            <p class="text-sm text-textSecondary mt-1">
              {{ $t("admin.pos.stock") }}: {{ selectedStock }}
            </p>
          </div>
        </div>

        <div v-if="product.colors?.length" class="space-y-2">
          <p class="form-label">{{ $t("admin.pos.color") }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in product.colors"
              :key="color.id"
              type="button"
              class="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors"
              :class="
                selectedColorId === color.id
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-borderThin'
              "
              @click="selectColor(color.id)"
            >
              {{ color.name }}
            </button>
          </div>
        </div>

        <div v-if="sizeOptions.length" class="space-y-2">
          <p class="form-label">{{ $t("admin.pos.size") }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="size in sizeOptions"
              :key="size"
              type="button"
              class="px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-40"
              :class="
                selectedSize === size
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-borderThin'
              "
              :disabled="!isSizeAvailable(size)"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div>
          <label class="form-label">{{ $t("admin.pos.quantity") }}</label>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            :max="Math.max(selectedStock, 1)"
            class="form-input w-32"
          />
        </div>

        <div v-if="showDiscount" class="admin-panel-muted p-4 space-y-3 rounded-xl">
          <p class="font-semibold">{{ $t("admin.pos.itemDiscount") }}</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="btn-secondary text-sm"
              :class="{ 'ring-2 ring-primary-500': discountMode === 'percent' }"
              @click="discountMode = 'percent'"
            >
              %
            </button>
            <button
              type="button"
              class="btn-secondary text-sm"
              :class="{ 'ring-2 ring-primary-500': discountMode === 'fixed' }"
              @click="discountMode = 'fixed'"
            >
              {{ $t("admin.pos.fixed") }}
            </button>
          </div>
          <input
            v-model.number="discountValue"
            type="number"
            min="0"
            :max="discountMode === 'percent' ? 100 : product.price"
            class="form-input"
            :placeholder="discountMode === 'percent' ? '10' : '50'"
          />
          <p class="text-sm text-textSecondary">
            {{ $t("admin.pos.finalPrice") }}:
            <strong>{{ formatCurrency(finalUnitPrice) }}</strong>
          </p>
        </div>
      </div>

      <div class="admin-modal-footer gap-2">
        <button type="button" class="btn-secondary" @click="showDiscount = !showDiscount">
          {{ $t("admin.pos.discountBtn") }}
        </button>
        <button
          type="button"
          class="btn-primary flex-1"
          :disabled="!canAdd"
          @click="handleAdd"
        >
          {{ $t("admin.pos.add") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useCurrency } from "@/composables/useCurrency.js";

const props = defineProps({
  product: { type: Object, required: true },
});

const emit = defineEmits(["add", "close"]);

const { formatCurrency } = useCurrency();

const selectedColorId = ref(null);
const selectedSize = ref(null);
const quantity = ref(1);
const showDiscount = ref(false);
const discountMode = ref("percent");
const discountValue = ref(0);

const sizeOptions = computed(() => {
  if (props.product.size_mode === "alpha") {
    return ["S", "M", "L", "XL", "XXL", "XXXL"];
  }
  if (props.product.size_mode === "numeric") {
    return Array.from({ length: 21 }, (_, i) => String(i + 30));
  }
  return [];
});

const variants = computed(() => props.product.variants || []);

const selectedVariant = computed(() => {
  if (!variants.value.length) return null;

  return (
    variants.value.find((variant) => {
      const colorMatch = selectedColorId.value
        ? variant.product_color_id === selectedColorId.value
        : !variant.product_color_id;
      const sizeMatch = selectedSize.value
        ? variant.size_value === selectedSize.value
        : !variant.size_value;
      return colorMatch && sizeMatch;
    }) || null
  );
});

const selectedStock = computed(() => {
  if (selectedVariant.value) return selectedVariant.value.stock;
  return props.product.stock || 0;
});

const displayImage = computed(() => {
  if (selectedColorId.value) {
    const color = props.product.colors?.find((c) => c.id === selectedColorId.value);
    if (color?.image_url) return color.image_url;
  }
  return props.product.images?.[0]?.image_url || null;
});

const finalUnitPrice = computed(() => {
  const price = Number(props.product.price) || 0;
  const value = Number(discountValue.value) || 0;
  if (!showDiscount.value || value <= 0) return price;

  if (discountMode.value === "percent") {
    const pct = Math.min(value, 100);
    return Math.max(price - (price * pct) / 100, 0);
  }

  return Math.max(price - Math.min(value, price), 0);
});

const canAdd = computed(() => {
  if (quantity.value < 1 || selectedStock.value < quantity.value) return false;
  if (variants.value.length && !selectedVariant.value) return false;
  return true;
});

function isSizeAvailable(size) {
  if (!selectedColorId.value) {
    return variants.value.some((v) => v.size_value === size && v.stock > 0);
  }
  return variants.value.some(
    (v) =>
      v.product_color_id === selectedColorId.value &&
      v.size_value === size &&
      v.stock > 0,
  );
}

function selectColor(colorId) {
  selectedColorId.value = colorId;
  if (selectedSize.value && !isSizeAvailable(selectedSize.value)) {
    selectedSize.value = null;
  }
}

function initSelection() {
  if (!variants.value.length) return;

  if (variants.value.length === 1) {
    const only = variants.value[0];
    selectedColorId.value = only.product_color_id || null;
    selectedSize.value = only.size_value || null;
    return;
  }

  const firstInStock = variants.value.find((v) => v.stock > 0) || variants.value[0];
  selectedColorId.value = firstInStock.product_color_id || null;
  selectedSize.value = firstInStock.size_value || null;
}

function handleAdd() {
  if (!canAdd.value) return;

  const variant = selectedVariant.value;
  const color = props.product.colors?.find((c) => c.id === variant?.product_color_id);

  emit("add", {
    product_id: props.product.id,
    variant_id: variant?.id || null,
    product_name: props.product.name,
    selected_size: variant?.size_value || null,
    selected_color_name: color?.name || variant?.color_name || null,
    selected_color_value: color?.value || variant?.color_value || null,
    selected_image_url: displayImage.value,
    quantity: quantity.value,
    original_unit_price: props.product.price,
    item_discount_type: showDiscount.value && discountValue.value > 0 ? discountMode.value : "none",
    item_discount_value: showDiscount.value ? discountValue.value : 0,
  });
  emit("close");
}

watch(
  () => props.product,
  () => {
    quantity.value = 1;
    showDiscount.value = false;
    discountValue.value = 0;
    initSelection();
  },
  { immediate: true },
);
</script>
