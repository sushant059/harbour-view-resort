import { ResultsEditor } from "@/components/admin/editors";
import { getDb } from "@/lib/store";

export default async function ResultsAdminPage() {
  const db = await getDb();
  return <div><h1 className="mb-4 text-3xl font-bold">Before and after</h1><ResultsEditor results={db.results} services={db.services} /></div>;
}
