"use client";

import { useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { useUser } from "@/hooks/useUser";
import { useQuizLimit } from "@/hooks/useQuizLimit";
import { validateQuizForm, hasValidationErrors } from "@/lib/validation";
import type { ValidationErrors } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/lib/constants";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import GenerationProgress from "./GenerationProgress";
import GenerationComplete from "./GenerationComplete";
import SourceInput from "./SourceInput";

export default function QuizForm() {
  const { profile } = useUser();
  const { canGenerate, remaining, maxQuestions } = useQuizLimit(profile);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const {
    title,
    sourceText,
    sourceType,
    questionCount,
    questionTypes,
    difficulty,
    isGenerating,
    generationStep,
    errorInfo,
    completedData,
    setTitle,
    setSourceText,
    setSourceType,
    setQuestionCount,
    toggleQuestionType,
    setDifficulty,
    setIsGenerating,
    setGenerationStep,
    setErrorInfo,
    setCompletedData,
    reset,
    resetGeneration,
  } = useQuizStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 클라이언트 검증
    const errors = validateQuizForm({ title, sourceText, questionTypes });
    setFieldErrors(errors);
    if (hasValidationErrors(errors)) return;

    if (!canGenerate) {
      setErrorInfo({
        message: "오늘 퀴즈 생성 횟수를 모두 사용했습니다.",
        code: "DAILY_LIMIT_EXCEEDED",
        retryable: false,
      });
      setGenerationStep("error");
      return;
    }

    setIsGenerating(true);
    setErrorInfo(null);
    setCompletedData(null);

    // 단계 시뮬레이션: validating
    setGenerationStep("validating");
    await new Promise((r) => setTimeout(r, 500));

    // 단계: generating
    setGenerationStep("generating");

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          source_text: sourceText.trim(),
          source_type: sourceType,
          question_count: questionCount,
          question_types: questionTypes,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorInfo({
          message: data.error || "퀴즈 생성에 실패했습니다.",
          code: data.code || "UNKNOWN_ERROR",
          retryable: data.retryable ?? true,
        });
        setGenerationStep("error");
        setIsGenerating(false);
        return;
      }

      // 단계: saving
      setGenerationStep("saving");
      await new Promise((r) => setTimeout(r, 600));

      // 완료
      setCompletedData(data);
      setGenerationStep("completed");
    } catch {
      setErrorInfo({
        message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
        code: "UNKNOWN_ERROR",
        retryable: true,
      });
      setGenerationStep("error");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleRetry() {
    resetGeneration();
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent);
  }

  function handleBackToForm() {
    resetGeneration();
    setFieldErrors({});
  }

  function handleNewQuiz() {
    reset();
    setFieldErrors({});
  }

  const filteredCountOptions = QUESTION_COUNT_OPTIONS.filter(
    (n) => n <= maxQuestions
  );

  // 생성 완료 화면
  if (generationStep === "completed" && completedData) {
    return <GenerationComplete summary={completedData} onNewQuiz={handleNewQuiz} />;
  }

  // 생성 진행 중 화면
  if (
    isGenerating &&
    generationStep !== "idle" &&
    generationStep !== "error"
  ) {
    return <GenerationProgress currentStep={generationStep} />;
  }

  // 에러 화면
  if (generationStep === "error" && errorInfo) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              퀴즈 생성 실패
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{errorInfo.message}</p>
            <div className="flex gap-3">
              {errorInfo.retryable && (
                <Button onClick={handleRetry} variant="default">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  다시 시도
                </Button>
              )}
              <Button onClick={handleBackToForm} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                입력 수정
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 기본 폼
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
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
            />
            {fieldErrors.title && (
              <p className="text-sm text-destructive">{fieldErrors.title}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <SourceInput
        sourceType={sourceType}
        sourceText={sourceText}
        onSourceTypeChange={(type) => {
          setSourceType(type);
          setSourceText("");
          if (fieldErrors.sourceText) {
            setFieldErrors((prev) => ({ ...prev, sourceText: undefined }));
          }
        }}
        onSourceTextChange={(text) => {
          setSourceText(text);
          if (fieldErrors.sourceText) {
            setFieldErrors((prev) => ({ ...prev, sourceText: undefined }));
          }
        }}
        error={fieldErrors.sourceText}
      />

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
                    questionTypes.includes(type.value) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    toggleQuestionType(type.value);
                    if (fieldErrors.questionTypes) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        questionTypes: undefined,
                      }));
                    }
                  }}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
            {fieldErrors.questionTypes && (
              <p className="text-sm text-destructive">
                {fieldErrors.questionTypes}
              </p>
            )}
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
          퀴즈 생성
        </Button>
      </div>
    </form>
  );
}
