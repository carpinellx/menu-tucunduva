-- Migração: trocar "escrita pública" por "escrita só para usuários autenticados"
-- Rode isso no SQL Editor do seu projeto Supabase (Project > SQL Editor > New query).
-- Não mexe nas tabelas nem apaga dados, só troca as regras de acesso (RLS).

-- ---------- categories ----------
drop policy if exists "categories: escrita pública" on categories;
drop policy if exists "categories: atualização pública" on categories;
drop policy if exists "categories: exclusão pública" on categories;

create policy "categories: escrita autenticada" on categories
  for insert with check (auth.role() = 'authenticated');
create policy "categories: atualização autenticada" on categories
  for update using (auth.role() = 'authenticated');
create policy "categories: exclusão autenticada" on categories
  for delete using (auth.role() = 'authenticated');

-- ---------- items ----------
drop policy if exists "items: escrita pública" on items;
drop policy if exists "items: atualização pública" on items;
drop policy if exists "items: exclusão pública" on items;

create policy "items: escrita autenticada" on items
  for insert with check (auth.role() = 'authenticated');
create policy "items: atualização autenticada" on items
  for update using (auth.role() = 'authenticated');
create policy "items: exclusão autenticada" on items
  for delete using (auth.role() = 'authenticated');

-- ---------- storage (fotos dos itens) ----------
drop policy if exists "menu-photos: upload público" on storage.objects;
drop policy if exists "menu-photos: exclusão pública" on storage.objects;

create policy "menu-photos: upload autenticado"
  on storage.objects for insert
  with check (bucket_id = 'menu-photos' and auth.role() = 'authenticated');

create policy "menu-photos: exclusão autenticada"
  on storage.objects for delete
  using (bucket_id = 'menu-photos' and auth.role() = 'authenticated');

-- A leitura pública (select) continua igual — o cardápio precisa ser
-- visível sem login. Não mexemos nas policies de "leitura pública".
