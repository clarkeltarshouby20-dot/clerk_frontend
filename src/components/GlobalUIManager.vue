<template>
  <div>
    <!-- Render the Global Confirmation / Prompt Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modalState.isOpen"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          <!-- Premium Backdrop (Refined Glass) -->
          <div
            class="absolute inset-0 bg-[#050505]/40 backdrop-blur-md transition-opacity duration-500"
            @click="cancel"
          ></div>

          <!-- Luxury Modal Card -->
          <div
            class="relative w-full max-w-[440px] bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-slate-200/50 dark:border-white/5 p-8 sm:p-10 overflow-hidden transform transition-all group/modal"
          >
            <!-- Decorative Accent -->
            <div class="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent"></div>

            <!-- Content Container -->
            <div class="relative z-10 text-center">
              <!-- Animated Icon Header -->
              <div class="flex justify-center mb-8">
                <div
                  :class="[
                    'w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 group-hover/modal:scale-110 group-hover/modal:rotate-6',
                    modalState.variant === 'danger'
                      ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.15)]'
                      : 'bg-primary-500/10 text-primary-500 shadow-[0_0_40px_rgba(var(--primary-500-rgb),0.15)]',
                  ]"
                >
                  <AlertTriangle
                    v-if="modalState.variant === 'danger'"
                    class="w-8 h-8"
                  />
                  <HelpCircle v-else class="w-8 h-8" />
                </div>
              </div>

              <!-- Typography -->
              <h3 class="text-2xl font-black text-textPrimary uppercase tracking-[0.2em] mb-4">
                {{ modalState.title }}
              </h3>
              <p class="text-sm font-medium text-textSecondary leading-[1.8] mb-10 px-2 lg:px-4">
                {{ modalState.message }}
              </p>

              <!-- Input for Prompt -->
              <div v-if="modalState.type === 'prompt'" class="mb-10">
                <div class="relative group/input">
                  <input
                    v-model="inputValue"
                    ref="promptInput"
                    type="text"
                    class="form-input w-full text-center text-lg font-bold py-5 rounded-2xl bg-surface/50 transition-all focus:ring-4 focus:ring-amber-500/20 border-borderThin"
                    :placeholder="$t('common.typeSomething') || 'Type here...'"
                    @keyup.enter="confirm"
                  />
                  <div class="absolute inset-0 rounded-2xl border border-amber-500/30 opacity-0 group-focus-within/input:opacity-100 pointer-events-none transition-opacity"></div>
                </div>
              </div>

              <!-- Footer Buttons (Enterprise Stack) -->
              <div class="flex flex-col gap-3">
                <button
                  @click="confirm"
                  class="w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]"
                  :class="[
                    modalState.variant === 'danger'
                      ? 'bg-amber-500 text-[#0A0A0A] shadow-amber-500/20 hover:shadow-amber-500/40'
                      : 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-primary-500/10 hover:shadow-primary-500/30',
                  ]"
                >
                  {{ modalState.confirmLabel || $t("common.confirm") }}
                </button>
                <button
                  class="w-full py-4 font-black uppercase tracking-[0.2em] text-[10px] text-textSecondary hover:text-textPrimary transition-all duration-300"
                  @click="cancel"
                >
                  {{ $t("common.cancel") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Render the Global Toasts -->
    <Teleport to="body">
      <TransitionGroup
        name="toast"
        tag="div"
        class="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          class="relative overflow-hidden flex items-start gap-4 p-4 rounded-none border-[0.5px] pointer-events-auto transform transition-all shadow-[0_20px_40px_rgb(0,0,0,0.08)] font-medium text-sm"
          :class="getToastStyles(t.type)"
        >
          <!-- Toast Icon -->
          <CheckCircle
            v-if="t.type === 'success'"
            class="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500"
          />
          <XCircle
            v-else-if="t.type === 'error'"
            class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500"
          />
          <AlertTriangle
            v-else-if="t.type === 'warning'"
            class="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500"
          />
          <Info
            v-else
            class="w-5 h-5 flex-shrink-0 mt-0.5 text-[#1A1A1A] dark:text-[#FDFDFD]"
          />

          <!-- Content & Close -->
          <div class="flex-1">
            <p class="leading-tight">{{ t.message }}</p>
          </div>
          <button
            @click="removeToast(t.id)"
            class="text-[#1A1A1A]/40 dark:text-[#FDFDFD]/40 hover:text-[#1A1A1A] dark:hover:text-[#FDFDFD] transition-colors flex-shrink-0"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- CSS Progress Bar -->
          <div
            class="absolute bottom-0 left-0 h-1 bg-black/10 dark:bg-white/20 transition-all ease-linear"
            :style="{
              width: t.progress + '%',
              transitionDuration: '10ms',
            }"
          ></div>
        </div>
      </TransitionGroup>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { useUI } from "@/composables/useUI";
import {
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  XCircle,
  Info,
  X,
} from "lucide-vue-next";

// Destructure so the refs automatically unwrap in the template!
const { toasts, modalState, removeToast, resolveModal } = useUI();
const inputValue = ref("");
const promptInput = ref(null);

// Focus input automatically for prompts
watch(
  () => modalState.isOpen,
  async (isOpen) => {
    if (isOpen && modalState.type === "prompt") {
      inputValue.value = modalState.inputValue || "";
      await nextTick();
      promptInput.value?.focus();
    }
  },
);

function confirm() {
  if (modalState.type === "prompt") {
    resolveModal(inputValue.value);
  } else {
    resolveModal(true);
  }
}

function cancel() {
  resolveModal(null); // Return null on cancellation
}

function getToastStyles(type) {
  const base =
    "bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 text-[#1A1A1A] dark:text-[#FDFDFD]";
  switch (type) {
    case "success":
      return `${base} border-l-[3px] !border-l-emerald-500`;
    case "error":
      return `${base} border-l-[3px] !border-l-red-500`;
    case "warning":
      return `${base} border-l-[3px] !border-l-amber-500`;
    case "info":
    default:
      return `${base} border-l-[3px] !border-l-[#1A1A1A] dark:!border-l-[#FDFDFD]`;
  }
}
</script>

<style scoped>
/* Modal Transition */
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.modal-leave-active {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.toast-leave-active {
  position: absolute;
}
</style>
