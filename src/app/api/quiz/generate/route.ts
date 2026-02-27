import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orchestrateQuizGeneration } from "@/lib/quiz";
import { PLAN_LIMITS } from "@/lib/constants";
import type { GenerateQuizRequest } from "@/types/quiz";
import type { Plan } from "@/types/user";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 사용자 프로필 조회
    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = profileData as {
      plan: string;
      quiz_count_today: number;
      quiz_count_reset_at: string;
    } | null;

    if (!profile) {
      return NextResponse.json(
        { error: "사용자 프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const plan = profile.plan as Plan;
    const limits = PLAN_LIMITS[plan];

    // 일일 제한 확인
    const today = new Date().toISOString().split("T")[0];
    const resetDate = profile.quiz_count_reset_at?.split("T")[0];

    let todayCount = profile.quiz_count_today;
    if (resetDate !== today) {
      todayCount = 0;
      await supabase
        .from("users")
        .update({
          quiz_count_today: 0,
          quiz_count_reset_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    if (
      limits.daily_quiz_limit !== Infinity &&
      todayCount >= limits.daily_quiz_limit
    ) {
      return NextResponse.json(
        { error: "오늘 퀴즈 생성 횟수를 모두 사용했습니다." },
        { status: 429 }
      );
    }

    const body: GenerateQuizRequest = await request.json();

    // 문제 수 제한 검증
    if (body.question_count > limits.max_questions) {
      body.question_count = limits.max_questions;
    }

    // AI로 퀴즈 생성
    const generatedQuestions = await orchestrateQuizGeneration(body);

    // DB에 퀴즈 저장
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.id,
        title: body.title,
        source_type: body.source_type,
        source_text: body.source_text,
        difficulty: body.difficulty,
        question_count: generatedQuestions.length,
        is_public: false,
      })
      .select()
      .single();

    const quiz = quizData as { id: string } | null;

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: "퀴즈 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    // 문제 저장
    const questionsToInsert = generatedQuestions.map((q, idx) => ({
      quiz_id: quiz.id,
      type: q.type,
      question: q.question,
      options: q.options as string[] | null,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      order_index: idx,
    }));

    await supabase.from("questions").insert(questionsToInsert);

    // 일일 생성 횟수 증가
    await supabase
      .from("users")
      .update({ quiz_count_today: todayCount + 1 })
      .eq("id", user.id);

    return NextResponse.json({ quiz_id: quiz.id });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "퀴즈 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
