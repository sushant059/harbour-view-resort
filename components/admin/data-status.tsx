"use client";

import { useTransition } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { syncSheetsAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

/** Shows where admin data is being saved, and lets the owner push everything to Google Sheets. */
export function DataStatus({ supabase, sheets }: { supabase: boolean; sheets: boolean }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <section className="mb-6 grid gap-3 md:grid-cols-2">
      <div className="rounded-card bg-white p-5 shadow-card">
        <p className="flex items-center gap-2 font-bold text-navy">{supabase ? <CheckCircle2 className="h-5 w-5 text-leaf-dark" aria-hidden /> : <CircleAlert className="h-5 w-5 text-danger" aria-hidden />} Supabase database</p>
        <p className="mt-1 text-sm text-slate">
          {supabase
            ? "Connected. Every add, edit and delete in admin is saved to Supabase straight away."
            : "Not connected. Changes are only kept temporarily. Add SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables, then redeploy."}
        </p>
      </div>
      <div className="rounded-card bg-white p-5 shadow-card">
        <p className="flex items-center gap-2 font-bold text-navy">{sheets ? <CheckCircle2 className="h-5 w-5 text-leaf-dark" aria-hidden /> : <CircleAlert className="h-5 w-5 text-sun" aria-hidden />} Google Sheet</p>
        <p className="mt-1 text-sm text-slate">
          {sheets
            ? "Connected. Customers, jobs, leads and bookings update in your sheet automatically."
            : "Not connected yet. Follow google-sheets/README.md in the project, then add the two Google settings in Vercel."}
        </p>
        {sheets && (
          <Button type="button" size="sm" variant="outline" className="mt-3" disabled={pending} onClick={() => start(async () => {
            const result = await syncSheetsAction();
            toast(result.ok ? result.message || "Synced" : result.error, result.ok ? "ok" : "error");
          })}>{pending ? "Testing & syncing…" : "Test connection & sync everything"}</Button>
        )}
      </div>
    </section>
  );
}
