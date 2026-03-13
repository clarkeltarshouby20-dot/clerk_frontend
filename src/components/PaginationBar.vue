<template>
  <div v-if="pages > 1" class="flex items-center justify-center gap-1 mt-6">
    <!-- Previous -->
    <button
      @click="$emit('change', current - 1)"
      :disabled="current <= 1"
      class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>

    <!-- Page numbers -->
    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="px-2 text-gray-400">…</span>
      <button
        v-else
        @click="$emit('change', page)"
        :class="[
          'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
          page === current
            ? 'bg-primary-600 text-white shadow'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
        ]"
      >
        {{ page }}
      </button>
    </template>

    <!-- Next -->
    <button
      @click="$emit('change', current + 1)"
      :disabled="current >= pages"
      class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = defineProps({
  current: { type: Number, required: true },
  pages: { type: Number, required: true },
});
defineEmits(["change"]);

// Generate visible page numbers with ellipsis
const visiblePages = computed(() => {
  const { current, pages } = props;
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

  const result = [1];
  if (current > 3) result.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(pages - 1, current + 1);
  for (let i = start; i <= end; i++) result.push(i);

  if (current < pages - 2) result.push("...");
  result.push(pages);
  return result;
});
</script>
