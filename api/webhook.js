const KEYWORDS = ["quero", "link", "comprar", "valor", "preço", "preco"];
const DM_TEXT =
  "Olá! 🌟 Aqui está o link do produto que você pediu:\n\n👉 https://memijobr.com/link-na-bio";

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
        await fetch(
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
      }
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
