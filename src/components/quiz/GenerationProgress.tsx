"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import type { GenerationStep } from "@/store/useQuizStore";

interface Step {
  key: GenerationStep;
  label: string;
}

const STEPS: Step[] = [
  { key: "validating", label: "입력 검증 중" },
  { key: "generating", label: "AI 문제 생성 중" },
  { key: "saving", label: "데이터 저장 중" },
];

function getStepStatus(
  stepKey: GenerationStep,
  currentStep: GenerationStep
): "completed" | "active" | "pending" {
  const order: GenerationStep[] = ["validating", "generating", "saving", "completed"];
  const stepIndex = order.indexOf(stepKey);
  const currentIndex = order.indexOf(currentStep);

  if (currentIndex > stepIndex) return "completed";
  if (currentIndex === stepIndex) return "active";
  return "pending";
}

function getProgressValue(step: GenerationStep): number {
  switch (step) {
    case "validating":
      return 15;
    case "generating":
      return 50;
    case "saving":
      return 85;
    case "completed":
      return 100;
    default:
      return 0;
  }
}

export default function GenerationProgress({
  currentStep,
}: {
  currentStep: GenerationStep;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}분 ${s}초` : `${s}초`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          퀴즈 생성 중
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={getProgressValue(currentStep)} className="h-2" />

        <div className="space-y-4">
          {STEPS.map((step) => {
            const status = getStepStatus(step.key, currentStep);
            return (
              <div key={step.key} className="flex items-center gap-3">
                {status === "completed" && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {status === "active" && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {status === "pending" && (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span
                  className={
                    status === "pending"
                      ? "text-muted-foreground"
                      : status === "active"
                        ? "font-medium text-foreground"
                        : "text-foreground"
                  }
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          경과 시간: {formatTime(elapsed)}
        </p>
      </CardContent>
    </Card>
  );
}
