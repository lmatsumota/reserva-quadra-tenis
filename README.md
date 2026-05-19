# Reserva Quadra — Tênis

App para reservar quadras de tênis (1h ou 2h), pagar online (Mercado Pago) e integrar com Wix Bookings e SimplyBook.me.

## Onde baixar o app?

| Forma | Onde | Quando usar |
|-------|------|-------------|
| **Site / PWA** | Página [/baixar](http://localhost:3000/baixar) após `npm run dev` | Instalar no celular pelo Chrome/Safari (“Adicionar à tela inicial”) |
| **Navegador** | `http://localhost:3000` em desenvolvimento | Testar no PC |
| **Expo Go** | Pasta `mobile/` + app Expo Go nas lojas | Protótipo nativo no celular |
| **Play Store / App Store** | Ainda não publicado | Requer `eas build` (ver `mobile/README.md`) |

Não existe link de download público até você **publicar** o projeto (ex.: Vercel + domínio próprio).

## Novidades desta versão

- **Login do jogador** — `/entrar`, histórico em `/minhas-reservas`
- **Painel admin** — `/admin` (escolas, quadras, JSON de integração)
- **PWA instalável** — `manifest.webmanifest` + ícones
- **App mobile Expo** — pasta `mobile/`

### Contas de demonstração (após `npm run db:seed`)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Super admin | admin@reservaquadra.com | admin123 |
| Gestor escola SP | gestor@tennisclub.com | gestor123 |
| Jogador | jogador@test.com | jogador123 |

## Instalação rápida

```bash
cd reserva-quadra-tenis
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

- App: http://localhost:3000  
- Baixar / instalar: http://localhost:3000/baixar  
- Admin: http://localhost:3000/admin  

## Publicar na internet (para jogadores baixarem o PWA)

1. Crie conta em [vercel.com](https://vercel.com)
2. Importe este repositório
3. Variáveis: `DATABASE_URL` (use Turso/Postgres em produção), `SESSION_SECRET`, `MERCADOPAGO_*`, `NEXT_PUBLIC_APP_URL`
4. Após o deploy, jogadores acessam sua URL e instalam pelo navegador

> SQLite local é só para desenvolvimento. Em produção use PostgreSQL (Neon, Turso, etc.).

## Variáveis de ambiente

Ver `.env.example` — inclui `SESSION_SECRET`, Mercado Pago, Wix e SimplyBook.

## Estrutura

```
src/app/admin/     # painel escolas
src/app/entrar/    # login jogador
src/app/baixar/    # instruções de download
mobile/            # app Expo
```

## Licença

MIT
