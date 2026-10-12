import { addDaysIso, nightsBetween } from "@/lib/constants";
import type { Booking, Database, Job, Service } from "@/lib/types";

/*
 * Hotel availability works by the night. A stay from check-in to check-out uses one room of its
 * type on every night in between (check-out morning is free for the next guest). A room type is
 * full on a night when the stays using it reach the number of rooms of that type.
 */

/** A stay shown on the calendar. */
export type StayItem = {
  kind: "job" | "booking";
  id: string;
  reference: string;
  room: string;
  roomTitle: string;
  name: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  href: string;
};

type ScheduleData = Pick<Database, "jobs" | "bookings" | "customers" | "blockedDates" | "services">;

/** A booking request stops holding its room once it's lost, or once it has become a stay (the stay holds it instead). */
function bookingHolds(booking: Booking, jobs: Job[]) {
  if (booking.status === "lost" || !booking.room || !booking.date || !booking.checkOut) return false;
  return !jobs.some((job) => job.sourceRef && job.sourceRef === booking.reference);
}

function jobHolds(job: Job) {
  return job.status !== "cancelled" && Boolean(job.room && job.scheduledDate && job.endDate);
}

/** Each night from check-in up to (not including) check-out. */
export function nightsOf(checkIn: string, checkOut: string) {
  const count = nightsBetween(checkIn, checkOut);
  return Array.from({ length: Math.min(count, 366) }, (_, index) => addDaysIso(checkIn, index));
}

export function roomTypes(db: Pick<Database, "services">): Service[] {
  return db.services.filter((service) => service.visible && service.rooms > 0);
}

/** Every stay (confirmed or requested) that overlaps the dates, inclusive of `from`, exclusive of `to`. */
export function stays(db: ScheduleData, from: string, to: string): StayItem[] {
  const title = (slug: string) => db.services.find((service) => service.slug === slug)?.title ?? slug;
  const overlaps = (checkIn: string, checkOut: string) => checkIn < to && checkOut > from;
  const items: StayItem[] = [];
  for (const job of db.jobs) {
    if (!jobHolds(job) || !overlaps(job.scheduledDate, job.endDate)) continue;
    const customer = db.customers.find((item) => item.id === job.customerId);
    items.push({
      kind: "job",
      id: job.id,
      reference: job.reference,
      room: job.room,
      roomTitle: title(job.room),
      name: customer ? customer.companyName || customer.name : "",
      checkIn: job.scheduledDate,
      checkOut: job.endDate,
      guests: job.guests,
      status: job.status,
      href: `/admin/customers/${job.customerId}`,
    });
  }
  for (const booking of db.bookings) {
    if (!bookingHolds(booking, db.jobs) || !overlaps(booking.date, booking.checkOut)) continue;
    items.push({
      kind: "booking",
      id: booking.id,
      reference: booking.reference,
      room: booking.room,
      roomTitle: title(booking.room),
      name: booking.name,
      checkIn: booking.date,
      checkOut: booking.checkOut,
      guests: booking.guests,
      status: booking.status,
      href: "/admin/leads",
    });
  }
  return items.sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.roomTitle.localeCompare(b.roomTitle));
}

/** Stays using a room type on one night. */
export function roomOccupants(db: ScheduleData, room: string, night: string, ignore: { jobId?: string; bookingId?: string } = {}) {
  return stays(db, night, addDaysIso(night, 1)).filter((item) => item.room === room && item.id !== ignore.jobId && item.id !== ignore.bookingId);
}

/** How many rooms of a type are left on the busiest night of a stay (0 = sold out). */
export function roomsLeft(db: ScheduleData, room: string, checkIn: string, checkOut: string, ignore: { jobId?: string; bookingId?: string } = {}) {
  const type = db.services.find((service) => service.slug === room);
  if (!type || type.rooms <= 0) return 0;
  const nights = nightsOf(checkIn, checkOut);
  if (!nights.length) return 0;
  if (nights.some((night) => db.blockedDates.some((item) => item.date === night))) return 0;
  return Math.max(0, Math.min(...nights.map((night) => type.rooms - roomOccupants(db, room, night, ignore).length)));
}

/** The stays that make a room type unavailable for these dates (for clear error messages). */
export function roomClash(db: ScheduleData, room: string, checkIn: string, checkOut: string, ignore: { jobId?: string; bookingId?: string } = {}) {
  if (roomsLeft(db, room, checkIn, checkOut, ignore) > 0) return [];
  const refs = new Set<string>();
  for (const night of nightsOf(checkIn, checkOut)) roomOccupants(db, room, night, ignore).forEach((item) => refs.add(item.reference));
  return [...refs];
}

/** What the public booking form shows: each room type with how many are left for the dates. */
export function stayAvailability(db: ScheduleData, checkIn: string, checkOut: string) {
  const closed = nightsOf(checkIn, checkOut).filter((night) => db.blockedDates.some((item) => item.date === night));
  return {
    closed,
    rooms: roomTypes(db).map((type) => ({ slug: type.slug, left: roomsLeft(db, type.slug, checkIn, checkOut), total: type.rooms })),
  };
}

/** Rooms booked per type on one night, for the admin calendar. */
export function nightOccupancy(db: ScheduleData, night: string) {
  return roomTypes(db).map((type) => ({ slug: type.slug, title: type.title, used: roomOccupants(db, type.slug, night).length, total: type.rooms }));
}
