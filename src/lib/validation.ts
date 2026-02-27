import type { QuestionType } from "@/types/quiz";
import {
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  SOURCE_TEXT_MIN_LENGTH,
  SOURCE_TEXT_MAX_LENGTH,
} from "@/lib/constants";

export interface ValidationErrors {
  title?: string;
  sourceText?: string;
  questionTypes?: string;
}

export function validateQuizForm(fields: {
  title: string;
  sourceText: string;
  questionTypes: QuestionType[];
}): ValidationErrors {
  const errors: ValidationErrors = {};

  const trimmedTitle = fields.title.trim();
  if (!trimmedTitle) {
    errors.title = "퀴즈 제목을 입력해주세요.";
  } else if (trimmedTitle.length < TITLE_MIN_LENGTH) {
    errors.title = `제목은 최소 ${TITLE_MIN_LENGTH}자 이상이어야 합니다.`;
  } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `제목은 최대 ${TITLE_MAX_LENGTH}자까지 입력 가능합니다.`;
  }

  const trimmedText = fields.sourceText.trim();
  if (!trimmedText) {
    errors.sourceText = "학습 텍스트를 입력해주세요.";
  } else if (trimmedText.length < SOURCE_TEXT_MIN_LENGTH) {
    errors.sourceText = `텍스트는 최소 ${SOURCE_TEXT_MIN_LENGTH}자 이상이어야 합니다. (현재 ${trimmedText.length}자)`;
  } else if (trimmedText.length > SOURCE_TEXT_MAX_LENGTH) {
    errors.sourceText = `텍스트는 최대 ${SOURCE_TEXT_MAX_LENGTH.toLocaleString()}자까지 입력 가능합니다.`;
  }

  if (fields.questionTypes.length === 0) {
    errors.questionTypes = "최소 1개의 문제 유형을 선택해주세요.";
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
