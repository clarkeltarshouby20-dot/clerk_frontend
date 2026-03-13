<template>
  <div class="min-h-screen py-10 px-4">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Page title -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t("profile.title") }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ $t("profile.subtitle") }}
        </p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="card p-8 space-y-6 animate-pulse">
        <div class="flex items-center gap-5">
          <div
            class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"
          />
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      <!-- Profile card -->
      <div v-else class="card overflow-hidden">
        <!-- ── Avatar hero strip ──────────────────────────────── -->
        <div
          class="relative bg-gradient-to-r from-primary-600 to-primary-500 h-24"
        >
          <div class="absolute -bottom-16 start-8">
            <ImageUploadSingle
              v-model="avatarModel"
              shape="circle"
              :uploading="uploading"
              :max-size="5242880"
              @change="handleImagePick"
            />
          </div>
        </div>

        <!-- Name + role (offset for avatar) -->
        <div
          class="pt-14 pb-4 px-8 flex items-end justify-between flex-wrap gap-3"
        >
          <div>
            <p class="font-bold text-lg text-gray-900 dark:text-white">
              {{ form.name || auth.user?.name }}
            </p>
            <p class="text-sm text-gray-400">{{ auth.user?.email }}</p>
          </div>
          <span :class="['badge', roleBadgeClass]">
            {{ $t(`admin.roleBadge.${auth.user?.role || "user"}`) }}
          </span>
        </div>

        <hr class="border-gray-100 dark:border-gray-700 mx-8" />

        <!-- ── Form body ──────────────────────────────────────── -->
        <form
          @submit.prevent="handleSave"
          class="px-8 py-6 space-y-5"
          novalidate
        >
          <!-- Full name -->
          <div>
            <label class="form-label">
              {{ $t("profile.username") }}
              <span class="text-red-400 ms-0.5">*</span>
            </label>
            <div class="relative">
              <UserCircle
                class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              />
              <input
                v-model.trim="form.name"
                type="text"
                class="form-input ps-9"
                :class="{ 'border-red-400 focus:ring-red-400': errors.name }"
                :placeholder="$t('profile.usernamePlaceholder')"
                autocomplete="name"
              />
            </div>
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">
              {{ errors.name }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label class="form-label">
              {{ $t("profile.email") }}
              <span class="text-red-400 ms-0.5">*</span>
            </label>
            <div class="relative">
              <Mail
                class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              />
              <input
                v-model.trim="form.email"
                type="email"
                class="form-input ps-9"
                :class="{ 'border-red-400 focus:ring-red-400': errors.email }"
                :placeholder="$t('profile.emailPlaceholder')"
                autocomplete="email"
              />
            </div>
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password section -->
          <div
            class="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-4"
          >
            <div class="flex items-center gap-2">
              <Lock class="w-4 h-4 text-primary-500" />
              <h3
                class="font-semibold text-sm text-gray-800 dark:text-white uppercase tracking-wide"
              >
                {{ $t("profile.changePassword") }}
              </h3>
            </div>
            <p class="text-xs text-gray-400 -mt-2">
              {{ $t("profile.passwordHint") }}
            </p>

            <!-- New password -->
            <div>
              <label class="form-label">{{ $t("profile.newPassword") }}</label>
              <div class="relative">
                <KeyRound
                  class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                />
                <input
                  v-model="form.password"
                  :type="showPwd ? 'text' : 'password'"
                  class="form-input ps-9 pe-10"
                  :class="{
                    'border-red-400 focus:ring-red-400': errors.password,
                  }"
                  :placeholder="$t('profile.passwordPlaceholder')"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  @click="showPwd = !showPwd"
                  class="absolute inset-y-0 end-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showPwd" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="errors.password" class="text-red-500 text-xs mt-1">
                {{ errors.password }}
              </p>
            </div>

            <!-- Confirm password -->
            <div v-if="form.password">
              <label class="form-label">{{
                $t("profile.confirmPassword")
              }}</label>
              <div class="relative">
                <KeyRound
                  class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                />
                <input
                  v-model="form.confirmPassword"
                  :type="showPwd ? 'text' : 'password'"
                  class="form-input ps-9"
                  :class="{
                    'border-red-400 focus:ring-red-400': errors.confirmPassword,
                  }"
                  :placeholder="$t('profile.confirmPasswordPlaceholder')"
                  autocomplete="new-password"
                />
              </div>
              <p
                v-if="errors.confirmPassword"
                class="text-red-500 text-xs mt-1"
              >
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>

          <!-- Password strength bar (only shown while typing a new password) -->
          <Transition name="slide-up">
            <div v-if="form.password" class="space-y-1">
              <div class="flex gap-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  :class="[
                    'h-1 flex-1 rounded-full transition-colors duration-300',
                    i <= pwdStrength
                      ? strengthColor
                      : 'bg-gray-200 dark:bg-gray-700',
                  ]"
                />
              </div>
              <p class="text-xs" :class="strengthTextColor">
                {{ strengthLabel }}
              </p>
            </div>
          </Transition>

          <!-- Submit row -->
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="saving || uploading"
              class="btn-primary px-8 gap-2 min-w-[130px]"
            >
              <span
                v-if="saving"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"
              />
              <Save v-else class="w-4 h-4" />
              {{ $t("common.save") }}
            </button>
          </div>
        </form>
      </div>

      <!-- Quick links card -->
      <div v-if="!loading" class="card p-4 flex flex-wrap gap-3">
        <RouterLink
          to="/orders"
          class="btn-secondary !py-2 !px-4 !text-sm gap-2"
        >
          <Package class="w-4 h-4" />
          {{ $t("nav.orders") }}
        </RouterLink>
        <RouterLink
          v-if="auth.isAdmin"
          to="/admin"
          class="btn-primary !py-2 !px-4 !text-sm gap-2"
        >
          <LayoutDashboard class="w-4 h-4" />
          {{ $t("nav.dashboard") }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  UserCircle,
  Lock,
  Save,
  Eye,
  EyeOff,
  Camera,
  Mail,
  KeyRound,
  Package,
  LayoutDashboard,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth.js";
import ImageUploadSingle from "@/components/ImageUploadSingle.vue";
import api from "@/axios.js";

const { t } = useI18n();
const auth = useAuthStore();
const showToast = inject("showToast");

// ── State ──────────────────────────────────────────────────────
const fileInput = ref(null);
const avatarModel = ref(auth.user?.image || null);
const uploading = ref(false);
const loading = ref(true);
const saving = ref(false);
const showPwd = ref(false);

const form = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// ── Computed ───────────────────────────────────────────────────
const initials = computed(() =>
  (form.name || auth.user?.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join(""),
);

const roleBadgeClass = computed(() => {
  const role = auth.user?.role;
  if (role === "owner")
    return "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300";
  if (role === "admin")
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
});

// Password strength meter (1–4)
const pwdStrength = computed(() => {
  const p = form.password;
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
});

const strengthColor = computed(() => {
  if (pwdStrength.value <= 1) return "bg-red-400";
  if (pwdStrength.value === 2) return "bg-amber-400";
  if (pwdStrength.value === 3) return "bg-blue-400";
  return "bg-emerald-500";
});

const strengthTextColor = computed(() => {
  if (pwdStrength.value <= 1) return "text-red-500";
  if (pwdStrength.value === 2) return "text-amber-500";
  if (pwdStrength.value === 3) return "text-blue-500";
  return "text-emerald-600";
});

const strengthLabel = computed(() => {
  const labels = [
    t("profile.pwd.weak"),
    t("profile.pwd.weak"),
    t("profile.pwd.fair"),
    t("profile.pwd.strong"),
    t("profile.pwd.veryStrong"),
  ];
  return labels[pwdStrength.value] || "";
});

// ── Fetch user from API ────────────────────────────────────────
onMounted(async () => {
  try {
    const { data } = await api.get(`/users/${auth.user.id}`);
    const user = data.data || data.user || data;
    form.name = user.name || "";
    form.email = user.email || "";
    // Sync image into store if different
    if (user.image && auth.user) {
      auth.user = { ...auth.user, image: user.image };
      avatarModel.value = user.image;
      localStorage.setItem("user", JSON.stringify(auth.user));
    }
  } catch {
    // Fallback to cached store data
    form.name = auth.user?.name || "";
    form.email = auth.user?.email || "";
  } finally {
    loading.value = false;
  }
});

// ── Avatar pick & upload ───────────────────────────────────────
async function handleImagePick(file) {
  if (!file || !(file instanceof File)) return;

  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append("image", file);

    const { data } = await api.put(`/users/${auth.user.id}`, fd);

    const updated = data.data || data.user || {};
    const newImage = updated?.image || auth.user.image;

    auth.user = { ...auth.user, image: newImage };
    avatarModel.value = newImage;
    localStorage.setItem("user", JSON.stringify(auth.user));

    showToast?.(data.message || t("profile.avatarSuccess"), "success");
  } catch (err) {
    // Revert on error if needed
    avatarModel.value = auth.user?.image;
    showToast?.(err.response?.data?.message || t("common.error"), "error");
  } finally {
    uploading.value = false;
  }
}

// ── Validation ─────────────────────────────────────────────────
function validate() {
  let valid = true;
  errors.name = errors.email = errors.password = errors.confirmPassword = "";

  if (!form.name) {
    errors.name = t("profile.errors.usernameRequired");
    valid = false;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email) {
    errors.email = t("profile.errors.emailRequired");
    valid = false;
  } else if (!emailRe.test(form.email)) {
    errors.email = t("profile.errors.emailInvalid");
    valid = false;
  }

  if (form.password) {
    if (form.password.length < 8) {
      errors.password = t("profile.errors.passwordTooShort");
      valid = false;
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = t("profile.errors.passwordMismatch");
      valid = false;
    }
  }

  return valid;
}

// ── Save profile text fields ───────────────────────────────────
async function handleSave() {
  if (!validate()) return;

  saving.value = true;
  try {
    // API requires multipart/form-data for PUT /users/:id
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    if (form.password) fd.append("password", form.password);

    const { data } = await api.put(`/users/${auth.user.id}`, fd);

    const updated = data.data || data.user || {};
    if (updated && Object.keys(updated).length) {
      auth.user = { ...auth.user, ...updated };
      localStorage.setItem("user", JSON.stringify(auth.user));
    }

    form.password = "";
    form.confirmPassword = "";

    showToast?.(data.message || t("profile.saveSuccess"), "success");
  } catch (err) {
    showToast?.(err.response?.data?.message || t("common.error"), "error");
  } finally {
    saving.value = false;
  }
}
</script>
