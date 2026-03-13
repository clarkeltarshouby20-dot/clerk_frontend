<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div
      v-for="n in count"
      :key="n"
      class="card relative overflow-hidden group animate-pulse pb-2"
    >
      <!-- Image Skeleton -->
      <div
        class="aspect-[4/5] sm:aspect-square w-full bg-gray-200 dark:bg-gray-800 rounded-b-none mb-4"
      />

      <!-- Info Skeleton -->
      <div class="space-y-3 p-5">
        <!-- Category -->
        <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-1/3" />

        <!-- Title -->
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-full" />
          <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-4/5" />
        </div>

        <!-- Price -->
        <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded-full w-1/4 mt-4" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 8 },
});
</script>
