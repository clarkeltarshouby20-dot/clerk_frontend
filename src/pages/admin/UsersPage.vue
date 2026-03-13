<template>
  <div class="space-y-6">
    <!-- Page header row -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h2
          class="text-base sm:text-lg lg:text-xl font-bold text-textPrimary tracking-tight"
        >
          {{ $t("admin.users.title") }}
        </h2>
        <p class="text-sm text-textSecondary mt-0.5">
          {{ $t("admin.users.subtitle") }}
        </p>
      </div>
      <!-- Live user count badge -->
      <span
        class="badge bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm px-3 py-1 self-start sm:self-auto"
      >
        {{ pagination.total }} {{ $t("admin.users.countLabel") }}
      </span>
    </div>

    <!-- Search bar -->
    <div class="relative w-full sm:max-w-sm">
      <Search
        class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none"
      />
      <input
        v-model="searchQuery"
        type="search"
        class="form-input ps-9 text-sm w-full"
        :placeholder="$t('common.search') + '…'"
        @input="debouncedSearch"
      />
    </div>

    <!-- Table card -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t("admin.users.name") }}</th>
              <th>{{ $t("admin.users.email") }}</th>
              <th>{{ $t("admin.users.role") }}</th>
              <th>{{ $t("admin.users.joined") }}</th>
              <th class="text-end w-28">{{ $t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading skeleton rows -->
            <template v-if="loading">
              <tr v-for="i in 5" :key="i">
                <td colspan="6" class="py-3">
                  <div class="skeleton h-4 rounded w-full" />
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <tr v-else-if="!users.length">
              <td colspan="6" class="text-center py-14 text-textSecondary">
                <Users class="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{{ $t("admin.users.empty") }}</p>
              </td>
            </tr>

            <!-- Data rows -->
            <tr v-else v-for="(user, index) in users" :key="user.id">
              <td class="font-mono text-xs text-textSecondary w-10">
                {{ (pagination.page - 1) * 15 + index + 1 }}
              </td>

              <!-- Avatar + name -->
              <td>
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 shrink-0"
                  >
                    <img
                      v-if="user.image"
                      :src="user.image"
                      :alt="user.name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else>{{ initials(user.name) }}</span>
                  </span>
                  <span
                    class="font-medium text-sm text-gray-800 dark:text-gray-100"
                    >{{ user.name }}</span
                  >
                </div>
              </td>

              <td class="text-sm text-textSecondary font-medium">
                {{ user.email }}
              </td>

              <!-- Role badge -->
              <td>
                <span :class="['badge', roleBadgeClass(user.role)]">
                  {{ $t(`admin.roleBadge.${user.role || "user"}`) }}
                </span>
              </td>

              <td class="text-xs text-textSecondary">
                {{ new Date(user.created_at).toLocaleDateString() }}
              </td>

              <!-- Action buttons -->
              <td class="text-end">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEdit(user)"
                    class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    :title="$t('common.edit')"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    :title="$t('common.delete')"
                    :disabled="user.id === auth.user?.id"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.pages > 1"
        class="px-4 py-3 border-t border-borderThin"
      >
        <PaginationBar
          :current="pagination.page"
          :pages="pagination.pages"
          @change="fetchUsers"
        />
      </div>
    </div>

    <!-- ── Edit / Create Modal ─────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="editModal = false"
          />
          <div
            class="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <!-- Header -->
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-lg text-textPrimary tracking-tight">
                {{ $t("admin.users.editTitle") }}
              </h3>
              <button
                @click="editModal = false"
                class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-textSecondary hover:text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- User being edited -->
            <p class="text-xs text-textSecondary -mt-1 flex items-center gap-1.5">
              <UserCircle class="w-4 h-4" />
              #{{ editForm.id }} · {{ editForm.originalEmail }}
            </p>

            <!-- Error -->
            <Transition name="slide-up">
              <p
                v-if="editError"
                class="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
              >
                {{ editError }}
              </p>
            </Transition>

            <form @submit.prevent="handleSave" class="space-y-4">
              <!-- ── Avatar upload ───────────────────────────────── -->
              <div class="py-2">
                <ImageUploadSingle
                  v-model="editForm.imageFile"
                  shape="circle"
                  :uploading="saving"
                  :max-size="5242880"
                  :label="$t('admin.users.avatarHint') || 'User Avatar'"
                />
              </div>

              <!-- Name -->
              <div>
                <label class="form-label">{{ $t("admin.users.name") }}</label>
                <input
                  v-model.trim="editForm.name"
                  type="text"
                  class="form-input"
                  :class="{
                    'border-red-400 focus:ring-red-400': !editForm.name,
                  }"
                  required
                />
              </div>

              <!-- Email -->
              <div>
                <label class="form-label">{{ $t("admin.users.email") }}</label>
                <input
                  v-model.trim="editForm.email"
                  type="email"
                  class="form-input"
                  required
                />
              </div>

              <!-- Role — only owners can set roles -->
              <div>
                <label class="form-label">
                  {{ $t("admin.users.role") }}
                  <span
                    class="ms-1 badge bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px]"
                  >
                    {{ $t("admin.users.ownerOnly") }}
                  </span>
                </label>
                <select v-model="editForm.role" class="form-input">
                  <option
                    v-for="r in roleOptions"
                    :key="r.value"
                    :value="r.value"
                  >
                    {{ r.label }}
                  </option>
                </select>
                <p class="text-xs text-amber-500 mt-1 flex items-center gap-1">
                  <ShieldAlert class="w-3.5 h-3.5 shrink-0" />
                  {{ $t("admin.users.roleWarning") }}
                </p>
              </div>

              <!-- ── New Password (optional) ────────────────────── -->
              <div>
                <label class="form-label">
                  {{ $t("admin.users.newPassword") }}
                  <span class="ms-1 text-[10px] text-textSecondary"
                    >({{ $t("common.optional") }})</span
                  >
                </label>
                <div class="relative">
                  <input
                    v-model="editForm.newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-input pe-10"
                    :placeholder="$t('admin.users.passwordPlaceholder')"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute end-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textSecondary dark:hover:text-gray-300"
                    tabindex="-1"
                  >
                    <Eye v-if="!showPassword" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
                <!-- Strength hint -->
                <p
                  v-if="editForm.newPassword"
                  :class="[
                    'text-xs mt-1',
                    editForm.newPassword.length < 8
                      ? 'text-red-500'
                      : 'text-emerald-600 dark:text-emerald-400',
                  ]"
                >
                  {{
                    editForm.newPassword.length < 8
                      ? $t("admin.users.passwordTooShort")
                      : $t("admin.users.passwordOk")
                  }}
                </p>
              </div>

              <!-- Footer buttons -->
              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  @click="editModal = false"
                  class="btn-secondary"
                >
                  {{ $t("common.cancel") }}
                </button>
                <button type="submit" :disabled="saving" class="btn-primary">
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
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm Modal ─────────────────────────────────── -->
    <ConfirmModal
      v-model="deleteModal"
      :title="$t('admin.users.deleteTitle')"
      :message="$t('admin.users.deleteConfirm', { name: userToDelete?.name })"
      :confirm-label="$t('common.delete')"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  UserCircle,
  Users,
  ShieldAlert,
  Camera,
  Plus,
  Eye,
  EyeOff,
} from "lucide-vue-next";
import PaginationBar from "@/components/PaginationBar.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ImageUploadSingle from "@/components/ImageUploadSingle.vue";
import { useAuthStore } from "@/stores/auth.js";
import api from "@/axios.js";

