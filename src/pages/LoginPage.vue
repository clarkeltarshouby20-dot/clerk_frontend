<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md p-8"
    >
      <!-- Logo + Title -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4"
        >
          <LogIn class="w-7 h-7 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white">
          {{ $t("auth.login") }}
        </h1>
      </div>

      <!-- Error alert -->
      <Transition name="slide-up">
        <div
          v-if="error"
          class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5"
        >
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          {{ error }}
        </div>
      </Transition>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email -->
        <div>
          <label class="form-label">{{ $t("auth.email") }}</label>
          <input
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="form-input"
            :placeholder="`${$t('auth.email')}…`"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="form-label">{{ $t("auth.password") }}</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="form-input pe-10"
              :placeholder="$t('auth.password')"
            />
            <button
              type="button"
              @click="showPass = !showPass"
              class="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Eye v-if="!showPass" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full mt-2"
        >
          <LoadingSpinner v-if="loading" :size="18" />
          <LogIn v-else class="w-4 h-4" />
          {{ $t("auth.login") }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        {{ $t("auth.noAccount") }}
        <RouterLink
          to="/register"
          class="text-primary-600 dark:text-primary-400 font-semibold hover:underline ms-1"
        >
          {{ $t("nav.register") }}
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-vue-next";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useAuthStore } from "@/stores/auth.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const showToast = inject("showToast");

const form = reactive({ email: "", password: "" });
const loading = ref(false);
const error = ref("");
const showPass = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(form.email, form.password);
    showToast?.(t("auth.loginSuccess"), "success");
    const redirect = route.query.redirect || "/";
    router.push(redirect);
  } catch (e) {
    error.value = e.response?.data?.message || t("auth.invalidCredentials");
  } finally {
    loading.value = false;
  }
}
</script>
