"use client";

import { useMemo } from "react";
import { PLAN_LIMITS } from "@/lib/constants";
import type { UserProfile } from "@/types/user";

export function useQuizLimit(profile: UserProfile | null) {
  return useMemo(() => {
    if (!profile) {
      return {
        canGenerate: false,
        remaining: 0,
        maxQuestions: PLAN_LIMITS.free.max_questions,
        limit: PLAN_LIMITS.free.daily_quiz_limit,
      };
    }

    const limits = PLAN_LIMITS[profile.plan];
    const remaining =
      limits.daily_quiz_limit === Infinity
        ? Infinity
        : Math.max(0, limits.daily_quiz_limit - profile.quiz_count_today);

    return {
      canGenerate: remaining > 0,
      remaining,
      maxQuestions: limits.max_questions,
      limit: limits.daily_quiz_limit,
    };
  }, [profile]);
}
