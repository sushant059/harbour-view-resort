import { OffersEditor } from "@/components/admin/editors";
import { emailEnabled } from "@/lib/email";
import { smsEnabled } from "@/lib/sms";
import { getDb } from "@/lib/store";
import { siteUrl } from "@/lib/utils";

export default async function OffersPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Offers and promo codes</h1>
      <OffersEditor offers={db.offers} promos={db.promos} send={{ customers: db.customers, campaigns: db.campaigns, siteUrl: siteUrl(), emailReady: emailEnabled(), smsReady: smsEnabled() }} />
    </div>
  );
}
