/**
 * Thermal receipt printing for POS (80mm roll, English content).
 */

import { RECEIPT_PRINT } from "@/config/receiptPrint.config.js";
import { printHtmlInHiddenIframe } from "@/composables/useLabelPrint.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatReceiptMoney(value) {
  const amount = Number(value) || 0;
  return `EGP ${amount.toFixed(2)}`;
}

export function formatReceiptDate(value) {
  const date = new Date(value);
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildItemRows(items) {
  if (!items?.length) {
    return `<p class="empty">No items</p>`;
  }

  return items
    .map((item) => {
      const variant = [item.selected_color_name, item.selected_size]
        .filter(Boolean)
        .join(" / ");
      const itemDisc =
        Number(item.item_discount_amount) > 0
          ? `<div class="row"><span>Item Discount</span><span>-${formatReceiptMoney(item.item_discount_amount * item.quantity)}</span></div>`
          : "";
      const unitAfterDisc = formatReceiptMoney(item.final_unit_price);

      return `
        <div class="item">
          <div class="item-name">${escapeHtml(item.product_name)}</div>
          ${variant ? `<div class="item-variant">${escapeHtml(variant)}</div>` : ""}
          <div class="row">
            <span>${item.quantity} x ${formatReceiptMoney(item.original_unit_price)}</span>
            <span>${formatReceiptMoney(item.original_unit_price * item.quantity)}</span>
          </div>
          ${itemDisc}
          <div class="row item-total">
            <span>Line Total</span>
            <span>${formatReceiptMoney(item.line_subtotal)}</span>
          </div>
          <div class="item-unit-note">Unit after discount: ${unitAfterDisc}</div>
        </div>
      `;
    })
    .join("");
}

export function buildReceiptPrintHtml(sale) {
  const { widthMm } = RECEIPT_PRINT;
  const isReturn = sale.transaction_type === "return";
  const itemsHtml = buildItemRows(sale.items);
  const itemsSubtotal =
    Number(sale.subtotal_before_discount) - Number(sale.items_discount_total);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(sale.receipt_number)}</title>
  <style>
    @page {
      size: ${widthMm}mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: ${widthMm}mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }

    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.35;
      padding: 3mm 4mm 4mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    .brand {
      text-align: center;
      margin-bottom: 3mm;
    }

    .brand h1 {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-bottom: 2mm;
    }

    .brand p {
      font-size: 9px;
      line-height: 1.3;
      padding: 0 2mm;
    }

    .divider {
      border-top: 1px dashed #000;
      margin: 3mm 0;
    }

    .divider-solid {
      border-top: 1px solid #000;
      margin: 3mm 0;
    }

    .meta .row,
    .summary .row,
    .item .row {
      display: flex;
      justify-content: space-between;
      gap: 3mm;
      margin: 1mm 0;
    }

    .meta .row span:first-child,
    .summary .row span:first-child,
    .item .row span:first-child {
      flex: 1;
    }

    .meta .row strong,
    .summary .row strong,
    .item .row span:last-child {
      text-align: right;
      white-space: nowrap;
    }

    .section-title {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.06em;
      margin-bottom: 2mm;
    }

    .item {
      margin-bottom: 3mm;
      padding-bottom: 2mm;
      border-bottom: 1px dashed #ccc;
    }

    .item:last-child {
      border-bottom: none;
    }

    .item-name {
      font-weight: 700;
      margin-bottom: 1mm;
    }

    .item-variant {
      font-size: 10px;
      margin-bottom: 1mm;
      color: #222;
    }

    .item-unit-note {
      font-size: 9px;
      color: #333;
      margin-top: 1mm;
    }

    .item-total {
      font-weight: 700;
    }

    .summary .final {
      font-size: 14px;
      font-weight: 700;
      margin-top: 2mm;
      padding-top: 2mm;
      border-top: 1px solid #000;
    }

    .thanks {
      text-align: center;
      font-weight: 700;
      font-size: 12px;
      margin-top: 4mm;
    }

    .badge-return {
      text-align: center;
      font-weight: 700;
      font-size: 11px;
      margin: 2mm 0;
      padding: 1mm;
      border: 1px solid #000;
    }
  </style>
</head>
<body>
  <div class="brand">
    <h1>Clark</h1>
    <p>Not for everyone, welcome to the upper class</p>
  </div>

  <div class="divider"></div>

  <div class="meta">
    <div class="row"><span>Receipt Number</span><strong>${escapeHtml(sale.receipt_number)}</strong></div>
    <div class="row"><span>Transaction Date &amp; Time</span><strong>${escapeHtml(formatReceiptDate(sale.created_at))}</strong></div>
    ${isReturn ? `<div class="badge-return">RETURN</div>` : ""}
  </div>

  <div class="divider"></div>

  <div class="section-title">Items</div>
  ${itemsHtml}

  <div class="divider-solid"></div>

  <div class="summary">
    <div class="row"><span>Subtotal Before Discount</span><strong>${formatReceiptMoney(sale.subtotal_before_discount)}</strong></div>
    <div class="row"><span>Items Discount</span><strong>-${formatReceiptMoney(sale.items_discount_total)}</strong></div>
    <div class="row"><span>After Item Discounts</span><strong>${formatReceiptMoney(itemsSubtotal)}</strong></div>
    <div class="row"><span>Total Discount</span><strong>-${formatReceiptMoney(sale.cart_discount_amount)}</strong></div>
    <div class="row final"><span>Final Total</span><strong>${formatReceiptMoney(sale.final_total)}</strong></div>
    <div class="row"><span>Payment Method</span><strong>Cash</strong></div>
    <div class="row"><span>Items Count</span><strong>${Number(sale.items_count) || 0}</strong></div>
  </div>

  <div class="divider"></div>
  <p class="thanks">Thank You</p>
</body>
</html>`;
}

export async function printReceiptDocument(sale) {
  await printHtmlInHiddenIframe(buildReceiptPrintHtml(sale));
}
