# QuizGen AI - 프로젝트 진행 현황

## 프로젝트 개요

AI 기반 퀴즈 자동 생성 SaaS. 텍스트를 입력하면 GPT-4o-mini가 객관식, O/X, 단답형 문제를 자동 생성합니다.

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1.6 |
| 언어 | TypeScript (strict) | ^5 |
| 스타일 | Tailwind CSS v4 + shadcn/ui (new-york) | ^4 |
| 인증/DB | Supabase (Auth, PostgreSQL, Storage) | ^2.97.0 |
| AI | OpenAI (gpt-4o-mini, JSON mode) | ^6.25.0 |
| 상태관리 | Zustand | ^5.0.11 |
| 다크모드 | next-themes | ^0.4.6 |
| 토스트 | Sonner | ^2.0.7 |
| 아이콘 | Lucide React | ^0.575.0 |
| PDF | pdf-parse v2 | ^2.4.5 |
| 결제 | Toss Payments | Phase 4 예정 |

## 완료된 작업

### 1단계: 프로젝트 생성 및 의존성 설치

- [x] `create-next-app@latest` 로 프로젝트 생성 (TypeScript, Tailwind, App Router, src 디렉토리)
- [x] 핵심 의존성 설치 (`@supabase/supabase-js`, `@supabase/ssr`, `openai`, `zustand`, `next-themes`, `sonner`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `pdf-parse`)
- [x] `shadcn` 초기화 + 17개 UI 컴포넌트 추가 (button, card, input, label, select, textarea, badge, dialog, tabs, avatar, progress, skeleton, separator, dropdown-menu, sonner, accordion, switch)

### 2단계: 설정 파일

- [x] `tsconfig.json` - strict mode, `@/*` path alias
- [x] `postcss.config.mjs` - `@tailwindcss/postcss`
- [x] `next.config.ts` - Supabase 이미지 도메인 설정
- [x] `components.json` - shadcn new-york 스타일, lucide 아이콘
- [x] `.env.local` - Supabase, OpenAI, Toss 키 템플릿
- [x] `globals.css` - oklch 색상 변수, 다크모드, Tailwind v4 설정

### 3단계: 타입 정의

- [x] `src/types/quiz.ts` - Quiz, Question, QuizAttempt, GenerateQuizRequest, GeneratedQuestion
- [x] `src/types/user.ts` - UserProfile, Subscription, Plan
- [x] `src/types/database.ts` - Supabase Database 타입 (Tables, Relationships, Views, Functions, Enums)

### 4단계: 핵심 라이브러리

- [x] `src/lib/utils.ts` - `cn()` 유틸리티 (clsx + tailwind-merge)
- [x] `src/lib/constants.ts` - 플랜 제한 (free: 3회/일 10문제, pro: 무제한 30문제), 문제 유형, 난이도
- [x] `src/lib/supabase/client.ts` - 브라우저 Supabase 클라이언트 (환경변수 가드 포함)
- [x] `src/lib/supabase/server.ts` - 서버 Supabase 클라이언트 (cookies 기반, 환경변수 가드 포함)
- [x] `src/lib/supabase/middleware.ts` - 세션 갱신 + 라우트 보호 (환경변수 미설정 시 스킵)
- [x] `src/lib/openai.ts` - OpenAI 클라이언트 + 퀴즈 생성 시스템 프롬프트 (JSON mode)
- [x] `src/lib/quiz.ts` - 퀴즈 생성 오케스트레이션 (텍스트 8000자 제한)
- [x] `src/lib/pdf-parser.ts` - PDF 텍스트 추출 (pdf-parse v2 API)
- [x] `src/lib/toss.ts` - Toss Payments 결제 확인 스켈레톤

### 5단계: 미들웨어

- [x] `src/middleware.ts` - Supabase 세션 갱신, 미인증시 `/login` 리다이렉트, 인증시 `/dashboard` 리다이렉트

### 6단계: Root 레이아웃 및 테마

- [x] `src/app/layout.tsx` - Geist 폰트, ThemeProvider, Toaster, 한국어 메타데이터/OG
- [x] `src/components/ThemeProvider.tsx` - next-themes 래퍼 (class 기반, system 기본값)

### 7단계: 인증 페이지

- [x] `src/app/(auth)/layout.tsx` - 중앙 정렬 카드 레이아웃
- [x] `src/app/(auth)/login/page.tsx` - 로그인 페이지
- [x] `src/app/(auth)/signup/page.tsx` - 회원가입 페이지
- [x] `src/app/(auth)/callback/route.ts` - OAuth 콜백 핸들러
- [x] `src/components/auth/LoginForm.tsx` - 이메일/비밀번호 로그인 폼
- [x] `src/components/auth/SignupForm.tsx` - 회원가입 폼 (이름, 이메일, 비밀번호)

