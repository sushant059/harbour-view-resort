import type { Invoice, InvoiceItem } from "@/lib/types";

const cents = (value: number) => Math.round(value * 100);

/** "$1,234.50" */
export function money(value: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);
}

export function lineTotal(item: InvoiceItem) {
  return cents(item.quantity * item.unitPrice) / 100;
}

/**
 * Prices are what the customer pays (GST-inclusive when registered),
 * so the GST shown on a tax invoice is 1/11 of the total.
 */
export function invoiceTotals(invoice: Pick<Invoice, "items" | "discount">, gstRegistered: boolean) {
  const subtotalCents = invoice.items.reduce((sum, item) => sum + cents(item.quantity * item.unitPrice), 0);
  const discountCents = Math.min(subtotalCents, Math.max(0, cents(invoice.discount || 0)));
  const totalCents = subtotalCents - discountCents;
  const gstCents = gstRegistered ? Math.round(totalCents / 11) : 0;
  return { subtotal: subtotalCents / 100, discount: discountCents / 100, total: totalCents / 100, gst: gstCents / 100 };
}

/** INV-1001, INV-1002, … one more than the highest number used so far. */
export function nextInvoiceNumber(numbers: string[]) {
  const highest = numbers.reduce((max, number) => Math.max(max, Number(number.replace(/\D/g, "")) || 0), 1000);
  return `INV-${highest + 1}`;
}

/** "$400", "400", "$1,250.00 inc GST" → 400 / 1250. Anything unreadable → 0. */
export function parsePrice(text: string) {
  const match = text.replace(/,/g, "").match(/\d+(\.\d{1,2})?/);
  return match ? Number(match[0]) : 0;
}

export function isOverdue(invoice: Pick<Invoice, "status" | "dueDate">, today: string) {
  return invoice.status === "sent" && Boolean(invoice.dueDate) && invoice.dueDate < today;
}
