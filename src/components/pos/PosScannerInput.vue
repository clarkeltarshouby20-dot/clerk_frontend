<template>
  <div class="card overflow-hidden">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-borderThin bg-surface/40">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="shrink-0 rounded-xl p-2.5 transition-colors"
          :class="
            enabled
              ? 'bg-primary-500/10 text-primary-600'
              : 'bg-orange-500/10 text-orange-600'
          "
        >
          <ScanLine class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold truncate">
            {{ enabled ? $t("admin.pos.scannerReady") : $t("admin.pos.scannerPaused") }}
          </h2>
          <p class="text-sm text-textSecondary truncate">
            {{ $t("admin.pos.scannerHint") }}
          </p>
        </div>
      </div>
      <div
        class="shrink-0 self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-bold"
        :class="
          enabled
            ? 'bg-emerald-500/10 text-emerald-600'
            : 'bg-orange-500/10 text-orange-600'
        "
      >
        {{ enabled ? $t("admin.pos.scannerActive") : $t("admin.pos.scannerPaused") }}
      </div>
    </div>

    <div class="p-4">
      <label class="form-label sr-only" for="pos-barcode-input">
        {{ $t("admin.pos.scannerPlaceholder") }}
      </label>
      <div class="relative">
        <ScanLine
          class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary"
          aria-hidden="true"
        />
        <input
          id="pos-barcode-input"
          ref="inputRef"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :disabled="!enabled"
          :placeholder="$t('admin.pos.scannerPlaceholder')"
          :aria-label="$t('admin.pos.scannerPlaceholder')"
          class="form-input w-full ps-10 font-mono text-sm transition-opacity"
          :class="{ 'opacity-60 cursor-not-allowed': !enabled }"
          @keydown.enter="handleEnter"
          @blur="handleBlur"
        />
      </div>
      <p class="mt-2 text-xs text-textSecondary">
        {{ $t("admin.pos.scannerEnterHint") }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { toRef } from "vue";
import { ScanLine } from "lucide-vue-next";
import { useBarcodeScanner } from "@/composables/useBarcodeScanner.js";

const props = defineProps({
  enabled: { type: Boolean, default: true },
});

const emit = defineEmits(["scan"]);

const enabledRef = toRef(props, "enabled");

const { inputRef, focusInput, handleEnter, handleBlur } = useBarcodeScanner({
  enabled: enabledRef,
  onScan: (code) => emit("scan", code),
});

defineExpose({ focusInput });
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
