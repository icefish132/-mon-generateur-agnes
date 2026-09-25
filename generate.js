// Fonction serveur (Vercel) : reçoit un prompt du site, appelle Agnes AI
// avec la clé secrète (jamais visible du visiteur), renvoie l'image.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { prompt } = req.body || {};
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Description manquante" });
  }

  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur" });
  }

  try {
    const response = await fetch("https://apihub.agnes-ai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "agnes-image-2.1-flash",
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    const item = data.data && data.data[0];

    if (item && item.b64_json) {
      return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` });
    }
    if (item && item.url) {
      return res.status(200).json({ image: item.url });
    }

    return res.status(500).json({ error: "Réponse inattendue de l'API" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
