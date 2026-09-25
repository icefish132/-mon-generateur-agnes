// Lance une génération vidéo à partir d'une image de départ.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { prompt, image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: "Image manquante" });
  }

  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur" });
  }

  try {
    const response = await fetch("https://apihub.agnes-ai.com/v1/videos/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "agnes-video-v2.0",
        prompt: prompt || "",
        image: image, // data URL base64
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: JSON.stringify(data) });
    }

    const videoId = data.id || data.video_id || (data.data && data.data[0] && data.data[0].id);
    if (!videoId) {
      return res.status(500).json({ error: "Pas d'identifiant de tâche renvoyé par l'API" });
    }

    return res.status(200).json({ video_id: videoId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
