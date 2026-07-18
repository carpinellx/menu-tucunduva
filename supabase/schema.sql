-- Cardápio digital — Fazenda Tucunduva
-- Rode este script no SQL Editor do seu projeto Supabase (Supabase > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- ---------- Tabelas ----------

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  description text default '',
  price numeric(10,2) not null default 0,
  photo_url text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists items_category_id_idx on items(category_id);

-- ---------- Segurança (RLS) ----------
-- Este projeto usa uma senha simples na tela de admin (não é autenticação real do Supabase).
-- Por isso, liberamos leitura e escrita para a chave "anon" (pública). Isso é aceitável para
-- começar, mas significa que, tecnicamente, qualquer pessoa com a URL/chave do seu projeto
-- poderia editar o banco diretamente (não pela tela, mas via API). Para uma segurança mais
-- forte no futuro, migre a edição para Supabase Auth + policies restritas a usuários logados.

alter table categories enable row level security;
alter table items enable row level security;

create policy "categories: leitura pública" on categories
  for select using (true);
create policy "categories: escrita pública" on categories
  for insert with check (true);
create policy "categories: atualização pública" on categories
  for update using (true);
create policy "categories: exclusão pública" on categories
  for delete using (true);

create policy "items: leitura pública" on items
  for select using (true);
create policy "items: escrita pública" on items
  for insert with check (true);
create policy "items: atualização pública" on items
  for update using (true);
create policy "items: exclusão pública" on items
  for delete using (true);

-- ---------- Storage (fotos dos itens) ----------
-- Crie manualmente um bucket chamado "menu-photos" em Storage > New bucket, marcado como "Public".
-- Depois rode as policies abaixo (Storage > Policies), ou execute este bloco aqui.

insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;

create policy "menu-photos: leitura pública"
  on storage.objects for select
  using (bucket_id = 'menu-photos');

create policy "menu-photos: upload público"
  on storage.objects for insert
  with check (bucket_id = 'menu-photos');

create policy "menu-photos: exclusão pública"
  on storage.objects for delete
  using (bucket_id = 'menu-photos');

-- ---------- Dados de exemplo (opcional) ----------
-- Apague este bloco se não quiser os itens de exemplo.

with cat as (
  insert into categories (name, sort_order) values
    ('Entradas', 0),
    ('Pratos Principais', 1),
    ('Sobremesas', 2),
    ('Bebidas', 3)
  returning id, name
)
insert into items (category_id, name, description, price, visible, sort_order)
select id, v.name, v.description, v.price, true, v.sort_order
from cat, (values
  ('Entradas', 'Pão de queijo da fazenda', 'Assado na hora, feito com queijo da produção própria.', 18.00, 0),
  ('Entradas', 'Tábua de queijos artesanais', 'Seleção de queijos curados da região, com geleia caseira.', 42.00, 1),
  ('Pratos Principais', 'Costela no fogo de chão', 'Costela bovina assada lentamente, acompanha mandioca e vinagrete.', 68.00, 0),
  ('Pratos Principais', 'Frango caipira ao molho de ervas', 'Frango criado solto, ervas frescas da horta.', 54.00, 1),
  ('Sobremesas', 'Doce de leite da fazenda com queijo', 'Clássico da roça, doce de leite artesanal.', 22.00, 0),
  ('Bebidas', 'Suco natural da estação', 'Fruta do dia, sem adição de açúcar.', 14.00, 0)
) as v(cat_name, name, description, price, sort_order)
where cat.name = v.cat_name;
