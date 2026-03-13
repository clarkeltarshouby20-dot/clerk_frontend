<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    class="text-primary-600 dark:text-primary-400"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M21 12a9 9 0 1 1-6.219-8.56"
      class="animate-spin origin-center"
      style="animation-duration: 0.75s"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 40 },
});
</script>
