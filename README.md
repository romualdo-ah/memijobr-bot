# memijobr-bot — Deploy na Vercel

Bot serverless que responde automaticamente por DM quando alguém comenta palavras-chave no Instagram (@memijobr).

---

## Passo 1 — Suba para o GitHub

```bash
cd vercel-webhook
git init
git add .
git commit -m "feat: instagram webhook bot"
gh repo create memijobr-bot --public --source=. --push
```

> Se não tiver o `gh` CLI: crie o repo em github.com e siga as instruções de `git remote add origin`.

---

## Passo 2 — Conecte na Vercel e adicione as variáveis de ambiente

1. Acesse [vercel.com/new](https://vercel.com/new) → importe o repo `memijobr-bot`.
2. Clique em **Environment Variables** antes de fazer o deploy e adicione:

| Nome | Valor |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | Seu token de sistema do Instagram/Meta |
| `WEBHOOK_VERIFY_TOKEN` | Qualquer string secreta, ex: `memijo_secreto_123` |

3. Clique em **Deploy**. Anote a URL gerada, ex: `https://memijobr-bot.vercel.app`.

---

## Passo 3 — Registre o Webhook no Portal Meta

1. Acesse [developers.facebook.com](https://developers.facebook.com) → seu app → **Webhooks**.
2. Escolha o objeto **Instagram**.
3. Clique em **Editar assinaturas** e preencha:
   - **URL de Callback**: `https://memijobr-bot.vercel.app/api/webhook`
   - **Token de Verificação**: o mesmo valor de `WEBHOOK_VERIFY_TOKEN`
4. Clique em **Verificar e Salvar**.
5. Na lista de campos, ative **comments**.

Pronto. A partir de agora, comentários com "quero", "link", "comprar", "valor" ou "preço" recebem DM automático com o link.