### 8단계: 대시보드 레이아웃

- [x] `src/app/(dashboard)/layout.tsx` - Header + Sidebar + main 영역
- [x] `src/components/layout/Header.tsx` - 로고 (Brain 아이콘), 테마 토글, UserMenu
- [x] `src/components/layout/Sidebar.tsx` - 네비게이션 (대시보드, 퀴즈 생성, 풀이 기록, 설정)
- [x] `src/components/layout/UserMenu.tsx` - 아바타 + 드롭다운 (프로필, 설정, 로그아웃)

### 9단계: 대시보드 메인

- [x] `src/app/(dashboard)/dashboard/page.tsx` - 통계 카드 (총 퀴즈, 오늘 생성, 남은 횟수) + 최근 퀴즈 목록
- [x] `src/components/quiz/QuizCard.tsx` - 퀴즈 목록 카드 (제목, 난이도 배지, 문제 수, 날짜)

### 10단계: 퀴즈 생성

- [x] `src/app/(dashboard)/quiz/new/page.tsx` - 퀴즈 생성 페이지
- [x] `src/components/quiz/QuizForm.tsx` - 텍스트 입력, 제목, 문제 수/유형/난이도 선택, 생성 버튼
- [x] `src/store/useQuizStore.ts` - Zustand 퀴즈 생성 상태 관리
- [x] `src/hooks/useUser.ts` - 사용자 인증/프로필 훅
- [x] `src/hooks/useQuizLimit.ts` - 플랜별 생성 제한 계산 훅
- [x] `src/app/api/quiz/generate/route.ts` - API 라우트 (인증 -> 제한 확인 -> OpenAI 생성 -> DB 저장)

### 11단계: 퀴즈 상세/풀기

- [x] `src/app/(dashboard)/quiz/[id]/page.tsx` - 퀴즈 상세 (소유자용, 문제 목록, 정답 표시)
- [x] `src/app/quiz/[id]/take/page.tsx` - 퀴즈 풀기 (공개 퀴즈)
- [x] `src/components/quiz/QuestionDisplay.tsx` - 문제 렌더링 (객관식/OX/단답형)
- [x] `src/components/quiz/QuizTaker.tsx` - 인터랙티브 퀴즈 풀기 (진행률, 제출)
- [x] `src/components/quiz/QuizResult.tsx` - 결과 표시 (점수, 정답/오답 비교, 해설)

### 12단계: 기타 페이지

- [x] `src/app/(dashboard)/history/page.tsx` - 풀이 기록 목록
- [x] `src/app/(dashboard)/settings/page.tsx` - 계정 정보 + 요금제 현황
- [x] `src/app/page.tsx` - 랜딩 페이지 (Hero, Features, Pricing, CTA)
- [x] `src/app/global-error.tsx` - 글로벌 에러 페이지

### 13단계: 랜딩 페이지 컴포넌트

- [x] `src/components/landing/Hero.tsx` - 메인 히어로 (CTA 버튼)
- [x] `src/components/landing/Features.tsx` - 기능 소개 4개 카드
- [x] `src/components/landing/Pricing.tsx` - Free vs Pro 요금제 비교
- [x] `src/components/landing/CTA.tsx` - 하단 CTA 섹션

### 14단계: DB 스키마

- [x] `supabase/schema.sql` - 전체 스키마 (5개 테이블, RLS, 트리거, Storage 버킷)
  - `users` - 프로필 (plan, quiz_count_today, quiz_count_reset_at)
  - `quizzes` - 퀴즈 (title, source_type, source_text, difficulty, is_public)
  - `questions` - 문제 (type, options, correct_answer, explanation, order_index)
  - `quiz_attempts` - 풀이 기록 (score, total_questions, answers)
  - `subscriptions` - 구독 (plan, status, payment_key, expires_at)
  - 인덱스 7개, RLS 정책 8개, 트리거 3개 (auto-create user, auto-update updated_at)
  - Storage 버킷 `quiz-pdfs` + 업로드/조회 정책

### 빌드 검증

- [x] `npm run build` 성공 (TypeScript 컴파일 + 정적 생성)
- [x] 12개 라우트 생성 확인 (정적 6 + 동적 6)

### 버그 수정

- [x] Supabase 환경변수 미설정 시 미들웨어 크래시 방지 (가드 추가)

## 디렉토리 구조

