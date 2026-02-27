export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Quiz, Question } from "@/types/quiz";

const difficultyLabels: Record<string, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

const typeLabels: Record<string, string> = {
  multiple_choice: "객관식",
  true_false: "O/X",
  short_answer: "단답형",
};

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: quizData } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">
              {difficultyLabels[quiz.difficulty]}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {quiz.question_count}문제
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(quiz.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {quiz.is_public && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quiz/${id}/take`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                풀기
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            공유
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{typeLabels[q.type]}</Badge>
                <CardTitle className="text-base">
                  {idx + 1}. {q.question}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {q.options && (
                <ul className="space-y-1">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`rounded-md px-3 py-1.5 text-sm ${
                        opt === q.correct_answer
                          ? "bg-green-100 font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-muted"
                      }`}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
              {!q.options && (
                <p className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  정답: {q.correct_answer}
                </p>
              )}
              {q.explanation && (
                <p className="text-sm text-muted-foreground">
                  {q.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
