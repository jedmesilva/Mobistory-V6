import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const EXTRACT_PROMPT = `Você é um extrator de dados de abastecimento de veículos.
Analise esta imagem (pode ser foto de bomba de combustível, display digital, comprovante, nota fiscal ou qualquer documento relacionado a abastecimento).

Extraia TODOS os dados que conseguir identificar e retorne SOMENTE um JSON válido, sem texto adicional, sem markdown, sem explicações.

Schema esperado (inclua apenas campos que você conseguiu extrair com confiança):
{
  "station": "nome do posto",
  "stationAddress": "endereço do posto",
  "pump": "número da bomba",
  "odometer": "quilometragem em número sem pontos ou vírgulas",
  "paymentMethod": "um de: credito | debito | pix | dinheiro | vale",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "notes": "observações relevantes",
  "fuels": [
    {
      "type": "um de: gasolina_comum | gasolina_aditivada | etanol | diesel | diesel_s10 | gnv | eletrico",
      "liters": "número com ponto decimal",
      "pricePerLiter": "número com ponto decimal"
    }
  ]
}

Se não conseguir extrair um campo com confiança, omita-o completamente.`;

router.post("/fuel/analyze", async (req, res) => {
  try {
    const { base64, mediaType } = req.body as { base64: string; mediaType: string };

    if (!base64 || !mediaType) {
      res.status(400).json({ error: "base64 and mediaType are required" });
      return;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64 },
            },
            { type: "text", text: EXTRACT_PROMPT },
          ],
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      res.status(500).json({ error: "No text response from AI" });
      return;
    }

    const clean = text.text.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(clean);
    res.json({ data: extracted });
  } catch (err) {
    console.error("Fuel analyze error:", err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

export default router;
