"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuestionDisplay from "./QuestionDisplay";
import QuizResult from "./QuizResult";
import type { Question } from "@/types/quiz";

interface QuizTakerProps {
  quizId: string;
  quizTitle: string;
  questions: Question[];
}

export default function QuizTaker({
  quizId,
  quizTitle,
  questions,
}: QuizTakerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  function handleSelect(questionId: string, answer: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  async function handleSubmit() {
    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id]?.trim().toLowerCase();
      const correctAnswer = q.correct_answer.trim().toLowerCase();
      if (userAnswer === correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    try {
      await fetch("/api/quiz/generate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quizId,
          score: correct,
          total_questions: questions.length,
          answers,
        }),
      });
    } catch {
      // 기록 저장 실패는 무시
    }
  }

  if (submitted) {
    return (
      <QuizResult
        quizTitle={quizTitle}
        score={score}
        totalQuestions={questions.length}
        questions={questions}
        answers={answers}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            {answeredCount}/{questions.length} 답변 완료
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <QuestionDisplay
            key={q.id}
            index={idx}
            type={q.type}
            question={q.question}
            options={q.options}
            selectedAnswer={answers[q.id] ?? null}
            onSelect={(answer) => handleSelect(q.id, answer)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={answeredCount < questions.length}
        >
          제출하기
        </Button>
      </div>
    </div>
  );
}
