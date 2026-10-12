import { MediaEditor } from "@/components/admin/editors";
import { getDb } from "@/lib/store";

export default async function MediaPage() {
  const db = await getDb();
  return <div><h1 className="mb-4 text-3xl font-bold">Gallery and media</h1><MediaEditor media={db.media} services={db.services} /></div>;
}
