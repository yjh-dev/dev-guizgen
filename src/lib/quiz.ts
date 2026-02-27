import { generateQuestions } from "./openai";
import { SOURCE_TEXT_MAX_LENGTH } from "./constants";
import type { GenerateQuizRequest, GeneratedQuestion } from "@/types/quiz";

export async function orchestrateQuizGeneration(
  request: GenerateQuizRequest
): Promise<GeneratedQuestion[]> {
  // 텍스트 길이 제한 (토큰 절감)
  let sourceText = request.source_text;
  if (sourceText.length > SOURCE_TEXT_MAX_LENGTH) {
    sourceText = sourceText.slice(0, SOURCE_TEXT_MAX_LENGTH);
  }

  const questions = await generateQuestions({
    sourceText,
    questionCount: request.question_count,
    questionTypes: request.question_types,
    difficulty: request.difficulty,
  });

  return questions;
}
