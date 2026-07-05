/**
 * Barcode scanner handler for USB laser scanners (keyboard wedge mode).
 *
 * The scanner emulates a keyboard: it types the barcode digits quickly then sends Enter.
 * A hidden input stays focused so keystrokes land in one place; on blur we refocus
 * unless the cashier is typing in a manual field (e.g. cart discount).
 */

import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

function isManualPosInput(element) {
  return element?.closest?.("[data-pos-manual-input]") != null;
}

export function useBarcodeScanner({ onScan, enabled = ref(true) }) {
  const inputRef = ref(null);

  function focusInput() {
    if (!enabled.value) return;
    nextTick(() => {
      const input = inputRef.value;
      if (!input) return;
      if (isManualPosInput(document.activeElement)) return;
      input.focus({ preventScroll: true });
    });
  }

  function handleEnter(event) {
    if (!enabled.value) return;

    event.preventDefault();
    const input = inputRef.value;
    if (!input) return;

    const code = input.value.trim();
    input.value = "";

    if (code.length >= 3) {
      onScan(code);
    }

    focusInput();
  }

  function handleBlur() {
    if (!enabled.value) return;

    setTimeout(() => {
      if (!enabled.value) return;
      if (isManualPosInput(document.activeElement)) return;
      focusInput();
    }, 120);
  }

  watch(enabled, (value) => {
    if (value) focusInput();
  });

  onMounted(() => {
    focusInput();
  });

  onUnmounted(() => {
    inputRef.value?.blur();
  });

  return {
    inputRef,
    focusInput,
    handleEnter,
    handleBlur,
  };
}
