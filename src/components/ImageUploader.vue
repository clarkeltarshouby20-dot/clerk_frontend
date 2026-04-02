<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      <!-- Slot 1: Main Image (Mandatory) -->
      <div 
        class="relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-500 group cursor-pointer overflow-hidden shadow-sm"
        :class="[
          previews[0] ? 'border-primary-500/50 ring-2 ring-primary-500/5 shadow-md' : 'border-borderThin hover:border-primary-400 bg-surface',
          draggingIdx === 0 ? 'scale-105 border-primary-500 bg-primary-50/30 ring-4 ring-primary-500/10' : ''
        ]"
        @click="triggerInput(0)"
        @dragover.prevent="onDragOver(0)"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop(0)"
      >
        <div v-if="previews[0]" class="w-full h-full relative group/preview">
          <img :src="previews[0]" class="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" />
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Edit2 class="text-white w-6 h-6 animate-in zoom-in duration-300" />
          </div>
          <button 
            @click.stop="removeImage(0)" 
            class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all z-10 border border-white/20"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        <div v-else class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div class="p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 mb-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Camera class="w-6 h-6" />
          </div>
          <span class="text-[10px] font-black text-textPrimary uppercase tracking-widest mb-0.5 leading-tight">{{ $t('admin.mainImage') }}</span>
          <span class="text-[9px] text-textSecondary opacity-70 font-bold uppercase tracking-tighter">* {{ $t('admin.mandatory') }}</span>
        </div>
        <input type="file" :ref="el => inputs[0] = el" class="hidden" accept="image/*" @change="handleFile(0, $event)" />
      </div>

      <!-- Slots 2-5: Gallery -->
      <div 
        v-for="i in 4" 
        :key="i"
        class="relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-500 group cursor-pointer overflow-hidden shadow-sm"
        :class="[
          previews[i] ? 'border-borderMedium/50 shadow-sm' : 'border-borderThin hover:border-primary-400 bg-surface',
          draggingIdx === i ? 'scale-105 border-primary-500 bg-primary-50/30 ring-4 ring-primary-500/10' : ''
        ]"
        @click="triggerInput(i)"
        @dragover.prevent="onDragOver(i)"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop(i)"
      >
        <div v-if="previews[i]" class="w-full h-full relative group/preview">
          <img :src="previews[i]" class="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" />
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Edit2 class="text-white w-5 h-5 animate-in zoom-in duration-300" />
          </div>
          <button 
            @click.stop="removeImage(i)" 
            class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all z-10 border border-white/20"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
        <div v-else class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div class="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-textSecondary group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 group-hover:text-primary-500 transition-all duration-500 mb-2 group-hover:scale-110 group-hover:-rotate-3">
             <Plus class="w-5 h-5" />
          </div>
          <span class="text-[9px] font-black text-textSecondary uppercase tracking-widest text-wrap leading-tight group-hover:text-textPrimary transition-colors">{{ $t('admin.gallery') }}</span>
        </div>
        <input type="file" :ref="el => inputs[i] = el" class="hidden" accept="image/*" @change="handleFile(i, $event)" />
      </div>
    </div>

    <!-- Error state -->
    <Transition name="slide-up">
      <div v-if="localError" class="flex items-center gap-2.5 p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-wide animate-in slide-in-from-left duration-300 shadow-sm mt-2">
        <AlertCircle class="w-4 h-4 flex-shrink-0" />
        {{ localError }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useI18n } from "vue-i18n";
import { Camera, Plus, X, Edit2, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  existingImages: {
    type: Array,
    default: () => []
  },
  maxSize: {
    type: Number,
    default: 2 * 1024 * 1024 // 2MB default for products
  }
});

const emit = defineEmits(['update:images']);
const { t } = useI18n();

const inputs = ref([]);
const files = ref([null, null, null, null, null]);
const previews = ref([null, null, null, null, null]);
const localError = ref('');
const draggingIdx = ref(-1);

// Maintain ObjectURLs for cleanup
const objectUrls = new Set();

// Sync existing images if provided (URLs from server)
watch(() => props.existingImages, (newVal) => {
  if (newVal && newVal.length > 0) {
    newVal.slice(0, 5).forEach((img, idx) => {
      // Only set if not already set via local file change
      if (!files.value[idx]) {
        previews.value[idx] = img;
      }
    });
  }
}, { immediate: true });

function triggerInput(index) {
  inputs.value[index]?.click();
}

function onDragOver(idx) {
  draggingIdx.value = idx;
}

function onDragLeave() {
  draggingIdx.value = -1;
}

function onDrop(idx) {
  draggingIdx.value = -1;
  const file = event.dataTransfer.files?.[0];
  if (file) handleFile(idx, { target: { files: [file] } });
}

function handleFile(index, event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validation
  if (!file.type.startsWith('image/')) {
    setError(t('errors.invalidFileType') || "يرجى اختيار ملف صورة صحيح.");
    return;
  }
  if (file.size > props.maxSize) {
    const mb = (props.maxSize / (1024 * 1024)).toFixed(0);
    setError(t('profile.errors.fileTooLarge') || `حجم الصورة يتجاوز الحد المسموح به (${mb} ميجابايت).`);
    return;
  }

  localError.value = '';
  files.value[index] = file;
  
  // Cleanup old local preview if exists
  if (previews.value[index] && typeof previews.value[index] === 'string' && previews.value[index].startsWith('blob:')) {
    URL.revokeObjectURL(previews.value[index]);
    objectUrls.delete(previews.value[index]);
  }

  const url = URL.createObjectURL(file);
  previews.value[index] = url;
  objectUrls.add(url);
  
  updateParent();
}

function removeImage(index) {
  files.value[index] = null;
  
  if (previews.value[index] && typeof previews.value[index] === 'string' && previews.value[index].startsWith('blob:')) {
    URL.revokeObjectURL(previews.value[index]);
    objectUrls.delete(previews.value[index]);
  }
  
  previews.value[index] = null;
  if (inputs.value[index]) inputs.value[index].value = '';
  updateParent();
}

function updateParent() {
  emit('update:images', files.value);
}

function setError(msg) {
  localError.value = msg;
  setTimeout(() => { if(localError.value === msg) localError.value = ''; }, 4000);
}

onBeforeUnmount(() => {
  objectUrls.forEach(url => URL.revokeObjectURL(url));
});
</script>

<style scoped>
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
