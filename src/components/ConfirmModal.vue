<template>
  <!-- Modal backdrop -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Premium Backdrop -->
        <div
          class="absolute inset-0 bg-[#050505]/40 backdrop-blur-sm transition-opacity duration-500"
          @click="$emit('update:modelValue', false)"
        />

        <!-- Luxury Modal Card -->
        <div
          class="relative w-full max-w-[440px] bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-slate-200/50 dark:border-white/5 p-8 sm:p-10 overflow-hidden transform transition-all animate-bounce-in group/modal"
        >
          <!-- Decorative Accent -->
          <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent"></div>

          <!-- Content Container -->
          <div class="relative z-10 text-center">
            <!-- Animated Icon Header -->
            <div class="flex justify-center mb-8">
              <div
                :class="[
                  'w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 group-hover/modal:scale-110 group-hover/modal:rotate-6 shadow-[0_0_40px_rgba(239,68,68,0.15)]',
                  variant === 'danger'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-primary-500/10 text-primary-500',
                ]"
              >
                <AlertTriangle class="w-8 h-8" />
              </div>
            </div>

            <h3 class="text-2xl font-black text-textPrimary uppercase tracking-widest mb-4">
              {{ title }}
            </h3>
            <p class="text-sm font-medium text-textSecondary leading-relaxed mb-10 px-2 lg:px-4">
              {{ message }}
            </p>

            <!-- Actions -->
            <div class="flex flex-col gap-3">
              <button
                class="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]"
                :class="variant === 'danger' ? 'bg-red-500 text-white shadow-red-500/20 hover:shadow-red-500/40' : 'bg-primary-500 text-white shadow-primary-500/20 hover:shadow-primary-500/40'"
                @click="confirm"
              >
                {{ confirmLabel || $t("common.confirm") }}
              </button>
              <button
                class="w-full py-4 font-black uppercase tracking-[0.2em] text-[10px] text-textSecondary hover:text-textPrimary transition-all duration-300"
                @click="
                  $emit('cancel');
                  $emit('update:modelValue', false);
                "
              >
                {{ $t("common.cancel") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangle } from "lucide-vue-next";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Confirm Action" },
  message: { type: String, default: "Are you sure?" },
  confirmLabel: { type: String, default: "" },
  variant: { type: String, default: "danger" }, // 'danger' | 'primary'
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

function confirm() {
  emit("confirm");
  emit("update:modelValue", false);
}
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
