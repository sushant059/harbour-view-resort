-- Spotless NT schema, row level security and storage.
-- Run this in the Supabase SQL editor (it is safe to run again after updates), then create an Auth user
-- for regmisushant94@gmail.com. The Next.js app seeds content
-- the first time it connects with the service role key.

create table if not exists public.admin_users (
  email text primary key
);

insert into public.admin_users (email)
values ('regmisushant94@gmail.com')
on conflict (email) do nothing;

-- The admin check lives in a private schema so it isn't callable through the public API.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
drop function if exists public.is_admin() cascade;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null,
  short_name text not null,
  phone_display text not null,
  phone_tel text not null,
  whatsapp_url text not null default '',
  email text not null,
  notification_email text not null,
  address text not null default '',
  service_areas text[] not null default '{}',
  facebook text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  google_url text not null default '',
  youtube text not null default '',
  abn text not null default '',
  licence text not null default '',
  insurance text not null default '',
  opening_hours jsonb not null default '[]',
  seo_title text not null,
  seo_description text not null,
  hero_headline text not null,
  hero_subtext text not null,
  hero_image text not null default '',
  hero_video text not null default '',
  team_photo text not null default '',
  og_image text not null default '',
  stats jsonb not null default '[]',
  slot_capacity int not null default 1
);

create table if not exists public.services (
  id text primary key,
  slug text unique not null,
  title text not null,
  summary text not null default '',
  description text not null default '',
  included jsonb not null default '[]',
  best_for jsonb not null default '[]',
  process jsonb not null default '[]',
  faqs jsonb not null default '[]',
  icon text not null default 'layers',
  category text not null default 'specialty-and-urgent',
  price_from text not null default '',
  duration text not null default '',
  image text not null default '',
  video_url text not null default '',
  gallery jsonb not null default '[]',
  sort_order int not null default 0,
  visible boolean not null default true,
  related jsonb not null default '[]'
);

