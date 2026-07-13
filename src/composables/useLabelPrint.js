/**
 * Hidden-iframe label printing for thermal barcode printers (browser + OS driver).
 */

import { LABEL_PRINT } from "@/config/labelPrint.config.js";

export function printHtmlInHiddenIframe(html) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "style",
      "position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none",
    );
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow;
    const doc = frameWindow?.document;
    if (!doc || !frameWindow) {
      iframe.remove();
      reject(new Error("Print frame unavailable."));
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      setTimeout(() => iframe.remove(), 300);
      resolve();
    };

    setTimeout(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
      } catch (error) {
        iframe.remove();
        reject(error);
        return;
      }

      frameWindow.addEventListener("afterprint", cleanup, { once: true });
      setTimeout(cleanup, 2000);
    }, 350);
  });
}

export function buildLabelPrintDocument({ barcode, price, barcodeSvgMarkup, escapeHtml }) {
  const { widthMm, heightMm } = LABEL_PRINT;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(barcode)}</title>
  <style>
    @page {
      size: ${widthMm}mm ${heightMm}mm;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      max-width: ${widthMm}mm;
      max-height: ${heightMm}mm;
      overflow: hidden;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .label-sheet {
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      max-height: ${heightMm}mm;
      padding: 2mm 2mm 1mm;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1mm;
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    .label-price {
      width: ${widthMm - 4}mm;
      font-size: 9pt;
      font-weight: 800;
      text-align: center;
      line-height: 1.2;
      flex-shrink: 0;
    }

    .barcode-svg {
      display: block;
      width: ${widthMm - 6}mm;
      height: 12mm;
      max-height: 12mm;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="label-sheet">
    ${barcodeSvgMarkup}
    <p class="label-price">EGP ${escapeHtml(Number(price || 0).toFixed(2))}</p>
  </div>
</body>
</html>`;
}
