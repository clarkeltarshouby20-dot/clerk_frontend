<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="admin-modal-panel w-full max-w-sm">
        <div class="admin-modal-header">
          <h3 class="text-lg font-bold">{{ $t("admin.pos.printBarcode") }}</h3>
          <button type="button" class="text-textSecondary" @click="$emit('close')">✕</button>
        </div>

        <div class="admin-modal-body flex flex-col items-center gap-4">
          <!-- Preview frame: same aspect ratio as the physical label -->
          <div
            class="label-preview-frame"
            :style="{ aspectRatio: `${labelSize.widthMm} / ${labelSize.heightMm}` }"
          >
            <p class="label-preview-name">{{ productName }}</p>
            <svg ref="barcodeRef" class="label-preview-barcode"></svg>
          </div>

          <p class="text-xs text-textSecondary font-mono">{{ barcode }}</p>
          <p class="text-xs text-textSecondary text-center">
            {{ $t("admin.pos.labelSizeHint", { size: `${labelSize.widthMm}×${labelSize.heightMm}` }) }}
          </p>

          <details class="label-setup-guide w-full">
            <summary class="cursor-pointer text-xs font-semibold text-primary-600">
              {{ $t("admin.pos.labelSetupTitle") }}
            </summary>
            <ol class="mt-2 space-y-1 text-xs text-textSecondary list-decimal list-inside">
              <li>{{ $t("admin.pos.labelSetupStep1") }}</li>
              <li>{{ $t("admin.pos.labelSetupStep2") }}</li>
              <li>{{ $t("admin.pos.labelSetupStep3") }}</li>
              <li>{{ $t("admin.pos.labelSetupStep4", { size: `${labelSize.widthMm}×${labelSize.heightMm}` }) }}</li>
            </ol>
          </details>
        </div>

        <div class="admin-modal-footer">
          <button type="button" class="btn-primary w-full" :disabled="printing" @click="printLabel">
            {{ printing ? $t("admin.pos.processing") : $t("admin.pos.print") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import JsBarcode from "jsbarcode";
import { useUI } from "@/composables/useUI.js";
import { LABEL_PRINT } from "@/config/labelPrint.config.js";
import {
  buildLabelPrintDocument,
  printHtmlInHiddenIframe,
} from "@/composables/useLabelPrint.js";

const props = defineProps({
  productName: { type: String, required: true },
  barcode: { type: String, required: true },
});

defineEmits(["close"]);

const ui = useUI();
const barcodeRef = ref(null);
const printing = ref(false);
const labelSize = computed(() => LABEL_PRINT);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBarcode(svgEl, { preview = false } = {}) {
  if (!svgEl || !props.barcode) return;

  JsBarcode(svgEl, props.barcode, {
    format: "CODE128",
    width: preview ? 1.6 : 1,
    height: preview ? 36 : 32,
    displayValue: true,
    fontSize: preview ? 9 : 8,
    margin: 0,
    textMargin: 1,
  });
}

function buildLabelSvgMarkup() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  renderBarcode(svg, { preview: false });

  const w = parseFloat(svg.getAttribute("width") || "0");
  const h = parseFloat(svg.getAttribute("height") || "0");
  if (w > 0 && h > 0) {
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("class", "barcode-svg");

  return svg.outerHTML;
}

async function printLabel() {
  if (printing.value) return;
  printing.value = true;

  try {
    const html = buildLabelPrintDocument({
      productName: props.productName,
      barcode: props.barcode,
      barcodeSvgMarkup: buildLabelSvgMarkup(),
      escapeHtml,
    });
    await printHtmlInHiddenIframe(html);
  } catch {
    ui.showToast("Unable to open print dialog. Check browser print permissions.", "error");
  } finally {
    printing.value = false;
  }
}

onMounted(async () => {
  await nextTick();
  renderBarcode(barcodeRef.value, { preview: true });
});
</script>

<style scoped>
.label-preview-frame {
  width: 100%;
  max-width: 14.5rem;
  background: #fff;
  border: 2px dashed rgb(var(--color-borderThin) / 1);
  border-radius: 0.5rem;
  padding: 0.5rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: #000;
}

.label-preview-name {
  width: 100%;
  font-size: 0.65rem;
  font-weight: 700;
  text-align: center;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label-preview-barcode {
  width: 100%;
  max-height: 4.5rem;
}

.label-setup-guide summary {
  list-style: none;
}

.label-setup-guide summary::-webkit-details-marker {
  display: none;
}
</style>
