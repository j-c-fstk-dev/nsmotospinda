# NS Multimarcas: site + painel

Site da NS Multimarcas (Pindamonhangaba-SP): vitrine de motos/carros, WhatsApp direto em cada anúncio, mapa, avaliação no Google e painel para o lojista.

**Stack:** Vite + React + TypeScript, CSS próprio, Supabase (opcional), deploy no Netlify.

## Rodar local

```bash
npm install
npm run dev
```

## Modo demonstração x produção

- **Sem variáveis de ambiente** → modo demo. Estoque de exemplo (24 motos, 8 categorias) e tudo que o painel alterar fica salvo no navegador. Login do painel: `admin@nsmultimarcas.com.br` / `ns2026` (já vem preenchido).
- **Com Supabase** → defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (no Netlify: Site settings → Environment variables) e faça novo deploy.

## Publicar no Netlify

Importe o repositório. O `netlify.toml` já define build (`npm run build`), pasta (`dist`) e o redirect de SPA.

## Checklist para quando o cliente fechar

1. **Supabase:** criar projeto → SQL Editor → rodar `supabase/schema.sql` → Authentication → Users → criar o usuário do lojista (e-mail + senha). Desativar "Allow new users to sign up".
2. **Variáveis no Netlify** (acima) e redeploy. Cadastrar o estoque real pelo painel (`/admin`).
3. **Google Perfil da Empresa:** no painel → *Google e avaliações*, colar o link "Pedir avaliações" (g.page/r/…/review), o link do perfil, nota e total. Baixar o QR code para o balcão.
4. **Google Analytics 4:** criar propriedade, copiar o ID `G-…` e colar em *Dados da loja*. Eventos enviados: `page_view`, `click_whatsapp`, `view`, `review`.
5. **Domínio:** Netlify → Domain management → adicionar domínio e apontar DNS.
6. Trocar o WhatsApp de exemplo `(12) 99999-0000` pelo real em *Dados da loja*.

## Estrutura

```
src/lib/store.ts        camada de dados (localStorage ou Supabase)
src/lib/seed.ts         estoque e dados de exemplo
src/lib/categories.ts   categorias de motos (Street, Trail, Scooter, Naked, Esportiva, Big Trail, Custom, Touring)
src/pages/              Home, Estoque, Detalhe
src/pages/admin/        painel: resumo, veículos, cadastro, loja, Google
supabase/schema.sql     tabelas, RLS e bucket de fotos
```

## Categorias

Baseadas nos segmentos da Fenabrave (City, Trail, Maxtrail, Scooter, Naked, Sport, Custom, Touring), com os nomes que o comprador usa: Street, Trail, Big Trail, Scooter, Naked, Esportiva, Custom, Touring. Carros: Hatch, Sedã, SUV, Picape.

## Fotos de demonstração

As fotos do estoque de exemplo vêm da Wikimedia Commons (licenças livres, crédito em cada anúncio) e são carregadas direto de lá. Substituir pelas fotos reais da loja antes de publicar.
