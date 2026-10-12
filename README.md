# Harbour View Resort Darwin

Luxury resort website and admin panel, built from the Spotless NT template with the business-website-builder skill. Rooms are booked by the night: each room type has a number of rooms, and the booking form, chatbot, occupancy calendar and admin all stop a room type being over-booked.


## What's included

**Public website**
- New brand system built from the logo colours (see [`docs/BRAND.md`](docs/BRAND.md)).
- Services grouped into four categories: Carpet & Rugs, Upholstery & Bedding, Bond & Property, and Specialty & Urgent. There's a mega-menu on desktop and accordions on mobile.
- Each service page has a video (YouTube, TikTok, Vimeo or an uploaded MP4), a photo gallery with lightbox, before/after sliders, the process, FAQs, reviews and a sticky booking card.
- An animated preview stands in wherever a real video hasn't been added yet.
- Offers page and top banner, promo codes.
- Reviews: customers submit a review on the site → it waits in admin → it's published only after approval. After submitting, customers are offered a "Post on Google" button.
- Social icons for Facebook, Instagram, TikTok, WhatsApp and Google (plus YouTube when set). Until a profile link is added in Settings, each icon opens that network's home page.
- A conversational booking assistant. It asks for the service, then service-specific questions (e.g. bedrooms and bathrooms for a bond clean, number of rugs for rug cleaning), then suburb, name, mobile, timing and promo code. It confirms, saves the lead and says the team will be in touch. It also answers common questions (drying, pets, stains…).
- Free quote form with photo upload, booking request form, contact page, FAQ search, suburb checker.

**Admin (`/admin`)**
- Dashboard with new enquiries, reviews waiting, pipeline and a "make the site shine" checklist.
- Leads & bookings (status, notes, call/WhatsApp, CSV export, blocked dates).
- Reviews: Pending / Approved / Rejected tabs with one-click approve.
- Services: category, price, time on site, text, video link or upload, cover photo and gallery uploads.
- Before & after pairs, media library, offers and promo codes, FAQs.
- Settings: business name, phone, email, WhatsApp, social links, Google review link, hero text, service areas, opening hours, ABN/licence/insurance, SEO.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI (Radix, CVA), lucide icons
- Zod and React Hook Form
- Local JSON database for development, Supabase Postgres when configured
- Resend for email when configured
- Owner session cookie. Supabase Auth is used when the Supabase keys are set

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Development sign-in, only when `NODE_ENV` is not production:

- Email: `regmisushant94@gmail.com`
- Password: `ADMIN_PASSWORD` from `.env.local`, or `spotless-demo` if that variable is empty

Set a long `AUTH_SECRET` and a real `ADMIN_PASSWORD` before any public deploy. The development password is not accepted as a fallback in production.

The first run writes starter content to `data/db.json` (gitignored). Services, offers, FAQs, sample reviews and illustrative before/after pairs are included. Leads start empty. Sample reviews are labelled “Sample — replace with real reviews”. Illustrative pictures are labelled too. No review counts, awards or trust numbers are invented.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO, sitemap and email links |
| `AUTH_SECRET` | Signs the admin cookie. Required in production |
| `ADMIN_PASSWORD` | Owner password when Supabase Auth is not configured |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Used only for owner sign-in |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Never expose it to the browser |
| `RESEND_API_KEY` | Sends owner and customer email |
| `EMAIL_FROM` | From address. `onboarding@resend.dev` works for Resend tests |
| `GMAIL_USER` | Business Gmail address used to send offer emails and notifications (preferred over Resend) |
| `GMAIL_APP_PASSWORD` | A Gmail **app password** (Google Account → Security → 2-Step Verification → App passwords), not the normal password |
| `CLICKSEND_USERNAME` | ClickSend account username, for sending offer texts from Admin → Send offers |
| `CLICKSEND_API_KEY` | ClickSend API key (ClickSend dashboard → API Credentials) |
| `CLICKSEND_FROM` | Optional sender: a dedicated number or an approved name like `SpotlessNT` |

If Supabase or Resend is not configured, quotes, bookings, chat and contact messages are still saved. Email sending fails quietly and the customer still gets a reference code.

## Supabase

1. Create a project and run `supabase/schema.sql` in the SQL editor. It is safe to run again after an update. It adds new columns and fixes the old misspelt owner email.
2. In Authentication, create a user for `regmisushant94@gmail.com`.
3. Put the three Supabase keys in `.env.local`.
4. Restart the app. Empty tables are seeded on the first connection.
5. Create a public Storage bucket named `media` if the SQL bucket insert did not run (the schema tries to create it).

The service role key is used on the server. Row Level Security still protects direct access with the anon key. Promo codes are not publicly readable. Leads and bookings can be inserted with length checks, and only the owner can read them.

Changing the public email in Settings also changes the only email allowed to sign in. The Supabase user has to match that address.

## Uploads and video

Server actions accept uploads up to 45MB locally. On Vercel, a single request is capped at about 4.5MB, so photos are compressed in the browser before upload. For longer videos, post them to YouTube or TikTok and paste the link into the service. The site embeds it.

## Email

Owner messages include the reference, job details and one-tap call / WhatsApp links. Customer confirmations include the reference. Chat callbacks have no customer email, so only the owner is emailed.

## Sending offers

Admin → Send offers lists every customer. Offers only go to customers marked “agreed to offers” (Spam Act 2003); tap “They agreed” once a customer says yes.

- **Email:** with `GMAIL_USER` and `GMAIL_APP_PASSWORD` set, emails go straight from the site, one per customer, with an unsubscribe line. Gmail allows about 500 a day. Without them, the button opens your email app with everyone in BCC.
- **Text message:** with a ClickSend account (`CLICKSEND_USERNAME`, `CLICKSEND_API_KEY`), texts go to everyone in one click (about 8–9c each, prepaid). Without it, each button opens your phone's Messages app with the text ready. “Reply STOP to opt out” is added if missing.
- **WhatsApp:** one tap per customer; bulk WhatsApp needs a paid WhatsApp Business API account.

## Admin

`/admin` covers the dashboard, leads and bookings (status, notes, call, WhatsApp, CSV, delete), offers and promo codes, services, before/after uploads, the media library, reviews, FAQs, blocked dates and settings. Content changes call `revalidatePath` so the public pages update.

Uploads are compressed in the browser, then stored in `public/uploads` or the Supabase `media` bucket.

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm start
```

## Test checklist

- Home, services, service detail, why us, how it works, results, reviews, FAQs, contact, privacy, terms and the 404 page at 360px, 768px and 1280px.
- Sticky header, dismissible offer banner, mobile menu, bottom Call / WhatsApp / Free Quote bar, floating WhatsApp, chat and back to top.
- A review sent from /reviews stays hidden until it is approved in Admin → Reviews, then appears on the site.
- The chat assistant asks service-specific questions (try End of lease: bedrooms, bathrooms, property type) and the lead shows in Admin → Leads.
- Free quote, booking (including a blocked date and a past date), contact and the chat callback. Each success state shows an `SNT-` reference.
- Promo code `WELCOME10` shows the confirmation message. A fake code does not.
- Suburb checker accepts Parap and explains an unknown suburb.
- Chat answers a drying-time question, then still completes a callback.
- Admin sign-in rejects a different email. Status changes, a new FAQ and a settings edit show on the public site after refresh.
- Keyboard: skip link, visible focus, before/after slider arrows, chat and menu Escape where a dialog is open.
- With Resend unset, a quote still saves. With it set, owner and customer emails arrive.

## Brand

See [`docs/BRAND.md`](docs/BRAND.md) for colours, fonts, logo use, uniform and voice.
