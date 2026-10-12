import { ServicesEditor } from "@/components/admin/editors";
import { getDb } from "@/lib/store";
import { byOrder } from "@/lib/utils";

export default async function ServicesAdminPage() {
  const db = await getDb();
  return <div><h1 className="mb-4 text-3xl font-bold">Services</h1><ServicesEditor services={byOrder(db.services)} /></div>;
}
