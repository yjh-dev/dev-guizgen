-- QuizGen AI - Supabase Schema
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. Users (프로필)
-- ============================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  quiz_count_today integer not null default 0,
  quiz_count_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 2. Quizzes
-- ============================================
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  source_type text not null default 'text' check (source_type in ('text', 'pdf', 'url')),
  source_text text,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  is_public boolean not null default false,
  question_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 3. Questions
-- ============================================
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  type text not null check (type in ('multiple_choice', 'true_false', 'short_answer')),
  question text not null,
  options jsonb,
  correct_answer text not null,
  explanation text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- 4. Quiz Attempts (풀이 기록)
-- ============================================
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  score integer not null,
  total_questions integer not null,
  answers jsonb not null default '{}',
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================
-- 5. Subscriptions (구독)
-- ============================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  payment_key text,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- Indexes
-- ============================================
create index if not exists idx_quizzes_user_id on public.quizzes(user_id);
create index if not exists idx_quizzes_created_at on public.quizzes(created_at desc);
create index if not exists idx_quizzes_is_public on public.quizzes(is_public) where is_public = true;
create index if not exists idx_questions_quiz_id on public.questions(quiz_id);
create index if not exists idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index if not exists idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
alter table public.users enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.subscriptions enable row level security;

-- Users: 본인만 조회/수정
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Quizzes: 본인 퀴즈 CRUD + 공개 퀴즈 조회
create policy "Users can manage own quizzes" on public.quizzes
  for all using (auth.uid() = user_id);

create policy "Anyone can view public quizzes" on public.quizzes
  for select using (is_public = true);

-- Questions: 퀴즈 소유자 or 공개 퀴즈의 문제 조회
create policy "Users can manage own quiz questions" on public.questions
  for all using (
    exists (
      select 1 from public.quizzes
      where quizzes.id = questions.quiz_id
      and quizzes.user_id = auth.uid()
    )
  );

create policy "Anyone can view public quiz questions" on public.questions
  for select using (
    exists (
      select 1 from public.quizzes
      where quizzes.id = questions.quiz_id
      and quizzes.is_public = true
    )
  );

-- Quiz Attempts: 본인 기록 조회 + 누구나 기록 생성
create policy "Users can view own attempts" on public.quiz_attempts
  for select using (auth.uid() = user_id);

create policy "Anyone can create attempts" on public.quiz_attempts
  for insert with check (true);

-- Subscriptions: 본인만 조회
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================
-- Triggers
-- ============================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

create or replace trigger quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.update_updated_at();

-- ============================================
-- Storage
-- ============================================
insert into storage.buckets (id, name, public)
values ('quiz-pdfs', 'quiz-pdfs', false)
on conflict (id) do nothing;

create policy "Users can upload PDFs" on storage.objects
  for insert with check (
    bucket_id = 'quiz-pdfs'
    and auth.uid() is not null
  );

create policy "Users can view own PDFs" on storage.objects
  for select using (
    bucket_id = 'quiz-pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
