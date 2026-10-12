import assert from "node:assert/strict";
import test from "node:test";
import { checkPromo, isOfferLive, matchSuburb, normalizeAuPhone } from "./validators";
import type { Promo } from "./types";

const promo: Promo = {
  id: "promo",
  code: "WELCOME10",
  type: "percent",
  amount: 10,
  message: "10% noted",
  expiresAt: "",
  usageLimit: 2,
  usedCount: 0,
  active: true,
};

test("accepts Australian mobile and NT landline numbers", () => {
  assert.equal(normalizeAuPhone("0401 647 545"), "0401647545");
  assert.equal(normalizeAuPhone("+61 401 647 545"), "0401647545");
  assert.equal(normalizeAuPhone("08 8981 0000"), "0889810000");
  assert.equal(normalizeAuPhone("12345"), null);
});

test("checks promo activity, expiry and usage", () => {
  assert.equal(checkPromo("welcome10", [promo], "2026-10-09").ok, true);
  assert.equal(checkPromo("nope", [promo]).ok, false);
  assert.equal(checkPromo("WELCOME10", [{ ...promo, active: false }]).ok, false);
  assert.equal(checkPromo("WELCOME10", [{ ...promo, expiresAt: "2020-01-01" }], "2026-10-09").ok, false);
  assert.equal(checkPromo("WELCOME10", [{ ...promo, usedCount: 2 }]).ok, false);
});

test("respects offer dates", () => {
  assert.equal(isOfferLive({ active: true, startsAt: "", endsAt: "" }, "2026-10-09"), true);
  assert.equal(isOfferLive({ active: true, startsAt: "2026-11-01", endsAt: "" }, "2026-10-09"), false);
  assert.equal(isOfferLive({ active: false, startsAt: "", endsAt: "" }), false);
});

test("matches suburbs loosely", () => {
  const areas = ["Parap", "Palmerston City", "Nightcliff"];
  assert.equal(matchSuburb("parap", areas).match, "Parap");
  assert.equal(matchSuburb("palm", areas).suggestions[0], "Palmerston City");
  assert.equal(matchSuburb("sydney", areas).match, null);
});
