import { computed } from "vue";
import { useSettingsStore } from "@/stores/settings.js";
import { useUiStore } from "@/stores/ui.js";

export function normalizeCurrencyCode(code) {
  const normalized = String(code || "EGP").trim().toUpperCase();
  if (!normalized || normalized === "USD") {
    return "EGP";
  }
  return normalized;
}

export function getCurrencyLabel(currencyCode, locale = "ar") {
  const normalized = normalizeCurrencyCode(currencyCode);
  if (normalized === "EGP") {
    return String(locale || "ar").toLowerCase().startsWith("ar")
      ? "\u062C.\u0645"
      : "EGP";
  }
  return normalized;
}

export function formatCurrencyValue(amount, options = {}) {
  const {
    currencyCode = "EGP",
    locale = "ar",
    minimumFractionDigits = 2,
  } = options;

  const numericValue = Number(amount || 0);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const label = getCurrencyLabel(currencyCode, locale);

  return `${label} ${safeValue.toFixed(minimumFractionDigits)}`;
}

export function useCurrency() {
  const settingsStore = useSettingsStore();
  const ui = useUiStore();

  const currencyCode = computed(() =>
    normalizeCurrencyCode(settingsStore.currencyCode),
  );

  const currencyLabel = computed(() =>
    getCurrencyLabel(currencyCode.value, ui.locale),
  );

  function formatCurrency(amount, options = {}) {
    return formatCurrencyValue(amount, {
      currencyCode: options.currencyCode || currencyCode.value,
      locale: options.locale || ui.locale,
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
    });
  }

  return {
    currencyCode,
    currencyLabel,
    formatCurrency,
  };
}
