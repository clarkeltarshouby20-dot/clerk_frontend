<template>
  <div class="px-4 py-32 sm:px-6 lg:px-8 max-w-[1440px] mx-auto min-h-screen">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
      <!-- ── Left Column: Contact Form ──────────────────────────────── -->
      <div class="flex flex-col">
        <h1
          class="text-4xl md:text-5xl font-sans font-bold text-textPrimary tracking-tight mb-4"
        >
          {{ $t("contact.title") }}
        </h1>
        <p class="text-textPrimary/70 font-sans text-lg mb-8 max-w-lg">
          {{ $t("contact.subtitle") }}
        </p>
 
        <form @submit.prevent="submitContactForm" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label
                class="form-label font-bold text-textPrimary uppercase text-xs tracking-wider"
                for="contact-name"
                >{{ $t("contact.form.name") }}</label
              >
              <input
                id="contact-name"
                v-model="form.name"
                type="text"
                required
                class="form-input"
                :placeholder="$t('contact.form.namePlaceholder')"
              />
            </div>
            <div class="space-y-2">
              <label
                class="form-label font-bold text-textPrimary uppercase text-xs tracking-wider"
                for="contact-email"
                >{{ $t("contact.form.email") }}</label
              >
              <input
                id="contact-email"
                v-model="form.email"
                type="email"
                required
                class="form-input"
                :placeholder="$t('contact.form.emailPlaceholder')"
              />
            </div>
          </div>
 
          <div class="space-y-2">
            <label
              class="form-label font-bold text-textPrimary uppercase text-xs tracking-wider"
              for="contact-subject"
              >{{ $t("contact.form.subject") }}</label
            >
            <input
              id="contact-subject"
              v-model="form.subject"
              type="text"
              required
              class="form-input"
              :placeholder="$t('contact.form.subjectPlaceholder')"
            />
          </div>
 
          <div class="space-y-2">
            <label
              class="form-label font-bold text-textPrimary uppercase text-xs tracking-wider"
              for="contact-message"
              >{{ $t("contact.form.message") }}</label
            >
            <textarea
              id="contact-message"
              v-model="form.message"
              rows="5"
              required
              class="form-input resize-none py-4"
              :placeholder="$t('contact.form.messagePlaceholder')"
            ></textarea>
          </div>
 
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full sm:w-auto"
          >
            <span v-if="loading">{{ $t("contact.form.sending") }}</span>
            <span v-else>{{ $t("contact.form.send") }}</span>
          </button>
        </form>
      </div>
 
      <!-- ── Right Column: Social Links / Information ────────────────── -->
      <div
        class="bg-surface p-10 md:p-14 flex flex-col justify-center border border-borderThin"
      >
        <h2
          class="text-2xl font-bold font-sans text-textPrimary tracking-tight mb-8"
        >
          {{ $t("contact.getInfo") }}
        </h2>
 
        <div class="space-y-6">
          <!-- Facebook -->
          <a
            v-if="settings.socialFacebook"
            :href="settings.socialFacebook"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 group"
          >
            <div
              class="w-12 h-12 flex items-center justify-center rounded-none bg-black dark:bg-white text-white dark:text-black"
            >
              <Facebook class="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p
                class="text-sm font-bold uppercase tracking-widest text-textPrimary/50 mb-1"
              >
                {{ $t("contact.socialLabels.facebook") }}
              </p>
              <p
                class="font-medium text-textPrimary group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
              >
                {{ $t("contact.social.facebook") }}
              </p>
            </div>
          </a>
 
          <!-- X (Twitter) -->
          <a
            v-if="settings.socialX"
            :href="settings.socialX"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 group"
          >
            <div
              class="w-12 h-12 flex items-center justify-center rounded-none bg-black dark:bg-white text-white dark:text-black"
            >
              <Twitter class="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p
                class="text-sm font-bold uppercase tracking-widest text-textPrimary/50 mb-1"
              >
                {{ $t("contact.socialLabels.twitter") }}
              </p>
              <p
                class="font-medium text-textPrimary group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
              >
                {{ $t("contact.social.twitter") }}
              </p>
            </div>
          </a>
 
          <!-- WhatsApp -->
          <a
            v-if="settings.socialWhatsapp"
            :href="settings.socialWhatsapp"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 group"
          >
            <div
              class="w-12 h-12 flex items-center justify-center rounded-none bg-black dark:bg-white text-white dark:text-black"
            >
              <MessageCircle class="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p
                class="text-sm font-bold uppercase tracking-widest text-textPrimary/50 mb-1"
              >
                {{ $t("contact.socialLabels.whatsapp") }}
              </p>
              <p
                class="font-medium text-textPrimary group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
              >
                {{ $t("contact.social.whatsapp") }}
              </p>
            </div>
          </a>
 
          <!-- Email -->
          <a
            v-if="settings.contactEmail"
            :href="`mailto:${settings.contactEmail}`"
            class="flex items-center gap-4 group"
          >
            <div
              class="w-12 h-12 flex items-center justify-center rounded-none bg-black dark:bg-white text-white dark:text-black"
            >
              <Mail class="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p
                class="text-sm font-bold uppercase tracking-widest text-textPrimary/50 mb-1"
              >
                {{ $t("contact.socialLabels.email") }}
              </p>
              <p
                class="font-medium text-textPrimary group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
              >
                {{ $t("contact.social.email") }}
              </p>
            </div>
          </a>
 
          <!-- Telegram -->
          <a
            v-if="settings.socialTelegram"
            :href="settings.socialTelegram"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-4 group"
          >
            <div
              class="w-12 h-12 flex items-center justify-center rounded-none bg-black dark:bg-white text-white dark:text-black"
            >
              <Send class="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p
                class="text-sm font-bold uppercase tracking-widest text-textPrimary/50 mb-1"
              >
                {{ $t("contact.socialLabels.telegram") }}
              </p>
              <p
                class="font-medium text-textPrimary group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors"
              >
                {{ $t("contact.social.telegram") }}
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, reactive, inject } from "vue";
import { MessageCircle, Mail, Send, Facebook, Twitter } from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings.js";
import { useI18n } from "vue-i18n";
import api from "@/axios.js";
 
const { t } = useI18n();
const settings = useSettingsStore();
const showToast = inject("showToast");
const loading = ref(false);
 
const form = reactive({
  name: "",
  email: "",
  subject: "",
  message: "",
});
 
const submitContactForm = async () => {
  loading.value = true;
  try {
    await api.post("/messages", form);
    showToast?.(t("contact.form.success"), "success");
    // Reset form
    form.name = "";
    form.email = "";
    form.subject = "";
    form.message = "";
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
};
</script>
