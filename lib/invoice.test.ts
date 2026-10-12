import { test } from "node:test";
import assert from "node:assert/strict";
import { invoiceTotals, isOverdue, nextInvoiceNumber, parsePrice } from "@/lib/invoice";

test("totals include GST as 1/11 of the total when registered", () => {
  const totals = invoiceTotals({ items: [{ description: "Carpet", quantity: 3, unitPrice: 55 }, { description: "Rug", quantity: 1, unitPrice: 44.5 }], discount: 9.5 }, true);
  assert.deepEqual(totals, { subtotal: 209.5, discount: 9.5, total: 200, gst: 18.18 });
  assert.equal(invoiceTotals({ items: [{ description: "x", quantity: 1, unitPrice: 110 }], discount: 0 }, false).gst, 0);
});

test("discount never takes the total below zero", () => {
  assert.equal(invoiceTotals({ items: [{ description: "x", quantity: 1, unitPrice: 50 }], discount: 80 }, false).total, 0);
});

test("invoice numbers count up from the highest", () => {
  assert.equal(nextInvoiceNumber([]), "INV-1001");
  assert.equal(nextInvoiceNumber(["INV-1001", "INV-1007", "INV-1003"]), "INV-1008");
});

test("reads prices typed on jobs and spots overdue invoices", () => {
  assert.equal(parsePrice("$1,250.00 inc GST"), 1250);
  assert.equal(parsePrice("about four hundred"), 0);
  assert.equal(isOverdue({ status: "sent", dueDate: "2026-10-01" }, "2026-10-11"), true);
  assert.equal(isOverdue({ status: "paid", dueDate: "2026-10-01" }, "2026-10-11"), false);
});
