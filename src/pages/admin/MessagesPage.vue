<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2
        class="text-base sm:text-lg lg:text-xl font-bold text-textPrimary tracking-tight flex items-center gap-2"
      >
        <Inbox class="w-6 h-6 text-primary-500" />
        {{ $t("admin.messages") || "Message Center" }}
      </h2>
    </div>

    <!-- Messages List -->
    <div class="card overflow-hidden">
      <div v-if="loading" class="p-8 flex justify-center">
        <LoadingSpinner />
      </div>

      <div
        v-else-if="messages.length === 0"
        class="p-12 text-center text-textSecondary"
      >
        <MessageSquare class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>No messages found in the inbox.</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-white/5">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="p-6 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-white/5 flex flex-col sm:flex-row gap-4 sm:items-start cursor-pointer"
          :class="{
            'opacity-60': msg.status === 'read' || msg.status === 'archived',
            'bg-primary-500/5 dark:bg-primary-500/10': msg.status === 'unread',
          }"
          @click="openMessage(msg)"
        >
          <!-- Status Icon -->
          <div class="hidden sm:flex shrink-0 mt-1">
            <div 
              v-if="msg.status === 'unread'"
              class="w-2 h-2 rounded-full bg-primary-500 mt-2"
              title="Unread"
            ></div>
            <Check v-else class="w-4 h-4 text-emerald-500 mt-1" title="Read" />
          </div>

          <!-- Avatar / Initial -->
          <div
            class="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 shrink-0 items-center justify-center text-sm font-bold text-textSecondary"
          >
            {{ msg.name.charAt(0).toUpperCase() }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h4 class="font-bold text-textPrimary tracking-tight truncate">
                {{ msg.name }}
                <span class="text-xs font-normal text-textSecondary ml-1"
                  >&lt;{{ msg.email }}&gt;</span
                >
              </h4>
              <span class="text-xs text-textSecondary whitespace-nowrap">
                {{ new Date(msg.created_at).toLocaleString() }}
              </span>
            </div>

            <p
              class="font-semibold text-sm mb-1 text-gray-800 dark:text-gray-200 truncate"
            >
              {{ msg.subject }}
            </p>

            <p
              class="text-sm text-textSecondary font-medium leading-relaxed truncate max-w-2xl"
            >
              {{ msg.message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0 pt-2 sm:pt-0" @click.stop>
            <button
              @click="openMessage(msg)"
              class="p-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/20 transition-colors"
              title="View Message"
            >
              <Eye class="w-4 h-4" />
            </button>
            <button
              v-if="msg.status === 'unread'"
              @click="updateStatus(msg.id, 'read')"
              class="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 transition-colors"
              title="Mark as Read"
            >
              <CheckSquare class="w-4 h-4" />
            </button>
            <button
              v-if="msg.status !== 'archived'"
              @click="updateStatus(msg.id, 'archived')"
              class="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/20 transition-colors"
              title="Archive Message"
            >
              <Archive class="w-4 h-4" />
            </button>
            <button
              @click="deleteMessage(msg.id)"
              class="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
              title="Delete Permanently"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Message Detail Modal -->
    <Transition name="fade">
      <div 
        v-if="selectedMessage" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="selectedMessage = null"
      >
        <div 
          class="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-borderThin overflow-hidden flex flex-col max-h-[90vh]"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="px-8 py-6 border-b border-borderThin flex items-start justify-between bg-gray-50/50 dark:bg-white/5">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                  {{ selectedMessage.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-textPrimary leading-tight">
                    {{ selectedMessage.name }}
                  </h3>
                  <p class="text-sm text-textSecondary">
                    {{ selectedMessage.email }}
                  </p>
                </div>
              </div>
            </div>
            <button 
              @click="selectedMessage = null"
              class="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-8 overflow-y-auto subtle-scrollbar flex-1">
            <div class="mb-6 pb-6 border-b border-borderThin">
              <span class="text-[10px] uppercase font-extrabold tracking-widest text-textSecondary opacity-60 mb-2 block">Subject</span>
              <h4 class="text-lg font-bold text-textPrimary">{{ selectedMessage.subject }}</h4>
              <span class="text-xs text-textSecondary mt-2 block">Received: {{ new Date(selectedMessage.created_at).toLocaleString() }}</span>
            </div>

            <div>
              <span class="text-[10px] uppercase font-extrabold tracking-widest text-textSecondary opacity-60 mb-2 block">Message</span>
              <p class="text-textPrimary leading-relaxed whitespace-pre-wrap font-medium">
                {{ selectedMessage.message }}
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-8 py-6 border-t border-borderThin bg-gray-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
             <button
              v-if="selectedMessage.status !== 'archived'"
              @click="updateStatus(selectedMessage.id, 'archived'); selectedMessage = null"
              class="btn-secondary text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Archive class="w-4 h-4 mr-2" />
              Archive
            </button>
            <button
              @click="deleteMessage(selectedMessage.id); selectedMessage = null"
              class="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete
            </button>
            <button 
              @click="selectedMessage = null"
              class="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { useI18n } from "vue-i18n";
import { Inbox, MessageSquare, Check, Archive, Trash2, X, Eye, CheckSquare } from "lucide-vue-next";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { useUI } from "@/composables/useUI.js";
import api from "@/axios.js";

const { t } = useI18n();
const { showToast, confirmAction } = useUI();

const loading = ref(true);
const messages = ref([]);
const selectedMessage = ref(null);

const openMessage = (msg) => {
  selectedMessage.value = msg;
  if (msg.status === "unread") {
    updateStatus(msg.id, "read");
  }
};

const fetchMessages = async () => {
  loading.value = true;
  try {
    const res = await api.get("/messages");
    messages.value = res.data.data || [];
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (id, status) => {
  try {
    await api.put(`/messages/${id}/status`, { status });
    const msg = messages.value.find((m) => m.id === id);
    if (msg) msg.status = status;
    showToast?.("Message status updated", "success");
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  }
};

const deleteMessage = async (id) => {
  const confirmed = await confirmAction({
    title: t("common.deleteConfirmTitle") || "Confirm Deletion",
    message: t("common.deleteConfirmMsg") || "Are you sure you want to delete this message permanently? This action cannot be undone.",
    confirmLabel: t("common.delete") || "Delete Permanently",
    variant: "danger"
  });

  if (!confirmed) return;

  try {
    await api.delete(`/messages/${id}`);
    messages.value = messages.value.filter((m) => m.id !== id);
    showToast?.("Message deleted", "success");
  } catch (error) {
    showToast?.(error.response?.data?.message || t("common.error"), "error");
  }
};

onMounted(fetchMessages);
</script>
