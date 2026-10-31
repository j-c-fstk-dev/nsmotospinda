-- NS Multimarcas: banco do painel (rodar no SQL Editor do Supabase)

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null default 'moto' check (type in ('moto','carro')),
  category text not null,
  brand text not null,
  model text not null,
  version text not null default '',
  year_fab int not null,
  year_model int not null,
  km int not null default 0,
  price numeric(12,2) not null,
  promo_price numeric(12,2),
  promo_label text not null default '',
  color text not null default '',
  fuel text not null default 'Flex',
  displacement_cc int,
  description text not null default '',
  features text[] not null default '{}',
  images text[] not null default '{}',
  image_credit text not null default '',
  featured boolean not null default false,
  status text not null default 'disponivel' check (status in ('disponivel','reservado','vendido')),
  created_at timestamptz not null default now()
);
create index if not exists vehicles_status_idx on public.vehicles (status);

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb
);
insert into public.settings (id) values (1) on conflict do nothing;

create table if not exists public.events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('whatsapp','view','review')),
  vehicle_id uuid,
  created_at timestamptz not null default now()
);

-- Segurança: o público só lê; só usuário logado (o lojista) escreve.
alter table public.vehicles enable row level security;
alter table public.settings enable row level security;
alter table public.events enable row level security;

create policy "vehicles public read" on public.vehicles for select using (true);
create policy "vehicles admin write" on public.vehicles for all to authenticated using (true) with check (true);

create policy "settings public read" on public.settings for select using (true);
create policy "settings admin write" on public.settings for all to authenticated using (true) with check (true);

create policy "events anyone insert" on public.events for insert to anon, authenticated with check (true);
create policy "events admin read" on public.events for select to authenticated using (true);

-- Fotos
insert into storage.buckets (id, name, public) values ('vehicles', 'vehicles', true) on conflict do nothing;
create policy "photos public read" on storage.objects for select using (bucket_id = 'vehicles');
create policy "photos admin upload" on storage.objects for insert to authenticated with check (bucket_id = 'vehicles');
create policy "photos admin delete" on storage.objects for delete to authenticated using (bucket_id = 'vehicles');
