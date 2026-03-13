<template>
  <div
    class="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950"
  >
    <div class="max-w-lg w-full text-center space-y-6">
      <!-- Animated icon -->
      <div class="flex justify-center">
        <div class="relative">
          <div
            class="w-28 h-28 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center animate-pulse"
          >
            <ServerCrash class="w-14 h-14 text-primary-500" />
          </div>
          <!-- Floating dot -->
          <span
            class="absolute top-2 end-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950 animate-ping"
          />
          <span
            class="absolute top-2 end-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"
          />
        </div>
      </div>

      <!-- Heading -->
      <div>
        <h1
          class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2"
        >
          {{ $t("error.maintenanceTitle") }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          {{ $t("error.maintenanceDesc") }}
        </p>
      </div>

      <!-- Retry button -->
      <button @click="retry" :disabled="retrying" class="btn-primary mx-auto">
        <RefreshCw :class="['w-4 h-4', retrying ? 'animate-spin' : '']" />
        {{ retrying ? $t("common.loading") : $t("error.retryBtn") }}
      </button>

      <!-- Status indicator -->
      <p class="text-xs text-gray-400 dark:text-gray-600">
        {{ $t("error.statusCode") }}: 503
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ServerCrash, RefreshCw } from "lucide-vue-next";

const router = useRouter();
const retrying = ref(false);

async function retry() {
  retrying.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  // Try to go back to home; the router guard will re-check the server
  try {
    await router.push("/");
  } finally {
    retrying.value = false;
  }
}
</script>
