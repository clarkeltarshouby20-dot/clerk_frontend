<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2
          class="text-base font-bold tracking-tight text-textPrimary sm:text-lg lg:text-xl"
        >
          {{ $t("admin.users.title") }}
        </h2>
        <p class="mt-0.5 text-sm text-textSecondary">
          {{ $t("admin.users.subtitle") }}
        </p>
      </div>

      <span
        class="badge self-start border border-primary-300/40 bg-primary-100 px-3 py-1 text-sm text-primary-800 dark:border-primary-700/30 dark:bg-primary-900/30 dark:text-primary-300 sm:self-auto"
      >
        {{ pagination.total }} {{ $t("admin.users.countLabel") }}
      </span>
    </div>

    <div class="relative w-full sm:max-w-sm">
      <Search
        class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary"
      />
      <input
        v-model="searchQuery"
        type="search"
        class="form-input w-full ps-9 text-sm"
        :placeholder="$t('common.search') + '...'"
        @input="debouncedSearch"
      />
    </div>

    <div class="space-y-4 md:hidden">
      <template v-if="loading">
        <div
          v-for="i in 4"
          :key="`mobile-skeleton-${i}`"
          class="admin-mobile-card"
        >
          <div class="skeleton h-5 w-32 rounded-full" />
          <div class="skeleton h-4 w-full rounded-full" />
          <div class="skeleton h-4 w-2/3 rounded-full" />
        </div>
      </template>

      <div
        v-else-if="!users.length"
        class="card p-10 text-center text-textSecondary"
      >
        <Users class="mx-auto mb-3 h-10 w-10 opacity-30" />
        <p>{{ $t("admin.users.empty") }}</p>
      </div>

      <template v-else>
        <div
          v-for="user in users"
          :key="`mobile-${user.id}`"
          class="admin-mobile-card"
        >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-300"
            >
              <img
                v-if="user.image"
                :src="user.image"
                :alt="user.name"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ initials(user.name) }}</span>
            </span>

            <div class="min-w-0">
              <p class="truncate font-semibold text-textPrimary">
                {{ user.name }}
              </p>
              <p class="truncate text-sm text-textSecondary">
                {{ user.email }}
              </p>
            </div>
          </div>

          <span :class="['badge shrink-0', roleBadgeClass(user.role)]">
            {{ $t(`admin.roleBadge.${user.role || "user"}`) }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs text-textSecondary">
          <div class="admin-panel-muted px-3 py-2">
            <p class="font-semibold text-textPrimary">#{{ user.id }}</p>
            <p>{{ $t("admin.users.countLabel") }}</p>
          </div>
          <div class="admin-panel-muted px-3 py-2">
            <p class="font-semibold text-textPrimary">
              {{ formatDate(user.created_at) }}
            </p>
            <p>{{ $t("admin.users.joined") }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="openEdit(user)"
            class="btn-secondary flex-1 px-4 py-3"
          >
            <Edit2 class="h-4 w-4" />
            {{ $t("common.edit") }}
          </button>
          <button
            @click="confirmDelete(user)"
            class="inline-flex min-h-[46px] min-w-[46px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
            :title="$t('common.delete')"
            :disabled="user.id === auth.user?.id"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
        </div>
      </template>
    </div>

    <div class="card hidden overflow-hidden md:block">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t("admin.users.name") }}</th>
              <th>{{ $t("admin.users.email") }}</th>
              <th>{{ $t("admin.users.role") }}</th>
              <th>{{ $t("admin.users.joined") }}</th>
              <th class="w-28 text-end">{{ $t("common.actions") }}</th>
            </tr>
          </thead>

          <tbody>
            <template v-if="loading">
              <tr v-for="i in 5" :key="i">
                <td colspan="6" class="py-3">
                  <div class="skeleton h-4 w-full rounded" />
                </td>
              </tr>
            </template>

            <tr v-else-if="!users.length">
              <td colspan="6" class="py-14 text-center text-textSecondary">
                <Users class="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p>{{ $t("admin.users.empty") }}</p>
              </td>
            </tr>

            <template v-else>
              <tr v-for="(user, index) in users" :key="user.id">
                <td class="w-10 font-mono text-xs text-textSecondary">
                  {{ (pagination.page - 1) * 15 + index + 1 }}
                </td>

                <td>
                  <div class="flex items-center gap-2.5">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xs font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-300"
                    >
                      <img
                        v-if="user.image"
                        :src="user.image"
                        :alt="user.name"
                        class="h-full w-full object-cover"
                      />
                      <span v-else>{{ initials(user.name) }}</span>
                    </span>
                    <span class="text-sm font-medium text-textPrimary">
                      {{ user.name }}
                    </span>
                  </div>
                </td>

                <td class="text-sm font-medium text-textSecondary">
                  {{ user.email }}
                </td>

                <td>
                  <span :class="['badge', roleBadgeClass(user.role)]">
                    {{ $t(`admin.roleBadge.${user.role || "user"}`) }}
                  </span>
                </td>

                <td class="text-xs text-textSecondary">
                  {{ formatDate(user.created_at) }}
                </td>

                <td class="text-end">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="openEdit(user)"
                      class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      :title="$t('common.edit')"
                    >
                      <Edit2 class="h-4 w-4" />
                    </button>
                    <button
                      @click="confirmDelete(user)"
                      class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      :title="$t('common.delete')"
                      :disabled="user.id === auth.user?.id"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="pagination.pages > 1"
      class="card border-none bg-background px-4 py-3 shadow-lg"
    >
      <PaginationBar
        :current="pagination.page"
        :pages="pagination.pages"
        @change="fetchUsers"
      />
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="editModal"
          class="admin-modal-shell"
          @click.self="editModal = false"
        >
          <div class="admin-modal-panel max-w-3xl">
            <div class="admin-modal-header">
              <div class="flex items-start gap-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100/70 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300"
                >
                  <UserCircle class="h-6 w-6" />
                </div>
                <div>
                  <h3 class="text-lg font-bold tracking-tight text-textPrimary sm:text-xl">
                    {{ $t("admin.users.editTitle") }}
                  </h3>
                  <p class="mt-1 text-sm text-textSecondary">
                    {{ $t("admin.users.subtitle") }}
                  </p>
                </div>
              </div>

              <button
                @click="editModal = false"
                class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl text-textSecondary transition hover:bg-surface"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="handleSave">
              <div class="admin-modal-body space-y-6">
                <div
                  class="admin-panel-muted grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]"
                >
                  <div class="min-w-0 space-y-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <span
                        class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-base font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-300"
                      >
                        <img
                          v-if="typeof editForm.imageFile === 'string' && editForm.imageFile"
                          :src="editForm.imageFile"
                          :alt="editForm.name"
                          class="h-full w-full object-cover"
                        />
                        <span v-else>{{ initials(editForm.name) }}</span>
                      </span>

                      <div class="min-w-0">
                        <p class="truncate text-base font-semibold text-textPrimary">
                          {{ editForm.name || $t("admin.users.name") }}
                        </p>
                        <p class="truncate text-sm text-textSecondary">
                          {{ editForm.originalEmail }}
                        </p>
                      </div>
                    </div>

                    <div class="flex flex-wrap gap-2 text-xs">
                      <span class="badge bg-background text-textSecondary">
                        #{{ editForm.id }}
                      </span>
                      <span :class="['badge', roleBadgeClass(editForm.role)]">
                        {{ $t(`admin.roleBadge.${editForm.role || "user"}`) }}
                      </span>
                      <span
                        v-if="auth.isOwner"
                        class="badge border border-primary-300/40 bg-primary-100 text-primary-800 dark:border-primary-700/30 dark:bg-primary-900/30 dark:text-primary-300"
                      >
                        {{ $t("admin.users.ownerOnly") }}
                      </span>
                    </div>
                  </div>

                  <div class="admin-panel-muted bg-background/80 p-4">
                    <ImageUploadSingle
                      v-model="editForm.imageFile"
                      shape="circle"
                      :uploading="saving"
                      :max-size="5242880"
                      :label="$t('admin.users.avatarHint') || 'User Avatar'"
                    />
                  </div>
                </div>

                <p
                  v-if="editError"
                  class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10"
                >
                  {{ editError }}
                </p>

                <div class="admin-form-grid">
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

                  <div>
                    <label class="form-label">{{ $t("admin.users.email") }}</label>
                    <input
                      v-model.trim="editForm.email"
                      type="email"
                      class="form-input"
                      required
                    />
                  </div>
                </div>

                <div class="admin-form-grid">
                  <div class="admin-panel-muted p-4">
                    <div class="mb-3 flex items-center justify-between gap-3">
                      <label class="form-label mb-0">{{ $t("admin.users.role") }}</label>
                      <span
                        class="badge border border-primary-300/40 bg-primary-100 text-primary-800 dark:border-primary-700/30 dark:bg-primary-900/30 dark:text-primary-300"
                      >
                        {{
                          auth.isOwner
                            ? $t("admin.users.ownerOnly")
                            : $t("admin.roleBadge.owner")
                        }}
                      </span>
                    </div>

                    <select
                      v-model="editForm.role"
                      class="form-input"
                      :disabled="!auth.isOwner"
                    >
                      <option
                        v-for="r in roleOptions"
                        :key="r.value"
                        :value="r.value"
                      >
                        {{ r.label }}
                      </option>
                    </select>

                    <p
                      class="mt-2 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400"
                    >
                      <ShieldAlert class="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        {{
                          auth.isOwner
                            ? $t("admin.users.roleWarning")
                            : $t("admin.users.ownerOnly")
                        }}
                      </span>
                    </p>
                  </div>

                  <div class="admin-panel-muted p-4">
                    <label class="form-label">
                      {{ $t("admin.users.newPassword") }}
                      <span class="ms-1 text-xs text-textSecondary">
                        ({{ $t("common.optional") }})
                      </span>
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
                        class="absolute end-3 top-1/2 -translate-y-1/2 text-textSecondary transition hover:text-textPrimary"
                        tabindex="-1"
                      >
                        <Eye v-if="!showPassword" class="h-4 w-4" />
                        <EyeOff v-else class="h-4 w-4" />
                      </button>
                    </div>

                    <p
                      v-if="editForm.newPassword"
                      :class="[
                        'mt-2 text-xs',
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
                </div>
              </div>

              <div class="admin-modal-footer">
                <button
                  type="button"
                  @click="editModal = false"
                  class="btn-secondary w-full sm:w-auto"
                >
                  {{ $t("common.cancel") }}
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="btn-primary w-full min-w-[140px] sm:w-auto"
                >
                  <span
                    v-if="saving"
                    class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  />
                  <Save v-else class="h-4 w-4" />
                  {{ $t("common.save") }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { computed, inject, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  Edit2,
  Eye,
  EyeOff,
  Save,
  Search,
  ShieldAlert,
  Trash2,
  UserCircle,
  Users,
  X,
} from "lucide-vue-next";
import PaginationBar from "@/components/PaginationBar.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ImageUploadSingle from "@/components/ImageUploadSingle.vue";
import { useAuthStore } from "@/stores/auth.js";
import api from "@/axios.js";

const { t } = useI18n();
const auth = useAuthStore();
const showToast = inject("showToast");

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

const roleOptions = computed(() => [
  { value: "user", label: t("admin.users.roles.user") },
  { value: "admin", label: t("admin.users.roles.admin") },
  { value: "owner", label: t("admin.users.roles.owner") },
]);

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function roleBadgeClass(role) {
  if (role === "owner") {
    return "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-300/40 dark:border-primary-700/30";
  }
  if (role === "admin") {
    return "bg-[#eadcc2] text-[#75522a] dark:bg-[#4a3828] dark:text-[#e8cca0] border border-primary-300/40 dark:border-[#8d6a40]/30";
  }
  return "bg-[#ede3d3] text-[#755d44] dark:bg-[#433326] dark:text-[#d4b897] border border-borderThin font-medium";
}

let searchTimer = null;
function debouncedSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchUsers(1), 350);
}

