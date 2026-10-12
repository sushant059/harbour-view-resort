import { test } from "node:test";
import assert from "node:assert/strict";
import { cancelRequestFor, linkEnquiry, matchCustomer } from "./crm";
import type { Booking, Customer, Job, Lead } from "./types";

const customer = (patch: Partial<Customer>): Customer => ({
  id: "c1", type: "person", name: "Shuwoj Karki", companyName: "", phone: "0401647545", email: "", address: "", suburb: "",
  notes: "", marketingOptIn: false, createdAt: "", updatedAt: "", ...patch,
});
const lead = (patch: Partial<Lead>): Lead => ({
  id: "l1", reference: "SNT-111111", source: "chat", status: "new", name: "Isha", phone: "0401 647 545", email: "", suburb: "Parap",
  services: ["rug-cleaning"], details: {}, summary: "Rug cleaning — Rugs: 2", notes: "", internalNotes: "", promoCode: "", promoMessage: "",
  photos: [], message: "", preferredTime: "Tomorrow", createdAt: "", ...patch,
});

test("same phone but a different name is a new customer", () => {
  const db = { customers: [customer({})], jobs: [] as Job[] };
  assert.equal(matchCustomer(db, { name: "Isha", phone: "0401 647 545", email: "" }), undefined);
  const result = linkEnquiry(db, "lead", lead({}));
  assert.equal(db.customers.length, 2);
  assert.equal(db.customers[0].name, "Isha");
  assert.equal(db.jobs[0].customerId, result.customerId);
  assert.equal(db.jobs[0].status, "requested");
});

test("same phone and first name, or same email, is the same customer", () => {
  const db = { customers: [customer({ email: "s@k.com" })], jobs: [] as Job[] };
  assert.equal(matchCustomer(db, { name: "shuwoj", phone: "+61401647545", email: "" })?.id, "c1");
  assert.equal(matchCustomer(db, { name: "Shuwoj K", phone: "0499000000", email: "S@K.com" })?.id, "c1");
  linkEnquiry(db, "lead", lead({ name: "Shuwoj" }));
  assert.equal(db.customers.length, 1);
});

test("linking twice doesn't duplicate, bookings keep their slot, lost cancels", () => {
  const booking: Booking = {
    id: "b1", reference: "SNT-222222", status: "new", name: "Ann Lee", phone: "0411222333", email: "ann@x.com", services: [], details: {},
    summary: "Pool villa", date: "2026-11-02", timeWindow: "", address: "", suburb: "Sydney", notes: "", internalNotes: "",
    promoCode: "WELCOME10", promoMessage: "10% off", checkOut: "2026-11-05", room: "pool-villa", guests: 2, createdAt: "",
  };
  const db = { customers: [] as Customer[], jobs: [] as Job[] };
  linkEnquiry(db, "booking", booking);
  linkEnquiry(db, "booking", booking);
  assert.equal(db.jobs.length, 1);
  assert.equal(db.jobs[0].scheduledDate, "2026-11-02");
  assert.equal(db.jobs[0].endDate, "2026-11-05");
  assert.equal(db.jobs[0].room, "pool-villa");
  assert.match(db.jobs[0].notes, /WELCOME10/);
  assert.equal(cancelRequestFor(db, "SNT-222222")?.status, "cancelled");
});

test("a chat enquiry for a room becomes a stay with dates and guests", () => {
  const db = { customers: [] as Customer[], jobs: [] as Job[] };
  linkEnquiry(db, "lead", lead({ services: ["harbour-king"], details: { checkIn: "2026-12-20", nights: 3, adults: 2, children: 1 } }));
  assert.equal(db.jobs[0].room, "harbour-king");
  assert.equal(db.jobs[0].scheduledDate, "2026-12-20");
  assert.equal(db.jobs[0].endDate, "2026-12-23");
  assert.equal(db.jobs[0].guests, 3);
});
