import { CalendarBoard } from "@/components/admin/calendar";
import { roomTypes, stays } from "@/lib/schedule";
import { getDb } from "@/lib/store";
import { darwinISODate } from "@/lib/utils";

export default async function CalendarPage() {
  const db = await getDb();
  return (
    <div>
      <h1 className="text-3xl font-bold text-navy">Occupancy calendar</h1>
      <p className="mb-5 mt-1 text-slate">Rooms booked each night, with arrivals and departures. A room type that’s full can’t be booked again on the website.</p>
      <CalendarBoard
        items={stays(db, "2000-01-01", "2100-12-31")}
        rooms={roomTypes(db).map((room) => ({ slug: room.slug, title: room.title, total: room.rooms }))}
        blocked={db.blockedDates}
        today={darwinISODate()}
      />
    </div>
  );
}
