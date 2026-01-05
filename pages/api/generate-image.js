export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || prompt.length < 3) {
      return res.status(400).json({ error: "Prompt inválido" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    const response = await fetch("https://api.subnp.com/v1/image/generate", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "subnp-image-v1",
        prompt,
        width: 768,
        height: 768,
        steps: 15,
        guidance: 9
      })
    });

    clearTimeout(timeout);

    const rawText = await response.text();

    // LOG CRÍTICO — aparece no dashboard da Vercel
    console.log("STATUS SUBNP:", response.status);
    console.log("RESPOSTA BRUTA:", rawText);

    if (!response.ok) {
      return res.status(500).json({
        error: "Subnp respondeu com erro",
        status: response.status,
        body: rawText
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: "Resposta não é JSON",
        body: rawText
      });
    }

    if (!data.image_url) {
      return res.status(500).json({
        error: "image_url não retornado",
        data
      });
    }

    return res.status(200).json({
      success: true,
      image: data.image_url
    });

  } catch (err) {
    console.error("ERRO GERAL:", err);

    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Timeout evitado" });
    }

    return res.status(500).json({
      error: "Erro interno real",
      message: err.message
    });
  }
      }
