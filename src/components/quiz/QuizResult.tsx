"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "@/types/quiz";

interface QuizResultProps {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  questions: Question[];
  answers: Record<string, string>;
}

export default function QuizResult({
  quizTitle,
  score,
  totalQuestions,
  questions,
  answers,
}: QuizResultProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{quizTitle} - 결과</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4 text-6xl font-bold">
            {percentage}
            <span className="text-2xl text-muted-foreground">점</span>
          </div>
          <p className="text-muted-foreground">
            {totalQuestions}문제 중 {score}문제 정답
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id] ?? "";
          const isCorrect =
            userAnswer.trim().toLowerCase() ===
            q.correct_answer.trim().toLowerCase();

          return (
            <Card key={q.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <CardTitle className="text-base">
                    {idx + 1}. {q.question}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant={isCorrect ? "default" : "destructive"}>
                    내 답: {userAnswer || "(미응답)"}
                  </Badge>
                  {!isCorrect && (
                    <Badge variant="outline">정답: {q.correct_answer}</Badge>
                  )}
                </div>
                {q.explanation && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {q.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
