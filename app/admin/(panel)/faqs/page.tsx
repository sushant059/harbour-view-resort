import { FaqsEditor } from "@/components/admin/editors";
import { getDb } from "@/lib/store";

export default async function FaqsAdminPage() {
  const db = await getDb();
  return <div><h1 className="mb-4 text-3xl font-bold">FAQs</h1><FaqsEditor faqs={db.faqs} /></div>;
}
