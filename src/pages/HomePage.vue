<template>
  <div
    class="bg-background min-h-screen transition-colors duration-500 relative text-textPrimary"
  >
    <!-- ── Hero Banner ────────────────────────────────────── -->
    <section
      class="relative w-full min-h-[90vh] flex items-center bg-surface pt-20 overflow-hidden"
    >
      <!-- Decorative Background blobs -->
      <div
        class="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/20 blur-[100px] rounded-full pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-violet-500/10 dark:bg-violet-500/20 blur-[100px] rounded-full pointer-events-none"
      ></div>

      <div
        class="max-w-[1440px] w-full mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 py-12"
      >
        <div
          class="animate-fade-in-up mt-8 lg:mt-0 order-2 lg:order-1"
          :class="[ui.locale === 'ar' ? 'text-right' : 'text-left']"
        >
          <span
            class="inline-block py-2 px-5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-extrabold text-xs tracking-widest uppercase mb-6 shadow-sm border border-primary-100 dark:border-primary-800"
          >
            {{ $t("home.newCollection") || "New Collection" }}
          </span>
          <h1
            class="text-5xl md:text-6xl lg:text-[5rem] font-extrabold leading-[1.18] md:leading-[1.16] lg:leading-[1.12] mb-6 tracking-tight"
          >
            <span class="text-primary-500">{{ $t("home.heroTitlePart2") }}</span>
          </h1>
          <p
            class="text-lg md:text-xl text-textSecondary max-w-lg mb-10 font-medium leading-relaxed"
          >
            {{ $t("home.heroDescription") }}
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <RouterLink
              to="/products"
              class="btn-primary px-8 py-4 text-base font-bold shadow-xl shadow-primary-500/20 rounded-2xl w-full sm:w-auto"
            >
              {{ $t("home.shopNow") }}
            </RouterLink>
            <RouterLink
              to="/products"
              class="btn-secondary px-8 py-4 text-base font-bold rounded-2xl w-full sm:w-auto"
            >
              {{ $t("home.exploreMore") }}
            </RouterLink>
          </div>
        </div>

        <div
          class="relative h-[400px] sm:h-[500px] lg:h-[700px] w-full animate-fade-in order-1 lg:order-2"
        >
          <div
            class="absolute inset-0 bg-primary-100 dark:bg-slate-800 rounded-[2.5rem] lg:rounded-[4rem] transform rotate-3 scale-105 transition-transform duration-700 hover:rotate-6"
          ></div>
          <div
            class="relative h-full w-full rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-2xl shadow-primary-900/20 dark:shadow-black/50 border border-white/20 dark:border-white/5 bg-surface text-center flex flex-col items-center justify-center"
          >
            <img
              :src="heroSrc"
              :srcset="heroSrc !== FALLBACK_HERO ? undefined : `${optimizeImg(FALLBACK_HERO, 1200, 80)} 1200w, ${optimizeImg(FALLBACK_HERO, 800, 80)} 800w`"
              sizes="100vw"
              width="1200"
              height="800"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-out absolute inset-0"
              fetchpriority="high"
              loading="eager"
              decoding="async"
              crossorigin="anonymous"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ── Categories Slider ─────────────────────────────── -->
    <section class="py-24 md:py-32 bg-background">
      <div class="section-container">
        <!-- Header -->
        <div
          class="flex flex-col md:flex-row items-center justify-between mb-12 sm:mb-16 gap-6"
          v-animate="{ delay: 0 }"
        >
          <h2 class="section-title mb-0">
            {{ $t("home.categories") }}
          </h2>
          <div class="flex items-center gap-4">
            <!-- Arrow navigation buttons (hidden on mobile) -->
            <div class="hidden md:flex items-center gap-3" dir="ltr">
              <!-- Prev: always decrements catIndex and shows left arrow (‹) -->
              <button
                @click="catPrev"
                :disabled="catIndex === 0"
                class="cat-arrow-btn"
                :class="{ 'opacity-30 cursor-not-allowed': catIndex === 0 }"
                aria-label="Previous categories"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <!-- Next: always increments catIndex and shows right arrow (›) -->
              <button
                @click="catNext"
                :disabled="catIndex >= catMaxIndex"
                class="cat-arrow-btn"
                :class="{ 'opacity-30 cursor-not-allowed': catIndex >= catMaxIndex }"
                aria-label="Next categories"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
            <RouterLink
              to="/products"
              class="group flex items-center gap-2 font-bold text-sm tracking-wide uppercase text-textSecondary hover:text-primary-500 transition-colors"
            >
              {{ $t("common.viewAll") }}
              <span class="w-8 h-[2px] bg-textSecondary group-hover:bg-primary-500 transition-colors"></span>
            </RouterLink>
          </div>
        </div>

        <!-- Skeleton Loading -->
        <div v-if="loadingCats" class="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="aspect-[4/5] bg-surface animate-pulse rounded-3xl"></div>
        </div>

        <!--
          Slider Track wrapper:
          IMPORTANT: dir="ltr" is forced here so that:
          1. The flex container always orders items left-to-right (item[0] on left)
          2. translateX(-offset) always scrolls correctly regardless of page RTL
          Without this, dir="rtl" from the page would flip flex direction and
          break the translateX offset calculation, causing empty space.
        -->
        <div
          v-else
          class="relative overflow-x-auto md:overflow-x-hidden no-scrollbar snap-x snap-mandatory py-2"
          dir="ltr"
          ref="catSliderRef"
        >
          <div
            class="flex gap-6 sm:gap-8 transition-transform duration-500 ease-in-out"
            :style="catTrackStyle"
          >
            <RouterLink
              v-for="(cat, index) in categories"
              :key="cat.id"
              :to="`/products?category_id=${cat.id}`"
              class="group relative overflow-hidden rounded-3xl flex-shrink-0 flex items-end transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-lg border border-borderThin snap-start"
              :style="{ width: catCardWidth, aspectRatio: '4/5' }"
              v-animate="{ delay: index * 80 }"
              @click="trackCategoryVisit(cat.id)"
            >
              <img
                :src="optimizeImg(cat.image_url, 600, 75) || `https://placehold.co/600x600/f1f5f9/94a3b8?text=${cat.name.charAt(0)}`"
                :alt="cat.name"
                width="600"
                height="750"
                class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
                decoding="async"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10 p-8 w-full flex flex-col justify-end">
                <h3 class="font-extrabold text-3xl md:text-4xl text-white mb-2 leading-tight drop-shadow-md">
                  {{ ui.locale === "ar" && cat.name_ar ? cat.name_ar : cat.name }}
                </h3>
                <div>
                  <span class="inline-flex items-center gap-2 font-bold text-sm tracking-widest uppercase text-white/90 group-hover:text-primary-400 transition-colors duration-300">
                    {{ $t("home.shopNow") }}
                    <span class="w-6 h-[2px] bg-white group-hover:bg-primary-400 transition-colors"></span>
                  </span>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- Dot Indicators (desktop/tablet only) -->
        <div v-if="!loadingCats && categories.length > catPerPage" class="hidden md:flex justify-center gap-2 mt-8">
          <button
            v-for="dot in catTotalPages"
            :key="dot"
            @click="catIndex = dot - 1"
            class="transition-all duration-300 rounded-full"
            :class="catIndex === dot - 1 ? 'w-8 h-2 bg-primary-500' : 'w-2 h-2 bg-borderThin hover:bg-primary-400'"
            :aria-label="`Go to slide ${dot}`"
          ></button>
        </div>
      </div>
    </section>

    <!-- ── Featured Products ──────────────────────────────── -->
    <section class="py-24 md:py-32 bg-surface">
      <div class="section-container">
        <div
          class="flex flex-col items-center text-center justify-center mb-16"
          v-animate="{ delay: 0 }"
        >
          <span
            class="text-primary-500 font-bold uppercase tracking-widest text-sm mb-3"
            >{{ $t("home.topRated") }}</span
          >
          <h2 class="section-title mb-0">
            {{ $t("home.featuredProducts") }}
          </h2>
        </div>

        <div
          v-if="!loadingProds"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          <div
            v-for="(product, index) in featuredProducts"
            :key="product.id"
            class="animate-fade-in-up"
            :style="{ animationDelay: `${(index % 4) * 100}ms` }"
          >
            <ProductCard :product="product" />
          </div>
        </div>
        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="aspect-square bg-background animate-pulse rounded-3xl"
          ></div>
        </div>

        <div class="mt-16 text-center">
          <RouterLink
            to="/products"
            class="btn-secondary px-8 py-3 rounded-full font-bold shadow-sm"
          >
            {{ $t("nav.products") }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── Most Visited Categories (Promo Blocks) ─────────── -->
    <section class="py-24 md:py-32 bg-background relative overflow-hidden">
      <!-- Decor -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 dark:bg-primary-500/10 blur-[120px] rounded-full pointer-events-none"
      ></div>

      <div
        class="section-container grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
      >
        <template v-if="!loadingMostVisited">
          <RouterLink
            v-for="(cat, index) in mostVisitedCategories"
            :key="cat.id"
            :to="`/products?category_id=${cat.id}`"
            class="relative overflow-hidden rounded-[2.5rem] min-h-[400px] md:min-h-[500px] flex flex-col justify-end p-10 group shadow-xl border border-borderThin"
            @click="trackCategoryVisit(cat.id)"
          >
            <div
              class="absolute inset-0 bg-surface group-hover:scale-105 transition-transform duration-700 ease-out"
              :style="{
                backgroundImage: `url(${categoryBg(cat)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-500"
            ></div>
            <div
              class="relative z-10 w-full transform transition-transform duration-500 group-hover:-translate-y-2"
            >
              <p
                class="font-bold text-xs tracking-widest uppercase mb-3 shadow-sm"
                :class="index % 2 === 0 ? 'text-primary-400' : 'text-violet-400'"
              >
                {{ $t("home.mostVisited") }}
              </p>
              <h3
                class="font-extrabold text-4xl md:text-5xl text-white mb-6 leading-tight drop-shadow-lg"
              >
                {{ ui.locale === "ar" && cat.name_ar ? cat.name_ar : cat.name }}
              </h3>
              <span
                class="inline-flex items-center gap-2 font-bold text-sm tracking-widest uppercase text-white transition-colors"
                :class="index % 2 === 0 ? 'group-hover:text-primary-400' : 'group-hover:text-violet-400'"
              >
                {{ $t("home.shopNow") }}
                <span
                  class="w-6 h-[2px] bg-white transition-colors"
                  :class="index % 2 === 0 ? 'group-hover:bg-primary-400' : 'group-hover:bg-violet-400'"
                ></span>
              </span>
            </div>
          </RouterLink>
        </template>

        <template v-else>
          <div
            v-for="i in 2"
            :key="i"
            class="min-h-[400px] md:min-h-[500px] bg-surface animate-pulse rounded-[2.5rem]"
          ></div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, inject, computed } from "vue";
import { useI18n } from "vue-i18n";
import ProductCard from "@/components/ProductCard.vue";
import { useUiStore } from "@/stores/ui.js";
import { useSettingsStore } from "@/stores/settings.js";
import { trackCategoryVisit } from "@/composables/useCategoryVisit.js";
import api from "@/axios.js";

const { t } = useI18n();
const ui = useUiStore();
const settingsStore = useSettingsStore();
const showToast = inject("showToast");

/** 
 * Hero image: uses the DB-managed image from settings if available,
 * falls back to the default Cloudinary image otherwise.
 */
const FALLBACK_HERO = 'https://res.cloudinary.com/doprwyj9v/image/upload/q_auto/f_auto/v1775171336/clark_odk5k7.jpg';
const heroSrc = computed(() => settingsStore.heroImageUrl || FALLBACK_HERO);

const categories = ref([]);
const featuredProducts = ref([]);
const mostVisitedCategories = ref([]);
const loadingCats = ref(true);
const loadingProds = ref(true);
const loadingMostVisited = ref(true);

// ── Category Slider State ────────────────────────────────────────
const catSliderRef = ref(null);
const catIndex = ref(0);      // current "page" index
const windowWidth = ref(window.innerWidth);

/** How many cards are visible at once based on screen width */
const catPerPage = computed(() => {
  if (windowWidth.value >= 1024) return 3; // lg: 3 visible
  if (windowWidth.value >= 640)  return 2; // sm/md: 2 visible
  return 1;                                 // mobile: 1 visible
});

/** Total number of "pages" in the slider */
const catTotalPages = computed(() =>
  Math.max(1, Math.ceil(categories.value.length / catPerPage.value))
);

/** Maximum page index the user can navigate to */
const catMaxIndex = computed(() => catTotalPages.value - 1);

/**
 * Calculates the pixel width of a single card based on the container size.
 * This is bound as inline :style on each .cat-slide to ensure
 * the flex children have explicit widths (CSS calc(100%) is unreliable in
 * an unconstrained flex container).
 */
const catCardWidth = computed(() => {
  if (!catSliderRef.value) return 'auto';
  const container = catSliderRef.value.offsetWidth;
  const gap       = windowWidth.value >= 640 ? 32 : 24;
  const perPage   = catPerPage.value;
  const width     = (container - gap * (perPage - 1)) / perPage;
  return width > 0 ? `${width}px` : 'auto';
});

/**
 * Calculates the translateX offset for the slider track.
 * Uses the same card width formula so both are always in sync.
 */
const catTrackStyle = computed(() => {
  if (windowWidth.value < 768) return { transform: 'none' }; // Disable transform on mobile to allow native finger drag
  if (!catSliderRef.value) return {};
  const container = catSliderRef.value.offsetWidth;
  const gap       = windowWidth.value >= 640 ? 32 : 24;
  const perPage   = catPerPage.value;
  const cardWidth = (container - gap * (perPage - 1)) / perPage;
  const offset    = catIndex.value * (cardWidth + gap);
  return { transform: `translateX(-${offset}px)` };
});

function catPrev() {
  // Always decrement – the visual flip is handled in the template via flex-row-reverse
  if (catIndex.value > 0) catIndex.value--;
}
function catNext() {
  // Always increment – consistent with the disabled conditions
  if (catIndex.value < catMaxIndex.value) catIndex.value++;
}

// Clamp catIndex when screen resizes to prevent out-of-bounds
async function onResize() {
  windowWidth.value = window.innerWidth;
  // Wait for DOM reflow so offsetWidth is updated before recalculating
  await nextTick();
  if (catIndex.value > catMaxIndex.value) catIndex.value = catMaxIndex.value;
}

onMounted(async () => {
  window.addEventListener('resize', onResize, { passive: true });

  try {
    const { data } = await api.get("/categories");
    categories.value = (data.categories || data.data || []).filter(
      (c) => c.is_active,
    );
  } catch (e) {
    showToast?.(t("common.error"), "error");
  } finally {
    loadingCats.value = false;
    // Wait for Vue to render the slider DOM before we measure offsetWidth
    await nextTick();
    windowWidth.value = window.innerWidth; // trigger computed recalculation
  }

  try {
    const { data } = await api.get("/products", {
      params: { page: 1, limit: 8 },
    });
    featuredProducts.value = data.products || data.data || [];
  } catch (e) {
    showToast?.(t("common.error"), "error");
  } finally {
    loadingProds.value = false;
  }

  try {
    const { data } = await api.get("/categories/most-visited", {
      params: { limit: 2 },
    });
    mostVisitedCategories.value = (data.data || []).filter((c) => c.is_active);
  } catch (e) {
    showToast?.(t("common.error"), "error");
  } finally {
    loadingMostVisited.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

function categoryBg(cat) {
  const url =
    optimizeImg(cat.image_url, 1000, 75) ||
    `https://placehold.co/1000x625/1e293b/94a3b8?text=${encodeURIComponent(cat.name?.charAt(0) || "?")}`;
  return url;
}

