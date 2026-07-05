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
          <div class="mt-1 flex flex-wrap gap-1.5">
            <span
              :class="[
                'badge',
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
            <span
              v-if="hasCategoryDiscount(cat)"
              class="badge inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <Percent class="h-3 w-3" />
              {{ formatCategoryDiscountLabel(cat) }}
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button
            type="button"
            :title="$t('admin.categoryDiscountBtn')"
            @click="openDiscount(cat)"
            class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          >
            <Percent class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="openEdit(cat)"
            class="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <Edit2 class="w-4 h-4" />
          </button>
          <button
            type="button"
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

    <!-- Category discount modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="discountModal"
          class="admin-modal-shell"
          @click.self="discountModal = false"
        >
          <div class="admin-modal-panel max-w-md">
            <div class="admin-modal-header">
              <div>
                <h3 class="text-lg font-bold tracking-tight text-textPrimary">
                  {{ $t("admin.categoryDiscount.title") }}
                </h3>
                <p v-if="discountCat" class="mt-1 text-sm text-textSecondary">
                  {{ discountCat.name }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl text-textSecondary transition hover:bg-surface"
                @click="discountModal = false"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="applyDiscount">
              <div class="admin-modal-body space-y-4">
                <p class="text-sm text-textSecondary">
                  {{ $t("admin.categoryDiscount.hint") }}
                </p>

                <div class="flex gap-2">
                  <button
                    type="button"
                    class="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
                    :class="
                      discountForm.type === 'percent'
                        ? 'bg-primary-500 text-white'
                        : 'bg-background text-textSecondary hover:text-textPrimary'
                    "
                    @click="discountForm.type = 'percent'"
                  >
                    {{ $t("admin.categoryDiscount.typePercent") }}
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
                    :class="
                      discountForm.type === 'fixed'
                        ? 'bg-primary-500 text-white'
                        : 'bg-background text-textSecondary hover:text-textPrimary'
                    "
                    @click="discountForm.type = 'fixed'"
                  >
                    {{ $t("admin.categoryDiscount.typeFixed") }}
                  </button>
                </div>

                <div>
                  <label class="form-label mb-1.5 text-xs uppercase tracking-wider opacity-70">
                    {{ $t("admin.categoryDiscount.valueLabel") }}
                  </label>
                  <input
                    v-model.number="discountForm.value"
                    type="number"
                    min="0.01"
                    :max="discountForm.type === 'percent' ? 100 : undefined"
                    step="0.01"
                    required
                    class="form-input"
                    :placeholder="
                      discountForm.type === 'percent'
                        ? $t('admin.categoryDiscount.valuePlaceholderPercent')
                        : $t('admin.categoryDiscount.valuePlaceholderFixed')
                    "
                  />
                </div>

                <p v-if="discountError" class="text-xs font-bold text-red-500">
                  {{ discountError }}
                </p>
              </div>

              <div class="admin-modal-footer">
                <button
                  type="button"
                  class="btn-secondary w-full sm:w-auto"
                  @click="discountModal = false"
                >
                  {{ $t("common.cancel") }}
                </button>
                <button
                  type="submit"
                  class="btn-primary min-w-[120px] w-full sm:w-auto"
                  :disabled="discountSaving"
                >
                  <LoadingSpinner v-if="discountSaving" :size="18" />
                  {{ $t("admin.categoryDiscount.apply") }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Create / Edit modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="formModal"
          class="admin-modal-shell"
          @click.self="formModal = false"
        >
          <div class="admin-modal-panel max-w-2xl">
            <div class="admin-modal-header">
              <div>
                <h3 class="text-lg font-bold tracking-tight text-textPrimary sm:text-xl">
                  {{
                    editingCat
                      ? $t("admin.editCategory")
                      : $t("admin.addCategory")
                  }}
                </h3>
                <p class="mt-1 text-sm text-textSecondary">
                  {{ $t("admin.categories") }}
                </p>
              </div>
              <button
                @click="formModal = false"
                class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl text-textSecondary transition hover:bg-surface"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="saveCategory">
              <div class="admin-modal-body space-y-5">
                <div class="admin-form-grid">
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("common.name") }} *</label>
                  <input v-model="form.name" required class="form-input shadow-none focus:ring-1" />
                </div>
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.arabicName") }}</label>
                  <input v-model="form.name_ar" dir="rtl" class="form-input shadow-none focus:ring-1" />
                </div>
              </div>

              <div class="admin-form-grid">
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

              <div class="admin-panel-muted p-4">
                <ImageUploadSingle
                  v-model="form.imageFile"
                  :label="$t('common.image')"
                  :label-icon="ImageIcon"
                  :max-size="2097152"
                  :subtext="$t('admin.imageRequirements2MB')"
                />
              </div>

              <div class="admin-panel-muted flex items-center justify-between p-3">
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
              </div>

              <div class="admin-modal-footer">
                <button
                  type="button"
                  @click="formModal = false"
                  class="btn-secondary w-full px-6 sm:w-auto"
                >
                  {{ $t("common.cancel") }}
                </button>
                <button type="submit" :disabled="saving" class="btn-primary min-w-[120px] w-full sm:w-auto">
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
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Percent } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ImageUploadSingle from "@/components/ImageUploadSingle.vue";
import api from "@/axios.js";
import { useCurrency } from "@/composables/useCurrency.js";

