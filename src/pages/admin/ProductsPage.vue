<template>
  <div class="space-y-6">
    <!-- Toolbar -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h2
        class="text-base sm:text-lg lg:text-xl font-bold text-textPrimary tracking-tight"
      >
        {{ $t("admin.products") }}
      </h2>
      <button @click="openCreate" class="btn-primary self-start sm:self-auto">
        <Plus class="w-4 h-4" />
        {{ $t("admin.addProduct") }}
      </button>
    </div>

    <!-- Search -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative w-full sm:w-auto sm:flex-1">
        <Search
          class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary"
        />
        <input
          v-model="search"
          @input="debouncedFetch"
          type="text"
          :placeholder="$t('products.searchPlaceholder')"
          class="form-input ps-9 w-full"
        />
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="loading && products.length === 0" class="text-center py-12 text-textSecondary">
      {{ $t("common.loading") }}
    </div>
    
    <div v-else-if="products.length === 0" class="card p-12 text-center text-textSecondary">
      <PackageOpen class="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p class="font-bold uppercase tracking-widest text-xs">{{ $t("common.noResults") }}</p>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="p in products"
          :key="p.id"
          class="card flex flex-col group hover:border-primary-500/50 transition-all duration-300"
        >
          <!-- Image Area -->
          <div class="relative aspect-video overflow-hidden bg-gray-100">
            <img
              :src="p.main_image"
              :alt="p.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @error="(e) => (e.target.src = 'https://placehold.co/400x300')"
            />
            <div class="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="openEdit(p)"
                class="p-2 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-xl text-blue-500 shadow-lg hover:bg-blue-500 hover:text-white transition-all"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button
                @click="askDelete(p)"
                class="p-2 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            
            <!-- Stock Badge -->
            <div class="absolute bottom-2 left-2">
              <span
                :class="[
                  'badge shadow-sm backdrop-blur-sm',
                  p.stock > 0
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 border border-red-500/20',
                ]"
              >
                {{ p.stock > 0 ? `${p.stock} In Stock` : 'Out of Stock' }}
              </span>
            </div>
          </div>

          <!-- Info Area -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-1">
                <h3 class="font-bold text-textPrimary tracking-tight truncate flex-1">
                  {{ p.name }}
                </h3>
                <span class="text-[10px] font-black text-textSecondary opacity-30 mt-1">#{{ p.id }}</span>
              </div>
              <p v-if="p.name_ar" class="text-xs text-textSecondary truncate mb-3" dir="rtl">
                {{ p.name_ar }}
              </p>
              
              <div class="flex items-center gap-2 mb-4">
                <span class="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-textSecondary uppercase tracking-wider">
                  {{ p.category_name }}
                </span>
                <div v-if="!p.is_active" class="px-2 py-0.5 rounded-lg bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider">
                  Hidden
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-borderThin flex items-center justify-between">
              <div class="flex flex-col">
                <span v-if="p.old_price" class="text-[10px] text-red-500 line-through opacity-70 font-bold">
                  ${{ Number(p.old_price).toFixed(2) }}
                </span>
                <span class="font-black text-primary-600 dark:text-primary-400">
                  ${{ Number(p.price).toFixed(2) }}
                </span>
              </div>
              
              <!-- Tablet/Mobile Mobile Actions -->
              <div class="flex sm:hidden gap-1">
                 <button @click="openEdit(p)" class="p-2 text-blue-500"><Edit2 class="w-4 h-4" /></button>
                 <button @click="askDelete(p)" class="p-2 text-red-500"><Trash2 class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Card-Footer Style -->
      <div class="card bg-background px-4 py-3 border-none shadow-lg">
        <PaginationBar
          :current="pagination.page"
          :pages="pagination.pages"
          @change="fetchProducts"
        />
      </div>
    </div>

    <!-- Delete confirm modal -->
    <ConfirmModal
      v-model="deleteModal"
      :title="$t('admin.deleteProduct')"
      :message="$t('admin.confirmDelete')"
      @confirm="deleteProduct"
    />

    <!-- Create / Edit drawer modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="formModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="formModal = false"
        >
          <div
            class="relative bg-surface rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 animate-bounce-in overflow-hidden border border-borderThin"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-2xl bg-primary-100/50 dark:bg-primary-900/40 text-primary-600">
                  <Plus v-if="!editingProduct" class="w-5 h-5" />
                  <Edit2 v-else class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-black text-xl text-textPrimary tracking-tight">
                    {{ editingProduct ? $t("admin.editProduct") : $t("admin.addProduct") }}
                  </h3>
                  <p class="text-[10px] text-textSecondary uppercase tracking-widest font-bold opacity-60">
                    {{ editingProduct ? `ID: #${editingProduct.id}` : $t('products.addSubtitle') || 'Create New Catalog Item' }}
                  </p>
                </div>
              </div>
              <button
                @click="formModal = false"
                class="p-2 rounded-xl text-textSecondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="saveProduct" class="space-y-6 max-h-[75vh] overflow-y-auto px-1 -mx-1 pr-3 scrollbar-thin">
              <!-- Name & Category Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-4">
                  <div>
                    <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("common.name") }} *</label>
                    <input v-model="form.name" required class="form-input shadow-none focus:ring-1" />
                  </div>
                  <div>
                    <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.arabicName") }}</label>
                    <input v-model="form.name_ar" dir="rtl" class="form-input shadow-none focus:ring-1 text-right" />
                  </div>
                </div>
                <div class="space-y-4">
                  <div>
                    <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("common.category") }} *</label>
                    <select v-model="form.category_id" required class="form-input shadow-none focus:ring-1">
                      <option value="" disabled>{{ $t("admin.selectCategory") }}</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                  </div>
                  <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-borderThin">
                      <span class="text-sm font-semibold text-textSecondary">{{ $t("admin.isActive") }}</span>
                      <input
                        type="checkbox"
                        v-model="form.is_active"
                        class="rounded text-primary-500 focus:ring-primary-500 w-5 h-5 cursor-pointer"
                      />
                  </div>
                </div>
              </div>

              <!-- Pricing & Stock Row -->
              <div class="bg-primary-50/30 dark:bg-primary-900/10 p-5 rounded-2xl border border-primary-100/50 dark:border-primary-900/20 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label class="form-label text-xs uppercase tracking-wider text-primary-600 mb-1.5">{{ $t("admin.currentPrice") }} *</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-40">$</span>
                    <input v-model.number="form.price" type="number" step="0.01" min="0" required class="form-input ps-7 shadow-none border-primary-100 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.oldPrice") }}</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-40">$</span>
                    <input v-model.number="form.old_price" type="number" step="0.01" min="0" class="form-input ps-7 shadow-none focus:ring-1 border-borderThin" />
                  </div>
                </div>
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("common.stock") }}</label>
                  <input v-model.number="form.stock" type="number" min="0" class="form-input shadow-none focus:ring-1 border-borderThin" />
                </div>
              </div>

              <!-- Descriptions -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.descEn") }}</label>
                  <textarea v-model="form.description" rows="3" class="form-input resize-none shadow-none focus:ring-1 text-sm"></textarea>
                </div>
                <div>
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-1.5">{{ $t("admin.descAr") }}</label>
                  <textarea v-model="form.description_ar" rows="3" dir="rtl" class="form-input resize-none shadow-none focus:ring-1 text-sm text-right"></textarea>
                </div>
              </div>

              <!-- Images -->
              <div class="space-y-3 p-1">
                <div class="flex items-center justify-between">
                  <label class="form-label text-xs uppercase tracking-wider opacity-70 mb-0">{{ $t("admin.uploadImages") }}</label>
                  <span class="text-[9px] font-black uppercase tracking-tighter text-textSecondary opacity-50">{{ $t("admin.imageRequirements2MB") }}</span>
                </div>
                <div class="bg-white dark:bg-gray-800/50 p-4 rounded-2xl border border-dashed border-borderMedium">
                  <ImageUploader 
                    :existing-images="form.existingImages"
                    @update:images="onImagesUpdate"
                  />
                </div>
              </div>

              <!-- Error & Footer -->
              <div v-if="formError" class="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                <p class="text-xs text-red-600 font-bold uppercase text-center">
                  {{ formError }}
                </p>
              </div>

              <div class="flex gap-3 justify-end sticky bottom-0 bg-surface/90 backdrop-blur-md pt-6 -mx-6 px-6 pb-2 mt-4 border-t border-borderThin">
                <button
                  type="button"
                  @click="formModal = false"
                  class="btn-secondary px-8 font-bold text-xs uppercase tracking-widest"
                >
                  {{ $t("common.cancel") }}
                </button>
                <button type="submit" :disabled="saving" class="btn-primary min-w-[140px] font-black text-xs uppercase tracking-widest py-3">
                  <LoadingSpinner v-if="saving" :size="18" />
                  {{ editingProduct ? $t("common.update") : $t("common.create") }}
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
import { Plus, Search, Edit2, Trash2, X, PackageOpen } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import ConfirmModal from "@/components/ConfirmModal.vue";
import PaginationBar from "@/components/PaginationBar.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ImageUploader from "@/components/ImageUploader.vue";
import api from "@/axios.js";

