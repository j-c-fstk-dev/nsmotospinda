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
  featured_rank int not null default 999,
  hidden boolean not null default false,
  promo_until text not null default '',
  status text not null default 'disponivel' check (status in ('disponivel','reservado','vendido')),
  created_at timestamptz not null default now()
);
create index if not exists vehicles_status_idx on public.vehicles (status);

-- Para bancos criados com a versão anterior deste arquivo:
alter table public.vehicles add column if not exists featured_rank int not null default 999;
alter table public.vehicles add column if not exists hidden boolean not null default false;
alter table public.vehicles add column if not exists promo_until text not null default '';

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

-- =====================================================================
-- Segurança
-- Público: só lê o que está à venda e os dados da loja.
-- Escrever: SÓ quem está na tabela admins. Estar logado não basta, então
-- uma conta criada por engano (cadastro público ligado, por exemplo)
-- não consegue mexer em nada.
-- =====================================================================

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- pela API cada um só enxerga a própria linha; incluir ou remover admin só pelo SQL Editor do Supabase
drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins for select to authenticated using (user_id = auth.uid());

-- usada pelas regras abaixo e pelo site (para saber se o login é de admin)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.vehicles enable row level security;
alter table public.settings enable row level security;
alter table public.events enable row level security;

-- remove regras de versões anteriores deste arquivo (pode rodar de novo sem erro)
drop policy if exists "vehicles public read" on public.vehicles;
drop policy if exists "vehicles admin read" on public.vehicles;
drop policy if exists "vehicles admin write" on public.vehicles;
drop policy if exists "settings public read" on public.settings;
drop policy if exists "settings admin write" on public.settings;
drop policy if exists "events anyone insert" on public.events;
drop policy if exists "events admin read" on public.events;
drop policy if exists "photos public read" on storage.objects;
drop policy if exists "photos admin upload" on storage.objects;
drop policy if exists "photos admin update" on storage.objects;
drop policy if exists "photos admin delete" on storage.objects;

-- Veículos: público vê os não escondidos; admin vê e altera tudo
create policy "vehicles public read" on public.vehicles for select to anon, authenticated using (hidden = false);
create policy "vehicles admin read" on public.vehicles for select to authenticated using ((select public.is_admin()));
create policy "vehicles admin write" on public.vehicles for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Dados da loja
create policy "settings public read" on public.settings for select to anon, authenticated using (true);
create policy "settings admin write" on public.settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Métricas: qualquer visitante registra clique/visita; só admin lê
create policy "events anyone insert" on public.events for insert to anon, authenticated
  with check (kind in ('whatsapp', 'view', 'review'));
create policy "events admin read" on public.events for select to authenticated using ((select public.is_admin()));

-- Fotos
insert into storage.buckets (id, name, public) values ('vehicles', 'vehicles', true) on conflict do nothing;
create policy "photos public read" on storage.objects for select using (bucket_id = 'vehicles');
create policy "photos admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'vehicles' and (select public.is_admin()));
create policy "photos admin update" on storage.objects for update to authenticated
  using (bucket_id = 'vehicles' and (select public.is_admin()));
create policy "photos admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'vehicles' and (select public.is_admin()));

-- =====================================================================
-- LIBERAR O DONO DA LOJA (rodar depois de criar o usuário dele em
-- Authentication > Users). Troque o e-mail:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'email-do-dono@exemplo.com'
--   on conflict do nothing;
--
-- Conferir quem é admin:
--   select u.email from public.admins a join auth.users u on u.id = a.user_id;
--
-- Tirar o acesso de alguém:
--   delete from public.admins where user_id = (select id from auth.users where email = '...');
-- =====================================================================