const { t } = useI18n();
const auth = useAuthStore();
const showToast = inject("showToast");

// ── State ──────────────────────────────────────────────────────
const users = ref([]);
const loading = ref(true);
const saving = ref(false);
const searchQuery = ref("");
const pagination = reactive({ page: 1, pages: 1, total: 0 });

const editModal = ref(false);
const deleteModal = ref(false);
const editError = ref("");
const userToDelete = ref(null);
const showPassword = ref(false);

const editForm = reactive({
  id: null,
  name: "",
  email: "",
  role: "user",
  originalEmail: "",
  imageFile: null,
  newPassword: "",
});

// ── Role options (owner-controlled) ───────────────────────────
const roleOptions = computed(() => [
  { value: "user", label: t("admin.users.roles.user") },
  { value: "admin", label: t("admin.users.roles.admin") },
  { value: "owner", label: t("admin.users.roles.owner") },
]);

// ── Helpers ────────────────────────────────────────────────────
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function roleBadgeClass(role) {
  if (role === "owner")
    return "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300";
  if (role === "admin")
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return "bg-borderThin text-textSecondary font-medium";
}

// ── Search debounce ────────────────────────────────────────────
let searchTimer = null;
function debouncedSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchUsers(1), 350);
}

// ── Fetch ──────────────────────────────────────────────────────
async function fetchUsers(page = 1) {
  loading.value = true;
  pagination.page = page;
  try {
    const params = { page, limit: 15 };
    if (searchQuery.value.trim()) params.search = searchQuery.value.trim();
    const { data } = await api.get("/users", { params });
    users.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

// ── Edit ───────────────────────────────────────────────────────
function openEdit(user) {
  Object.assign(editForm, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    originalEmail: user.email,
    imageFile: user.image || null, // ImageUploadSingle handles string or File
    newPassword: "",
  });
  showPassword.value = false;
  editError.value = "";
  editModal.value = true;
}

/** Called when the admin picks a new avatar file */
// function onAvatarChange(e) { ... } removed in favor of ImageUploadSingle

async function handleSave() {
  editError.value = "";

  // ── Validation ────────────────────────────────────────────────
  if (!editForm.name.trim()) {
    editError.value = t("profile.errors.usernameRequired");
    return;
  }
  if (editForm.newPassword && editForm.newPassword.length < 8) {
    editError.value = t("admin.users.passwordTooShort");
    return;
  }

  saving.value = true;
  try {
    // Build FormData — API endpoint is PUT /users/:id (multipart)
    const fd = new FormData();
    fd.append("name", editForm.name.trim());
    fd.append("email", editForm.email.trim());

    // Role is ONLY sent when the logged-in user is the owner
    if (auth.isOwner) {
      fd.append("role", editForm.role);
    }
    // Append image only when a new file was selected
    if (editForm.imageFile && editForm.imageFile instanceof File) {
      fd.append("image", editForm.imageFile);
    }
    // Append password only when the admin actually typed one
    if (editForm.newPassword.trim()) {
      fd.append("password", editForm.newPassword.trim());
    }

    const { data } = await api.put(`/users/${editForm.id}`, fd);

    showToast?.(data.message || t("admin.users.updateSuccess"), "success");
    // Clear password field after success (security best practice)
    editForm.newPassword = "";
    editModal.value = false;
    fetchUsers(pagination.page);
  } catch (e) {
    editError.value = e.response?.data?.message || t("common.error");
  } finally {
    saving.value = false;
  }
}

// ── Delete ─────────────────────────────────────────────────────
function confirmDelete(user) {
  userToDelete.value = user;
  deleteModal.value = true;
}

async function handleDelete() {
  try {
    const { data } = await api.delete(`/users/${userToDelete.value.id}`);
    showToast?.(data.message || t("admin.users.deleteSuccess"), "success");
    deleteModal.value = false;
    fetchUsers(pagination.page);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
    deleteModal.value = false;
  }
}

onMounted(() => fetchUsers());
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-leave-active {
  transition: all 0.15s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(8px);
}
</style>
