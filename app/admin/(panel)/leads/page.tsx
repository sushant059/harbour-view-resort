import { LeadsBoard } from "@/components/admin/leads-board";
import { getDb } from "@/lib/store";

export default async function LeadsPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Leads and bookings</h1>
      <LeadsBoard leads={db.leads} bookings={db.bookings} blocked={db.blockedDates} />
    </div>
  );
}
