export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          plan: string;
          quiz_count_today: number;
          quiz_count_reset_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          quiz_count_today?: number;
          quiz_count_reset_at?: string;
        };
        Update: {
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          quiz_count_today?: number;
          quiz_count_reset_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          source_type: string;
          source_text: string | null;
          difficulty: string;
          is_public: boolean;
          question_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          source_type?: string;
          source_text?: string | null;
          difficulty?: string;
          is_public?: boolean;
          question_count?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          source_type?: string;
          source_text?: string | null;
          difficulty?: string;
          is_public?: boolean;
          question_count?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          type: string;
          question: string;
          options: Json | null;
          correct_answer: string;
          explanation: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          quiz_id: string;
          type: string;
          question: string;
          options?: Json | null;
          correct_answer: string;
          explanation?: string | null;
          order_index?: number;
        };
        Update: {
          type?: string;
          question?: string;
          options?: Json | null;
          correct_answer?: string;
          explanation?: string | null;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string | null;
          score: number;
          total_questions: number;
          answers: Json;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          quiz_id: string;
          user_id?: string | null;
          score: number;
          total_questions: number;
          answers?: Json;
          completed_at?: string;
        };
        Update: {
          score?: number;
          total_questions?: number;
          answers?: Json;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          payment_key: string | null;
          started_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          plan?: string;
          status?: string;
          payment_key?: string | null;
          started_at?: string;
          expires_at?: string | null;
        };
        Update: {
          plan?: string;
          status?: string;
          payment_key?: string | null;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
