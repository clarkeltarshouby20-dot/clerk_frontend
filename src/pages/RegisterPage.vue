<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-md p-8"
    >
      <!-- Title -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4"
        >
          <UserPlus class="w-7 h-7 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white">
          {{ $t("auth.register") }}
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

      <form @submit.prevent="handleRegister" class="space-y-4" novalidate>
        <div class="py-2">
          <ImageUploadSingle
            v-model="form.imageFile"
            shape="circle"
            :max-size="5242880"
            :label="$t('profile.uploadAvatar')"
            :subtext="$t('JPEG, PNG, WEBP. Max 5MB.')"
          />
        </div>

        <!-- Full Name -->
        <div>
          <label class="form-label">{{ $t("auth.username") }}</label>
          <input
            v-model.trim="form.name"
            type="text"
            required
            autocomplete="name"
            class="form-input"
            :class="{ 'border-red-400': fieldErrors.name }"
            :placeholder="$t('auth.username')"
          />
          <p v-if="fieldErrors.name" class="text-red-500 text-xs mt-1">
            {{ fieldErrors.name }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label class="form-label">{{ $t("auth.email") }}</label>
          <input
            v-model.trim="form.email"
            type="email"
            required
            autocomplete="email"
            class="form-input"
            :class="{ 'border-red-400': fieldErrors.email }"
            :placeholder="$t('auth.email')"
          />
          <p v-if="fieldErrors.email" class="text-red-500 text-xs mt-1">
            {{ fieldErrors.email }}
          </p>
        </div>

        <!-- Phone Number -->
        <div>
          <label class="form-label">{{ $t("profile.phone") }}</label>
          <input
            v-model.trim="form.phone"
            type="tel"
            required
            autocomplete="tel"
            class="form-input"
            :class="{ 'border-red-400': fieldErrors.phone }"
            placeholder="01xxxxxxxxx"
          />
          <p v-if="fieldErrors.phone" class="text-red-500 text-xs mt-1">
            {{ fieldErrors.phone }}
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="form-label">{{ $t("auth.password") }}</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              required
              autocomplete="new-password"
              class="form-input pe-10"
              :class="{ 'border-red-400': fieldErrors.password }"
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
          <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">
            {{ $t('profile.passwordPlaceholder') }} ({{ $t('admin.users.passwordOk') }})
          </p>
          <p v-if="fieldErrors.password" class="text-red-500 text-xs mt-1">
            {{ fieldErrors.password }}
          </p>
        </div>

        <!-- Confirm password -->
        <div>
          <label class="form-label">{{ $t("auth.confirmPassword") }}</label>
          <input
            v-model="form.passwordConfirm"
            :type="showPass ? 'text' : 'password'"
            required
            autocomplete="new-password"
            class="form-input"
            :class="{ 'border-red-400': fieldErrors.passwordConfirm }"
            :placeholder="$t('auth.confirmPassword')"
          />
          <p
            v-if="fieldErrors.passwordConfirm"
            class="text-red-500 text-xs mt-1"
          >
            {{ fieldErrors.passwordConfirm }}
          </p>
        </div>


        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full mt-2"
        >
          <LoadingSpinner v-if="loading" :size="18" />
          <UserPlus v-else class="w-4 h-4" />
          {{ $t("auth.register") }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        {{ $t("auth.hasAccount") }}
        <RouterLink
          to="/login"
          class="text-primary-600 dark:text-primary-400 font-semibold hover:underline ms-1"
        >
          {{ $t("nav.login") }}
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { UserPlus, AlertCircle, Eye, EyeOff, User, Camera, Plus, Image as ImageIcon } from "lucide-vue-next";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ImageUploadSingle from "@/components/ImageUploadSingle.vue";
import { useAuthStore } from "@/stores/auth.js";
import { inject } from "vue";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const showToast = inject("showToast");

// removed avatarInput, avatarPreview refs

const form = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
  imageFile: null,
});
const fieldErrors = reactive({
  name: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirm: "",
});
const loading = ref(false);
const error = ref("");
const showPass = ref(false);

// function onFileSelect(e) { ... } removed in favor of ImageUploadSingle

// ── Client-side validation ─────────────────────────────────────────
function validate() {
  let valid = true;
  fieldErrors.name = "";
  fieldErrors.email = "";
  fieldErrors.phone = "";
  fieldErrors.password = "";
  fieldErrors.passwordConfirm = "";

  if (!form.name) {
    fieldErrors.name = t("profile.errors.usernameRequired");
    valid = false;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email) {
    fieldErrors.email = t("errors.required");
    valid = false;
  } else if (!emailRe.test(form.email)) {
    fieldErrors.email = t("errors.invalidEmail");
    valid = false;
  }

  const phoneRe = /^01[0125][0-9]{8}$/;
  if (!form.phone) {
    fieldErrors.phone = t("errors.required");
    valid = false;
  } else if (!phoneRe.test(form.phone)) {
    fieldErrors.phone = t("checkout.invalidPhoneEgypt");
    valid = false;
  }

  if (!form.password) {
    fieldErrors.password = t("errors.required");
    valid = false;
  } else if (form.password.length < 8) {
    fieldErrors.password = t("profile.errors.passwordTooShort");
    valid = false;
  } else if (!/[A-Z]/.test(form.password)) {
    fieldErrors.password = t("min 1 uppercase") || "At least 1 uppercase letter required.";
    valid = false;
  } else if (!/[0-9]/.test(form.password)) {
    fieldErrors.password = t("min 1 number") || "At least 1 number required.";
    valid = false;
  }

  if (!form.passwordConfirm) {
    fieldErrors.passwordConfirm = t("errors.required");
    valid = false;
  } else if (form.password !== form.passwordConfirm) {
    fieldErrors.passwordConfirm = t("profile.errors.passwordMismatch");
    valid = false;
  }

  return valid;
}

async function handleRegister() {
  error.value = "";
  if (!validate()) return;

  loading.value = true;
  try {
    // Build FormData — multer on the backend expects multipart/form-data
    // API fields: name (required), email (required), password (required), image (optional)
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("password", form.password);
    if (form.imageFile) fd.append("image", form.imageFile);

    await auth.register(fd);
    showToast?.(t("auth.registerSuccess"), "success");
    // Redirect to login — backend returns no token on registration
    router.push({ name: "login" });
  } catch (e) {
    const msg = e.response?.data?.message || "";
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes("email already exists")) {
      fieldErrors.email = t("auth.emailExists");
    } else if (lowerMsg.includes("phone number already exists")) {
      fieldErrors.phone = t("auth.phoneExists");
    } else if (lowerMsg.includes("uppercase")) {
      fieldErrors.password = t("auth.passwordUppercase");
    } else if (lowerMsg.includes("number")) {
      fieldErrors.password = t("auth.passwordNumber");
    } else if (lowerMsg.includes("at least 8 characters")) {
      fieldErrors.password = t("profile.errors.passwordTooShort");
    } else if (lowerMsg.includes("valid email")) {
      fieldErrors.email = t("errors.invalidEmail");
    } else if (lowerMsg.includes("egyptian mobile")) {
      fieldErrors.phone = t("checkout.invalidPhoneEgypt");
    } else {
      error.value = msg || t("common.error");
    }
  } finally {
    loading.value = false;
  }
}
</script>
