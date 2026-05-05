import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const FIELD_PROMPTS: Record<string, string> = {
  brand:   'Identify the vehicle brand from this image. Return ONLY valid JSON, no markdown: {"brand":"..."}',
  model:   'Identify the vehicle model from this image. Return ONLY valid JSON, no markdown: {"model":"..."}',
  version: 'Identify the vehicle version/trim level from this image. Return ONLY valid JSON, no markdown: {"version":"..."}',
  year:    'Identify the vehicle manufacturing year from this image. Return ONLY valid JSON, no markdown: {"year":"..."}',
  plate:   'Identify the license plate number from this image. Return ONLY valid JSON, no markdown: {"plate":"..."}',
  color:   'Identify the vehicle color in Portuguese (e.g. Branco, Prata, Preto, Cinza, Vermelho, Azul). Return ONLY valid JSON, no markdown: {"color":"..."}',
  fuel:    'Identify the fuel type in Portuguese (Flex, Gasolina, Etanol, Diesel, GNV, Elétrico, Híbrido) from this document or image. Return ONLY valid JSON, no markdown: {"fuel":"..."}',
};

router.post("/vehicle/analyze", async (req, res) => {
  try {
    const { base64, mediaType, field } = req.body as { base64: string; mediaType: string; field: string };

    if (!base64 || !mediaType || !field) {
      res.status(400).json({ error: "base64, mediaType and field are required" });
      return;
    }

    const prompt = FIELD_PROMPTS[field] ?? FIELD_PROMPTS["brand"];

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      res.status(500).json({ error: "No text response from AI" });
      return;
    }

    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(clean);
    res.json({ data: extracted });
  } catch (err) {
    console.error("Vehicle analyze error:", err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

export default router;
