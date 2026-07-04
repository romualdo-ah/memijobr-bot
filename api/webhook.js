const KEYWORDS = ["quero", "link", "comprar", "valor", "preço", "preco"];
const DM_TEXT =
  "Olá! 🌟 Aqui está o link do produto que você pediu:\n\n👉 https://memijobr.com/link-na-bio";
const REPLY_TEXT = "Prontinho! 📩 Te enviei o link no seu Direct 😉";

module.exports = async (req, res) => {
  // GET — verificação do webhook Meta
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  // POST — eventos de comentário
  if (req.method === "POST") {
    const entries = req.body?.entry ?? [];

    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "comments") continue;

        const text = (change.value?.text ?? "").toLowerCase();
        const commentId = change.value?.id;

        if (!commentId || !KEYWORDS.some((k) => text.includes(k))) continue;

        // ponytail: await garante envio antes de fechar a função Vercel
        const fbRes = await fetch(
          `https://graph.facebook.com/v20.0/${commentId}/private_replies`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: DM_TEXT,
              access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
            }),
          }
        );
        // Sem isto, um DM que falha ainda devolve 200 ao Meta (falha silenciosa).
        const fbBody = await fbRes.json().catch(() => ({}));
        if (!fbRes.ok || fbBody.error) {
          console.error(
            "private_reply FAILED",
            commentId,
            fbRes.status,
            JSON.stringify(fbBody.error || fbBody)
          );
        } else {
          console.log("private_reply OK", commentId, JSON.stringify(fbBody));

          // DM enviada → responde publicamente ao comentário avisando o usuário.
          const replyRes = await fetch(
            `https://graph.facebook.com/v20.0/${commentId}/replies`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                message: REPLY_TEXT,
                access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
              }),
            }
          );
          const replyBody = await replyRes.json().catch(() => ({}));
          if (!replyRes.ok || replyBody.error) {
            console.error(
              "public reply FAILED",
              commentId,
              replyRes.status,
              JSON.stringify(replyBody.error || replyBody)
            );
          } else {
            console.log("public reply OK", commentId, JSON.stringify(replyBody));
          }
        }
      }
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
