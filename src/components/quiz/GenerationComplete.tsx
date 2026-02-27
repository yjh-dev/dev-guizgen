"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Eye, Play, Plus } from "lucide-react";
import { QUESTION_TYPES } from "@/lib/constants";
import type { GenerationSummary, QuestionType } from "@/types/quiz";

function getTypeLabel(type: QuestionType): string {
  return QUESTION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default function GenerationComplete({
  summary,
  onNewQuiz,
}: {
  summary: GenerationSummary;
  onNewQuiz: () => void;
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            퀴즈가 생성되었습니다!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">{summary.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              총 {summary.total_questions}문제
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.type_distribution).map(([type, count]) => (
              <Badge key={type} variant="secondary">
                {getTypeLabel(type as QuestionType)} {count}문제
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {summary.questions_preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">문제 미리보기</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {summary.questions_preview.map((q, idx) => (
                <AccordionItem key={idx} value={`q-${idx}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-left">
                      <Badge variant="outline" className="shrink-0">
                        {getTypeLabel(q.type)}
                      </Badge>
                      <span className="text-sm">
                        {idx + 1}. {q.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {q.options && q.options.length > 0 ? (
                      <ul className="space-y-1 pl-4">
                        {q.options.map((opt, optIdx) => (
                          <li
                            key={optIdx}
                            className="text-sm text-muted-foreground"
                          >
                            {String.fromCharCode(9312 + optIdx)} {opt}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4">
                        직접 답을 입력하는 문제입니다.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onNewQuiz} className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          새 퀴즈 만들기
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/quiz/${summary.quiz_id}`)}
          className="flex-1"
        >
          <Eye className="mr-2 h-4 w-4" />
          상세 보기
        </Button>
        <Button
          onClick={() => router.push(`/quiz/${summary.quiz_id}/take`)}
          className="flex-1"
        >
          <Play className="mr-2 h-4 w-4" />
          바로 풀기
        </Button>
      </div>
    </div>
  );
}
