<template>
  <div class="flex flex-wrap gap-2 mb-6">
    <RouterLink
      to="/admin/pos"
      class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      :class="
        isSellActive
          ? 'bg-primary-500 text-white'
          : 'bg-surface border border-borderThin text-textSecondary hover:text-textPrimary'
      "
    >
      {{ $t("admin.pos.sell") }}
    </RouterLink>
    <RouterLink
      to="/admin/pos/history"
      class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      :class="
        isHistoryActive
          ? 'bg-primary-500 text-white'
          : 'bg-surface border border-borderThin text-textSecondary hover:text-textPrimary'
      "
    >
      {{ $t("admin.pos.history") }}
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const isSellActive = computed(() => route.path === "/admin/pos");
const isHistoryActive = computed(() => route.path.startsWith("/admin/pos/history"));
</script>
