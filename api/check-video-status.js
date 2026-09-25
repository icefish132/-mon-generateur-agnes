// pages/api/check-video-status.js
// Vérifie le statut d'une tâche de génération vidéo. Appelé en polling par le front.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { video_id } = req.query || {};
  if (!video_id) {
    return res.status(400).json({ error: "video_id manquant" });
  }

  const apiKey = process.env.AGNES_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur" });
  }

  try {
    const url = `https://apihub.agnes-ai.com/agnesapi?video_id=${encodeURIComponent(
      video_id
    )}&model_name=agnes-video-2.5-flash`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data.detail || JSON.stringify(data);
      return res.status(response.status).json({ error: message });
    }

    return res.status(200).json({
      status: data.status,
      progress: data.progress,
      url: data.status === "completed" ? data.url : null,
      error: data.status === "failed" ? data.error : null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
