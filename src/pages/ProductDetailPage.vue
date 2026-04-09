<template>
  <div class="section-container py-12">
    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex items-center justify-center min-h-[60vh] py-24 animate-pulse"
    >
      <div
        class="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="text-center py-24 text-red-500 font-bold text-xl"
    >
      {{ error }}
    </div>

    <!-- Product detail -->
    <template v-else-if="product">
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16"
      >
        <!-- Left: Image Gallery Component -->
        <div>
          <ImageGallery :images="displayImages" />
        </div>

        <!-- Right: Product info (Sticky) -->
        <div class="flex flex-col lg:sticky lg:top-28">
          <!-- Category breadcrumb -->
          <p
            class="text-xs uppercase tracking-widest text-primary-500 font-bold mb-3"
          >
            {{ displayCategoryName }}
          </p>

          <!-- Name -->
          <h1
            class="text-4xl md:text-5xl font-extrabold text-textPrimary leading-[1.1] mb-4"
          >
            {{ displayName }}
          </h1>

          <!-- Star Rating -->
          <div
            v-if="product.review_count > 0"
            class="flex items-center gap-3 mb-6"
          >
            <div class="flex items-center gap-1">
              <Star
                v-for="i in 5"
                :key="i"
                class="w-5 h-5"
                :class="
                  i <= Math.round(product.avg_rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-200 dark:text-gray-700'
                "
              />
            </div>
            <span class="text-sm font-bold text-textPrimary">
              {{ product.avg_rating }}
            </span>
            <span class="text-sm text-textSecondary font-medium">
              ({{ $t("products.basedOnRatings", { n: product.review_count }) }})
            </span>
          </div>

          <!-- Price & Discount -->
          <div class="flex items-center gap-4 mb-8 bg-surface p-5 rounded-[2.5rem] border border-borderThin shadow-sm w-max animate-in slide-in-from-bottom duration-700">
            <span class="text-4xl md:text-5xl font-extrabold text-textPrimary tracking-tighter">
              {{ formatCurrency(product.price) }}
            </span>
            <div v-if="discountPercentage" class="flex flex-col items-start">
              <span class="text-lg font-bold text-red-500 line-through opacity-50 decoration-2">
                {{ formatCurrency(product.old_price) }}
              </span>
              <span class="text-[11px] font-black text-white bg-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter mt-0.5 shadow-sm">
                {{ ui.locale === 'ar' ? `وفر ${discountPercentage}%` : `-${discountPercentage}% OFF` }}
              </span>
            </div>
          </div>

          <!-- Stock badge -->
          <div class="mb-8">
            <span
              v-if="selectedStock > 5"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 max-w-max dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm"
            >
              <CheckCircle class="w-4 h-4" />
              {{ $t("products.inStock") }}
            </span>
            <span
              v-else-if="selectedStock > 0"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 max-w-max dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-sm"
            >
              <AlertTriangle class="w-4 h-4" />
              {{ $t("products.lowStockBadge", { n: selectedStock }) }}
            </span>
            <span
              v-else
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 max-w-max dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm"
            >
              <XCircle class="w-4 h-4" />
              {{ $t("products.outOfStock") }}
            </span>
          </div>

          <!-- Description -->
          <p
            v-if="displayDescription"
            class="text-textSecondary text-base leading-relaxed border-t border-borderThin pt-8 mb-8"
          >
            {{ displayDescription }}
          </p>

          <!-- Specs -->
          <div v-if="displaySpecs" class="border-t border-borderThin pt-8 mb-8">
            <h3
              class="text-sm font-bold text-textPrimary mb-3 flex items-center gap-2 uppercase tracking-widest"
            >
              <ClipboardList class="w-4 h-4 text-primary-500" />
              {{ $t("products.specs") }}
            </h3>
            <p
              class="text-textSecondary text-sm leading-relaxed whitespace-pre-line font-medium bg-surface p-4 rounded-2xl"
            >
              {{ displaySpecs }}
            </p>
          </div>

          <div
            v-if="product.color_options?.length"
            class="border-t border-borderThin pt-8 mb-8 space-y-4"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold uppercase tracking-widest text-textPrimary">
                {{ ui.locale === "ar" ? "الألوان" : "Colors" }}
              </h3>
              <span
                v-if="selectedColorOption"
                class="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-textSecondary"
              >
                <span
                  class="h-3.5 w-3.5 rounded-full border border-white/50"
                  :style="{ backgroundColor: selectedColorOption.value }"
                ></span>
                {{ selectedColorOption.name }}
              </span>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                v-for="color in product.color_options"
                :key="color.id"
                type="button"
                @click="selectColor(color.id)"
                :class="[
                  'inline-flex min-h-[46px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all',
                  selectedColorId === color.id
                    ? 'border-primary-500 bg-primary-50 text-textPrimary dark:bg-primary-900/20'
                    : 'border-borderThin bg-surface text-textSecondary hover:border-primary-300',
                ]"
              >
                <span
                  class="h-4 w-4 rounded-full border border-white/50 shadow-sm"
                  :style="{ backgroundColor: color.value }"
                ></span>
                
              </button>
            </div>
          </div>

          <div
            v-if="product.size_mode !== 'none' && product.size_options?.length"
            class="border-t border-borderThin pt-8 mb-8 space-y-4"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-sm font-bold uppercase tracking-widest text-textPrimary">
                {{ ui.locale === "ar" ? "المقاسات" : "Sizes" }}
              </h3>
              <span
                v-if="selectedSize"
                class="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-textSecondary"
              >
                {{ selectedSize }}
              </span>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                v-for="size in product.size_options"
                :key="size"
                type="button"
                :disabled="!isSizeAvailable(size)"
                @click="selectedSize = size"
                :class="[
                  'rounded-full border px-4 py-2 text-sm font-bold transition-all',
                  selectedSize === size
                    ? 'border-primary-500 bg-primary-500 text-[#2d1f12]'
                    : 'border-borderThin bg-surface text-textSecondary hover:border-primary-300',
                  !isSizeAvailable(size) ? 'cursor-not-allowed opacity-40 line-through' : '',
                ]"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <div
            v-if="selectionHint"
            class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/10 dark:text-amber-300"
          >
            {{ selectionHint }}
          </div>

          <!-- Quantity selector + Add to Cart -->
          <div
            class="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-borderThin"
          >
            <!-- Quantity control -->
            <div
              class="flex items-center bg-surface rounded-2xl p-1 w-full sm:w-auto overflow-hidden border border-borderThin shadow-sm"
            >
              <button
                @click="qty = Math.max(1, qty - 1)"
                class="p-3 text-textSecondary hover:text-textPrimary hover:bg-background rounded-xl transition-colors"
              >
                <Minus class="w-5 h-5" />
              </button>
              <span
                class="px-6 font-bold text-textPrimary text-lg min-w-[3rem] text-center"
              >
                {{ qty }}
              </span>
              <button
                @click="qty = Math.min(selectedStock, qty + 1)"
                :disabled="qty >= selectedStock"
                class="p-3 text-textSecondary hover:text-textPrimary hover:bg-background rounded-xl transition-colors disabled:opacity-40"
              >
                <Plus class="w-5 h-5" />
              </button>
            </div>

            <!-- Add to cart button -->
            <button
              @click="handleAddToCart"
              :disabled="selectedStock === 0 || !canAddToCart"
              class="btn-primary flex-1 py-4 w-full text-base font-bold rounded-2xl shadow-lg border-2 border-primary-500"
            >
              <ShoppingCart class="w-5 h-5 shrink-0" />
              {{ $t("products.addToCart") }}
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════
           Reviews Section
           ════════════════════════════════════════════════════════════════ -->
      <div class="mt-24 pt-16 border-t border-borderThin">
        <h2
          class="text-3xl font-extrabold text-textPrimary mb-12 flex items-center gap-3"
        >
          {{ $t("products.reviews") }}
          <span
            v-if="reviewData.total"
            class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-bold"
          >
            {{ reviewData.total }}
          </span>
        </h2>

        <div class="grid lg:grid-cols-3 gap-12">
          <!-- Left: Star Distribution -->
          <div class="lg:col-span-1 card p-8 h-max">
            <div class="text-center mb-8 border-b border-borderThin pb-8">
              <span class="text-6xl font-extrabold text-textPrimary">
                {{ reviewData.avg_rating || "—" }}
              </span>
              <div class="flex justify-center mt-3 gap-1">
                <Star
                  v-for="i in 5"
                  :key="i"
                  class="w-5 h-5"
                  :class="
                    i <= Math.round(reviewData.avg_rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-200 dark:text-gray-700'
                  "
                />
              </div>
              <p class="text-sm font-medium text-textSecondary mt-2">
                {{ $t("products.basedOnRatings", { n: reviewData.total }) }}
              </p>
            </div>

            <!-- Distribution bars -->
            <div class="space-y-4">
              <div
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                class="flex items-center gap-3 text-sm font-semibold text-textSecondary"
              >
                <span class="w-4 text-end">{{ star }}</span>
                <Star class="w-4 h-4 text-yellow-400 fill-current shrink-0" />
                <div
                  class="flex-1 h-2.5 bg-surface rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                    :style="{
                      width: reviewData.total
                        ? ((reviewData.distribution[star] || 0) /
                            reviewData.total) *
                            100 +
                          '%'
                        : '0%',
                    }"
                  />
                </div>
                <span class="w-6 text-end text-xs">{{
                  reviewData.distribution?.[star] || 0
                }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Reviews List + Write Form -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Write Review Form -->
            <div
              class="card p-8 bg-primary-50/50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30"
            >
              <h3
                class="font-extrabold text-lg text-textPrimary mb-4 flex items-center gap-2"
              >
                <MessageSquare class="w-5 h-5 text-primary-500" />
                {{ $t("products.writeReview") }}
              </h3>

              <template v-if="auth.isLoggedIn">
                <form @submit.prevent="submitReview" class="space-y-5">
                  <div>
                    <label
                      class="form-label font-bold text-xs uppercase tracking-wider mb-2"
                      >{{ $t("products.yourRating") }} *</label
                    >
                    <div class="flex gap-2 p-2 bg-background rounded-xl w-max">
                      <button
                        v-for="i in 5"
                        :key="i"
                        type="button"
                        @click="reviewForm.rating = i"
                        class="transition-transform hover:scale-110 p-1"
                      >
                        <Star
                          class="w-8 h-8 transition-colors"
                          :class="
                            i <= reviewForm.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-200 dark:text-gray-700 hover:text-yellow-200'
                          "
                        />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      class="form-label font-bold text-xs uppercase tracking-wider mb-2"
                      >{{ $t("products.yourComment") }}</label
                    >
                    <textarea
                      v-model="reviewForm.comment"
                      rows="3"
                      class="form-input resize-none bg-background"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    :disabled="reviewForm.rating === 0 || submittingReview"
                    class="btn-primary w-full sm:w-auto px-8"
                  >
                    {{ $t("products.submitReview") }}
                  </button>
                </form>
              </template>
              <div
                v-else
                class="flex flex-col items-center justify-center py-6 text-center"
              >
                <p class="text-textSecondary font-medium mb-4">
                  {{ $t("products.loginToReview") }}
                </p>
                <RouterLink to="/login" class="btn-primary px-8"
                  >{{ $t("common.login") }}</RouterLink
                >
              </div>
            </div>

            <!-- List -->
            <div
              v-if="reviewData.reviews?.length"
              class="space-y-4 border-t border-borderThin pt-8"
            >
              <div
                v-for="review in reviewData.reviews"
                :key="review.id"
                class="card p-6 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-extrabold text-lg shrink-0"
                  >
                    {{ review.user_name?.charAt(0)?.toUpperCase() || "?" }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 flex-wrap mb-1">
                      <span class="font-bold text-textPrimary text-base">{{
                        review.user_name
                      }}</span>
                      <span
                        class="badge bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-1 flex items-center gap-1 font-bold"
                      >
                        <BadgeCheck class="w-3.5 h-3.5" />
                        {{ $t("products.verifiedPurchase") }}
                      </span>
                    </div>
                    <div class="flex gap-1 mb-3">
                      <Star
                        v-for="i in 5"
                        :key="i"
                        class="w-3.5 h-3.5"
                        :class="
                          i <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-200 dark:text-gray-700'
                        "
                      />
                    </div>
                    <p
                      v-if="review.comment"
                      class="text-textSecondary font-medium leading-relaxed"
                    >
                      {{ review.comment }}
                    </p>
                    <p
                      class="text-xs text-textSecondary/60 mt-4 font-semibold uppercase tracking-wider"
                    >
                      {{ formatDate(review.created_at) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p
              v-else
              class="text-textSecondary text-center py-12 font-medium bg-surface rounded-3xl"
            >
              {{ $t("products.noReviews") }}
            </p>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════
           Related Products
           ════════════════════════════════════════════════════════════════ -->
      <div
        v-if="product.related_products?.length"
        class="mt-24 pt-16 border-t border-borderThin"
      >
        <h2
          class="text-3xl font-extrabold text-textPrimary mb-12 flex items-center gap-2"
        >
          <Sparkles class="w-7 h-7 text-primary-500" />
          {{ $t("products.suggestedForYou") }}
        </h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="rp in product.related_products"
            :key="rp.id"
            :product="rp"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  MessageSquare,
  ClipboardList,
  Sparkles,
  BadgeCheck,
} from "lucide-vue-next";
import ProductCard from "@/components/ProductCard.vue";
import ImageGallery from "@/components/ImageGallery.vue";
import { useCartStore } from "@/stores/cart.js";
import { useUiStore } from "@/stores/ui.js";
import { useAuthStore } from "@/stores/auth.js";
import { useSettingsStore } from "@/stores/settings.js";
import { useSEO } from "@/composables/useSEO.js";
import { useCurrency } from "@/composables/useCurrency.js";
import api from "@/axios.js";

const { setMeta, setJsonLd } = useSEO();
const route = useRoute();
const { t } = useI18n();
const cart = useCartStore();
const ui = useUiStore();
const auth = useAuthStore();
const settingsStore = useSettingsStore();
const { currencyCode, formatCurrency } = useCurrency();
const showToast = inject("showToast");

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const qty = ref(1);
const selectedColorId = ref(null);
const selectedSize = ref(null);

// Reviews
const reviewData = reactive({
  reviews: [],
  total: 0,
  avg_rating: 0,
  distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
});
const reviewForm = reactive({ rating: 0, comment: "" });
const submittingReview = ref(false);

const displayName = computed(() =>
  ui.locale === "ar" && product.value?.name_ar
    ? product.value.name_ar
    : product.value?.name || "",
);

const discountPercentage = computed(() => {
  if (!product.value?.old_price || product.value.old_price <= product.value.price)
    return 0;
  const diff = product.value.old_price - product.value.price;
  return Math.round((diff / product.value.old_price) * 100);
});

const displayDescription = computed(() =>
  ui.locale === "ar" && product.value?.description_ar
    ? product.value.description_ar
    : product.value?.description || "",
);

const displaySpecs = computed(() =>
  ui.locale === "ar" && product.value?.specs_ar
    ? product.value.specs_ar
    : product.value?.specs_en || "",
);

const displayCategoryName = computed(() =>
  ui.locale === "ar" && product.value?.category_name_ar
    ? product.value.category_name_ar
    : product.value?.category_name || "",
);

const selectedColorOption = computed(() =>
  product.value?.color_options?.find((color) => color.id === selectedColorId.value) || null,
);

const displayImages = computed(() => {
  const colorImages = selectedColorOption.value?.images || [];
  if (colorImages.length) {
    return normalizeImages(colorImages);
  }
  if (product.value?.images?.length) {
    return normalizeImages(product.value.images);
  }
  if (product.value?.main_image) {
    return normalizeImages([product.value.main_image]);
  }
  return [];
});

const selectedVariant = computed(() => {
  if (!product.value?.variants?.length) return null;

  if (product.value.size_mode !== "none" && !selectedSize.value) {
    return null;
  }

  return (
    product.value.variants.find((variant) => {
      const colorMatches = selectedColorId.value
        ? variant.color_id === selectedColorId.value
        : !variant.color_id;
      const sizeMatches =
        product.value.size_mode !== "none"
          ? String(variant.size_value || "") === String(selectedSize.value || "")
          : true;
      return colorMatches && sizeMatches;
    }) || null
  );
});

const selectedStock = computed(() => {
  if (!product.value) return 0;
  if (!product.value.has_variants) return Number(product.value.stock || 0);

  if (product.value.size_mode !== "none" && !selectedSize.value) return 0;
  if (product.value.color_options?.length && !selectedColorId.value) return 0;
  return Number(selectedVariant.value?.stock || 0);
});

const canAddToCart = computed(() => {
  if (!product.value) return false;
  if (product.value.color_options?.length && !selectedColorId.value) return false;
  if (product.value.size_mode !== "none" && !selectedSize.value) return false;
  return selectedStock.value > 0;
});

const selectionHint = computed(() => {
  if (!product.value?.has_variants) return "";
  if (product.value.color_options?.length && !selectedColorId.value) {
    return ui.locale === "ar" ? "اختر اللون أولاً." : "Please choose a color first.";
  }
  if (product.value.size_mode !== "none" && !selectedSize.value) {
    return ui.locale === "ar" ? "اختر المقاس قبل الإضافة للسلة." : "Please choose a size before adding to cart.";
  }
  return "";
});

onMounted(async () => {
  try {
    await settingsStore.fetchSettings();
    const { data } = await api.get(`/products/${route.params.id}`);
    product.value = data.data;
    if (product.value.color_options?.length) {
      selectedColorId.value = product.value.color_options[0].id;
    }

    // Update SEO Meta Tags
    setMeta(
      displayName.value, 
      displayDescription.value, 
      product.value.main_image,
      window.location.href
    );

    // Inject JSON-LD for Product
    setJsonLd({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": displayName.value,
      "image": [product.value.main_image],
      "description": displayDescription.value,
      "sku": product.value.id,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": currencyCode.value,
        "price": product.value.price,
        "availability": product.value.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    });

    product.value.images = normalizeImages(product.value.images || []);
    product.value.color_options =
      product.value.color_options?.map((color) => ({
        ...color,
        images: normalizeImages(color.images || []),
      })) || [];
  } catch (e) {
    error.value = t("errors.notFound");
  } finally {
    loading.value = false;
  }

  try {
    const { data } = await api.get(`/reviews/product/${route.params.id}`);
    Object.assign(reviewData, data.data);
  } catch (e) {
    // Silently proceed
  }
});

function handleAddToCart() {
  if (!canAddToCart.value) {
    showToast?.(selectionHint.value || t("products.outOfStock"), "error");
    return;
  }

  const selectedImage =
    selectedColorOption.value?.main_image ||
    displayImages.value?.[0]?.image_url ||
    product.value.main_image ||
    "";

  cart.addItem(
    {
      ...product.value,
      variant_id: selectedVariant.value?.id || null,
      selected_size: selectedSize.value || null,
      selected_color_name: selectedColorOption.value?.name || null,
      selected_color_value: selectedColorOption.value?.value || null,
      selected_image: selectedImage,
      stock: selectedStock.value,
      main_image: selectedImage || product.value.main_image,
    },
    qty.value,
  );
  showToast?.(t("products.addedToCart"), "success");
  qty.value = 1;
}

function normalizeImages(images = []) {
  return images
    .map((image, index) =>
      typeof image === "string"
        ? { id: `${index}-${image}`, image_url: image, is_main: index === 0 ? 1 : 0 }
        : image,
    )
    .filter((image) => image?.image_url);
}

function isSizeAvailable(size) {
  if (!product.value?.has_variants) return product.value?.stock > 0;
  return product.value.variants.some((variant) => {
    const colorMatches = selectedColorId.value ? variant.color_id === selectedColorId.value : true;
    return colorMatches && String(variant.size_value || "") === String(size) && Number(variant.stock) > 0;
  });
}

function selectColor(colorId) {
  selectedColorId.value = colorId;
  qty.value = 1;
  if (selectedSize.value && !isSizeAvailable(selectedSize.value)) {
    selectedSize.value = null;
  }
}

async function submitReview() {
  if (reviewForm.rating === 0) return;
  submittingReview.value = true;
  try {
    const { data } = await api.post("/reviews", {
      product_id: product.value.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });

    const newReview = {
      ...data.data,
      user_name: auth.user.name || auth.user.email,
    };
    reviewData.reviews.unshift(newReview);
    reviewData.total += 1;

    reviewData.distribution[reviewForm.rating] =
      (reviewData.distribution[reviewForm.rating] || 0) + 1;

    let totalPoints = 0;
    for (const [star, count] of Object.entries(reviewData.distribution)) {
      totalPoints += Number(star) * count;
    }
    reviewData.avg_rating = +(totalPoints / reviewData.total).toFixed(1);

    showToast?.(t("products.reviewPublished"), "success");
    reviewForm.rating = 0;
    reviewForm.comment = "";
  } catch (e) {
    const msg =
      e.response?.status === 409
        ? t("products.alreadyReviewed")
        : e.response?.data?.message || t("common.error");
    showToast?.(msg, "error");
  } finally {
    submittingReview.value = false;
  }
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(
    ui.locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );
}
</script>
