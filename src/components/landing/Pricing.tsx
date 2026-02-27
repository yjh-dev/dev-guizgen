import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "무료",
    description: "가볍게 시작하기",
    features: [
      { text: "일일 3회 퀴즈 생성", included: true },
      { text: "최대 10문제", included: true },
      { text: "객관식, O/X, 단답형", included: true },
      { text: "PDF 업로드", included: false },
      { text: "퀴즈 공유", included: false },
      { text: "퀴즈 내보내기", included: false },
    ],
    cta: "무료로 시작",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₩9,900/월",
    description: "본격적인 학습을 위해",
    features: [
      { text: "무제한 퀴즈 생성", included: true },
      { text: "최대 30문제", included: true },
      { text: "객관식, O/X, 단답형", included: true },
      { text: "PDF 업로드", included: true },
      { text: "퀴즈 공유", included: true },
      { text: "퀴즈 내보내기", included: true },
    ],
    cta: "Pro 시작하기",
    href: "/signup",
    highlight: true,
  },
];

export default function Pricing() {
  return (
    <section className="bg-muted/50 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-center text-3xl font-bold">요금제</h2>
        <p className="mb-12 text-center text-muted-foreground">
          필요에 맞는 요금제를 선택하세요
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="mt-2 text-3xl font-bold">{plan.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={
                          feature.included ? "" : "text-muted-foreground"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
