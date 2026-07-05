<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <button
      type="button"
      class="btn-primary py-4 text-lg font-bold"
      :disabled="disabled || loading"
      @click="$emit('sell')"
    >
      {{ loading ? $t("admin.pos.processing") : $t("admin.pos.sellBtn") }}
    </button>
    <button
      type="button"
      class="btn-secondary py-4 text-lg font-bold"
      :disabled="loading"
      @click="$emit('return')"
    >
      {{ $t("admin.pos.returnBtn") }}
    </button>
    <button
      type="button"
      class="btn-danger py-4 text-lg font-bold"
      :disabled="disabled || loading"
      @click="$emit('cancel')"
    >
      {{ $t("admin.pos.cancelBtn") }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

defineEmits(["sell", "return", "cancel"]);
</script>
