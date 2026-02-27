import QuizForm from "@/components/quiz/QuizForm";

export default function NewQuizPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">퀴즈 생성</h1>
        <p className="text-muted-foreground">
          텍스트를 입력하면 AI가 자동으로 퀴즈를 생성합니다
        </p>
      </div>
      <QuizForm />
    </div>
  );
}
