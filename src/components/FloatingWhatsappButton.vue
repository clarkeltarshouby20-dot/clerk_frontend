<template>
  <a
    v-if="whatsappHref"
    :href="whatsappHref"
    target="_blank"
    rel="noopener noreferrer"
    class="group fixed bottom-24 right-5 z-50 flex items-center gap-3 rounded-full border border-primary-400/40 bg-[linear-gradient(135deg,rgba(248,241,227,0.98),rgba(228,204,157,0.98))] px-4 py-3 text-[#654526] shadow-[0_22px_55px_-22px_rgba(138,97,34,0.72)] ring-1 ring-white/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_-24px_rgba(138,97,34,0.82)] sm:bottom-8 dark:border-primary-300/25 dark:bg-[linear-gradient(135deg,rgba(77,56,34,0.98),rgba(108,79,44,0.98))] dark:text-[#f2e2c0] dark:ring-primary-200/10 rtl:right-auto rtl:left-5"
    :aria-label="ctaLabel"
    :title="ctaLabel"
  >
    <span
      class="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-white/50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,251,243,0.96),rgba(219,186,128,0.98))] text-[#6d4a1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_12px_24px_-12px_rgba(107,76,27,0.72)] transition-transform duration-300 group-hover:scale-105 dark:border-primary-200/20 dark:bg-[radial-gradient(circle_at_30%_30%,rgba(167,125,58,0.98),rgba(88,64,38,0.98))] dark:text-[#fff4df]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        class="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M19.05 4.94A9.94 9.94 0 0 0 12 .99C6.48.99 2 5.47 2 10.99c0 1.77.46 3.5 1.33 5.03L2 21l5.12-1.3a9.94 9.94 0 0 0 4.88 1.25h.01c5.52 0 10-4.48 10-10 0-2.67-1.04-5.18-2.96-7.01ZM12 19.27h-.01a8.26 8.26 0 0 1-4.2-1.15l-.3-.18-3.04.77.81-2.96-.2-.31a8.26 8.26 0 1 1 6.94 3.83Zm4.53-6.18c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.55.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.21-.73-.65-1.22-1.45-1.37-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42l-.47-.01c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.02 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z"
        />
      </svg>
    </span>

      <span class="hidden flex-col text-start md:flex">
      <span class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9c7441] dark:text-[#dfc08a]">
        WhatsApp
      </span>
      <span class="text-sm font-bold leading-tight">
        {{ ctaLabel }}
      </span>
    </span>
  </a>
</template>

<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@/stores/settings.js";
import { useUiStore } from "@/stores/ui.js";

const settingsStore = useSettingsStore();
const ui = useUiStore();

function normalizeWhatsappHref(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || /^wa\.me\//i.test(raw)) {
    return raw.startsWith("http") ? raw : `https://${raw}`;
  }

  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}`;
}

const whatsappHref = computed(() =>
  normalizeWhatsappHref(settingsStore.socialWhatsapp || settingsStore.whatsappNumber),
);

const ctaLabel = computed(() =>
  ui.locale === "ar" ? "تواصل عبر واتساب" : "Chat on WhatsApp",
);
</script>
