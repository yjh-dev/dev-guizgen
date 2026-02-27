export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type Difficulty = "easy" | "medium" | "hard";
export type SourceType = "text" | "pdf" | "url";

export interface Question {
  id: string;
  quiz_id: string;
  type: QuestionType;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  source_type: SourceType;
  source_text: string | null;
  difficulty: Difficulty;
  is_public: boolean;
  question_count: number;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string | null;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  completed_at: string;
  created_at: string;
}

export interface GenerateQuizRequest {
  title: string;
  source_text: string;
  source_type: SourceType;
  question_count: number;
  question_types: QuestionType[];
  difficulty: Difficulty;
}

export interface GeneratedQuestion {
  type: QuestionType;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
}
