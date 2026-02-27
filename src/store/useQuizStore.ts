"use client";

import { create } from "zustand";
import type {
  QuestionType,
  Difficulty,
  SourceType,
  GeneratedQuestion,
  QuizErrorCode,
  GenerationSummary,
} from "@/types/quiz";

export type GenerationStep =
  | "idle"
  | "validating"
  | "generating"
  | "saving"
  | "completed"
  | "error";

interface ErrorInfo {
  message: string;
  code: QuizErrorCode;
  retryable: boolean;
}

interface QuizFormState {
  title: string;
  sourceText: string;
  sourceType: SourceType;
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  isGenerating: boolean;
  generationStep: GenerationStep;
  generatedQuestions: GeneratedQuestion[];
  error: string | null;
  errorInfo: ErrorInfo | null;
  completedData: GenerationSummary | null;
}

interface QuizFormActions {
  setTitle: (title: string) => void;
  setSourceText: (text: string) => void;
  setSourceType: (type: SourceType) => void;
  setQuestionCount: (count: number) => void;
  toggleQuestionType: (type: QuestionType) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setIsGenerating: (loading: boolean) => void;
  setGenerationStep: (step: GenerationStep) => void;
  setGeneratedQuestions: (questions: GeneratedQuestion[]) => void;
  setError: (error: string | null) => void;
  setErrorInfo: (info: ErrorInfo | null) => void;
  setCompletedData: (data: GenerationSummary | null) => void;
  reset: () => void;
  resetGeneration: () => void;
}

const initialState: QuizFormState = {
  title: "",
  sourceText: "",
  sourceType: "text",
  questionCount: 5,
  questionTypes: ["multiple_choice"],
  difficulty: "medium",
  isGenerating: false,
  generationStep: "idle",
  generatedQuestions: [],
  error: null,
  errorInfo: null,
  completedData: null,
};

export const useQuizStore = create<QuizFormState & QuizFormActions>((set) => ({
  ...initialState,

  setTitle: (title) => set({ title }),
  setSourceText: (sourceText) => set({ sourceText }),
  setSourceType: (sourceType) => set({ sourceType }),
  setQuestionCount: (questionCount) => set({ questionCount }),
  toggleQuestionType: (type) =>
    set((state) => {
      const types = state.questionTypes.includes(type)
        ? state.questionTypes.filter((t) => t !== type)
        : [...state.questionTypes, type];
      return { questionTypes: types.length > 0 ? types : state.questionTypes };
    }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setGenerationStep: (generationStep) => set({ generationStep }),
  setGeneratedQuestions: (generatedQuestions) => set({ generatedQuestions }),
  setError: (error) => set({ error }),
  setErrorInfo: (errorInfo) => set({ errorInfo }),
  setCompletedData: (completedData) => set({ completedData }),
  reset: () => set(initialState),
  resetGeneration: () =>
    set({
      isGenerating: false,
      generationStep: "idle",
      error: null,
      errorInfo: null,
      completedData: null,
    }),
}));
