<template>
  <div class="card overflow-hidden">
    <div class="p-4 border-b border-borderThin">
      <h2 class="font-bold text-lg">{{ $t("admin.pos.cart") }}</h2>
    </div>

    <div v-if="!items.length" class="p-8 text-center text-textSecondary">
      {{ $t("admin.pos.emptyCart") }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-surface/60 text-textSecondary uppercase text-xs">
          <tr>
            <th class="text-start p-3">{{ $t("admin.pos.item") }}</th>
            <th class="text-start p-3">{{ $t("admin.pos.variant") }}</th>
            <th class="text-center p-3">{{ $t("admin.pos.qty") }}</th>
            <th class="text-end p-3">{{ $t("admin.pos.original") }}</th>
            <th class="text-end p-3">{{ $t("admin.pos.discount") }}</th>
            <th class="text-end p-3">{{ $t("admin.pos.total") }}</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.cart_key"
            class="border-t border-borderThin"
          >
            <td class="p-3 font-semibold">{{ item.product_name }}</td>
            <td class="p-3 text-textSecondary">
              <span v-if="item.selected_color_name">{{ item.selected_color_name }}</span>
              <span v-if="item.selected_size">
                <span v-if="item.selected_color_name"> / </span>
                {{ item.selected_size }}
              </span>
              <span v-if="!item.selected_color_name && !item.selected_size">—</span>
            </td>
            <td class="p-3 text-center">{{ item.quantity }}</td>
            <td class="p-3 text-end">{{ formatCurrency(item.original_unit_price) }}</td>
            <td class="p-3 text-end text-red-500">
              <template v-if="item.item_discount_amount > 0">
                -{{ formatCurrency(item.item_discount_amount) }}
              </template>
              <span v-else>—</span>
            </td>
            <td class="p-3 text-end font-bold">{{ formatCurrency(item.line_subtotal) }}</td>
            <td class="p-3 text-end">
              <button
                type="button"
                class="text-red-500 hover:text-red-600 text-xs font-semibold"
                @click="$emit('remove', item.cart_key)"
              >
                {{ $t("admin.pos.remove") }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useCurrency } from "@/composables/useCurrency.js";

defineProps({
  items: { type: Array, default: () => [] },
});

defineEmits(["remove"]);

const { formatCurrency } = useCurrency();
</script>
