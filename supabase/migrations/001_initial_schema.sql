-- Yeapy — Schema inicial
-- Extensoes
create extension if not exists "unaccent" schema "public";

-- ==========================================
-- CATEGORIAS
-- ==========================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
create policy "categories_read" on public.categories for select using (true);
create policy "categories_admin" on public.categories for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- CIDADES
-- ==========================================
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state char(2) not null,
  slug text unique not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.cities enable row level security;
create policy "cities_read" on public.cities for select using (true);
create policy "cities_admin" on public.cities for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- PLANOS
-- ==========================================
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  max_active_offers int not null,
  price_cents int not null,
  features jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.plans enable row level security;
create policy "plans_read" on public.plans for select using (true);
create policy "plans_admin" on public.plans for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- EMPRESAS
-- ==========================================
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,
  phone text,
  whatsapp text,
  address text,
  city_id uuid references public.cities(id),
  state char(2),
  social_links jsonb default '{}',
  plan_id uuid references public.plans(id),
  is_active boolean default true,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_companies_owner on public.companies(owner_id);
create index idx_companies_slug on public.companies(slug);
create index idx_companies_city on public.companies(city_id);

alter table public.companies enable row level security;
create policy "companies_read" on public.companies for select using (true);
create policy "companies_insert" on public.companies for insert with check (
  auth.uid() = owner_id
);
create policy "companies_update" on public.companies for update using (
  auth.uid() = owner_id
);
create policy "companies_admin" on public.companies for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- PRODUTOS (catalogo por empresa)
-- ==========================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  name_normalized text not null,
  lowest_price_cents int,
  last_offer_price_cents int,
  total_offers int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id, name_normalized)
);

create index idx_products_company on public.products(company_id);

alter table public.products enable row level security;
create policy "products_read" on public.products for select using (true);
create policy "products_insert" on public.products for insert with check (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);
create policy "products_update" on public.products for update using (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);

-- ==========================================
-- OFERTAS
-- ==========================================
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.products(id),
  category_id uuid not null references public.categories(id),
  city_id uuid references public.cities(id),
  title text not null,
  description text,
  image_url text,
  original_price_cents int not null,
  promotional_price_cents int not null,
  external_link text,
  whatsapp_link text,
  is_national boolean default false,
  status text default 'active' check (status in ('active', 'expired', 'cancelled')),
  starts_at timestamptz default now(),
  expires_at timestamptz not null,
  views_count int default 0,
  clicks_count int default 0,
  created_at timestamptz default now()
);

create index idx_offers_company on public.offers(company_id);
create index idx_offers_category on public.offers(category_id);
create index idx_offers_city on public.offers(city_id);
create index idx_offers_status on public.offers(status);
create index idx_offers_expires on public.offers(expires_at) where status = 'active';
create index idx_offers_active on public.offers(status, created_at desc) where status = 'active';

alter table public.offers enable row level security;
create policy "offers_read" on public.offers for select using (true);
create policy "offers_insert" on public.offers for insert with check (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);
create policy "offers_update" on public.offers for update using (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);
create policy "offers_admin" on public.offers for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- HISTORICO DE PRECOS
-- ==========================================
create table public.offer_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  promotional_price_cents int not null,
  original_price_cents int not null,
  created_at timestamptz default now()
);

create index idx_offer_history_product on public.offer_history(product_id);

alter table public.offer_history enable row level security;
create policy "offer_history_read" on public.offer_history for select using (true);
create policy "offer_history_insert" on public.offer_history for insert with check (
  exists (select 1 from public.companies where id = company_id and owner_id = auth.uid())
);

-- ==========================================
-- CONFIGURACOES DA PLATAFORMA
-- ==========================================
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.platform_settings enable row level security;
create policy "settings_read" on public.platform_settings for select using (true);
create policy "settings_admin" on public.platform_settings for all using (
  auth.jwt() ->> 'role' = 'admin'
);

-- ==========================================
-- FUNCAO: normalizar texto (remover acentos, lowercase)
-- ==========================================
create or replace function public.normalize_text(input text)
returns text as $$
begin
  return lower(unaccent(trim(input)));
end;
$$ language plpgsql immutable;

-- ==========================================
-- FUNCAO: expirar ofertas automaticamente
-- ==========================================
create or replace function public.expire_offers()
returns int as $$
declare
  expired_count int;
begin
  update public.offers
  set status = 'expired'
  where status = 'active' and expires_at <= now();
  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$ language plpgsql security definer;

-- ==========================================
-- FUNCAO: atualizar updated_at automaticamente
-- ==========================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.handle_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ==========================================
-- STORAGE BUCKET
-- ==========================================
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict do nothing;

create policy "images_read" on storage.objects for select using (
  bucket_id = 'images'
);
create policy "images_insert" on storage.objects for insert with check (
  bucket_id = 'images' and auth.role() = 'authenticated'
);
create policy "images_delete" on storage.objects for delete using (
  bucket_id = 'images' and auth.role() = 'authenticated'
);
