export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

interface AttemptWithQuiz {
  id: string;
  quiz_id: string;
  user_id: string | null;
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  completed_at: string;
  created_at: string;
  quizzes: { title: string } | null;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: attemptsData } = await supabase
    .from("quiz_attempts")
    .select("*, quizzes(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const attempts = (attemptsData ?? []) as AttemptWithQuiz[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">풀이 기록</h1>

      {attempts.length > 0 ? (
        <div className="space-y-4">
          {attempts.map((attempt) => {
            const percentage = Math.round(
              (attempt.score / attempt.total_questions) * 100
            );
            return (
              <Card key={attempt.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {attempt.quizzes?.title ?? "퀴즈"}
                    </CardTitle>
                    <Badge
                      variant={percentage >= 80 ? "default" : "secondary"}
                    >
                      {percentage}점
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {attempt.score}/{attempt.total_questions} 정답
                    </span>
                    <span>
                      {new Date(attempt.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">풀이 기록이 없습니다</p>
            <p className="text-sm text-muted-foreground">
              퀴즈를 풀면 여기에 기록이 표시됩니다
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