/**
 * Multi-CDN Image Optimization Helper
 * Supports Unsplash and Pexels to ensure high-res images are resized.
 */
function optimizeImg(url, width = 800, quality = 75) {
  if (!url) return url;
  try {
    const u = new URL(url);

    // Clear potentially redundant params from seed script
    u.searchParams.delete('w');
    u.searchParams.delete('h');
    u.searchParams.delete('width');
    u.searchParams.delete('height');
    u.searchParams.delete('t'); // Remove cache buster for better performance

    // Unsplash
    if (url.includes("unsplash.com")) {
      u.searchParams.set("w", width.toString());
      u.searchParams.set("q", quality.toString());
      u.searchParams.set("fm", "webp");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }

    // Pexels
    if (url.includes("pexels.com")) {
      u.searchParams.set("w", width.toString());
      u.searchParams.set("h", Math.round(width * 1.25).toString()); // Maintain aspect ratio
      u.searchParams.set("fit", "crop");
      return u.toString();
    }
  } catch (e) {
    return url;
  }
  return url;
}
</script>

<style scoped>
/* ── Category Slider ─────────────────────────────────────────── */

/**
 * Arrow navigation buttons – circle shape with glassmorphism effect.
 * Hidden on mobile via Tailwind 'hidden md:flex' in the template.
 */
.cat-arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1.5px solid var(--color-border-thin, rgba(0,0,0,0.1));
  background: var(--color-surface, #fff);
  color: var(--color-text-primary, #1e293b);
  transition: background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  flex-shrink: 0;
}
.dark .cat-arrow-btn {
  background: var(--color-surface, #1e293b);
  border-color: rgba(255,255,255,0.12);
  color: #f1f5f9;
}
.cat-arrow-btn:not(:disabled):hover {
  background: var(--color-primary-500, #6366f1);
  color: #fff;
  border-color: transparent;
  transform: scale(1.08);
  box-shadow: 0 4px 18px rgba(99,102,241,0.3);
}


/* Card width + aspect-ratio are set via inline :style from catCardWidth computed */

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