```
dev_quizgen/
├── .env.local                    # 환경변수 (Supabase, OpenAI, Toss)
├── components.json               # shadcn/ui 설정
├── next.config.ts                # Next.js 설정
├── postcss.config.mjs            # Tailwind v4 PostCSS
├── tsconfig.json                 # TypeScript strict
├── supabase/
│   └── schema.sql                # DB 스키마 (SQL Editor에서 실행)
└── src/
    ├── middleware.ts              # 라우트 보호
    ├── app/
    │   ├── layout.tsx            # Root 레이아웃 (Geist, ThemeProvider, Toaster)
    │   ├── page.tsx              # 랜딩 페이지
    │   ├── globals.css           # Tailwind v4 + oklch 테마
    │   ├── global-error.tsx      # 글로벌 에러
    │   ├── (auth)/               # 인증 (로그인, 회원가입, 콜백)
    │   ├── (dashboard)/          # 대시보드 (메인, 퀴즈 생성/상세, 기록, 설정)
    │   ├── quiz/[id]/take/       # 공개 퀴즈 풀기
    │   └── api/quiz/generate/    # 퀴즈 생성 API
    ├── components/
    │   ├── ui/                   # shadcn 컴포넌트 17개
    │   ├── auth/                 # LoginForm, SignupForm
    │   ├── layout/               # Header, Sidebar, UserMenu
    │   ├── quiz/                 # QuizForm, QuizCard, QuestionDisplay, QuizTaker, QuizResult
    │   ├── landing/              # Hero, Features, Pricing, CTA
    │   └── ThemeProvider.tsx
    ├── lib/
    │   ├── supabase/             # client.ts, server.ts, middleware.ts
    │   ├── openai.ts             # GPT-4o-mini 퀴즈 생성
    │   ├── quiz.ts               # 생성 오케스트레이션
    │   ├── constants.ts          # 플랜 제한, 옵션
    │   ├── utils.ts              # cn()
    │   ├── pdf-parser.ts         # PDF 추출 (Phase 3)
    │   └── toss.ts               # 결제 (Phase 4)
    ├── store/
    │   └── useQuizStore.ts       # Zustand 퀴즈 폼 상태
    ├── hooks/
    │   ├── useUser.ts            # 사용자 인증/프로필
    │   └── useQuizLimit.ts       # 생성 제한 계산
    └── types/
        ├── quiz.ts               # Quiz, Question, QuizAttempt
        ├── user.ts               # UserProfile, Subscription
        └── database.ts           # Supabase Database 타입
```

## 라우트 맵

| 경로 | 타입 | 설명 |
|------|------|------|
| `/` | 정적 | 랜딩 페이지 |
| `/login` | 정적 | 로그인 |
| `/signup` | 정적 | 회원가입 |
| `/callback` | 동적 | OAuth 콜백 |
| `/dashboard` | 동적 | 대시보드 메인 |
| `/quiz/new` | 정적 | 퀴즈 생성 폼 |
| `/quiz/[id]` | 동적 | 퀴즈 상세 (소유자) |
| `/quiz/[id]/take` | 동적 | 퀴즈 풀기 (공개) |
| `/history` | 동적 | 풀이 기록 |
| `/settings` | 동적 | 계정 설정 |
| `/api/quiz/generate` | API | 퀴즈 생성 (POST) |

## Free vs Pro 기능 차등

| 기능 | Free | Pro |
|------|------|-----|
| 일일 퀴즈 생성 | 3회 | 무제한 |
| 최대 문제 수 | 10문제 | 30문제 |
| PDF 업로드 | X | O |
| 퀴즈 내보내기 | X | O |
| 퀴즈 공유 | X | O |

## 다음 단계 (TODO)

### 즉시 필요

1. `.env.local`에 실제 키 설정
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   OPENAI_API_KEY=sk-...
   ```
2. Supabase SQL Editor에서 `supabase/schema.sql` 실행
3. Supabase Authentication 에서 Email 제공자 활성화

### Phase 2: 기능 고도화

- [ ] 퀴즈 공유 토글 (is_public 변경 API)
- [ ] 퀴즈 삭제 기능
- [ ] 프로필 수정 (이름, 비밀번호 변경)
- [ ] 모바일 반응형 Sidebar (햄버거 메뉴)
- [ ] 퀴즈 검색/필터링

### Phase 3: PDF 업로드

- [ ] PDF 파일 업로드 UI (QuizForm에 파일 드롭존)
- [ ] Supabase Storage에 PDF 저장
- [ ] `pdf-parser.ts` 활용하여 텍스트 추출 후 퀴즈 생성

### Phase 4: 결제 (Toss Payments)

- [ ] 결제 페이지 UI
- [ ] Toss Payments 위젯 연동
- [ ] `/api/webhooks/toss` 웹훅 라우트
- [ ] 구독 상태 관리 (subscriptions 테이블)
- [ ] Pro 플랜 업그레이드/다운그레이드

### Phase 5: 추가 기능

- [ ] 퀴즈 내보내기 (PDF, CSV)
- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 통계 대시보드 (차트)
- [ ] URL 소스 지원 (웹 페이지 크롤링)
