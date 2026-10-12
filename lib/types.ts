export type LeadStatus = "new" | "contacted" | "quoted" | "booked" | "completed" | "lost";
export type LeadSource = "quote" | "chat" | "contact";
export type IconName = "layers" | "sofa" | "bed" | "rug" | "armchair" | "paw" | "siren" | "key" | "building" | "crown" | "waves" | "spa" | "utensils" | "glass" | "car" | "users" | "sun";
export type ServiceCategory = "rooms" | "suites-and-villas" | "dining" | "experiences";
export type ReviewStatus = "pending" | "approved" | "rejected";

export type ServiceProcess = { title: string; detail: string };
export type ServiceFaq = { question: string; answer: string };

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  included: string[];
  bestFor: string[];
  process: ServiceProcess[];
  faqs: ServiceFaq[];
  icon: IconName;
  category: ServiceCategory;
  priceFrom: string;
  duration: string;
  image: string;
  videoUrl: string;
  gallery: string[];
  order: number;
  visible: boolean;
  related: string[];
  /** How many rooms of this type the resort has. 0 = not a room (dining, spa, experiences). */
  rooms: number;
  maxGuests: number;
  /** Price per night in dollars, used for booking totals and invoices. 0 = on request. */
  nightlyRate: number;
};

export type OpeningHour = { day: string; hours: string };
export type TrustStat = { value: string; label: string };

export type Settings = {
  businessName: string;
  shortName: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsappUrl: string;
  email: string;
  notificationEmail: string;
  address: string;
  serviceAreas: string[];
  facebook: string;
  instagram: string;
  tiktok: string;
  google: string;
  youtube: string;
  abn: string;
  licence: string;
  insurance: string;
  openingHours: OpeningHour[];
  seoTitle: string;
  seoDescription: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  heroVideo: string;
  teamPhoto: string;
  ogImage: string;
  stats: TrustStat[];
  /** How many jobs can share one time slot (number of crews). */
  slotCapacity: number;
  invoice: InvoiceSettings;
};

export type InvoiceSettings = {
  /** Registered for GST: invoices say "Tax invoice" and show the GST included (1/11 of the total). */
  gstRegistered: boolean;
  /** Days until an invoice is due. */
  termsDays: number;
  bankAccountName: string;
  bsb: string;
  accountNumber: string;
  /** Printed at the bottom of every invoice, e.g. "Thank you for staying with us". */
  footer: string;
};

export type InvoiceItem = { description: string; quantity: number; unitPrice: number };
export type InvoiceStatus = "draft" | "sent" | "paid" | "void";

export type Invoice = {
  id: string;
  number: string;
  /** Secret part of the customer's link to view and print the invoice. */
  token: string;
  customerId: string;
  jobId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  notes: string;
  status: InvoiceStatus;
  sentAt: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  bannerText: string;
  href: string;
  image: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
  showOnBanner: boolean;
  order: number;
};

export type Promo = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  amount: number;
  message: string;
  expiresAt: string;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
};

export type DetailValue = string | number | boolean;

export type Lead = {
  id: string;
  reference: string;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  suburb: string;
  services: string[];
  details: Record<string, DetailValue>;
  summary: string;
  notes: string;
  internalNotes: string;
  promoCode: string;
  promoMessage: string;
  photos: string[];
  message: string;
  preferredTime: string;
  createdAt: string;
};

export type Booking = {
  id: string;
  reference: string;
  status: LeadStatus;
  name: string;
  phone: string;
  email: string;
  services: string[];
  details: Record<string, DetailValue>;
  summary: string;
  date: string;
  timeWindow: string;
  address: string;
  suburb: string;
  notes: string;
  internalNotes: string;
  promoCode: string;
  promoMessage: string;
  /** Hotel stays: `date` is check-in, `checkOut` the morning they leave, `room` the room type slug. */
  checkOut: string;
  room: string;
  guests: number;
  createdAt: string;
};

export type ResultPair = {
  id: string;
  serviceSlug: string;
  caption: string;
  scene: string;
  beforeImage: string;
  afterImage: string;
  illustrative: boolean;
  order: number;
};

export type Review = {
  id: string;
  name: string;
  text: string;
  service: string;
  rating: number;
  date: string;
  source: "sample" | "manual" | "google" | "customer";
  status: ReviewStatus;
  email: string;
  suburb: string;
  order: number;
};

export type Faq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
};

export type BlockedDate = { id: string; date: string; reason: string };

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  kind: "image" | "video";
  slot: string;
  createdAt: string;
};

export type CustomerType = "person" | "company";

export type Customer = {
  id: string;
  type: CustomerType;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  suburb: string;
  notes: string;
  /** Agreed to receive offers. Required before sending marketing messages (Spam Act 2003). */
  marketingOptIn: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JobStatus = "requested" | "scheduled" | "in-progress" | "done" | "complaint" | "redo" | "cancelled";

export type JobEvent = { at: string; status: JobStatus; note: string };

export type Job = {
  id: string;
  reference: string;
  customerId: string;
  services: string;
  address: string;
  scheduledDate: string;
  timeWindow: string;
  /** Hotel stays: check-out date and room type. scheduledDate is check-in. */
  endDate: string;
  room: string;
  guests: number;
  completedDate: string;
  price: string;
  status: JobStatus;
  notes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  history: JobEvent[];
  sourceRef: string;
  createdAt: string;
  updatedAt: string;
};

export type Campaign = {
  id: string;
  title: string;
  message: string;
  channel: "whatsapp" | "sms" | "email";
  recipientIds: string[];
  createdAt: string;
};

export type Database = {
  version: 1;
  settings: Settings;
  services: Service[];
  offers: Offer[];
  promos: Promo[];
  leads: Lead[];
  bookings: Booking[];
  results: ResultPair[];
  reviews: Review[];
  faqs: Faq[];
  blockedDates: BlockedDate[];
  media: MediaItem[];
  customers: Customer[];
  jobs: Job[];
  campaigns: Campaign[];
  invoices: Invoice[];
};

export type ActionResult =
  | { ok: true; reference?: string; emailed?: boolean; message?: string }
  | { ok: false; error: string; fields?: Record<string, string> };
