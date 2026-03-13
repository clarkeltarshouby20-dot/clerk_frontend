<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h2
        class="text-base sm:text-lg lg:text-xl font-bold text-textPrimary tracking-tight flex items-center gap-2"
      >
        <MessageSquare class="w-5 h-5 text-primary-500" />
        {{ $t("admin.reviewManagement") }}
      </h2>

      <!-- Filter -->
      <div class="flex gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          @click="
            activeFilter = f.value;
            fetchReviews(1);
          "
          :class="[
            'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
            activeFilter === f.value
              ? 'bg-primary-600 text-white'
              : 'bg-borderThin text-textSecondary font-medium hover:bg-gray-200 dark:hover:bg-gray-600',
          ]"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ $t("common.product") }}</th>
              <th>{{ $t("admin.user") }}</th>
              <th>{{ $t("products.yourRating") }}</th>
              <th>{{ $t("admin.comment") }}</th>
              <th>{{ $t("admin.status") }}</th>
              <th>{{ $t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-10 text-textSecondary">
                {{ $t("common.loading") }}
              </td>
            </tr>
            <tr v-else-if="reviews.length === 0">
              <td colspan="7" class="text-center py-10 text-textSecondary">
                {{ $t("common.noResults") }}
              </td>
            </tr>
            <tr v-for="r in reviews" :key="r.id">
              <td class="text-xs text-textSecondary">{{ r.id }}</td>
              <td
                class="text-sm font-medium text-textPrimary tracking-tight max-w-[150px] truncate"
              >
                {{ r.product_name || r.product_name_ar }}
              </td>
              <td class="text-sm text-textSecondary">
                <div>{{ r.user_name }}</div>
                <div class="text-xs text-textSecondary">{{ r.user_email }}</div>
              </td>
              <td>
                <div class="flex gap-0.5">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    class="w-3.5 h-3.5"
                    :class="
                      i <= r.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-textSecondary'
                    "
                  />
                </div>
              </td>
              <td
                class="text-sm text-textSecondary font-medium max-w-[200px] truncate"
              >
                {{ r.comment || "—" }}
              </td>
              <td>
                <span
                  :class="[
                    'badge text-[10px] font-bold',
                    r.is_approved
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
                  ]"
                >
                  {{
                    r.is_approved ? $t("admin.approved") : $t("admin.hidden")
                  }}
                </span>
              </td>
              <td class="flex gap-2">
                <button
                  @click="toggleVisibility(r)"
                  class="p-1.5 rounded-lg transition-colors"
                  :class="
                    r.is_approved
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200'
                  "
                  :title="$t('admin.toggleVisibility')"
                >
                  <Eye v-if="!r.is_approved" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
                <button
                  @click="askDelete(r)"
                  class="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 transition-colors"
                  :title="$t('common.delete')"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 border-t border-borderThin">
        <PaginationBar
          :current="pagination.page"
          :pages="pagination.totalPages"
          @change="fetchReviews"
        />
      </div>
    </div>

    <!-- Delete confirm modal -->
    <ConfirmModal
      v-model="deleteModal"
      :title="$t('admin.deleteReview')"
      :message="$t('admin.confirmDeleteReview')"
      @confirm="deleteReview"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { MessageSquare, Star, Eye, EyeOff, Trash2 } from "lucide-vue-next";
import PaginationBar from "@/components/PaginationBar.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import api from "@/axios.js";

const { t } = useI18n();
const showToast = inject("showToast");

const reviews = ref([]);
const loading = ref(true);
const activeFilter = ref("");
const pagination = reactive({ page: 1, totalPages: 1, total: 0 });

const filters = computed(() => [
  { label: t("common.all"), value: "" },
  { label: t("admin.approved"), value: "approved" },
  { label: t("admin.hidden"), value: "pending" }, // Backend still filters 'pending' as is_approved=FALSE
]);

const deleteModal = ref(false);
const reviewToDelete = ref(null);

async function fetchReviews(page = 1) {
  loading.value = true;
  try {
    const params = { page, limit: 20 };
    if (activeFilter.value) params.status = activeFilter.value;
    const { data } = await api.get("/reviews/admin", { params });
    reviews.value = data.data;
    Object.assign(pagination, data.pagination);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
}

async function toggleVisibility(r) {
  try {
    const { data } = await api.patch(`/reviews/${r.id}/toggle`);
    r.is_approved = data.is_approved;
    showToast?.(t("admin.toggleVisibility") + " ✓", "success");
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  }
}

function askDelete(r) {
  reviewToDelete.value = r;
  deleteModal.value = true;
}

async function deleteReview() {
  try {
    await api.delete(`/reviews/${reviewToDelete.value.id}`);
    showToast?.(t("common.delete") + " ✓", "success");
    fetchReviews(pagination.page);
  } catch (e) {
    showToast?.(e.response?.data?.message || t("common.error"), "error");
  }
}

onMounted(() => fetchReviews());
</script>
