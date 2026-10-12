"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 font-bold text-white hover:bg-navy-deep print:hidden">
      <Printer className="h-5 w-5" aria-hidden /> Print or save as PDF
    </button>
  );
}
