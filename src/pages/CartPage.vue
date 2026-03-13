<template>
  <div class="section-container py-12 min-h-[70vh]">
    <h1 class="section-title mb-10">{{ $t("cart.title") }}</h1>

    <!-- Empty cart -->
    <div
      v-if="cart.items.length === 0"
      class="flex flex-col items-center justify-center py-24 text-textSecondary gap-6 bg-surface rounded-3xl"
    >
      <div
        class="w-24 h-24 rounded-full bg-background flex flex-col justify-center items-center shadow-sm"
      >
        <ShoppingCart class="w-10 h-10 text-primary-500" />
      </div>
      <p class="text-2xl font-extrabold text-textPrimary">
        {{ $t("cart.empty") }}
      </p>
      <p class="font-medium">{{ $t("cart.emptySubtitle") || "Looks like you haven't added anything yet." }}</p>
      <RouterLink to="/products" class="btn-primary mt-4 px-8 py-3 w-auto">
        {{ $t("cart.continueShopping") }}
      </RouterLink>
    </div>

    <!-- Cart items + summary -->
    <div v-else class="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
      <!-- Item list -->
      <div class="lg:col-span-2">
        <TransitionGroup name="list" tag="div" class="space-y-4">
          <div
            v-for="item in cart.items"
            :key="item.id"
            class="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center shadow-sm hover:shadow-md transition-shadow relative overflow-visible border-borderThin"
          >
            <!-- Image -->
            <RouterLink :to="`/products/${item.id}`" class="block shrink-0">
              <img
                :src="
                  item.main_image ||
                  'https://placehold.co/100x100/f1f5f9/94a3b8?text=Image'
                "
                :alt="item.name"
                class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl shadow-sm hover:scale-105 transition-transform"
                @error="
                  (e) =>
                    (e.target.src =
                      'https://placehold.co/100x100/f1f5f9/94a3b8?text=Image')
                "
              />
            </RouterLink>

            <!-- Info -->
            <div
              class="flex-1 min-w-0 flex flex-col w-full text-center sm:text-start"
            >
              <RouterLink
                :to="`/products/${item.id}`"
                class="font-bold text-textPrimary text-base hover:text-primary-500 transition-colors line-clamp-2 mb-2"
              >
                {{
                  ui.locale === "ar" && item.name_ar ? item.name_ar : item.name
                }}
              </RouterLink>
              <p
                class="text-primary-600 dark:text-primary-400 font-extrabold text-lg sm:mb-4"
              >
                ${{ Number(item.price).toFixed(2) }}
              </p>

              <div
                class="flex items-center justify-between sm:justify-start gap-4 mt-auto w-full"
              >
                <!-- Qty -->
                <div
                  class="flex items-center bg-surface rounded-xl p-1 border border-borderThin"
                >
                  <button
                    @click="cart.updateQty(item.id, item.quantity - 1)"
                    class="p-2 text-textSecondary hover:bg-background hover:text-textPrimary rounded-lg transition-colors"
                  >
                    <Minus class="w-4 h-4" />
                  </button>
                  <span
                    class="px-4 text-sm font-bold text-textPrimary w-8 text-center"
                    >{{ item.quantity }}</span
                  >
                  <button
                    @click="cart.updateQty(item.id, item.quantity + 1)"
                    :disabled="item.quantity >= item.stock"
                    class="p-2 text-textSecondary hover:bg-background hover:text-textPrimary rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Plus class="w-4 h-4" />
                  </button>
                </div>

                <!-- Sub-total & Remove -->
                <div class="flex items-center gap-4 ml-auto sm:ml-6">
                  <span
                    class="text-sm font-extrabold text-textPrimary text-end"
                  >
                    ${{ (Number(item.price) * item.quantity).toFixed(2) }}
                  </span>

                  <button
                    @click="cart.removeItem(item.id)"
                    class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors bg-surface sm:bg-transparent"
                    :title="$t('cart.removeItem')"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Order summary -->
      <div class="lg:col-span-1">
        <div
          class="card p-6 sm:p-8 sticky top-28 border-borderThin bg-surface/50"
        >
          <h2
            class="font-extrabold text-textPrimary text-xl border-b border-borderThin pb-4 mb-6 uppercase tracking-wider"
          >
            {{ $t("cart.orderSummary") }}
          </h2>

          <div class="space-y-4 text-base font-medium text-textSecondary mb-6">
            <div class="flex justify-between items-center">
              <span>{{ $t("cart.subtotal") }}</span>
              <span class="text-textPrimary font-bold"
                >${{ cart.total.toFixed(2) }}</span
              >
            </div>
            <div class="flex justify-between items-center">
              <span>{{ $t("cart.shipping") }}</span>
              <span
                class="text-emerald-500 font-bold uppercase tracking-widest text-xs"
                >{{ $t("cart.free") }}</span
              >
            </div>
            <div class="border-t border-borderThin my-2"></div>
            <div
              class="flex justify-between items-center bg-background p-4 rounded-2xl border border-borderThin shadow-sm"
            >
              <span class="font-bold text-textPrimary">{{
                $t("common.total")
              }}</span>
              <span
                class="font-black text-primary-600 dark:text-primary-400 text-2xl"
                >${{ cart.total.toFixed(2) }}</span
              >
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <RouterLink
              to="/checkout"
              class="btn-primary w-full py-4 text-base shadow-lg justify-center shadow-primary-500/20"
            >
              {{ $t("cart.checkout") }}
              <ArrowRight class="w-4 h-4 ml-1 rtl:-scale-x-100" />
            </RouterLink>
            <RouterLink
              to="/products"
              class="btn-secondary w-full py-3 text-sm justify-center border-none bg-surface hover:bg-borderThin"
            >
              {{ $t("cart.continueShopping") }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-vue-next";
import { useCartStore } from "@/stores/cart.js";
import { useUiStore } from "@/stores/ui.js";

const cart = useCartStore();
const ui = useUiStore();
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
</style>
