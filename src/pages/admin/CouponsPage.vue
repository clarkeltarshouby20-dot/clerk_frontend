<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-textPrimary tracking-tight">
          {{ $t("admin.coupons.title") || "Coupon Management" }}
        </h2>
        <p class="text-sm text-textSecondary mt-1">
          {{ $t("admin.coupons.subtitle") || "Create and manage discount codes for your customers." }}
        </p>
      </div>
      <button @click="openModal()" class="btn-primary self-start sm:self-auto">
        <Plus class="w-4 h-4" />
        {{ $t("admin.coupons.add") || "Create Coupon" }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="couponStore.loading" class="flex justify-center py-20">
      <LoadingSpinner :size="40" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="couponStore.coupons.length === 0"
      class="card p-16 text-center text-textSecondary flex flex-col items-center gap-4"
    >
      <Ticket class="w-12 h-12 opacity-20" />
      <p class="font-medium">{{ $t("admin.coupons.empty") || "No coupons found. Create your first discount code!" }}</p>
    </div>

    <!-- Coupons Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="coupon in couponStore.coupons"
        :key="coupon.id"
        class="card group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary-500/30 border-borderThin p-6 space-y-4"
      >
        <!-- Card Background Shimmer/Dashed border feel -->
        <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Ticket class="w-16 h-16 rotate-12" />
        </div>

        <div class="flex justify-between items-start relative z-10">
          <div>
            <span class="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {{ coupon.discount_type === 'percentage' ? $t('admin.coupons.percentage') || 'Percentage' : $t('admin.coupons.fixed') || 'Fixed Amount' }}
            </span>
            <h3 class="text-2xl font-black text-textPrimary tracking-tighter mt-1">{{ coupon.code }}</h3>
          </div>
          <div class="flex gap-2">
            <button
              @click="openModal(coupon)"
              class="p-2 rounded-xl bg-background hover:bg-primary-50 dark:hover:bg-primary-900/20 text-textSecondary hover:text-primary-600 transition-colors shadow-sm"
            >
              <Edit2 class="w-4 h-4" />
            </button>
            <button
              @click="confirmDelete(coupon)"
              class="p-2 rounded-xl bg-background hover:bg-red-50 dark:hover:bg-red-900/20 text-textSecondary hover:text-red-600 transition-colors shadow-sm"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="space-y-3 relative z-10">
          <div class="flex items-center justify-between text-sm">
            <span class="text-textSecondary font-bold underline decoration-primary-500/30">{{ $t('admin.coupons.discount') || 'Value' }}</span>
            <span class="font-black text-primary-600">
              {{ coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}` }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-textSecondary font-bold underline decoration-primary-500/30">{{ $t('admin.coupons.minOrder') || 'Min. Order' }}</span>
            <span class="font-bold text-textPrimary">${{ coupon.min_order_amount }}</span>
          </div>
          <div v-if="coupon.expiry_date" class="flex items-center justify-between text-sm">
            <span class="text-textSecondary font-bold underline decoration-primary-500/30">{{ $t('admin.coupons.expiry') || 'Expires' }}</span>
            <span :class="['font-bold', isExpired(coupon.expiry_date) ? 'text-red-500' : 'text-textPrimary']">
              {{ new Date(coupon.expiry_date).toLocaleDateString() }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-textSecondary font-bold underline decoration-primary-500/30">{{ $t('admin.coupons.usage') || 'Use Count' }}</span>
            <span class="font-bold text-textPrimary">
              {{ coupon.used_count }} / {{ coupon.max_uses || '∞' }}
            </span>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="flex items-center gap-2 pt-2 border-t border-borderThin mt-4 border-dashed relative z-10">
          <div :class="['w-2 h-2 rounded-full animate-pulse', getStatusColor(coupon)]"></div>
          <span :class="['text-[10px] font-black uppercase tracking-widest', getStatusTextColor(coupon)]">
            {{ getStatusText(coupon) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div @click.stop class="card w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
          <div class="p-6 border-b border-borderThin flex items-center justify-between bg-surface/50">
            <h3 class="text-lg font-black text-textPrimary uppercase tracking-widest">
              {{ editingId ? ($t('admin.coupons.editTitle') || "Edit Coupon") : ($t('admin.coupons.addTitle') || "New Coupon") }}
            </h3>
            <button @click="showModal = false" class="p-2 hover:bg-background rounded-full transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveCoupon" class="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <!-- Code -->
              <div class="sm:col-span-2">
                <label class="form-label font-black text-[10px] uppercase tracking-widest text-textSecondary mb-2 block">
                  {{ $t('admin.coupons.labelCode') || "Coupon Code" }}
                </label>
                <input
                  v-model="form.code"
                  type="text"
                  required
                  class="form-input font-mono uppercase tracking-widest"
                  placeholder="E.g. SUMMER25"
                />
              </div>

              <!-- Discount Type -->
              <div>
                <label class="form-label font-black text-[10px] uppercase tracking-widest text-textSecondary mb-2 block">
                  {{ $t('admin.coupons.labelType') || "Type" }}
                </label>
                <select v-model="form.discount_type" class="form-input">
                  <option value="percentage">{{ $t('admin.coupons.percentage') || "Percentage (%)" }}</option>
                  <option value="fixed">{{ $t('admin.coupons.fixed') || "Fixed Amount ($)" }}</option>
                </select>
              </div>

              <!-- Discount Value -->
              <div>
                <label class="form-label font-black text-[10px] uppercase tracking-widest text-textSecondary mb-2 block">
                  {{ $t('admin.coupons.labelValue') || "Value" }}
                </label>
                <input
                  v-model="form.discount_value"
                  type="number"
                  step="0.01"
                  required
                  class="form-input"
                  placeholder="0.00"
                />
              </div>

              <!-- Min Order Amount -->
              <div>
                <label class="form-label font-black text-[10px] uppercase tracking-widest text-textSecondary mb-2 block">
                    {{ $t('admin.coupons.labelMinAmount') || "Min. Order" }}
                </label>
                <input
                  v-model="form.min_order_amount"
                  type="number"
                  step="0.01"
                  class="form-input"
                  placeholder="0.00"
                />
              </div>

              <!-- Max Uses -->
              <div>
                <label class="form-label font-black text-[10px] uppercase tracking-widest text-textSecondary mb-2 block">
                    {{ $t('admin.coupons.labelMaxUses') || "Limit per User" }}
                </label>
                <input
                  v-model="form.max_uses"
                  type="number"
                  class="form-input"
                  placeholder="Unlimited"
                />
              </div>

              <!-- Expiry Date -->
              <div class="sm:col-span-2">
                <label class="form-label font-black text-[10px] uppercase tracking-widest text-textSecondary mb-2 block">
                    {{ $t('admin.coupons.labelExpiry') || "Expiry Date" }}
                </label>
                <input
                  v-model="form.expiry_date"
                  type="datetime-local"
                  class="form-input"
                />
              </div>

              <!-- Is Active -->
              <div class="sm:col-span-2 flex items-center gap-3 bg-surface p-4 rounded-xl border border-borderThin">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  id="is_active"
                  class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <label for="is_active" class="text-sm font-bold text-textPrimary cursor-pointer">
                  {{ $t('admin.coupons.labelActive') || "Active & redeemable" }}
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-4 pt-4 border-t border-borderThin">
              <button
                type="button"
                @click="showModal = false"
                class="btn-secondary px-6"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="btn-primary min-w-[120px]"
              >
                 <LoadingSpinner v-if="saving" :size="18" />
                 <template v-else>
                   <Save class="w-4 h-4" />
                   {{ $t('common.save') }}
                 </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <ConfirmModal
      v-model="showDeleteModal"
      :title="$t('admin.coupons.deleteTitle') || 'Delete Coupon'"
      :message="$t('admin.coupons.deleteConfirm') || 'Are you sure you want to delete this coupon? This action cannot be undone.'"
      @confirm="handleDelete"
      variant="danger"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from "vue";
import { Plus, Edit2, Trash2, Save, X, Ticket } from "lucide-vue-next";
import { useCouponStore } from "@/stores/coupon.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

const couponStore = useCouponStore();
const showToast = inject("showToast");

const showModal = ref(false);
const showDeleteModal = ref(false);
const saving = ref(false);
const editingId = ref(null);
const couponToDelete = ref(null);

const form = reactive({
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  expiry_date: "",
  max_uses: null,
  is_active: true,
});

onMounted(() => {
  couponStore.fetchAllCoupons();
});

function openModal(coupon = null) {
  if (coupon) {
    editingId.value = coupon.id;
    form.code = coupon.code;
    form.discount_type = coupon.discount_type;
    form.discount_value = coupon.discount_value;
    form.min_order_amount = coupon.min_order_amount;
    form.expiry_date = coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().slice(0, 16) : "";
    form.max_uses = coupon.max_uses;
    form.is_active = coupon.is_active;
  } else {
    editingId.value = null;
    form.code = "";
    form.discount_type = "percentage";
    form.discount_value = 0;
    form.min_order_amount = 0;
    form.expiry_date = "";
    form.max_uses = null;
    form.is_active = true;
  }
  showModal.value = true;
}

async function saveCoupon() {
  saving.value = true;
  try {
    const payload = { ...form };
    if (!payload.expiry_date) payload.expiry_date = null;
    if (!payload.max_uses) payload.max_uses = null;

    if (editingId.value) {
      await couponStore.updateCoupon(editingId.value, payload);
      showToast?.("Coupon updated successfully", "success");
    } else {
      await couponStore.createCoupon(payload);
      showToast?.("Coupon created successfully", "success");
    }
    showModal.value = false;
  } catch (error) {
    showToast?.(error.response?.data?.message || "Operation failed", "error");
  } finally {
    saving.value = false;
  }
}

function confirmDelete(coupon) {
  couponToDelete.value = coupon;
  showDeleteModal.value = true;
}

async function handleDelete() {
  if (!couponToDelete.value) return;
  try {
    await couponStore.deleteCoupon(couponToDelete.value.id);
    showToast?.("Coupon deleted successfully", "success");
    showDeleteModal.value = false;
  } catch (error) {
    showToast?.("Failed to delete coupon", "error");
  }
}

// Helpers
function isExpired(date) {
  return new Date(date) < new Date();
}

function getStatusColor(coupon) {
  if (!coupon.is_active) return 'bg-gray-400';
  if (coupon.expiry_date && isExpired(coupon.expiry_date)) return 'bg-red-500';
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getStatusTextColor(coupon) {
  if (!coupon.is_active) return 'text-gray-500';
  if (coupon.expiry_date && isExpired(coupon.expiry_date)) return 'text-red-500';
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return 'text-amber-500';
  return 'text-emerald-500';
}

function getStatusText(coupon) {
  if (!coupon.is_active) return 'Manually Disabled';
  if (coupon.expiry_date && isExpired(coupon.expiry_date)) return 'Expired';
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) return 'Limit Reached';
  return 'Active';
}
</script>

<style scoped>
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
