import { DayMomentsEditor } from "@/components/admin/day-moments";
import { getDb } from "@/lib/store";

export default async function DayMomentsPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">A day at the resort</h1>
      <p className="mb-5 mt-1 max-w-2xl text-slate">The homepage scene where the sun crosses the harbour. Each time of day shows its own photo: upload your real photos of breakfast, the pool, the spa, sunset drinks and dinner. Landscape photos look best.</p>
      <DayMomentsEditor settings={db.settings} />
    </div>
  );
}
