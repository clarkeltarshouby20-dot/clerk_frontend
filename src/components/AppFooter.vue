<template>
  <footer
    class="mt-auto border-t border-borderThin bg-[linear-gradient(180deg,rgba(96,70,45,0.96),rgba(50,38,28,0.98))] text-[#e8d8bf]"
  >
    <div class="section-container py-16">
      <div class="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
        <div class="md:col-span-2">
          <RouterLink
            to="/"
            class="mb-4 inline-flex items-center gap-3 text-2xl text-[#f5ead6] transition-transform hover:scale-[1.03]"
          >
            <template v-if="settingsStore.logoUrl">
              <img
                :src="settingsStore.logoUrl"
                :alt="settingsStore.siteName"
                class="h-10 w-10 rounded-full border border-primary-300/40 object-cover shadow-[0_12px_25px_-18px_rgba(201,155,79,0.9)]"
              />
            </template>
            <template v-else>
              <div
                class="rounded-xl bg-primary-500 p-2 text-[#2d1f12] shadow-[0_12px_30px_-18px_rgba(201,155,79,0.85)]"
              >
                <ShoppingBag class="h-6 w-6" />
              </div>
            </template>
            <span class="brand-display tracking-[0.08em]">
              {{ settingsStore.siteName || "ShopWave" }}
            </span>
          </RouterLink>

          <p
            class="mb-6 max-w-sm text-sm font-medium leading-relaxed text-[#d9c3a1]"
          >
            {{ $t("footer.tagline") }}
          </p>

          <div class="flex items-center gap-4">
            <a
              v-if="settingsStore.socialFacebook"
              :href="settingsStore.socialFacebook"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-primary-400/20 bg-white/5 shadow-sm transition-colors hover:bg-primary-500/15 hover:text-primary-200"
            >
              <Facebook class="h-4 w-4" />
            </a>
            <a
              v-if="settingsStore.socialX"
              :href="settingsStore.socialX"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-primary-400/20 bg-white/5 shadow-sm transition-colors hover:bg-primary-500/15 hover:text-primary-200"
            >
              <Twitter class="h-4 w-4" />
            </a>
            <a
              v-if="settingsStore.socialWhatsapp"
              :href="settingsStore.socialWhatsapp"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-primary-400/20 bg-white/5 shadow-sm transition-colors hover:bg-primary-500/15 hover:text-primary-200"
            >
              <MessageCircle class="h-4 w-4" />
            </a>
            <a
              v-if="settingsStore.socialTelegram"
              :href="settingsStore.socialTelegram"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-primary-400/20 bg-white/5 shadow-sm transition-colors hover:bg-primary-500/15 hover:text-primary-200"
            >
              <Send class="h-4 w-4" />
            </a>
            <a
              v-if="settingsStore.socialGmail"
              :href="'mailto:' + settingsStore.socialGmail"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-primary-400/20 bg-white/5 shadow-sm transition-colors hover:bg-primary-500/15 hover:text-primary-200"
            >
              <Mail class="h-4 w-4" />
            </a>
          </div>
        </div>

        <div class="col-span-1">
          <h4
            class="brand-display mb-4 text-xl font-semibold tracking-[0.08em] text-[#f5ead6]"
          >
            {{ $t("footer.quickLinks") }}
          </h4>
          <ul class="space-y-3 text-sm font-medium text-[#d9c3a1]">
            <li>
              <RouterLink
                to="/products"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("nav.products") }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/cart"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("nav.cart") }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/orders"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("nav.orders") }}
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to="/contact"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("common.contactUs") }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="col-span-1">
          <h4
            class="brand-display mb-4 text-xl font-semibold tracking-[0.08em] text-[#f5ead6]"
          >
            {{ $t("nav.profile") }}
          </h4>
          <ul class="space-y-3 text-sm font-medium text-[#d9c3a1]">
            <li v-if="!auth.isLoggedIn">
              <RouterLink
                to="/login"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("nav.login") }}
              </RouterLink>
            </li>
            <li v-if="!auth.isLoggedIn">
              <RouterLink
                to="/register"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("nav.register") }}
              </RouterLink>
            </li>
            <li v-if="auth.isLoggedIn">
              <RouterLink
                to="/profile"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("nav.profile") }}
              </RouterLink>
            </li>
            <li v-if="auth.isAdmin || auth.isOwner">
              <RouterLink
                to="/admin"
                class="flex items-center gap-2 transition-colors hover:text-primary-200"
              >
                <ChevronRight class="h-3 w-3 rtl:rotate-180" />
                {{ $t("nav.admin") }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 font-medium sm:flex-row"
      >
        <p class="text-xs text-[#bda682] sm:text-sm">
          © {{ currentYear }} {{ settingsStore.siteName || "ShopWave" }}.
          {{ $t("footer.rights") }}
        </p>

        <div class="flex flex-col items-center gap-2 sm:items-end">
          <div
            class="flex items-center gap-1.5 text-xs text-[#d9c3a1] sm:text-sm"
          >
            <span>{{
              ui.locale === "ar" ? "تم التطوير بواسطة" : "Developed by"
            }}</span>
            <span class="font-bold text-primary-300">Eiiso</span>
          </div>
          <div
            class="flex flex-col items-center gap-1 text-[11px] text-[#bda682] sm:items-end"
          >
            <a
              href="tel:+201032122054"
              class="tracking-wider transition-colors hover:text-primary-200"
            >
              +201032122054
            </a>
            <a
              href="mailto:ahmedessameldeen@outlook.com"
              class="transition-colors hover:text-primary-200"
            >
              ahmedessameldeen@outlook.com
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import {
  ShoppingBag,
  ChevronRight,
  Facebook,
  Twitter,
  MessageCircle,
  Send,
  Mail,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth.js";
import { useSettingsStore } from "@/stores/settings.js";
import { useUiStore } from "@/stores/ui.js";

const auth = useAuthStore();
const settingsStore = useSettingsStore();
const ui = useUiStore();
const currentYear = new Date().getFullYear();
</script>