async function fetchUsers(page = 1) {
  loading.value = true;
  pagination.page = page;
  try {
    const params = { page, limit: 15 };
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }
    const { data } = await api.get("/users", { params });
    users.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

function openEdit(user) {
  Object.assign(editForm, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    originalEmail: user.email,
    imageFile: user.image || null,
    newPassword: "",
  });
  showPassword.value = false;
  editError.value = "";
  editModal.value = true;
}

async function handleSave() {
  editError.value = "";

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
    const fd = new FormData();
    fd.append("name", editForm.name.trim());
    fd.append("email", editForm.email.trim());

    if (auth.isOwner) {
      fd.append("role", editForm.role);
    }
    if (editForm.imageFile && editForm.imageFile instanceof File) {
      fd.append("image", editForm.imageFile);
    }
    if (editForm.newPassword.trim()) {
      fd.append("password", editForm.newPassword.trim());
    }

    const { data } = await api.put(`/users/${editForm.id}`, fd);
    showToast?.(data.message || t("admin.users.updateSuccess"), "success");
    editForm.newPassword = "";
    editModal.value = false;
    fetchUsers(pagination.page);
  } catch (error) {
    editError.value = error.response?.data?.message || t("common.error");
  } finally {
    saving.value = false;
  }
}

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
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
    deleteModal.value = false;
  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active {
  transition: all 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .admin-modal-panel,
.modal-leave-to .admin-modal-panel {
  transform: translateY(18px) scale(0.97);
}
</style>