create table if not exists public.offers (
  id text primary key,
  title text not null,
  description text not null default '',
  banner_text text not null default '',
  href text not null default '',
  image text not null default '',
  active boolean not null default false,
  starts_at date,
  ends_at date,
  show_on_banner boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.promo_codes (
  id text primary key,
  code text unique not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  amount numeric not null,
  message text not null default '',
  expires_at date,
  usage_limit int,
  used_count int not null default 0,
  active boolean not null default true
);

create table if not exists public.leads (
  id text primary key,
  reference text unique not null,
  source text not null check (source in ('quote', 'chat', 'contact')),
  status text not null check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'lost')),
  name text not null,
  phone text not null default '',
  email text not null default '',
  suburb text not null default '',
  services jsonb not null default '[]',
  details jsonb not null default '{}',
  summary text not null default '',
  notes text not null default '',
  internal_notes text not null default '',
  promo_code text not null default '',
  promo_message text not null default '',
  photos jsonb not null default '[]',
  message text not null default '',
  preferred_time text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  reference text unique not null,
  status text not null check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'lost')),
  name text not null,
  phone text not null,
  email text not null,
  services jsonb not null default '[]',
  details jsonb not null default '{}',
  summary text not null default '',
  appointment_date date not null,
  time_window text not null,
  address text not null,
  suburb text not null,
  notes text not null default '',
  internal_notes text not null default '',
  promo_code text not null default '',
  promo_message text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.before_after (
  id text primary key,
  service_slug text not null,
  caption text not null default '',
  scene text not null default 'carpet',
  before_image text not null default '',
  after_image text not null default '',
  illustrative boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.reviews (
  id text primary key,
  name text not null,
  body text not null,
  service text not null default '',
  rating int not null check (rating between 1 and 5),
  review_date date,
  source text not null check (source in ('sample', 'manual', 'google', 'customer')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  visible boolean not null default false,
  email text not null default '',
  suburb text not null default '',
  sort_order int not null default 0
);

create table if not exists public.faqs (
  id text primary key,
  category text not null,
  question text not null,
  answer text not null,
  sort_order int not null default 0
);

create table if not exists public.blocked_dates (
  id text primary key,
  blocked_on date unique not null,
  reason text not null default ''
);

create table if not exists public.media (
  id text primary key,
  name text not null,
  url text not null,
  kind text not null check (kind in ('image', 'video')),
  slot text not null default '',
  created_at timestamptz not null default now()
);

-- Upgrades for databases created from the first version of this schema.
-- Safe to run more than once.
alter table public.site_settings add column if not exists youtube text not null default '';
alter table public.services add column if not exists category text not null default 'specialty-and-urgent';
alter table public.services add column if not exists price_from text not null default '';
alter table public.services add column if not exists duration text not null default '';
alter table public.services add column if not exists gallery jsonb not null default '[]';
alter table public.reviews add column if not exists status text not null default 'approved';
alter table public.reviews add column if not exists email text not null default '';
alter table public.reviews add column if not exists suburb text not null default '';
alter table public.bookings add column if not exists promo_code text not null default '';
alter table public.site_settings add column if not exists slot_capacity int not null default 1;
alter table public.site_settings add column if not exists day_moments jsonb not null default '[]'::jsonb;
alter table public.bookings add column if not exists promo_message text not null default '';
alter table public.reviews drop constraint if exists reviews_source_check;
alter table public.reviews add constraint reviews_source_check check (source in ('sample', 'manual', 'google', 'customer'));
alter table public.reviews drop constraint if exists reviews_status_check;
alter table public.reviews add constraint reviews_status_check check (status in ('pending', 'approved', 'rejected'));
update public.site_settings set email = 'regmisushant94@gmail.com' where email = 'regmisusanth94@gmail.com';
update public.site_settings set notification_email = 'regmisushant94@gmail.com' where notification_email = 'regmisusanth94@gmail.com';
delete from public.admin_users where email = 'regmisusanth94@gmail.com';

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.offers enable row level security;
alter table public.promo_codes enable row level security;
alter table public.leads enable row level security;
alter table public.bookings enable row level security;
alter table public.before_after enable row level security;
alter table public.reviews enable row level security;
alter table public.faqs enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.media enable row level security;

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
drop policy if exists "admin write settings" on public.site_settings;
create policy "admin write settings" on public.site_settings for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "public read visible services" on public.services;
create policy "public read visible services" on public.services for select using (visible = true or private.is_admin());
drop policy if exists "admin write services" on public.services;
create policy "admin write services" on public.services for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "public read active offers" on public.offers;
create policy "public read active offers" on public.offers for select using (active = true or private.is_admin());
drop policy if exists "admin write offers" on public.offers;
create policy "admin write offers" on public.offers for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "admin promo codes" on public.promo_codes;
create policy "admin promo codes" on public.promo_codes for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "admin read leads" on public.leads;
create policy "admin read leads" on public.leads for select using (private.is_admin());
drop policy if exists "admin update leads" on public.leads;
create policy "admin update leads" on public.leads for update using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admin delete leads" on public.leads;
create policy "admin delete leads" on public.leads for delete using (private.is_admin());
drop policy if exists "public insert leads" on public.leads;
create policy "public insert leads" on public.leads for insert with check (char_length(name) between 2 and 80);

drop policy if exists "admin bookings" on public.bookings;
create policy "admin bookings" on public.bookings for all using (private.is_admin()) with check (private.is_admin());
drop policy if exists "public insert bookings" on public.bookings;
create policy "public insert bookings" on public.bookings for insert with check (char_length(name) between 2 and 80 and char_length(address) between 5 and 160);

drop policy if exists "public read results" on public.before_after;
create policy "public read results" on public.before_after for select using (true);
drop policy if exists "admin write results" on public.before_after;
create policy "admin write results" on public.before_after for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "public read visible reviews" on public.reviews;
create policy "public read visible reviews" on public.reviews for select using (status = 'approved' or private.is_admin());
drop policy if exists "admin write reviews" on public.reviews;
create policy "admin write reviews" on public.reviews for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "public read faqs" on public.faqs;
create policy "public read faqs" on public.faqs for select using (true);
drop policy if exists "admin write faqs" on public.faqs;
create policy "admin write faqs" on public.faqs for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "public read blocked dates" on public.blocked_dates;
create policy "public read blocked dates" on public.blocked_dates for select using (true);
drop policy if exists "admin write blocked dates" on public.blocked_dates;
create policy "admin write blocked dates" on public.blocked_dates for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "public read media" on public.media;
create policy "public read media" on public.media for select using (true);
drop policy if exists "admin write media" on public.media;
create policy "admin write media" on public.media for all using (private.is_admin()) with check (private.is_admin());

drop policy if exists "admin users" on public.admin_users;
create policy "admin users" on public.admin_users for all using (private.is_admin()) with check (private.is_admin());

-- Customers, jobs and offer messages (admin only).
create table if not exists public.customers (
  id text primary key,
  type text not null default 'person' check (type in ('person', 'company')),
  name text not null,
  company_name text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  suburb text not null default '',
  notes text not null default '',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  reference text not null default '',
  customer_id text not null references public.customers(id) on delete cascade,
  services text not null default '',
  address text not null default '',
  scheduled_date date,
  time_window text not null default '',
  completed_date date,
  price text not null default '',
  status text not null default 'scheduled' check (status in ('requested', 'scheduled', 'in-progress', 'done', 'complaint', 'redo', 'cancelled')),
  notes text not null default '',
  before_photos jsonb not null default '[]',
  after_photos jsonb not null default '[]',
  history jsonb not null default '[]',
  source_ref text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jobs_customer_id_idx on public.jobs (customer_id);
alter table public.jobs add column if not exists time_window text not null default '';
create index if not exists jobs_scheduled_date_idx on public.jobs (scheduled_date);
create index if not exists bookings_appointment_date_idx on public.bookings (appointment_date);
alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add constraint jobs_status_check check (status in ('requested', 'scheduled', 'in-progress', 'done', 'complaint', 'redo', 'cancelled'));

create table if not exists public.campaigns (
  id text primary key,
  title text not null default '',
  message text not null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'sms', 'email')),
  recipient_ids jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.campaigns enable row level security;

drop policy if exists "admin customers" on public.customers;
create policy "admin customers" on public.customers for all using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admin jobs" on public.jobs;
create policy "admin jobs" on public.jobs for all using (private.is_admin()) with check (private.is_admin());
drop policy if exists "admin campaigns" on public.campaigns;
create policy "admin campaigns" on public.campaigns for all using (private.is_admin()) with check (private.is_admin());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Files in the public bucket are served by URL; no select policy, so nobody can list the bucket.
drop policy if exists "public read media files" on storage.objects;
drop policy if exists "admin write media files" on storage.objects;
create policy "admin write media files" on storage.objects for all using (bucket_id = 'media' and private.is_admin()) with check (bucket_id = 'media' and private.is_admin());

-- Invoices (admin only; customers see theirs through the website's private link)
alter table public.site_settings add column if not exists invoice_settings jsonb not null default '{}';

create table if not exists public.invoices (
  id text primary key,
  number text not null,
  token text not null unique,
  customer_id text not null references public.customers(id) on delete cascade,
  job_id text not null default '',
  issue_date date,
  due_date date,
  items jsonb not null default '[]',
  discount numeric(12, 2) not null default 0,
  notes text not null default '',
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'void')),
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invoices_customer_id_idx on public.invoices (customer_id);
alter table public.invoices enable row level security;
drop policy if exists "admin invoices" on public.invoices;
create policy "admin invoices" on public.invoices for all using (private.is_admin()) with check (private.is_admin());

-- Hotel: room types, nights-based bookings and stays
alter table public.services add column if not exists rooms int not null default 0;
alter table public.services add column if not exists max_guests int not null default 2;
alter table public.services add column if not exists nightly_rate numeric(10, 2) not null default 0;
alter table public.bookings add column if not exists check_out date;
alter table public.bookings add column if not exists room text not null default '';
alter table public.bookings add column if not exists guests int not null default 0;
alter table public.jobs add column if not exists end_date date;
alter table public.jobs add column if not exists room text not null default '';
alter table public.jobs add column if not exists guests int not null default 0;
-- Hotel bookings have no street address.
drop policy if exists "public insert bookings" on public.bookings;
create policy "public insert bookings" on public.bookings for insert with check (char_length(name) between 2 and 80);
