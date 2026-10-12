import { CustomersBoard } from "@/components/admin/customers";
import { getDb } from "@/lib/store";

export default async function CustomersPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Guests & stays</h1>
      <p className="mb-5 mt-1 text-slate">Every guest and stay, created automatically from website bookings and chats, with status, notes and photos. Saved to Supabase and your Google Sheet.</p>
      <CustomersBoard customers={db.customers} jobs={db.jobs} />
    </div>
  );
}
