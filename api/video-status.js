// Vérifie si une vidéo lancée précédemment est prête.

export default async function handler(req, res) {
  const videoId = req.query.id;
  if (!videoId) {
    return res.status(400).json({ error: "Identifiant manquant" });
  }

  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur" });
  }

  try {
    const response = await fetch(`https://apihub.agnes-ai.com/v1/videos/generations/${videoId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: JSON.stringify(data) });
    }

    const status = data.status || (data.data && data.data.status) || "unknown";
    const url = data.url || (data.data && data.data.url) || (data.output && data.output.url);

    return res.status(200).json({ status, url: url || null, raw: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
