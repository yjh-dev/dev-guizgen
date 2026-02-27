"use client";

import { create } from "zustand";
import type {
  QuestionType,
  Difficulty,
  SourceType,
  GeneratedQuestion,
} from "@/types/quiz";

interface QuizFormState {
  title: string;
  sourceText: string;
  sourceType: SourceType;
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  isGenerating: boolean;
  generatedQuestions: GeneratedQuestion[];
  error: string | null;
}

interface QuizFormActions {
  setTitle: (title: string) => void;
  setSourceText: (text: string) => void;
  setSourceType: (type: SourceType) => void;
  setQuestionCount: (count: number) => void;
  toggleQuestionType: (type: QuestionType) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setIsGenerating: (loading: boolean) => void;
  setGeneratedQuestions: (questions: GeneratedQuestion[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: QuizFormState = {
  title: "",
  sourceText: "",
  sourceType: "text",
  questionCount: 5,
  questionTypes: ["multiple_choice"],
  difficulty: "medium",
  isGenerating: false,
  generatedQuestions: [],
  error: null,
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
  setGeneratedQuestions: (generatedQuestions) => set({ generatedQuestions }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
