import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orchestrateQuizGeneration } from "@/lib/quiz";
import {
  PLAN_LIMITS,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  SOURCE_TEXT_MIN_LENGTH,
  SOURCE_TEXT_MAX_LENGTH,
} from "@/lib/constants";
import type {
  GenerateQuizRequest,
  QuizErrorCode,
  QuizErrorResponse,
  QuestionType,
  GenerationSummary,
} from "@/types/quiz";
import type { Plan } from "@/types/user";

function errorResponse(
  error: string,
  code: QuizErrorCode,
  retryable: boolean,
  status: number
) {
  return NextResponse.json(
    { error, code, retryable } satisfies QuizErrorResponse,
    { status }
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse(
        "로그인이 필요합니다. 로그인 후 다시 시도해주세요.",
        "AUTH_REQUIRED",
        false,
        401
      );
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
      return errorResponse(
        "사용자 프로필을 찾을 수 없습니다. 다시 로그인해주세요.",
        "PROFILE_NOT_FOUND",
        false,
        404
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
      return errorResponse(
        "오늘의 퀴즈 생성 횟수를 모두 사용했습니다. 내일 다시 시도하거나 Pro 플랜으로 업그레이드해주세요.",
        "DAILY_LIMIT_EXCEEDED",
        false,
        429
      );
    }

    const body: GenerateQuizRequest = await request.json();

    // 서버측 입력 검증
    const trimmedTitle = body.title?.trim();
    const trimmedText = body.source_text?.trim();

    if (
      !trimmedTitle ||
      trimmedTitle.length < TITLE_MIN_LENGTH ||
      trimmedTitle.length > TITLE_MAX_LENGTH
    ) {
      return errorResponse(
        `제목은 ${TITLE_MIN_LENGTH}~${TITLE_MAX_LENGTH}자 사이로 입력해주세요.`,
        "VALIDATION_FAILED",
        false,
        400
      );
    }

    if (
      !trimmedText ||
      trimmedText.length < SOURCE_TEXT_MIN_LENGTH ||
      trimmedText.length > SOURCE_TEXT_MAX_LENGTH
    ) {
      return errorResponse(
        `학습 텍스트는 ${SOURCE_TEXT_MIN_LENGTH}~${SOURCE_TEXT_MAX_LENGTH.toLocaleString()}자 사이로 입력해주세요.`,
        "VALIDATION_FAILED",
        false,
        400
      );
    }

    if (!body.question_types || body.question_types.length === 0) {
      return errorResponse(
        "최소 1개의 문제 유형을 선택해주세요.",
        "VALIDATION_FAILED",
        false,
        400
      );
    }

    // 문제 수 제한 검증
    if (body.question_count > limits.max_questions) {
      body.question_count = limits.max_questions;
    }

    // AI로 퀴즈 생성
    let generatedQuestions;
    try {
      generatedQuestions = await orchestrateQuizGeneration(body);
    } catch {
      return errorResponse(
        "AI 문제 생성에 실패했습니다. 텍스트 내용을 확인하고 다시 시도해주세요.",
        "AI_GENERATION_FAILED",
        true,
        500
      );
    }

    // DB에 퀴즈 저장
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.id,
        title: trimmedTitle,
        source_type: body.source_type,
        source_text: trimmedText,
        difficulty: body.difficulty,
        question_count: generatedQuestions.length,
        is_public: false,
      })
      .select()
      .single();

    const quiz = quizData as { id: string } | null;

    if (quizError || !quiz) {
      return errorResponse(
        "퀴즈 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        "DB_SAVE_FAILED",
        true,
        500
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

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsToInsert);

    if (questionsError) {
      // 퀴즈 레코드 정리
      await supabase.from("quizzes").delete().eq("id", quiz.id);
      return errorResponse(
        "문제 저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        "DB_SAVE_FAILED",
        true,
        500
      );
    }

    // 일일 생성 횟수 증가
    await supabase
      .from("users")
      .update({ quiz_count_today: todayCount + 1 })
      .eq("id", user.id);

    // 유형별 분포 계산
    const typeDistribution = generatedQuestions.reduce(
      (acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      },
      {} as Record<QuestionType, number>
    );

    // summary 응답
    const summary: GenerationSummary = {
      quiz_id: quiz.id,
      title: trimmedTitle,
      total_questions: generatedQuestions.length,
      type_distribution: typeDistribution,
      questions_preview: generatedQuestions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.options,
      })),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Quiz generation error:", error);
    return errorResponse(
      "퀴즈 생성 중 예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      "UNKNOWN_ERROR",
      true,
      500
    );
  }
}
