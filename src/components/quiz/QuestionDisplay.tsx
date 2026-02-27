"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  multiple_choice: "객관식",
  true_false: "O/X",
  short_answer: "단답형",
};

interface QuestionDisplayProps {
  index: number;
  type: string;
  question: string;
  options: string[] | null;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  disabled?: boolean;
}

export default function QuestionDisplay({
  index,
  type,
  question,
  options,
  selectedAnswer,
  onSelect,
  disabled,
}: QuestionDisplayProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{typeLabels[type]}</Badge>
          <CardTitle className="text-base">
            {index + 1}. {question}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {options ? (
          <div className="space-y-2">
            {options.map((opt, i) => (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(opt)}
                className={cn(
                  "w-full rounded-md border px-4 py-2.5 text-left text-sm transition-colors",
                  selectedAnswer === opt
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-muted"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            placeholder="답을 입력하세요"
            value={selectedAnswer ?? ""}
            onChange={(e) => onSelect(e.target.value)}
            disabled={disabled}
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        )}
      </CardContent>
    </Card>
  );
}