const { t } = useI18n();
const showToast = inject("showToast");

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const search = ref("");
const pagination = reactive({ page: 1, pages: 1, total: 0 });

const formModal = ref(false);
const editingProduct = ref(null);
const saving = ref(false);
const formError = ref("");
const form = reactive({
  name: "",
  name_ar: "",
  category_id: "",
  price: "",
  old_price: "",
  stock: 0,
  description: "",
  description_ar: "",
  is_active: true,
  images: [],
  existingImages: [],
});

const deleteModal = ref(false);
const productToDelete = ref(null);

async function fetchProducts(page = 1) {
  loading.value = true;
  try {
    const params = { page, limit: 20 };
    if (search.value) params.name = search.value;
    const { data } = await api.get("/products", { params });
    products.value = data.data;
    Object.assign(pagination, data.pagination);
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    const { data } = await api.get("/categories");
    categories.value = data.data;
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  }
}

let debounceTimer;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchProducts(1), 400);
}

function openCreate() {
  editingProduct.value = null;
  Object.assign(form, {
    name: "",
    name_ar: "",
    category_id: "",
    price: "",
    old_price: "",
    stock: 0,
    description: "",
    description_ar: "",
    is_active: true,
    images: [],
    existingImages: [],
  });
  formError.value = "";
  formModal.value = true;
}

