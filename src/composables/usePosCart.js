/**
 * POS cart state: line items, discounts, and totals (client-side preview).
 */

import { computed, reactive, ref } from "vue";

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function calcItemPricing(originalUnitPrice, discountType, discountValue) {
  const price = roundMoney(originalUnitPrice);
  const type = discountType === "percent" || discountType === "fixed" ? discountType : "none";
  const value = roundMoney(discountValue || 0);

  if (type === "none" || value <= 0) {
    return {
      item_discount_type: "none",
      item_discount_value: 0,
      item_discount_amount: 0,
      final_unit_price: price,
    };
  }

  if (type === "percent") {
    const pct = Math.min(Math.max(value, 0), 100);
    const discountAmount = roundMoney((price * pct) / 100);
    return {
      item_discount_type: "percent",
      item_discount_value: pct,
      item_discount_amount: discountAmount,
      final_unit_price: roundMoney(Math.max(price - discountAmount, 0)),
    };
  }

  const discountAmount = roundMoney(Math.min(value, price));
  return {
    item_discount_type: "fixed",
    item_discount_value: value,
    item_discount_amount: discountAmount,
    final_unit_price: roundMoney(Math.max(price - discountAmount, 0)),
  };
}

function buildCartKey(item) {
  return [
    item.product_id,
    item.variant_id || "none",
    item.item_discount_type,
    item.item_discount_value,
  ].join("::");
}

export function usePosCart() {
  const items = ref([]);
  const cartDiscountType = ref("none");
  const cartDiscountValue = ref(0);

  function addItem(payload) {
    const pricing = calcItemPricing(
      payload.original_unit_price,
      payload.item_discount_type,
      payload.item_discount_value,
    );

    const line = {
      cart_key: "",
      product_id: payload.product_id,
      variant_id: payload.variant_id || null,
      product_name: payload.product_name,
      selected_size: payload.selected_size || null,
      selected_color_name: payload.selected_color_name || null,
      selected_color_value: payload.selected_color_value || null,
      selected_image_url: payload.selected_image_url || null,
      quantity: payload.quantity || 1,
      original_unit_price: roundMoney(payload.original_unit_price),
      ...pricing,
    };

    line.line_subtotal = roundMoney(line.final_unit_price * line.quantity);
    line.cart_key = buildCartKey(line);

    const existing = items.value.find((row) => row.cart_key === line.cart_key);
    if (existing) {
      existing.quantity += line.quantity;
      existing.line_subtotal = roundMoney(
        existing.final_unit_price * existing.quantity,
      );
      return;
    }

    items.value.push(line);
  }

  function removeItem(cartKey) {
    items.value = items.value.filter((row) => row.cart_key !== cartKey);
  }

  function clearCart() {
    items.value = [];
    cartDiscountType.value = "none";
    cartDiscountValue.value = 0;
  }

  function setCartDiscount(type, value) {
    cartDiscountType.value = type === "percent" || type === "fixed" ? type : "none";
    cartDiscountValue.value = roundMoney(value || 0);
  }

  const subtotalBeforeDiscount = computed(() =>
    roundMoney(
      items.value.reduce(
        (sum, item) => sum + item.original_unit_price * item.quantity,
        0,
      ),
    ),
  );

  const itemsDiscountTotal = computed(() =>
    roundMoney(
      items.value.reduce(
        (sum, item) => sum + item.item_discount_amount * item.quantity,
        0,
      ),
    ),
  );

  const itemsSubtotal = computed(() =>
    roundMoney(items.value.reduce((sum, item) => sum + item.line_subtotal, 0)),
  );

  const cartDiscountAmount = computed(() => {
    const subtotal = itemsSubtotal.value;
    const type = cartDiscountType.value;
    const value = roundMoney(cartDiscountValue.value || 0);

    if (type === "percent" && value > 0) {
      const pct = Math.min(Math.max(value, 0), 100);
      return roundMoney((subtotal * pct) / 100);
    }

    if (type === "fixed" && value > 0) {
      return roundMoney(Math.min(value, subtotal));
    }

    return 0;
  });

  const finalTotal = computed(() =>
    roundMoney(Math.max(itemsSubtotal.value - cartDiscountAmount.value, 0)),
  );

  const itemsCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  function toApiPayload() {
    return {
      items: items.value.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        item_discount_type: item.item_discount_type,
        item_discount_value: item.item_discount_value,
        selected_image_url: item.selected_image_url,
      })),
      cart_discount_type: cartDiscountType.value,
      cart_discount_value: cartDiscountValue.value,
    };
  }

  // reactive() wraps the returned object so that nested refs are auto-unwrapped
  // in templates and allow direct property access without .value in scripts.
  return reactive({
    items,
    cartDiscountType,
    cartDiscountValue,
    subtotalBeforeDiscount,
    itemsDiscountTotal,
    itemsSubtotal,
    cartDiscountAmount,
    finalTotal,
    itemsCount,
    addItem,
    removeItem,
    clearCart,
    setCartDiscount,
    toApiPayload,
  });
}
