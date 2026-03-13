<template>
  <div
    class="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
  >
    <div
      class="text-8xl font-black text-gray-200 dark:text-gray-700 mb-4 select-none"
    >
      404
    </div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {{ $t("errors.notFound") }}
    </h1>
    <p class="text-gray-500 dark:text-gray-400 mb-6">
      The page you're looking for doesn't exist.
    </p>
    <RouterLink to="/" class="btn-primary">← {{ $t("nav.home") }}</RouterLink>
  </div>
</template>
