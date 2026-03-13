<template>
  <!-- Full-page loading spinner -->
  <div
    v-if="fullPage"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm"
  >
    <SpinnerSVG :size="size" />
  </div>

  <!-- Inline spinner -->
  <SpinnerSVG v-else :size="size" class="mx-auto" />
</template>

<script setup>
import SpinnerSVG from "./SpinnerSVG.vue";

defineProps({
  fullPage: { type: Boolean, default: false },
  size: { type: Number, default: 48 },
});
</script>
