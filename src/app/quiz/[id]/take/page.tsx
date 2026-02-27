import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import QuizTaker from "@/components/quiz/QuizTaker";
import type { Quiz, Question } from "@/types/quiz";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quizData } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single();
  const quiz = quizData as Quiz | null;

  if (!quiz) notFound();

  const { data: questionsData } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", id)
    .order("order_index", { ascending: true });
  const questions = (questionsData ?? []) as Question[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="mt-1 text-muted-foreground">{quiz.description}</p>
        )}
      </div>
      <QuizTaker
        quizId={id}
        quizTitle={quiz.title}
        questions={questions}
      />
    </div>
  );
}
