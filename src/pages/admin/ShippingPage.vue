<template>
  <div class="space-y-8 min-h-screen">
    <div
      class="sticky top-[80px] z-20 bg-background/80 backdrop-blur-md border-b border-borderThin -mx-4 px-4 py-4 mb-8"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-black text-textPrimary uppercase tracking-widest">
            {{ $t("settings.sectionShipping") }}
          </h2>
          <p class="mt-1 text-xs font-bold uppercase tracking-wider text-textSecondary">
            {{ $t("settings.shippingGovernoratesHint") }}
          </p>
        </div>

        <button
          @click="saveShipping"
          :disabled="saving"
          class="btn-primary"
        >
          <LoadingSpinner v-if="saving" :size="18" />
          <Save v-else class="w-4 h-4" />
          <span>{{ $t("common.save") }}</span>
        </button>
      </div>
    </div>

    <Transition name="slide-up">
      <div
        v-if="feedbackMsg"
        :class="[
          'flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm border',
          feedbackType === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
        ]"
      >
        <CheckCircle v-if="feedbackType === 'success'" class="w-5 h-5 flex-shrink-0" />
        <AlertCircle v-else class="w-5 h-5 flex-shrink-0" />
        {{ feedbackMsg }}
      </div>
    </Transition>

    <section class="card overflow-hidden border-borderThin">
      <div class="p-8 border-b border-borderThin bg-surface/30">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-3">
            <div class="rounded-2xl bg-primary-500/10 p-3 text-primary-500">
              <Truck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-textPrimary tracking-widest uppercase text-xs">
                {{ $t("settings.shippingGovernoratesTitle") }}
              </h3>
              <p class="mt-1 text-xs text-textSecondary">
                {{ $t("settings.shippingGovernoratesHint") }}
              </p>
            </div>
          </div>

          <div class="relative w-full max-w-sm">
            <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary rtl:left-auto rtl:right-4" />
            <input
              v-model="shippingSearch"
              type="text"
              :placeholder="$t('settings.shippingSearchPlaceholder')"
              class="form-input ps-11 text-sm rtl:ps-4 rtl:pe-11"
            />
          </div>
        </div>
      </div>

      <div class="p-6 sm:p-8">
        <div class="grid gap-3">
          <div
            v-for="(gov, index) in filteredGovernorates"
            :key="`${gov.key}-${index}`"
            class="grid gap-3 rounded-[1.5rem] border border-borderThin bg-background/90 p-4 shadow-sm md:grid-cols-[minmax(0,1.2fr)_180px_130px]"
          >
            <div class="space-y-2">
              <label class="form-label text-[10px] font-black uppercase tracking-[0.18em] text-textSecondary">
                {{ $t("settings.governorateName") }}
              </label>
              <input
                :value="governorateLabel(gov.key)"
                type="text"
                readonly
                class="form-input cursor-default text-sm font-medium"
              />
            </div>

            <div class="space-y-2">
              <label class="form-label text-[10px] font-black uppercase tracking-[0.18em] text-textSecondary">
                {{ $t("settings.shippingFeeLabel") }}
              </label>
              <div class="relative">
                <input
                  v-model.number="gov.value"
                  type="number"
                  min="0"
                  step="1"
                  class="form-input pe-14 text-sm font-bold"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-wider text-textSecondary rtl:right-auto rtl:left-4">
                  {{ currencyLabel }}
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <label class="form-label text-[10px] font-black uppercase tracking-[0.18em] text-textSecondary">
                {{ $t("settings.shippingAvailability") }}
              </label>
              <button
                type="button"
                class="flex h-[52px] w-full items-center justify-between rounded-2xl border px-4 text-sm font-bold transition-all"
                :class="gov.is_active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-borderThin bg-surface text-textSecondary'"
                @click="gov.is_active = !gov.is_active"
              >
                <span>{{ gov.is_active ? $t("settings.shippingEnabled") : $t("settings.shippingDisabled") }}</span>
                <span
                  class="inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors"
                  :class="gov.is_active ? 'bg-emerald-500/20' : 'bg-borderThin'"
                >
                  <span
                    class="h-4 w-4 rounded-full bg-current transition-transform"
                    :class="gov.is_active ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'"
                  ></span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="filteredGovernorates.length === 0"
          class="rounded-[1.5rem] border border-dashed border-borderThin bg-background/60 px-5 py-8 text-center text-sm font-medium text-textSecondary"
        >
          {{ $t("settings.shippingNoResults") }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { AlertCircle, CheckCircle, Save, Search, Truck } from "lucide-vue-next";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useSettingsStore } from "@/stores/settings.js";
import api from "@/axios.js";
import { useCurrency } from "@/composables/useCurrency.js";
import {
  getGovernorateDisplayName,
  matchesGovernorateQuery,
} from "@/utils/governorates.js";

const { t, locale } = useI18n();
const settingsStore = useSettingsStore();
const showToast = inject("showToast");
const { currencyLabel } = useCurrency();

const saving = ref(false);
const feedbackMsg = ref("");
const feedbackType = ref("success");
const shippingSearch = ref("");
const governorates = ref([]);

const filteredGovernorates = computed(() => {
  const query = shippingSearch.value.trim().toLowerCase();
  const sorted = [...governorates.value].sort((a, b) => {
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    return governorateLabel(a.key).localeCompare(
      governorateLabel(b.key),
      locale.value,
    );
  });

  if (!query) return sorted;
  return sorted.filter((item) => matchesGovernorateQuery(item.key, query));
});

function governorateLabel(value) {
  return getGovernorateDisplayName(value, locale.value);
}

function syncFromStore() {
  governorates.value = settingsStore.shippingGovernorates.map((item) => ({
    key: item.key || "",
    value: Number(item.value || 0),
    is_active: item.is_active !== false,
  }));
}

onMounted(async () => {
  await settingsStore.fetchSettings(true);
  syncFromStore();
});

async function saveShipping() {
  saving.value = true;
  feedbackMsg.value = "";
  try {
    const payload = {
      shipping_governorates: governorates.value.map((item) => ({
        key: String(item.key || "").trim(),
        value: Number(item.value || 0),
        is_active: item.is_active !== false,
      })),
    };

    const { data } = await api.put("/settings/shipping", payload);
    settingsStore.data.value = data.data || settingsStore.data.value;
    syncFromStore();
    feedbackType.value = "success";
    feedbackMsg.value = t("settings.saveSuccess");
    showToast?.(feedbackMsg.value, "success");
  } catch (error) {
    feedbackType.value = "error";
    feedbackMsg.value =
      error.response?.data?.message || t("settings.saveError");
    showToast?.(feedbackMsg.value, "error");
  } finally {
    saving.value = false;
  }
}
</script>