const { t } = useI18n();
const { formatCurrency } = useCurrency();
const showToast = inject("showToast");

const categories = ref([]);
const loading = ref(true);
const formModal = ref(false);
const editingCat = ref(null);
const saving = ref(false);
const formError = ref("");
const deleteModal = ref(false);
const catToDelete = ref(null);
const discountModal = ref(false);
const discountCat = ref(null);
const discountSaving = ref(false);
const discountError = ref("");
const discountForm = reactive({
  type: "percent",
  value: "",
});
const form = reactive({
  name: "",
  name_ar: "",
  slug: "",
  sort_order: 0,
  is_active: true,
  imageFile: null,
});

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
    imageFile: cat.image_url || null,
  });
  formError.value = "";
  formModal.value = true;
}

function hasCategoryDiscount(cat) {
  return (
    (cat.discount_type === "percent" || cat.discount_type === "fixed") &&
    Number(cat.discount_value) > 0
  );
}

function formatCategoryDiscountLabel(cat) {
  if (cat.discount_type === "percent") {
    return `-${Number(cat.discount_value)}%`;
  }
  return `-${formatCurrency(Number(cat.discount_value))}`;
}

function openDiscount(cat) {
  discountCat.value = cat;
  if (hasCategoryDiscount(cat)) {
    discountForm.type = cat.discount_type;
    discountForm.value = Number(cat.discount_value);
  } else {
    discountForm.type = "percent";
    discountForm.value = "";
  }
  discountError.value = "";
  discountModal.value = true;
}

function validateDiscountForm() {
  const value = Number(discountForm.value);
  if (!value || value <= 0) {
    discountError.value = t("admin.categoryDiscount.invalidValue");
    return false;
  }
  if (discountForm.type === "percent" && value > 100) {
    discountError.value = t("admin.categoryDiscount.invalidValue");
    return false;
  }
  discountError.value = "";
  return true;
}

async function applyDiscount() {
  if (!validateDiscountForm() || !discountCat.value) return;

  discountSaving.value = true;
  try {
    const { data } = await api.post(
      `/categories/${discountCat.value.id}/apply-discount`,
      {
        discount_type: discountForm.type,
        discount_value: Number(discountForm.value),
      },
    );
    discountModal.value = false;
    await fetchCategories();
    showToast?.(
      t("admin.categoryDiscount.success", {
        count: data.data?.updated_count || 0,
      }),
      "success",
    );
  } catch (e) {
    discountError.value =
      e.response?.data?.message || t("admin.categoryDiscount.failed");
  } finally {
    discountSaving.value = false;
  }
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
