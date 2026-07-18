# Cardápio Digital — Fazenda Tucunduva

Cardápio digital só de visualização (sem pedidos), com painel administrativo
para controlar quais itens aparecem, editar textos/preços e trocar fotos.

Feito com **Vite + React + TypeScript**, banco de dados e fotos no **Supabase**
(plano gratuito), pronto para publicar na **Vercel**.

## 1. Criar o projeto no Supabase (grátis)

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto.
2. Vá em **SQL Editor > New query**, cole o conteúdo do arquivo
   [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**.
   Isso cria as tabelas `categories` e `items`, as permissões de acesso e o
   bucket de fotos `menu-photos` (já incluindo alguns itens de exemplo — pode
   apagar esse bloco final do SQL se não quiser).
3. Vá em **Project Settings > API** e copie:
   - `Project URL`
   - `anon public key`

## 2. Configurar o projeto localmente

```bash
npm install
cp .env.example .env
```

Abra o `.env` e preencha:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Crie o usuário do admin em **Supabase > Authentication > Users > Add user**
(e-mail + senha). Esse é o login que você vai usar em `/admin` — não existe
mais uma senha fixa guardada no código do site.

Em **Authentication > Providers > Email**, desmarque "Allow new users to
sign up" — assim ninguém consegue criar uma conta sozinho, só quem você
cadastrar manualmente.

Rodar localmente:

```bash
npm run dev
```

- Cardápio público: `http://localhost:5173/`
- Painel administrativo: `http://localhost:5173/admin`

## 3. Publicar na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Na [Vercel](https://vercel.com), clique em **Add New > Project** e
   importe o repositório (framework detectado automaticamente: Vite).
3. Em **Environment Variables**, adicione as mesmas duas variáveis do `.env`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy. O arquivo `vercel.json` já está incluído para as rotas
   (`/` e `/admin`) funcionarem corretamente.

## Como usar

- **Cardápio (`/`)**: mostra só os itens marcados como "visível", agrupados
  por categoria.
- **Admin (`/admin`)**: pede a senha definida em `VITE_ADMIN_PASSWORD`. De lá
  dá para:
  - Criar, renomear, reordenar e excluir categorias (categorias com itens
    não podem ser excluídas antes de mover ou apagar os itens).
  - Criar, editar, excluir itens.
  - Adicionar ou remover a foto de cada item (a imagem é redimensionada e
    comprimida no navegador antes do envio, pra não pesar).
  - Ligar/desligar a visibilidade de um item no cardápio com um clique,
    sem precisar abrir o formulário de edição.

## Limitações conhecidas (bom saber)

- O login do admin agora usa o **Supabase Auth** de verdade (e-mail + senha),
  e as tabelas só aceitam escrita (insert/update/delete) de usuários
  autenticados — rode `supabase/migracao-auth.sql` no seu projeto para
  aplicar essas permissões. A leitura continua pública, porque o cardápio
  precisa aparecer sem login.
- Não há controle de estoque, pedidos ou pagamento — este projeto é só
  vitrine/visualização, como pedido.

## Estrutura do projeto

```
src/
  pages/Menu.tsx        cardápio público
  pages/Admin.tsx        painel administrativo
  components/            componentes de UI (login, formulário de item, etc.)
  lib/api.ts              todas as chamadas ao Supabase (CRUD + upload de foto)
  lib/supabaseClient.ts   configuração do cliente Supabase
  lib/useAdminAuth.ts     controle simples de sessão do admin
supabase/schema.sql       script para criar as tabelas e o bucket de fotos
```
