import { DataStatus } from "@/components/admin/data-status";
import { SettingsEditor } from "@/components/admin/editors";
import { sheetsEnabled } from "@/lib/sheets";
import { getDb, usingSupabase } from "@/lib/store";

export default async function SettingsPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-navy">Settings</h1>
      <DataStatus supabase={usingSupabase()} sheets={sheetsEnabled()} />
      <SettingsEditor settings={db.settings} localMode={!usingSupabase()} />
    </div>
  );
}
