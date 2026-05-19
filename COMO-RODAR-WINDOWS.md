# Como rodar no Windows (CMD não reconhece npm)

## Opção A — Mais fácil (duplo clique)

1. Abra a pasta do projeto no Explorador de Arquivos:
   ```
   C:\Users\lmats\.cursor\projects\empty-window\reserva-quadra-tenis
   ```
2. Dê **duplo clique** em **`iniciar-app.bat`** (se der erro de parênteses, use a versão atualizada do arquivo na pasta)
3. Aguarde instalar (na primeira vez pode demorar alguns minutos)
4. O navegador abrirá em http://localhost:3000

---

## Opção B — Corrigir o PATH (para `npm` funcionar em qualquer terminal)

1. Pressione **Win + S** e pesquise: **variáveis de ambiente**
2. Abra **"Editar as variáveis de ambiente do sistema"**
3. Clique em **Variáveis de Ambiente**
4. Em **Variáveis do usuário** (ou do sistema), selecione **Path** → **Editar**
5. Clique **Novo** e adicione:
   ```
   C:\Program Files\nodejs
   ```
6. **OK** em todas as janelas
7. **Feche o CMD completamente** e abra um novo
8. Teste:
   ```cmd
   node -v
   npm -v
   ```
9. Depois:
   ```cmd
   cd C:\Users\lmats\.cursor\projects\empty-window\reserva-quadra-tenis
   npm install
   npm run db:push
   npm run db:seed
   npm run dev
   ```

---

## Contas de teste (após rodar)

| E-mail | Senha |
|--------|-------|
| jogador@test.com | jogador123 |
| admin@reservaquadra.com | admin123 |

---

## Se ainda falhar

Envie uma captura ou copie o texto do erro. Verifique se existe a pasta:
`C:\Program Files\nodejs\npm.cmd`

Se não existir, reinstale o Node em https://nodejs.org (versão LTS).
