import { reactive, ref, readonly } from "vue";

// ── Shared State ───────────────────────────────────────────
// We keep the state outside the composable function so it acts as a global singleton across the app.
const toasts = ref([]);
let toastIdCounter = 0;

const modalState = reactive({
  isOpen: false,
  title: "",
  message: "",
  confirmLabel: "",
  variant: "primary", // 'danger' | 'primary'
  type: "confirm", // 'confirm' | 'prompt'
  inputValue: "", // For prompt type
  resolve: null,
});

// A subtle "pop" sound as base64 audio
const popSound =
  typeof window !== "undefined"
    ? new Audio(
        "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAQAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      )
    : null;

// Fallback to safely play sound without breaking execution if audio isn't supported or fails policy
function playPopSound() {
  if (popSound) {
    popSound.currentTime = 0;
    popSound.play().catch(() => {
      // Ignore audio playback errors (like un-interacted DOM policies in browsers)
    });
  }
}

// ── Composable Definition ──────────────────────────────────
export function useUI() {
  // ── Toasts ──
  const showToast = (message, type = "info", duration = 3500) => {
    const id = ++toastIdCounter;

    // Create new toast object
    const newToast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      progress: 100,
    };

    toasts.value.push(newToast);
    playPopSound();

    // Progress bar logic (animate width linearly)
    const intervalTime = 10;
    const decrementAmount = 100 / (duration / intervalTime);

    const progressInterval = setInterval(() => {
      const targetToast = toasts.value.find((t) => t.id === id);
      if (targetToast) {
        targetToast.progress -= decrementAmount;
        if (targetToast.progress <= 0) {
          targetToast.progress = 0;
          clearInterval(progressInterval);
        }
      } else {
        clearInterval(progressInterval);
      }
    }, intervalTime);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  // ── Modals / Dialogs ──
  const confirmAction = ({
    title,
    message,
    confirmLabel = "Confirm",
    variant = "danger",
  }) => {
    return new Promise((resolve) => {
      // Setup modal
      modalState.title = title;
      modalState.message = message;
      modalState.confirmLabel = confirmLabel;
      modalState.variant = variant;
      modalState.type = "confirm";
      modalState.isOpen = true;
      modalState.resolve = resolve;
    });
  };

  const promptAction = ({
    title,
    message,
    confirmLabel = "Confirm",
    variant = "primary",
  }) => {
    return new Promise((resolve) => {
      // Setup prompt modal
      modalState.title = title;
      modalState.message = message;
      modalState.confirmLabel = confirmLabel;
      modalState.variant = variant;
      modalState.type = "prompt";
      modalState.inputValue = "";
      modalState.isOpen = true;
      modalState.resolve = resolve;
    });
  };

  const resolveModal = (value) => {
    if (modalState.resolve) {
      modalState.resolve(value);
      modalState.resolve = null;
    }
    modalState.isOpen = false;
  };

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,

    modalState: readonly(modalState),
    confirmAction,
    promptAction,
    resolveModal,
  };
}
