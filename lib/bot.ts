import type { Faq } from "@/lib/types";

export type BotReply = { reply: string; intent: "faq" | "quote" | "unknown" };

const TOPICS: { keys: string[]; test: (faq: Faq) => boolean; fallback: string }[] = [
  {
    keys: ["drying", "dry time", "how long", "wet"],
    test: (faq) => /dry/i.test(faq.question),
    fallback: "Most carpets are ready to walk on in about 4–8 hours. Humidity in the Top End can make that longer, and we tell you what to expect before we leave.",
  },
  {
    keys: ["pet", "dog", "cat", "animal"],
    test: (faq) => /pet/i.test(faq.question),
    fallback: "Pets can stay home. Keep them out of the room we are cleaning until the floor is dry.",
  },
  {
    keys: ["stain", "wine", "odour", "odor", "smell"],
    test: (faq) => /stain/i.test(faq.question),
    fallback: "We pre-treat marks and tell you honestly if a stain is set or permanent. Age, dye and the fibre all change what is possible.",
  },
  {
    keys: ["kid", "child", "baby", "safe"],
    test: (faq) => /kid|child|safe/i.test(faq.question),
    fallback: "We choose products with kids and pets in mind and we explain anything you should keep off the floor while it dries.",
  },
  {
    keys: ["bond", "lease", "agent", "paperwork"],
    test: (faq) => /bond|lease/i.test(faq.question),
    fallback: "We can give you a receipt and a short job note for the agent. The bond decision itself sits with the property manager.",
  },
  {
    keys: ["mattress", "bed"],
    test: (faq) => /mattress/i.test(faq.question),
    fallback: "We clean mattresses on site and let you know when it is dry enough to sleep on.",
  },
  {
    keys: ["damage", "shrink", "colour", "color", "risk"],
    test: (faq) => /damage/i.test(faq.question),
    fallback: "We look at the fabric or carpet first. If something is not safe to clean, we say so before we start.",
  },
  {
    keys: ["steam", "extraction", "method", "chemical"],
    test: (faq) => /method/i.test(faq.question),
    fallback: "Carpets and rugs are hot-water extracted. Upholstery and mattresses use a lower-moisture tool where that gives a better result.",
  },
  {
    keys: ["suburb", "darwin", "palmerston", "area", "where do you"],
    test: (faq) => /area/i.test(faq.question),
    fallback: "We cover Darwin and surrounding Northern Territory suburbs. Send the suburb and we will confirm we can reach you.",
  },
  {
    keys: ["same-day", "sameday", "availability", "how do i book"],
    test: (faq) => /book/i.test(faq.question),
    fallback: "Send a quote or booking request and we call to confirm a time. Same-day is often possible if you reach us in the morning.",
  },
  {
    keys: ["pay", "payment", "price", "cost", "card"],
    test: (faq) => /pay/i.test(faq.question),
    fallback: "We agree the price before the job starts. Payment is taken after the clean.",
  },
  {
    keys: ["cancel", "reschedule"],
    test: (faq) => /cancel/i.test(faq.question),
    fallback: "Tell us as soon as you can if you need to change a time. We confirm the cancellation approach when we book you in.",
  },
];

export async function getBotReply(input: { text: string; faqs: Faq[] }): Promise<BotReply> {
  const text = input.text.toLowerCase();
  const topic = TOPICS.find((item) => item.keys.some((key) => text.includes(key)));
  if (topic) {
    const faq = input.faqs.find(topic.test);
    return { reply: faq?.answer ?? topic.fallback, intent: "faq" };
  }
  if (/\b(quote|book|booking)\b/.test(text)) {
    return {
      reply: "I can take a few details and the team will call you back with a fixed price.",
      intent: "quote",
    };
  }
  const faq = input.faqs.find((item) => {
    const words = item.question.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 4);
    return words.filter((word) => text.includes(word)).length >= 2;
  });
  if (faq) return { reply: faq.answer, intent: "faq" };
  return {
    reply: "I can help you request a call back, or you can ask about drying time, pets, stains, bond cleans, bookings and payment.",
    intent: "unknown",
  };
}
