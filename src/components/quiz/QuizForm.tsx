"use client";

import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/useQuizStore";
import { useUser } from "@/hooks/useUser";
import { useQuizLimit } from "@/hooks/useQuizLimit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  QUESTION_TYPES,
  DIFFICULTY_OPTIONS,
  QUESTION_COUNT_OPTIONS,
  SOURCE_TEXT_MAX_LENGTH,
} from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function QuizForm() {
  const router = useRouter();
  const { profile } = useUser();
  const { canGenerate, remaining, maxQuestions } = useQuizLimit(profile);

  const {
    title,
    sourceText,
    questionCount,
    questionTypes,
    difficulty,
    isGenerating,
    setTitle,
    setSourceText,
    setQuestionCount,
    toggleQuestionType,
    setDifficulty,
    setIsGenerating,
    setError,
  } = useQuizStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canGenerate) {
      toast.error("오늘 퀴즈 생성 횟수를 모두 사용했습니다.");
      return;
    }

    if (!sourceText.trim()) {
      toast.error("텍스트를 입력해주세요.");
      return;
    }

    if (!title.trim()) {
      toast.error("퀴즈 제목을 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          source_text: sourceText,
          source_type: "text",
          question_count: questionCount,
          question_types: questionTypes,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "퀴즈 생성에 실패했습니다.");
      }

      toast.success("퀴즈가 생성되었습니다!");
      router.push(`/quiz/${data.quiz_id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "퀴즈 생성에 실패했습니다.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }

  const filteredCountOptions = QUESTION_COUNT_OPTIONS.filter(
    (n) => n <= maxQuestions
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>퀴즈 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">퀴즈 제목</Label>
            <Input
              id="title"
              placeholder="예: 한국사 근현대사 퀴즈"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">학습 텍스트</Label>
            <Textarea
              id="source"
              placeholder="퀴즈를 생성할 텍스트를 입력하세요..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              maxLength={SOURCE_TEXT_MAX_LENGTH}
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              {sourceText.length.toLocaleString()} /{" "}
              {SOURCE_TEXT_MAX_LENGTH.toLocaleString()}자
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>생성 옵션</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>문제 유형</Label>
            <div className="flex flex-wrap gap-2">
              {QUESTION_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={
                    questionTypes.includes(type.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleQuestionType(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>문제 수</Label>
              <Select
                value={String(questionCount)}
                onValueChange={(v) => setQuestionCount(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredCountOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}문제
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>난이도</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          남은 생성 횟수:{" "}
          <span className="font-medium">
            {remaining === Infinity ? "무제한" : `${remaining}회`}
          </span>
        </p>
        <Button type="submit" disabled={isGenerating || !canGenerate} size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            "퀴즈 생성"
          )}
        </Button>
      </div>
    </form>
  );
}
