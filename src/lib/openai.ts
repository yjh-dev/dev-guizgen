import OpenAI from "openai";
import type { QuestionType, Difficulty, GeneratedQuestion } from "@/types/quiz";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY를 .env.local에 설정해주세요.");
  }
  return new OpenAI({ apiKey });
}

interface GenerateQuestionsParams {
  sourceText: string;
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
}

const SYSTEM_PROMPT = `당신은 교육 전문가입니다. 주어진 텍스트를 기반으로 퀴즈 문제를 생성합니다.

규칙:
1. 반드시 주어진 텍스트의 내용에 기반한 문제만 생성하세요.
2. 문제는 명확하고 모호하지 않아야 합니다.
3. 객관식 문제는 4개의 보기를 제공하세요.
4. O/X 문제는 options를 ["O", "X"]로 설정하세요.
5. 단답형 문제는 options를 null로 설정하세요.
6. 각 문제에 간단한 해설을 포함하세요.
7. 한국어로 작성하세요.

JSON 형식으로 응답하세요:
{
  "questions": [
    {
      "type": "multiple_choice" | "true_false" | "short_answer",
      "question": "문제 내용",
      "options": ["보기1", "보기2", "보기3", "보기4"] | ["O", "X"] | null,
      "correct_answer": "정답",
      "explanation": "해설"
    }
  ]
}`;

function buildUserPrompt(params: GenerateQuestionsParams): string {
  const typeLabels: Record<QuestionType, string> = {
    multiple_choice: "객관식",
    true_false: "O/X",
    short_answer: "단답형",
  };
  const difficultyLabels: Record<Difficulty, string> = {
    easy: "쉬움",
    medium: "보통",
    hard: "어려움",
  };

  const types = params.questionTypes.map((t) => typeLabels[t]).join(", ");

  return `다음 텍스트를 기반으로 퀴즈를 생성해주세요.

- 문제 수: ${params.questionCount}개
- 문제 유형: ${types}
- 난이도: ${difficultyLabels[params.difficulty]}

텍스트:
${params.sourceText}`;
}

export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GeneratedQuestion[]> {
  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(params) },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("AI 응답이 비어있습니다.");

  const parsed = JSON.parse(content) as { questions: GeneratedQuestion[] };
  return parsed.questions;
}
