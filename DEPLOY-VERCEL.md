# Publicar na Vercel — passo a passo (Windows)

## Antes de começar

- Conta no **GitHub**: https://github.com/signup  
- Conta na **Vercel**: https://vercel.com/signup (use “Continue with GitHub”)  
- Conta no **Neon** (banco grátis): https://neon.tech  

> O arquivo `dev.db` (SQLite) **não funciona** na Vercel. Use PostgreSQL no Neon.

---

## Parte 1 — Banco de dados (Neon)

1. Acesse https://console.neon.tech e crie um projeto (ex.: `reserva-quadra`).  
2. Na dashboard, copie a **Connection string** (modo **Pooled** ou **Direct**).  
   Exemplo:
   ```
   postgresql://usuario:senha@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Guarde essa URL — será o `DATABASE_URL` na Vercel.

---

## Parte 2 — Ajustar o Prisma para PostgreSQL

1. Abra `prisma/schema.prisma`.  
2. Troque o bloco `datasource db` de:

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

   para:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Salve o arquivo.

---

## Parte 3 — Subir o código para o GitHub

### Instalar o Git (se ainda não tiver)

- https://git-scm.com/download/win  
- Instale com as opções padrão e **reabra** o CMD.

### Enviar o projeto

No CMD:

```cmd
set PATH=C:\Program Files\nodejs;%PATH%
cd C:\Users\lmats\.cursor\projects\empty-window\reserva-quadra-tenis

git init
git add .
git commit -m "App Reserva Quadra - versao inicial"
```

No GitHub: **New repository** → nome `reserva-quadra-tenis` → **não** marque README → Create.

Depois (troque `SEU_USUARIO`):

```cmd
git remote add origin https://github.com/SEU_USUARIO/reserva-quadra-tenis.git
git branch -M main
git push -u origin main
```

(Faça login no GitHub se o Git pedir.)

---

## Parte 4 — Criar tabelas e dados de teste (uma vez)

Ainda no PC, com a URL do Neon:

```cmd
set PATH=C:\Program Files\nodejs;%PATH%
cd C:\Users\lmats\.cursor\projects\empty-window\reserva-quadra-tenis

set DATABASE_URL=postgresql://COLE_SUA_URL_AQUI
npx prisma db push
npm run db:seed
```

Isso cria escolas e usuários de demonstração no banco na nuvem.

---

## Parte 5 — Deploy na Vercel

1. Acesse https://vercel.com/new  
2. **Import** o repositório `reserva-quadra-tenis`.  
3. **Framework Preset:** Next.js (detectado automaticamente).  
4. Em **Environment Variables**, adicione:

   | Nome | Valor |
   |------|--------|
   | `DATABASE_URL` | URL completa do Neon |
   | `SESSION_SECRET` | Texto longo aleatório (ex.: gere em https://generate-secret.vercel.app/32) |
   | `NEXT_PUBLIC_APP_URL` | Deixe vazio por agora; atualize depois do 1º deploy |

   Opcionais (pagamento / integrações):

   | Nome | Valor |
   |------|--------|
   | `MERCADOPAGO_ACCESS_TOKEN` | Token do Mercado Pago |
   | `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Chave pública MP |

5. Em **Build Command**, use:

   ```
   prisma generate && next build
   ```

   (O `postinstall` já roda `prisma generate`; o importante é não usar SQLite.)

6. Clique **Deploy** e aguarde (2–5 min).

7. Quando terminar, copie a URL (ex.: `https://reserva-quadra-tenis.vercel.app`).

8. **Settings** → **Environment Variables** → edite `NEXT_PUBLIC_APP_URL` com essa URL → **Redeploy** (Deployments → ⋮ → Redeploy).

---

## Parte 6 — Usar no Android

1. No Chrome do celular, abra a URL da Vercel.  
2. Menu **⋮** → **Instalar app** ou **Adicionar à tela inicial**.  
3. Pronto — funciona em qualquer rede, sem o PC ligado.

---

## Parte 7 — Mercado Pago (produção)

No painel do Mercado Pago Developers:

- **Webhook:** `https://SUA-URL.vercel.app/api/webhooks/mercadopago`  
- Use credenciais de **produção** só quando for cobrar de verdade.

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Build falha no Prisma | Confirme `provider = "postgresql"` e `DATABASE_URL` correta |
| Site abre sem escolas | Rode `db:seed` com `DATABASE_URL` do Neon no PC |
| Login não funciona | `SESSION_SECRET` definido na Vercel + redeploy |
| MP não confirma pagamento | `NEXT_PUBLIC_APP_URL` = URL exata da Vercel |

---

## Contas de teste (após seed)

| E-mail | Senha |
|--------|--------|
| jogador@test.com | jogador123 |
| admin@reservaquadra.com | admin123 |
