import { test } from "node:test";
import assert from "node:assert/strict";
import { nightOccupancy, nightsOf, roomClash, roomsLeft, stayAvailability } from "@/lib/schedule";
import { seedDatabase } from "@/lib/seed";
import type { Booking, Database, Job } from "@/lib/types";

function db(): Database {
  const base = seedDatabase();
  // Two pool villas to make the maths easy to follow.
  base.services = base.services.map((service) => (service.slug === "pool-villa" ? { ...service, rooms: 2 } : service));
  return base;
}

const stay = (id: string, checkIn: string, checkOut: string, extra: Partial<Job> = {}): Job => ({
  id, reference: id.toUpperCase(), customerId: "c1", services: "Pool villa", address: "", scheduledDate: checkIn, timeWindow: "", endDate: checkOut,
  room: "pool-villa", guests: 2, completedDate: "", price: "", status: "scheduled", notes: "", beforePhotos: [], afterPhotos: [], history: [], sourceRef: "",
  createdAt: "", updatedAt: "", ...extra,
});

const request = (id: string, checkIn: string, checkOut: string, extra: Partial<Booking> = {}): Booking => ({
  id, reference: id.toUpperCase(), status: "new", name: "Guest", phone: "0400000000", email: "", services: ["pool-villa"], details: {}, summary: "", date: checkIn,
  timeWindow: "", address: "", suburb: "", notes: "", internalNotes: "", promoCode: "", promoMessage: "", checkOut, room: "pool-villa", guests: 2, createdAt: "", ...extra,
});

test("nights run from check-in up to the night before check-out", () => {
  assert.deepEqual(nightsOf("2026-12-30", "2027-01-02"), ["2026-12-30", "2026-12-31", "2027-01-01"]);
  assert.deepEqual(nightsOf("2026-12-30", "2026-12-30"), []);
});

test("a room type sells out when stays fill every room on any night", () => {
  const data = db();
  data.jobs = [stay("a", "2026-11-01", "2026-11-04")];
  data.bookings = [request("b", "2026-11-03", "2026-11-05")];
  assert.equal(roomsLeft(data, "pool-villa", "2026-11-01", "2026-11-03"), 1);
  assert.equal(roomsLeft(data, "pool-villa", "2026-11-03", "2026-11-04"), 0);
  assert.deepEqual(roomClash(data, "pool-villa", "2026-11-02", "2026-11-04").sort(), ["A", "B"]);
  // Check-out morning is free: a new guest can arrive the day the last one leaves.
  assert.equal(roomsLeft(data, "pool-villa", "2026-11-05", "2026-11-06"), 2);
});

test("lost requests, cancelled stays and converted requests don't hold rooms twice", () => {
  const data = db();
  data.bookings = [request("lost", "2026-11-01", "2026-11-02", { status: "lost" }), request("conv", "2026-11-01", "2026-11-02")];
  data.jobs = [stay("x", "2026-11-01", "2026-11-02", { sourceRef: "CONV" }), stay("y", "2026-11-01", "2026-11-02", { status: "cancelled" })];
  assert.equal(roomsLeft(data, "pool-villa", "2026-11-01", "2026-11-02"), 1);
  assert.equal(nightOccupancy(data, "2026-11-01").find((item) => item.slug === "pool-villa")?.used, 1);
});

test("blocked nights close every room and show on the booking form", () => {
  const data = db();
  data.blockedDates = [{ id: "b1", date: "2026-11-02", reason: "Private event" }];
  const result = stayAvailability(data, "2026-11-01", "2026-11-03");
  assert.deepEqual(result.closed, ["2026-11-02"]);
  assert.ok(result.rooms.every((room) => room.left === 0));
});
