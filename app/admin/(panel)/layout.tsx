import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { isOverdue } from "@/lib/invoice";
import { getDb } from "@/lib/store";
import { darwinISODate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const db = await getDb();
  const badges = {
    "/admin/reviews": db.reviews.filter((review) => review.status === "pending").length,
    "/admin/customers": db.jobs.filter((job) => job.status === "complaint").length,
    "/admin/invoices": db.invoices.filter((invoice) => isOverdue(invoice, darwinISODate())).length,
    "/admin/leads": db.leads.filter((lead) => lead.status === "new").length + db.bookings.filter((booking) => booking.status === "new").length,
  };
  return <AdminShell badges={badges}>{children}</AdminShell>;
}
