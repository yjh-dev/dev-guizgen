import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="px-4 py-20 text-center">
      <h2 className="mb-4 text-3xl font-bold">
        지금 바로 시작하세요
      </h2>
      <p className="mb-8 text-lg text-muted-foreground">
        무료로 가입하고 AI 퀴즈를 생성해보세요
      </p>
      <Button asChild size="lg">
        <Link href="/signup">
          무료로 시작하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
