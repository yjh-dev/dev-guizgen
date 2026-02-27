import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-32">
      <div className="flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
        <Brain className="h-4 w-4" />
        AI 기반 퀴즈 자동 생성
      </div>

      <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
        텍스트를 넣으면
        <br />
        <span className="text-primary">AI가 퀴즈를 만듭니다</span>
      </h1>

      <p className="max-w-xl text-lg text-muted-foreground">
        학습 자료, 강의 노트, 교재 내용을 입력하면 AI가 자동으로 객관식, O/X,
        단답형 문제를 생성합니다. 효율적인 학습을 시작하세요.
      </p>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/signup">
            무료로 시작하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/login">로그인</Link>
        </Button>
      </div>
    </section>
  );
}
