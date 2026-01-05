export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.length < 3) {
    return res.status(400).json({ error: "Prompt inválido" });
  }

  // ⏱️ Timeout manual para não estourar os 20s da Vercel
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);

  try {
    const response = await fetch("https://api.subnp.com/v1/image/generate", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "subnp-image-v1",
        prompt: prompt,
        width: 1024,
        height: 1024,
        steps: 18,        // rápido + qualidade
        guidance: 9,      // fidelidade alta ao prompt
        format: "png"
      })
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();

    if (!data?.image_url) {
      return res.status(500).json({ error: "Imagem não retornada pela API" });
    }

    return res.status(200).json({
      success: true,
      image: data.image_url
    });

  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({
        error: "Timeout evitado antes dos 20s da Vercel"
      });
    }

    return res.status(500).json({
      error: "Erro ao gerar imagem",
      details: err.message
    });
  }
    }