function openEdit(p) {
  editingProduct.value = p;
  Object.assign(form, {
    name: p.name,
    name_ar: p.name_ar || "",
    category_id: p.category_id,
    price: p.price,
    old_price: p.old_price || "",
    stock: p.stock,
    description: p.description || "",
    description_ar: p.description_ar || "",
    is_active: !!p.is_active,
    images: [],
    existingImages: p.images || [],
  });
  formError.value = "";
  formModal.value = true;
}

function onImagesUpdate(newFiles) {
  form.images = newFiles;
}

async function saveProduct() {
  formError.value = "";
  saving.value = true;
  try {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("name_ar", form.name_ar);
    fd.append("category_id", form.category_id);
    fd.append("price", form.price);
    if (form.old_price) fd.append("old_price", form.old_price);
    fd.append("stock", form.stock);
    fd.append("description", form.description);
    fd.append("description_ar", form.description_ar);
    fd.append("is_active", form.is_active ? 1 : 0);
    
    // Filter out null/empty slots and append
    const validImages = form.images.filter(img => img !== null);
    validImages.forEach((f) => fd.append("images", f));

    // Validation: old_price must be > price
    if (form.old_price && Number(form.old_price) <= Number(form.price)) {
      formError.value = "السعر القديم يجب أن يكون أكبر من السعر الحالي. (Original price must be higher)";
      saving.value = false;
      return;
    }

    if (editingProduct.value) {
      await api.put(`/products/${editingProduct.value.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    formModal.value = false;
    showToast?.(
      editingProduct.value
        ? t("common.update") + " ✓"
        : t("common.create") + " ✓",
      "success",
    );
    fetchProducts(pagination.page);
  } catch (e) {
    formError.value = e.response?.data?.message || t("admin.saveError");
  } finally {
    saving.value = false;
  }
}

function askDelete(p) {
  productToDelete.value = p;
  deleteModal.value = true;
}

async function deleteProduct() {
  try {
    await api.delete(`/products/${productToDelete.value.id}`);
    showToast?.(t("common.delete") + " ✓", "success");
    fetchProducts(pagination.page);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  }
}

onMounted(() => {
  fetchProducts();
  loadCategories();
});
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.25s ease;
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
