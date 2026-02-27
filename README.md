# QuizGen AI

AI 기반 퀴즈 자동 생성 서비스. 텍스트, PDF, 웹페이지, 이미지, YouTube 영상에서 학습 퀴즈를 자동 생성합니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, Turbopack)
- **언어**: TypeScript (strict mode)
- **스타일**: Tailwind CSS 4 + shadcn/ui
- **상태관리**: Zustand
- **인증/DB**: Supabase (Auth, PostgreSQL, Storage)
- **AI**: OpenAI GPT-4o-mini (퀴즈 생성, 이미지 OCR)
- **기타**: cheerio (URL 스크래핑), pdf-parse v2 (PDF 텍스트 추출)

## 주요 기능

### 퀴즈 생성
- **5가지 입력 소스**: 텍스트 직접 입력, PDF 업로드, URL 스크래핑, 이미지 OCR, YouTube 자막 추출
- **3가지 문제 유형**: 객관식, O/X, 단답형
- **3단계 난이도**: 쉬움, 보통, 어려움
- **생성 UX**: 단계별 진행 표시, 완료 프리뷰, 인라인 에러 처리

### 퀴즈 풀기
- 인터랙티브 문제 풀이 인터페이스
- 진행률 표시 및 실시간 응답 추적
- 제출 후 점수, 정답/오답, 해설 표시
- 풀이 기록 자동 저장

### 사용자 관리
- 이메일/비밀번호 인증
- Free/Pro 플랜 기반 사용량 제한
- 대시보드 (통계, 최근 퀴즈)
- 풀이 히스토리

## 시작하기

### 환경 변수

`.env.local` 파일에 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 설치 및 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 데이터베이스 설정

Supabase에서 `supabase/schema.sql`을 실행하여 테이블, RLS 정책, 트리거를 생성하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (auth)/             # 인증 (로그인, 회원가입, 콜백)
│   ├── (dashboard)/        # 대시보드, 히스토리, 설정
│   ├── quiz/
│   │   ├── new/            # 퀴즈 생성 폼
│   │   └── [id]/
│   │       ├── page.tsx    # 퀴즈 상세 보기
│   │       └── take/       # 퀴즈 풀기
│   └── api/
│       ├── quiz/generate/  # 퀴즈 생성 API
│       └── extract/        # 텍스트 추출 API
├── components/
│   ├── quiz/               # 퀴즈 관련 컴포넌트
│   │   ├── QuizForm.tsx    # 퀴즈 생성 폼 (통합)
│   │   ├── SourceInput.tsx # 멀티 소스 입력 (탭)
│   │   ├── FileUpload.tsx  # 파일 드래그&드롭
│   │   ├── GenerationProgress.tsx  # 생성 진행 표시
│   │   ├── GenerationComplete.tsx  # 생성 완료 프리뷰
│   │   ├── QuizTaker.tsx   # 퀴즈 풀기
│   │   └── QuizResult.tsx  # 결과 표시
│   └── ui/                 # shadcn/ui 컴포넌트
├── lib/
│   ├── openai.ts           # OpenAI API 연동
│   ├── quiz.ts             # 퀴즈 생성 오케스트레이션
│   ├── validation.ts       # 폼 검증 유틸
│   ├── pdf-parser.ts       # PDF 텍스트 추출
│   ├── url-scraper.ts      # URL 본문 스크래핑
│   ├── image-ocr.ts        # 이미지 OCR (GPT-4o Vision)
│   ├── youtube-transcript.ts # YouTube 자막 추출
│   ├── constants.ts        # 앱 상수
│   └── supabase/           # Supabase 클라이언트
├── store/
│   └── useQuizStore.ts     # Zustand 상태 관리
├── hooks/                  # 커스텀 훅
└── types/                  # TypeScript 타입 정의
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/quiz/generate` | AI 퀴즈 생성 + DB 저장 |
| POST | `/api/extract` | 텍스트 추출 (PDF, URL, 이미지, YouTube) |

## 플랜 제한

| 기능 | Free | Pro |
|------|------|-----|
| 일일 퀴즈 생성 | 3회 | 무제한 |
| 문제 수 제한 | 10개 | 30개 |
| PDF 업로드 | - | O |
| 퀴즈 공유 | - | O |
| 퀴즈 내보내기 | - | O |

---

## 로드맵

### MVP 완성 (우선)

- [ ] **퀴즈 삭제** - DELETE API + 대시보드/상세 페이지에 삭제 버튼
- [ ] **퀴즈 공개/공유** - 공개 토글 API + 공유 링크 생성/복사
- [ ] **모바일 네비게이션** - 반응형 햄버거 메뉴 사이드바
- [ ] **비밀번호 재설정** - 이메일 기반 비밀번호 찾기 플로우

### 사용자 경험 개선

- [ ] **프로필 편집** - 이름, 아바타 변경 (현재 Settings는 읽기 전용)
- [ ] **퀴즈 검색/필터** - 대시보드에서 제목 검색, 난이도/날짜 필터
- [ ] **퀴즈 편집** - 생성된 퀴즈의 제목/문제 수정 기능
- [ ] **소셜 로그인** - Google, Kakao OAuth 연동

### 수익화 (Phase 4)

- [ ] **결제 연동** - 토스페이먼츠 통합 + 웹훅 처리
- [ ] **구독 관리** - 플랜 업/다운그레이드, 결제 내역 조회

### 고급 기능

- [ ] **퀴즈 내보내기** - PDF/CSV 다운로드
- [ ] **학습 분석** - 성적 추이 차트, 약점 영역 분석
- [ ] **퀴즈 복제** - 기존 퀴즈 기반 새 퀴즈 생성
