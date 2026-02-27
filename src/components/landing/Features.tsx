import { Sparkles, Zap, Share2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI 자동 생성",
    description: "GPT-4o-mini가 텍스트를 분석하여 다양한 유형의 문제를 자동 생성합니다.",
  },
  {
    icon: Zap,
    title: "빠른 생성",
    description: "텍스트를 붙여넣기만 하면 몇 초 만에 퀴즈가 완성됩니다.",
  },
  {
    icon: FileText,
    title: "다양한 유형",
    description: "객관식, O/X, 단답형 등 다양한 문제 유형을 지원합니다.",
  },
  {
    icon: Share2,
    title: "공유 & 풀기",
    description: "생성된 퀴즈를 공유하고, 다른 사람이 풀 수 있도록 할 수 있습니다.",
  },
];

export default function Features() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          이렇게 사용하세요
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
