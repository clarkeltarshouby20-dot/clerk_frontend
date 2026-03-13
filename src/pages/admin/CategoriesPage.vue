<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h2
        class="text-base sm:text-lg lg:text-xl font-bold text-textPrimary tracking-tight"
      >
        {{ $t("admin.categories") }}
      </h2>
      <button @click="openCreate" class="btn-primary self-start sm:self-auto">
        <Plus class="w-4 h-4" />
        {{ $t("admin.addCategory") }}
      </button>
    </div>

    <!-- Categories grid -->
    <div v-if="loading" class="text-center py-12 text-textSecondary">
      {{ $t("common.loading") }}
    </div>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="card p-4 flex items-center gap-4"
      >
        <img
          :src="cat.image_url || 'https://placehold.co/48x48'"
          class="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"
          @error="(e) => (e.target.src = 'https://placehold.co/48x48')"
        />
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-textPrimary tracking-tight truncate">
            {{ cat.name }}
          </p>
          <p
            v-if="cat.name_ar"
            class="text-sm text-textSecondary truncate"
            dir="rtl"
          >
            {{ cat.name_ar }}
          </p>
          <span
            :class="[
              'badge mt-1',
              cat.is_active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-textSecondary',
            ]"
          >
            {{
              cat.is_active
                ? $t("admin.statusActive")
                : $t("admin.statusHidden")
            }}
          </span>
        </div>
        <div class="flex flex-col gap-2">
          <button
            @click="openEdit(cat)"
            class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Edit2 class="w-4 h-4" />
          </button>
          <button
            @click="askDelete(cat)"
            class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <ConfirmModal
      v-model="deleteModal"
      :title="$t('admin.deleteCategory')"
      :message="$t('admin.confirmDelete')"
      @confirm="deleteCategory"
    />

    <!-- Create / Edit modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="formModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="formModal = false"
          />
          <div
            class="relative bg-surface rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-bounce-in"
          >
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold text-lg text-textPrimary tracking-tight">
                {{
                  editingCat
                    ? $t("admin.editCategory")
                    : $t("admin.addCategory")
                }}
              </h3>
              <button
                @click="formModal = false"
                class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-textSecondary hover:text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="saveCategory" class="space-y-5 max-h-[70vh] overflow-y-auto px-1 -mx-1 scrollbar-thin">
              <!-- Name Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("common.name") }} *</label>
                  <input v-model="form.name" required class="form-input shadow-none focus:ring-1" />
                </div>
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.arabicName") }}</label>
                  <input v-model="form.name_ar" dir="rtl" class="form-input shadow-none focus:ring-1" />
                </div>
              </div>

              <!-- Meta Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.slug") }}</label>
                  <input
                    v-model="form.slug"
                    class="form-input shadow-none focus:ring-1"
                    placeholder="e.g. electronics"
                  />
                </div>
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.sortOrder") }}</label>
                  <input
                    v-model.number="form.sort_order"
                    type="number"
                    min="0"
                    class="form-input shadow-none focus:ring-1"
                  />
                </div>
              </div>

              <!-- Image Section -->
              <div class="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-borderThin">
                <ImageUploadSingle
                  v-model="form.imageFile"
                  :label="$t('common.image')"
                  :label-icon="ImageIcon"
                  :max-size="2097152"
                  :subtext="$t('admin.imageRequirements2MB')"
                />
              </div>

              <div class="flex items-center justify-between bg-surface rounded-xl p-3 border border-borderThin shadow-sm">
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    v-model="form.is_active"
                    class="rounded text-primary-500 focus:ring-primary-500 w-4 h-4"
                  />
                  <span
                    class="text-sm font-semibold text-textSecondary group-hover:text-textPrimary transition-colors"
                    >{{ $t("admin.isActive") }}</span
                  >
                </label>
                
                <p v-if="formError" class="text-[10px] text-red-500 font-bold uppercase">
                  {{ formError }}
                </p>
              </div>

              <div class="flex gap-3 justify-end sticky bottom-0 bg-surface/80 backdrop-blur-md pt-4 mt-2">
                <button
                  type="button"
                  @click="formModal = false"
                  class="btn-secondary px-6"
                >
                  {{ $t("common.cancel") }}
                </button>
                <button type="submit" :disabled="saving" class="btn-primary min-w-[120px]">
                  <LoadingSpinner v-if="saving" :size="18" />
                  {{ editingCat ? $t("common.update") : $t("common.create") }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from "vue";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ImageUploadSingle from "@/components/ImageUploadSingle.vue";
import api from "@/axios.js";

const { t } = useI18n();
const showToast = inject("showToast");

const categories = ref([]);
const loading = ref(true);
const formModal = ref(false);
const editingCat = ref(null);
const saving = ref(false);
const formError = ref("");
const deleteModal = ref(false);
const catToDelete = ref(null);
const form = reactive({
  name: "",
  name_ar: "",
  slug: "",
  sort_order: 0,
  is_active: true,
  imageFile: null,
});

// function onImageSelect(e) { ... } removed in favor of ImageUploadSingle

async function fetchCategories() {
  loading.value = true;
  try {
    const { data } = await api.get("/categories");
    categories.value = data.data;
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingCat.value = null;
  Object.assign(form, {
    name: "",
    name_ar: "",
    slug: "",
    sort_order: 0,
    is_active: true,
    imageFile: null,
  });
  formError.value = "";
  formModal.value = true;
}

function openEdit(cat) {
  editingCat.value = cat;
  Object.assign(form, {
    name: cat.name,
    name_ar: cat.name_ar || "",
    slug: cat.slug || "",
    sort_order: cat.sort_order || 0,
    is_active: !!cat.is_active,
    imageFile: cat.image_url || null, // ImageUploadSingle handles string (URL) or File
  });
  formError.value = "";
  formModal.value = true;
}

async function saveCategory() {
  formError.value = "";
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("name_ar", form.name_ar);
    fd.append("slug", form.slug);
    fd.append("sort_order", form.sort_order);
    fd.append("is_active", form.is_active ? 1 : 0);
    if (form.imageFile && form.imageFile instanceof File) fd.append("image_url", form.imageFile);

    if (editingCat.value) {
      await api.put(`/categories/${editingCat.value.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    formModal.value = false;
    await fetchCategories();
    showToast?.(
      editingCat.value ? t("common.update") + " ✓" : t("common.create") + " ✓",
      "success",
    );
  } catch (e) {
    formError.value = e.response?.data?.message || "Error saving category";
  } finally {
    saving.value = false;
  }
}

function askDelete(cat) {
  catToDelete.value = cat;
  deleteModal.value = true;
}

async function deleteCategory() {
  try {
    await api.delete(`/categories/${catToDelete.value.id}`);
    showToast?.(t("common.delete") + " ✓", "success");
    deleteModal.value = false;
    // Update local state instead of re-fetching
    categories.value = categories.value.filter(
      (c) => c.id !== catToDelete.value.id,
    );
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
    deleteModal.value = false;
  }
}

onMounted(fetchCategories);
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.2s ease;
}
.modal-leave-active {
  transition: all 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
