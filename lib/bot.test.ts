import assert from "node:assert/strict";
import test from "node:test";
import { getBotReply } from "./bot";
import type { Faq } from "./types";

const faqs: Faq[] = [
  { id: "1", category: "The clean", question: "How long does carpet take to dry?", answer: "Most carpets dry in 4–8 hours.", order: 1 },
  { id: "2", category: "Booking", question: "When and how do I pay?", answer: "Pay after the clean.", order: 2 },
];

test("answers drying questions from the FAQ list", async () => {
  const reply = await getBotReply({ text: "how long until it is dry?", faqs });
  assert.equal(reply.intent, "faq");
  assert.match(reply.reply, /4–8 hours/);
});

test("offers the quote flow when someone asks to book", async () => {
  const reply = await getBotReply({ text: "can I get a quote", faqs });
  assert.equal(reply.intent, "quote");
});

test("stays helpful when the question is unknown", async () => {
  const reply = await getBotReply({ text: "do you sell vacuums", faqs });
  assert.equal(reply.intent, "unknown");
});
