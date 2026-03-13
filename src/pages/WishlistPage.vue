<template>
  <div class="section-container py-10 min-h-[60vh]">
    <h1 class="section-title mb-8">{{ $t("wishlist.title") }}</h1>

    <!-- Empty state -->
    <div
      v-if="wishlist.items.length === 0"
      class="flex flex-col items-center justify-center py-24 text-gray-400 gap-4"
    >
      <Heart class="w-20 h-20 opacity-30" />
      <p class="text-xl font-medium">{{ $t("wishlist.empty") }}</p>
      <RouterLink to="/products" class="btn-primary mt-2">
        {{ $t("wishlist.shopNow") }}
      </RouterLink>
    </div>

    <!-- Wishlist grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <ProductCard
        v-for="product in wishlist.items"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { Heart } from "lucide-vue-next";
import ProductCard from "@/components/ProductCard.vue";
import { useWishlistStore } from "@/stores/wishlist.js";

const wishlist = useWishlistStore();

onMounted(() => {
  wishlist.fetchWishlist();
});
</script>
