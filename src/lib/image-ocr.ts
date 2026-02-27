import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY를 .env.local에 설정해주세요.");
  }
  return new OpenAI({ apiKey });
}

export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const openai = getOpenAIClient();
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "당신은 이미지에서 텍스트를 정확하게 추출하는 OCR 전문가입니다. 이미지에 포함된 모든 텍스트를 원본 구조를 유지하며 추출해주세요. 텍스트만 반환하고, 다른 설명은 포함하지 마세요.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "이 이미지에서 모든 텍스트를 추출해주세요. 제목, 본문, 캡션 등 보이는 모든 텍스트를 포함해주세요.",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" },
          },
        ],
      },
    ],
    max_tokens: 4000,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("이미지에서 텍스트를 추출할 수 없습니다.");
  }

  return text;
}
