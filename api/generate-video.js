// pages/api/generate-video.js
// Lance une génération vidéo (tâche longue). Renvoie un video_id à surveiller.

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
    const response = await fetch("https://apihub.agnes-ai.com/v1/videos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "agnes-video-2.5-flash",
        prompt: prompt,
        mode: "text",
        size: "720P",
        seconds: "5",
        aspect_ratio: "16:9",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.detail || JSON.stringify(data);
      return res.status(response.status).json({ error: message });
    }

    const videoId = data.video_id || data.id || data.task_id;
    if (!videoId) {
      return res.status(500).json({ error: "Pas d'identifiant de tâche renvoyé par l'API" });
    }

    return res.status(200).json({ video_id: videoId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
