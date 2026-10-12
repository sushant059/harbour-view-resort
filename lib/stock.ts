/*
 * Free stock photos and video from Pexels (pexels.com/license: free for commercial use, no attribution needed).
 * They fill every spot until the owner uploads real job photos in Admin, which always take priority.
 * Each spot lists a few photos: if one fails to load, the next one is used, then a brand gradient.
 */

const PEXELS = "https://images.pexels.com/photos";

export type StockImage = { id: number; alt: string };

/** One Pexels photo at a given width. */
export function pexelsUrl(id: number, width = 1280) {
  return `${PEXELS}/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

export function pexelsSrcSet(id: number) {
  return [480, 800, 1280, 1920].map((width) => `${pexelsUrl(id, width)} ${width}w`).join(", ");
}

const img = (id: number, alt: string): StockImage => ({ id, alt });

export const STOCK = {
  hero: [img(6437583, "An infinity pool at sunset"), img(4034153, "A palm-lined resort pool"), img(6861, "A tropical pool by the sea")],
  pool: [img(4034153, "A palm-lined resort pool in the evening"), img(6437583, "An infinity pool at sunset"), img(2225718, "A resort swimming pool")],
  sunset: [img(6437583, "Sunset over the water"), img(6861, "A tropical pool by the sea")],
  room: [img(14746032, "A hotel room with a sea view"), img(5883728, "A warmly lit hotel bedroom"), img(19025564, "A hotel room balcony with an ocean view")],
  twin: [img(14465274, "A hotel room with two beds and white sheets"), img(5883728, "A warmly lit hotel bedroom")],
  family: [img(8266829, "A bright, airy bedroom"), img(5137981, "Bunk beds in a family room"), img(14465274, "A hotel room with two beds")],
  suite: [img(18801080, "A hotel suite with modern furniture"), img(19025564, "A suite balcony looking over the ocean"), img(5883728, "A hotel bedroom")],
  villa: [img(2476632, "Villas with private pools by the beach"), img(4497544, "A villa with a pool and garden"), img(20200291, "A garden pool villa")],
  penthouse: [img(19025564, "Ocean views from a balcony"), img(18801080, "A spacious suite"), img(2476632, "Villas by the beach")],
  spa: [img(3865773, "Candles and incense in a massage room"), img(11774389, "A calm massage room"), img(3865712, "Candles in the spa")],
  dining: [img(18247103, "A waterfront restaurant at sunset"), img(21253848, "A seaside restaurant terrace"), img(17746232, "Dinner on a restaurant terrace")],
  events: [img(28976220, "An outdoor wedding reception table"), img(28976226, "An outdoor wedding reception")],
  transfer: [img(6758532, "A modern hotel lobby"), img(19025564, "Arriving to an ocean view")],
  breakfast: [img(1843244, "Breakfast on a wooden bed tray"), img(3575143, "Breakfast in bed"), img(14020237, "Pastries and tea in bed")],
  lobby: [img(6758532, "A spacious, modern hotel lobby"), img(18801080, "A hotel lounge")],
} satisfies Record<string, StockImage[]>;

export type StockKey = keyof typeof STOCK;

const SERVICE_STOCK: Record<string, StockKey> = {
  "harbour-king": "room",
  "garden-twin": "twin",
  "family-suite": "family",
  "harbour-suite": "suite",
  "pool-villa": "villa",
  "sky-penthouse": "penthouse",
  "saltwater-restaurant": "dining",
  "day-spa": "spa",
  "weddings-and-events": "events",
  "airport-transfers": "transfer",
};

const CATEGORY_STOCK: Record<string, StockKey> = {
  rooms: "room",
  "suites-and-villas": "villa",
  dining: "dining",
  experiences: "spa",
};

export function stockFor(key: StockKey) {
  return STOCK[key];
}

export function serviceStock(slug: string): StockImage[] {
  return STOCK[SERVICE_STOCK[slug] ?? "pool"];
}

/** Stock photos for a before/after scene; the resort doesn't use before/after, so this falls back to the service. */
export function sceneStock(scene: string): StockImage[] {
  return serviceStock(scene);
}

export function categoryStock(id: string): StockImage[] {
  return STOCK[CATEGORY_STOCK[id] ?? "pool"];
}

/** Photos for a room or experience gallery: its own shots plus the pool, dining and breakfast. */
export function serviceGalleryStock(slug: string): StockImage[] {
  const seen = new Set<number>();
  return [...serviceStock(slug), ...STOCK.pool, ...STOCK.breakfast, ...STOCK.dining].filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true))).slice(0, 5);
}

/** Everything for the resort gallery page, grouped. */
export const GALLERY: { title: string; images: StockImage[] }[] = [
  { title: "Rooms & suites", images: [...STOCK.room, ...STOCK.suite, ...STOCK.twin].slice(0, 6) },
  { title: "Villas & pools", images: [...STOCK.villa, ...STOCK.pool].slice(0, 6) },
  { title: "Dining & spa", images: [...STOCK.dining, ...STOCK.breakfast, ...STOCK.spa].slice(0, 6) },
  { title: "Weddings & events", images: [...STOCK.events, ...STOCK.lobby] },
];

/*
 * Stock video clips. Pexels file names vary by frame rate and size, so each clip lists the likely
 * files: the browser tries each <source> in turn and the poster photo stays if none play.
 */
export type StockClip = { id: number; title: string; poster: number; sources: string[] };

const clipSources = (id: number, sizes: string[]) =>
  sizes.flatMap((size) => ["25fps", "30fps", "24fps"].map((fps) => `https://videos.pexels.com/video-files/${id}/${id}-${size}_${fps}.mp4`));

export const STOCK_CLIPS: StockClip[] = [
  { id: 4069480, title: "An infinity pool from above", poster: 6437583, sources: clipSources(4069480, ["hd_1920_1080", "uhd_2560_1440", "hd_1280_720"]) },
  { id: 6364755, title: "A private island resort", poster: 2476632, sources: clipSources(6364755, ["hd_1920_1080", "uhd_2560_1440", "hd_1280_720"]) },
  { id: 3410662, title: "A beach resort from the air", poster: 4034153, sources: clipSources(3410662, ["hd_1920_1080", "uhd_2560_1440", "hd_1280_720"]) },
  { id: 4407791, title: "A villa and its pool", poster: 4497544, sources: clipSources(4407791, ["hd_1920_1080", "uhd_2560_1440", "hd_1280_720"]) },
];

export function clipFor(slug: string) {
  const index = Object.keys(SERVICE_STOCK).indexOf(slug);
  return STOCK_CLIPS[(index < 0 ? 0 : index) % STOCK_CLIPS.length];
}
