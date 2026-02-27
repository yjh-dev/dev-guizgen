export type Plan = "free" | "pro";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: Plan;
  quiz_count_today: number;
  quiz_count_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: Plan;
  status: "active" | "cancelled" | "expired";
  payment_key: string | null;
  started_at: string;
  expires_at: string | null;
  created_at: string;
}
