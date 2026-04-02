<template>
  <div class="space-y-4 group">
    <!-- Component Label -->
    <div v-if="label" class="flex flex-col gap-1 mb-2">
      <label class="form-label font-black text-[10px] uppercase tracking-[0.2em] text-textSecondary flex items-center gap-2">
        <component :is="labelIcon" v-if="labelIcon" class="w-3.5 h-3.5 text-primary-500" />
        {{ label }}
      </label>
      <p v-if="subtext" class="text-[9px] font-bold text-textSecondary/60 uppercase tracking-tighter">
        {{ subtext }}
      </p>
    </div>

    <div
      class="relative transition-all duration-500"
      :class="[
        shape === 'circle' ? 'w-32 h-32 mx-auto' : `w-full ${aspect} max-w-full`,
        isDragging ? 'scale-[1.02]' : ''
      ]"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        :disabled="readonly"
        @change="onFileSelect"
      />

      <!-- Upload Trigger Area -->
      <div
        @click="!readonly && fileInput?.click()"
        class="relative w-full h-full overflow-hidden cursor-pointer border-2 border-dashed transition-all duration-500 shadow-sm"
        :class="[
          shape === 'circle' ? 'rounded-full' : 'rounded-3xl',
          readonly ? 'opacity-60 cursor-not-allowed' : '',
          isDragging 
            ? 'border-primary-500 bg-primary-500/5 ring-8 ring-primary-500/5' 
            : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/50 bg-slate-50/50 dark:bg-slate-900/50 group-hover:bg-slate-50 dark:group-hover:bg-slate-900',
          previewUrl ? 'border-primary-500/20 shadow-inner' : ''
        ]"
      >
        <!-- content: Empty State -->
        <div v-if="!previewUrl" class="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div class="p-4 rounded-2xl bg-white dark:bg-black/20 text-slate-400 group-hover:text-primary-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-800">
             <UploadCloud v-if="!isDragging" class="w-8 h-8" />
             <CloudLightning v-else class="w-8 h-8 animate-pulse text-primary-500" />
          </div>
          <p class="text-[10px] font-black text-textPrimary uppercase tracking-widest mt-4">
             {{ isDragging ? $t('common.dropNow') || 'Drop Now' : $t('common.uploadImage') || 'Upload Image' }}
          </p>
        </div>

        <!-- content: Image Preview -->
        <div v-else class="w-full h-full relative">
          <img 
            :src="previewUrl" 
            class="w-full h-full transition-all duration-700 group-hover:scale-105 p-3"
            :class="fit === 'contain' ? 'object-contain' : 'object-cover'"
            :alt="label"
            @error="handleImageError"
          />
          
          <!-- Uploading Overlay -->
          <div v-if="uploading" class="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
             <div class="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- External Actions & Metadata -->
    <div class="flex items-center justify-between gap-4 pt-2">
      <div v-if="previewUrl" class="flex items-center gap-2">
        <button 
          @click="!readonly && fileInput?.click()"
          :disabled="readonly"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-500/10 hover:bg-primary-500 text-primary-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300"
        >
          <Edit2 class="w-3 h-3" />
          {{ $t('common.change') || 'Change' }}
        </button>
        <button 
          v-if="!uploading"
          @click="removeImage"
          :disabled="readonly"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300"
        >
          <X class="w-3 h-3" />
          {{ $t('common.remove') || 'Remove' }}
        </button>
      </div>
      <div v-else>
         <slot name="empty-actions"></slot>
      </div>

      <!-- Additional slot for custom info (like size recommendations) -->
      <div class="ml-auto">
        <slot name="footer"></slot>
      </div>
    </div>

    <!-- Error Message -->
    <Transition name="slide-up">
      <div v-if="localError" class="flex items-center gap-2.5 p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-wide animate-in slide-in-from-left duration-300 shadow-sm">
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        {{ localError }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { UploadCloud, CloudLightning, X, Edit2, AlertCircle, Plus } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: [File, String, null], default: null },
  label: { type: String, default: '' },
  labelIcon: { type: [Object, Function], default: null },
  subtext: { type: String, default: '' },
  accept: { type: String, default: 'image/jpeg,image/png,image/webp' },
  maxSize: { type: Number, default: 5 * 1024 * 1024 }, // 5MB default
  shape: { type: String, default: 'square' }, // 'square' or 'circle'
  uploading: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  aspect: { type: String, default: 'aspect-square' },
  fit: { type: String, default: 'cover' }
});

const emit = defineEmits(['update:modelValue', 'change', 'error']);

const fileInput = ref(null);
const previewUrl = ref(null);
const isDragging = ref(false);
const localError = ref('');

function decodeHtmlEntities(value) {
  if (typeof value !== "string" || !value) return value;

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#([0-9]+);/g, (_match, dec) =>
      String.fromCharCode(parseInt(dec, 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function matchesAcceptedType(file, accept) {
  if (!accept) return true;

  const accepted = accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const mime = `${file.type || ''}`.toLowerCase();
  const extension = file.name?.includes('.')
    ? `.${file.name.split('.').pop().toLowerCase()}`
    : '';

  return accepted.some((entry) => {
    if (entry.endsWith('/*')) {
      const family = entry.slice(0, -1);
      return mime.startsWith(family);
    }
    return entry === mime || entry === extension;
  });
}

// Sync preview with modelValue
watch(() => props.modelValue, (val) => {
  if (!val) {
    previewUrl.value = null;
  } else if (typeof val === 'string') {
    previewUrl.value = decodeHtmlEntities(val);
  } else if (val instanceof File) {
    // Only update preview if it's not already set correctly
    if (!previewUrl.value || !previewUrl.value.startsWith('blob:')) {
      if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl.value);
      }
      previewUrl.value = URL.createObjectURL(val);
    }
  }
}, { immediate: true });

function onFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) handleFile(file);
}

function onDragOver() {
  if (props.readonly) return;
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(e) {
  if (props.readonly) return;
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) handleFile(file);
}

function handleFile(file) {
  if (props.readonly) return;
  localError.value = '';
  
  // Validation
  if (!matchesAcceptedType(file, props.accept)) {
    setError(t('Invalid file type.') + ' (' + props.accept + ')');
    return;
  }

  if (file.size > props.maxSize) {
    const mb = (props.maxSize / (1024 * 1024)).toFixed(0);
    setError(t('File too large. Max size is') + ` ${mb}MB`);
    return;
  }

  // Success
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }
  
  previewUrl.value = URL.createObjectURL(file);
  emit('update:modelValue', file);
  emit('change', file);
}

function removeImage() {
  if (props.readonly) return;
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = null;
  localError.value = '';
  if (fileInput.value) fileInput.value.value = '';
  emit('update:modelValue', null);
  emit('change', null);
}

function setError(msg) {
  localError.value = msg;
  emit('error', msg);
  // Auto-clear error after 4s
  setTimeout(() => { if(localError.value === msg) localError.value = ''; }, 4000);
}

function handleImageError(e) {
  console.error("Image load error:", e.target.src);
  // Optional: set a fallback or show error
}

onBeforeUnmount(() => {
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-leave-active {
  transition: all 0.2s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
