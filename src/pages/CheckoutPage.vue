<template>
  <div class="section-container py-12 max-w-7xl mx-auto">
    <h1 class="section-title mb-10">{{ $t("checkout.title") || "Checkout" }}</h1>

    <!-- Empty cart guard -->
    <div
      v-if="cart.items.length === 0"
      class="card p-16 text-center text-textSecondary flex flex-col items-center gap-6 bg-surface shadow-sm"
    >
      <div class="w-24 h-24 rounded-full bg-background flex flex-col justify-center items-center shadow-sm">
        <ShoppingBag class="w-10 h-10 text-primary-500" />
      </div>
      <p class="text-2xl font-extrabold text-textPrimary">
        {{ $t("checkout.emptyCart") || "Your cart is empty." }}
      </p>
      <RouterLink to="/products" class="btn-primary mt-4 px-8 py-3 w-auto">
        {{ $t("cart.continueShopping") || "Continue Shopping" }}
      </RouterLink>
    </div>

    <!-- Advanced Two-Column Checkout Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      <!-- LEFT COLUMN: Shipping Information -->
      <div class="lg:col-span-7 space-y-8">
        
        <!-- Shipping Info Card -->
        <div class="card p-6 sm:p-8 shadow-sm border border-borderThin bg-background">
          <div class="flex items-center gap-4 border-b border-borderThin pb-6 mb-6">
            <div class="p-3 bg-primary-50 dark:bg-primary-900/10 text-primary-500 rounded-2xl shadow-sm">
              <MapPin class="w-6 h-6" />
            </div>
            <h2 class="font-extrabold text-textPrimary text-xl lg:text-2xl tracking-tight">
              {{ $t("checkout.shippingInfo") || "Shipping Information" }}
            </h2>
          </div>

          <div class="space-y-6">
            <!-- Full Name (Read-Only from Profile) -->
            <div>
              <label class="form-label font-bold text-xs uppercase tracking-widest text-textSecondary mb-2">
                {{ $t("checkout.fullName") }}
              </label>
              <div class="input-field bg-surface text-textSecondary cursor-not-allowed flex items-center gap-3">
                <User class="w-4 h-4 text-textSecondary/70" />
                <span class="font-medium text-sm">{{ authStore.user?.name || "Loading..." }}</span>
              </div>
            </div>

            <!-- Egyptian Phone Number w/ Validation -->
            <div>
              <label class="form-label font-bold text-xs uppercase tracking-widest text-textSecondary mb-2">
                {{ $t("checkout.phone") }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <Phone class="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-4 text-textSecondary/70 rtl:right-4 rtl:left-auto" />
                <input
                  v-model="form.shipping_phone"
                  @input="validatePhone"
                  type="tel"
                  dir="ltr"
                  placeholder="01012345678"
                  class="input-field w-full pl-11 rtl:pr-11 font-mono text-sm tracking-widest bg-surface transition-all duration-300"
                  :class="{
                    'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10 text-red-600': phoneError,
                    'border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500': phoneValid,
                  }"
                />
                <div v-if="phoneValid" class="absolute top-1/2 -translate-y-1/2 right-4 rtl:left-4 rtl:right-auto text-emerald-500">
                  <CheckCircle2 class="w-5 h-5" />
                </div>
              </div>
              <Transition name="fade">
                <p v-if="phoneError" class="text-xs font-bold text-red-500 mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertCircle class="w-3.5 h-3.5" />
                  {{ $t("checkout.invalidPhoneEgypt") || "Invalid Egyptian Number" }}
                </p>
              </Transition>
            </div>

            <!-- Detailed Address -->
            <div>
              <label class="form-label font-bold text-xs uppercase tracking-widest text-textSecondary mb-2">
                {{ $t("checkout.detailedAddress") || "Detailed Address" }} <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.shipping_address"
                rows="3"
                :placeholder="$t('checkout.addressPlaceholder') || 'Street Name, Building Number, Apartment, City, Governorate'"
                class="input-field w-full resize-none bg-surface text-sm"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="card p-6 sm:p-8 shadow-sm border border-borderThin bg-background">
          <div class="flex items-center gap-4 border-b border-borderThin pb-6 mb-6">
            <div class="p-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 rounded-2xl shadow-sm">
              <CreditCard class="w-6 h-6" />
            </div>
            <h2 class="font-extrabold text-textPrimary text-xl lg:text-2xl tracking-tight">
              {{ $t("checkout.paymentMethod") || "Payment Method" }}
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- COD -->
            <label
              class="flex flex-col gap-3 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 text-center items-center justify-center relative overflow-hidden group"
              :class="paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-sm' : 'border-borderThin bg-surface hover:border-gray-300 dark:hover:border-gray-600'"
            >
              <input type="radio" v-model="paymentMethod" value="cod" class="sr-only" />
              <div class="w-12 h-12 rounded-full flex items-center justify-center transition-colors" :class="paymentMethod === 'cod' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600' : 'bg-background text-textSecondary group-hover:text-textPrimary'">
                <Banknote class="w-6 h-6" />
              </div>
              <span class="font-bold text-sm text-textPrimary">
                {{ $t("checkout.cashOnDelivery") || "Cash on Delivery" }}
              </span>
            </label>

            <!-- Electronic Wallet -->
            <label
              class="flex flex-col gap-3 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 text-center items-center justify-center relative overflow-hidden group"
              :class="paymentMethod === 'wallet' ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-sm' : 'border-borderThin bg-surface hover:border-gray-300 dark:hover:border-gray-600'"
            >
              <input type="radio" v-model="paymentMethod" value="wallet" class="sr-only" />
              <div class="w-12 h-12 rounded-full flex items-center justify-center transition-colors" :class="paymentMethod === 'wallet' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600' : 'bg-background text-textSecondary group-hover:text-textPrimary'">
                <Smartphone class="w-6 h-6" />
              </div>
              <span class="font-bold text-sm text-textPrimary">
                {{ $t("checkout.electronicWallet") || "E-Wallet" }}
              </span>
            </label>

            <!-- InstaPay -->
            <label
              class="flex flex-col gap-3 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 text-center items-center justify-center relative overflow-hidden group"
              :class="paymentMethod === 'instapay' ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/20 shadow-sm' : 'border-borderThin bg-surface hover:border-gray-300 dark:hover:border-gray-600'"
            >
              <div class="absolute -right-6 top-3 rotate-45 bg-[#4F1B78] text-white text-[9px] font-black px-8 py-0.5 tracking-widest shadow-lg uppercase">
                {{ $t("checkout.fast") }}
              </div>
              <input type="radio" v-model="paymentMethod" value="instapay" class="sr-only" />
              <div class="w-12 h-12 rounded-full flex items-center justify-center transition-colors" :class="paymentMethod === 'instapay' ? 'bg-[#4F1B78] text-white shadow-inner' : 'bg-background text-textSecondary group-hover:text-textPrimary'">
                <Zap class="w-5 h-5 fill-current" />
              </div>
              <span class="font-bold text-sm text-textPrimary">
                {{ $t("checkout.instapay") || "InstaPay" }}
              </span>
            </label>
          </div>

          <!-- Dynamic Payment Upload Forms -->
          <Transition name="slide-up">
            <div
              v-if="paymentMethod === 'wallet' || paymentMethod === 'instapay'"
              class="mt-8 border-t border-borderThin pt-8"
            >
              <!-- Instructions Card -->
              <div
                class="mb-6 p-5 rounded-2xl border flex items-start gap-4 shadow-sm"
                :class="paymentMethod === 'instapay' ? 'bg-violet-50/50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-800/30' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30'"
              >
                <div class="p-2 rounded-full shrink-0" :class="paymentMethod === 'instapay' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'">
                   <Info class="w-4 h-4" />
                </div>
                <div class="text-sm space-y-2 text-textPrimary">
                  <p class="font-extrabold text-base">
                    {{ paymentMethod === "instapay" ? $t("checkout.instapayInstructionsTitle") || "Transfer via InstaPay to:" : $t("checkout.walletInstructionsTitle") || "Transfer via Vodafone/Orange Cash to:" }}
                  </p>
                  <div class="bg-background px-3 py-2 rounded-xl border border-borderThin shadow-inner w-max flex items-center gap-3">
                     <p class="font-mono text-lg font-black tracking-widest text-textPrimary select-all">
                       {{ paymentMethod === "instapay" ? (settingsStore.data.instapay_handle || "store@instapay") : (settingsStore.data.wallet_number || "01012345678") }}
                     </p>
                     <button @click.prevent="copyPaymentInfo" class="text-textSecondary hover:text-primary-500 transition-colors p-1 bg-surface rounded-md shadow-sm border border-borderThin" title="Copy to clipboard">
                       <Copy class="w-4 h-4" />
                     </button>
                  </div>
                  <p class="text-textSecondary font-medium leading-relaxed pt-1">
                    {{ $t("checkout.uploadProofRule") || "After transferring the exact total, please upload a screenshot of the successful transaction to verify your order." }}
                  </p>
                </div>
              </div>

              <!-- Ref & Screenshot grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Reference number -->
                <div>
                  <label class="form-label font-bold text-xs uppercase tracking-widest text-textSecondary mb-2">{{ $t("payment.reference") }}</label>
                  <input
                    v-model="form.reference"
                    type="text"
                    class="input-field w-full font-mono text-sm tracking-wider bg-surface"
                    :placeholder="paymentMethod === 'instapay' ? 'Ref: IP-123...' : 'TXN-1234...'"
                  />
                  <span class="text-[10px] text-textSecondary/60 mt-2 block px-1 font-bold tracking-wider uppercase">Optional but speeds up verification</span>
                </div>

                <!-- Screenshot upload -->
                <div class="md:col-span-1">
                  <ImageUploadSingle
                    v-model="form.screenshotFile"
                    :label="$t('payment.screenshot')"
                    :label-icon="ImageIcon"
                    :max-size="5242880"
                    :subtext="$t('payment.screenshotHint') || 'JPEG, PNG, WEBP. Max 5MB.'"
                    :uploading="loading"
                  />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- RIGHT COLUMN: Order Summary -->
      <div class="lg:col-span-5 lg:sticky lg:top-28">
        <div class="card p-0 shadow-lg border-borderThin overflow-hidden flex flex-col bg-surface/50">
          <div class="p-6 sm:p-8 bg-background border-b border-borderThin flex items-center gap-3">
             <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                <ClipboardList class="w-5 h-5" />
             </div>
            <h2 class="font-extrabold text-textPrimary text-xl tracking-wide uppercase">
              {{ $t("checkout.orderSummary") }}
            </h2>
          </div>

          <!-- Items List within Summary -->
          <div class="p-4 sm:p-6 max-h-[350px] overflow-y-auto subtle-scrollbar border-b border-borderThin bg-background/50">
            <ul class="space-y-4">
              <li v-for="item in cart.items" :key="item.id" class="flex gap-4 p-2 hover:bg-surface rounded-xl transition-colors">
                <img
                  :src="item.main_image"
                  class="w-16 h-16 rounded-xl object-cover bg-surface border border-borderThin shadow-sm shrink-0"
                  @error="(e) => (e.target.src = 'https://placehold.co/100x100')"
                />
                <div class="flex flex-col justify-center flex-1 min-w-0">
                  <span class="text-sm font-bold text-textPrimary line-clamp-2 leading-snug mb-1">
                    {{ ui.locale === "ar" && item.name_ar ? item.name_ar : item.name }}
                  </span>
                  <div class="flex items-center justify-between mt-auto">
                    <span class="text-xs text-textSecondary font-bold tracking-wider uppercase">
                      {{ $t("checkout.qty") }}: {{ item.quantity }}
                    </span>
                    <span class="font-black text-sm text-primary-600 dark:text-primary-400">
                      ${{ (Number(item.price) * item.quantity).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Coupon Input -->
          <div class="p-6 border-b border-borderThin bg-background/30">
            <label class="form-label font-black text-[10px] uppercase tracking-widest text-textSecondary mb-3 block">
              {{ $t('checkout.haveCoupon') || "Have a discount code?" }}
            </label>
            <div class="flex gap-3">
              <div class="relative flex-1">
                <Ticket class="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-4 text-textSecondary/50 rtl:right-4 rtl:left-auto" />
                <input
                  v-model="couponCode"
                  type="text"
                  :disabled="loadingCoupon || couponStore.activeCoupon"
                  class="input-field w-full pl-11 rtl:pr-11 font-mono uppercase tracking-widest text-sm bg-surface transition-all"
                  :class="{ 'opacity-50 cursor-not-allowed': couponStore.activeCoupon }"
                  placeholder="CODE123"
                />
              </div>
              <button
                v-if="!couponStore.activeCoupon"
                @click="applyCoupon"
                :disabled="!couponCode || loadingCoupon"
                class="btn-secondary px-6 py-0 min-h-[46px] whitespace-nowrap"
              >
                <LoadingSpinner v-if="loadingCoupon" :size="16" />
                <span v-else>{{ $t('common.apply') || "Apply" }}</span>
              </button>
              <button
                v-else
                @click="removeCoupon"
                class="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition-colors border border-red-100 dark:border-red-800/30"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <Transition name="fade">
              <div v-if="couponStore.activeCoupon" class="mt-3 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <CheckCircle2 class="w-4 h-4" />
                {{ $t('checkout.couponApplied') || "Coupon Applied Successfully!" }}
              </div>
            </Transition>
          </div>

          <!-- Totals block -->
          <div class="p-6 sm:p-8 bg-background space-y-4 relative">
            <div class="flex justify-between text-sm text-textSecondary font-bold">
              <span>{{ $t("cart.subtotal") }}</span>
              <span class="text-textPrimary">${{ cart.total.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm text-textSecondary font-bold">
              <span>{{ $t("checkout.shippingFee") }}</span>
              <span class="text-emerald-500 uppercase tracking-widest">{{ $t("checkout.free") }}</span>
            </div>

            <!-- Discount Row -->
            <Transition name="fade">
              <div v-if="couponStore.activeCoupon" class="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800">
                <span>{{ $t("checkout.discount") || "Discount" }} ({{ couponStore.activeCoupon.code }})</span>
                <span>-${{ couponStore.activeCoupon.discount_amount.toFixed(2) }}</span>
              </div>
            </Transition>

            <div class="border-t border-borderThin pt-4 mt-2 flex justify-between items-center bg-surface p-4 rounded-2xl shadow-sm">
              <span class="text-base font-extrabold text-textPrimary uppercase tracking-widest">{{ $t("common.total") }}</span>
              <span class="text-3xl font-black text-primary-600 dark:text-primary-400 drop-shadow-sm">${{ finalTotal.toFixed(2) }}</span>
            </div>

            <!-- Error Alert -->
            <Transition name="fade">
              <div v-if="error" class="mt-4 flex items-start gap-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-2xl p-4 text-xs font-bold uppercase tracking-wide">
                <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                <p>{{ error }}</p>
              </div>
            </Transition>

            <!-- Sticky Submit Button -->
            <button
              @click="placeOrder"
              :disabled="loading || !isFormValid"
              class="btn-primary w-full py-4 sm:py-5 text-base font-extrabold shadow-xl mt-6 group rounded-2xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LoadingSpinner v-if="loading" :size="20" />
              <template v-else>
                <Lock class="w-5 h-5 mr-3" />
                {{ $t("checkout.confirmOrder") || "Confirm & Pay" }}
                <ArrowRight class="w-5 h-5 ml-3 group-hover:translate-x-1.5 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
              </template>
            </button>
            <p class="text-center text-[10px] text-textSecondary mt-4 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
              <ShieldCheck class="w-3.5 h-3.5" />
              {{ $t("checkout.secureProcessing") }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.js";
import {
  AlertCircle,
  ShoppingBag,
  UploadCloud,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Zap,
  Info,
  ClipboardList,
  Lock,
  ArrowRight,
  ShieldCheck,
  Copy,
  Ticket,
  X,
  Image as ImageIcon,
} from "lucide-vue-next";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ImageUploadSingle from "@/components/ImageUploadSingle.vue";
import { useCartStore } from "@/stores/cart.js";
import { useUiStore } from "@/stores/ui.js";
import { useSettingsStore } from "@/stores/settings.js";
import { useCouponStore } from "@/stores/coupon.js";
import { useConversion } from "@/composables/useConversion.js";
import api from "@/axios.js";

const { trackPurchase } = useConversion();
const { t } = useI18n();
const router = useRouter();
const cart = useCartStore();
const ui = useUiStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const couponStore = useCouponStore();
const showToast = inject("showToast");

const loading = ref(false);
const loadingCoupon = ref(false);
const couponCode = ref("");
const error = ref("");
const paymentMethod = ref("cod");

const form = reactive({
  shipping_phone: "",
  shipping_address: "",
  reference: "",
  screenshotFile: null,
});

// removed previewUrl, fileInput refs

const phoneError = ref(false);
const phoneValid = ref(false);

function validatePhone() {
  const current = form.shipping_phone.trim();
  if (current.length === 0) {
    phoneError.value = false;
    phoneValid.value = false;
    return;
  }
  const regex = /^01[0125][0-9]{8}$/;
  if (regex.test(current)) {
    phoneValid.value = true;
    phoneError.value = false;
  } else {
    phoneValid.value = false;
    phoneError.value = current.length > 2;
  }
}

const isFormValid = computed(() => {
  if (!phoneValid.value) return false;
  if (form.shipping_address.trim().length < 5) return false;
  if ((paymentMethod.value === "wallet" || paymentMethod.value === "instapay") && !form.screenshotFile) return false;
  return true;
});

const finalTotal = computed(() => {
  const discount = couponStore.activeCoupon?.discount_amount || 0;
  return Math.max(0, cart.total - discount);
});

onMounted(async () => {
  await settingsStore.fetchSettings();
  couponStore.clearActiveCoupon();
  // Phone number now explicitly left empty for user to fill
});

async function applyCoupon() {
  if (!couponCode.value) return;
  loadingCoupon.value = true;
  try {
    await couponStore.validateCoupon(couponCode.value, cart.total);
    showToast?.(t("checkout.couponApplied") || "Coupon applied", "success");
  } catch (err) {
    showToast?.(err.response?.data?.message || "Invalid coupon", "error");
  } finally {
    loadingCoupon.value = false;
  }
}

function removeCoupon() {
  couponStore.clearActiveCoupon();
  couponCode.value = "";
}

// function onFileSelect, onDrop, setFile removed in favor of ImageUploadSingle

async function placeOrder() {
  if (!isFormValid.value) return;

  error.value = "";
  loading.value = true;
  try {
    let payload;
    let headers = {};

    if (paymentMethod.value === "wallet" || paymentMethod.value === "instapay") {
      payload = new FormData();
      payload.append("items", JSON.stringify(cart.items));
      payload.append("total_price", finalTotal.value);
      payload.append("payment_method", paymentMethod.value);
      payload.append("shipping_phone", form.shipping_phone);
      payload.append("shipping_address", form.shipping_address);
      payload.append("reference", form.reference);
      payload.append("coupon_code", couponStore.activeCoupon?.code || "");
      payload.append("screenshot", form.screenshotFile);
      headers = { "Content-Type": "multipart/form-data" };
    } else {
      payload = {
        items: cart.items,
        total_price: finalTotal.value,
        payment_method: paymentMethod.value,
        shipping_phone: form.shipping_phone,
        shipping_address: form.shipping_address,
        coupon_code: couponStore.activeCoupon?.code || "",
      };
    }

    const { data } = await api.post("/orders", payload, { headers });

    // Fire Conversion Tracking for Marketing
    trackPurchase(data.order || data.data);

    showToast?.(t("checkout.orderPlaced"), "success");
    router.push({ name: "orders" });

    setTimeout(() => {
      cart.clearCart();
    }, 500);
  } catch (e) {
    error.value = e.response?.data?.message || t("checkout.orderError");
  } finally {
    loading.value = false;
  }
}

async function copyPaymentInfo() {
  const textToCopy = paymentMethod.value === "instapay" 
    ? (settingsStore.data.instapay_handle || "store@instapay")
    : (settingsStore.data.wallet_number || "01012345678");
  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast?.(t("common.copied") || "Copied to clipboard!", "success");
  } catch(e) {
    console.error("Failed to copy", e);
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 500px;
  overflow: hidden;
}
.slide-up-enter-from,
.slide-up-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
