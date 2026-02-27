import type { Plan } from "@/types/user";
import type { QuestionType, Difficulty } from "@/types/quiz";

export const PLAN_LIMITS: Record<Plan, {
  daily_quiz_limit: number;
  max_questions: number;
  pdf_upload: boolean;
  quiz_export: boolean;
  quiz_share: boolean;
}> = {
  free: {
    daily_quiz_limit: 3,
    max_questions: 10,
    pdf_upload: false,
    quiz_export: false,
    quiz_share: false,
  },
  pro: {
    daily_quiz_limit: Infinity,
    max_questions: 30,
    pdf_upload: true,
    quiz_export: true,
    quiz_share: true,
  },
};

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "multiple_choice", label: "객관식" },
  { value: "true_false", label: "O/X" },
  { value: "short_answer", label: "단답형" },
];

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "쉬움" },
  { value: "medium", label: "보통" },
  { value: "hard", label: "어려움" },
];

export const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30];

export const SOURCE_TEXT_MAX_LENGTH = 8000;
export const SOURCE_TEXT_MIN_LENGTH = 50;
export const TITLE_MIN_LENGTH = 2;
export const TITLE_MAX_LENGTH = 100;

export const PDF_MAX_SIZE_MB = 10;
export const PDF_MAX_SIZE_BYTES = PDF_MAX_SIZE_MB * 1024 * 1024;
export const IMAGE_MAX_SIZE_MB = 5;
export const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const ALLOWED_PDF_TYPES = ["application/pdf"];
