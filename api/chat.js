// Chat conversationnel — style ChatGPT/Meta AI, propulsé par Agnes.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Historique de messages manquant" });
  }

  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur" });
  }

  try {
    const response = await fetch("https://apihub.agnes-ai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "agnes-2.0-flash",
        messages: messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: JSON.stringify(data) });
    }

    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) {
      return res.status(500).json({ error: "Réponse inattendue de l'API" });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
