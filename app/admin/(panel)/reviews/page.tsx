import { ReviewsEditor } from "@/components/admin/editors";
import { getDb } from "@/lib/store";

export default async function ReviewsAdminPage() {
  const db = await getDb();
  return <div><h1 className="mb-4 text-3xl font-bold">Reviews</h1><ReviewsEditor reviews={db.reviews} googleUrl={db.settings.google} /></div>;
}
