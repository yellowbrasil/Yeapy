-- Yeapy — Migration 002: Tracking, avaliacoes, consumidores, multiplas imagens

-- ==========================================
-- PERFIS DE CONSUMIDOR
-- ==========================================
create table public.consumer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  email text,
  cpf text,
  cpf_verified boolean default false,
  avatar_url text,
  city_id uuid references public.cities(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_consumer_user on public.consumer_profiles(user_id);

alter table public.consumer_profiles enable row level security;
create policy "consumer_read_own" on public.consumer_profiles for select using (auth.uid() = user_id);
create policy "consumer_insert_own" on public.consumer_profiles for insert with check (auth.uid() = user_id);
create policy "consumer_update_own" on public.consumer_profiles for update using (auth.uid() = user_id);
create policy "consumer_admin" on public.consumer_profiles for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- TRACKING DE CLIQUES
-- ==========================================
create table public.offer_clicks (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id),
  click_type text not null check (click_type in ('whatsapp', 'external_link', 'view')),
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index idx_clicks_offer on public.offer_clicks(offer_id);
create index idx_clicks_company on public.offer_clicks(company_id);
create index idx_clicks_type on public.offer_clicks(click_type);
create index idx_clicks_date on public.offer_clicks(created_at);

alter table public.offer_clicks enable row level security;
create policy "clicks_insert_auth" on public.offer_clicks for insert with check (true);
create policy "clicks_read_own_company" on public.offer_clicks for select using (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);
create policy "clicks_admin" on public.offer_clicks for select using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- AVALIACOES DE EMPRESAS
-- ==========================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  review_type text default 'general' check (review_type in ('general', 'not_delivered', 'misleading_ad', 'poor_quality', 'other')),
  company_response text,
  company_responded_at timestamptz,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_reviews_company on public.reviews(company_id);
create index idx_reviews_user on public.reviews(user_id);

alter table public.reviews enable row level security;
create policy "reviews_read" on public.reviews for select using (is_visible = true);
create policy "reviews_insert" on public.reviews for insert with check (
  auth.uid() = user_id
  and exists (select 1 from public.consumer_profiles where user_id = auth.uid() and cpf_verified = true)
);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_company_respond" on public.reviews for update using (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);
create policy "reviews_admin" on public.reviews for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- IMAGENS DAS OFERTAS (max 3)
-- ==========================================
create table public.offer_images (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_offer_images_offer on public.offer_images(offer_id);

alter table public.offer_images enable row level security;
create policy "offer_images_read" on public.offer_images for select using (true);
create policy "offer_images_insert" on public.offer_images for insert with check (
  exists (
    select 1 from public.offers o
    join public.companies c on c.id = o.company_id
    where o.id = offer_id and c.owner_id = auth.uid()
  )
  and (select count(*) from public.offer_images where offer_id = offer_images.offer_id) < 3
);
create policy "offer_images_admin" on public.offer_images for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- TRIGGER: updated_at para novas tabelas
-- ==========================================
create trigger consumer_profiles_updated_at
  before update on public.consumer_profiles
  for each row execute function public.handle_updated_at();

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();
