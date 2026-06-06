# Lapis Nexus — Frontend

Next.js 16 (App Router, TypeScript) 기반 프론트엔드.
백엔드: `../backend` | 라이브 서비스: **[https://lapis.nexus](https://lapis.nexus)**

---

## 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 `law-frontend/` 루트에 생성합니다.

```env
# 백엔드 API 주소
NEXT_PUBLIC_API_BASE=http://localhost:8000

# 로컬 테스트 시 Clerk 인증 우회 (백엔드도 DEV_MODE=true 필요)
NEXT_PUBLIC_DEV_MODE=true

# Clerk 로컬 개발용 테스트 키 (localhost 허용)
# lapis.nexus 배포용 pk_live_* 키는 localhost에서 작동하지 않음
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<pk_test_...>
CLERK_SECRET_KEY=<sk_test_...>
CLERK_ISSUER=<https://...clerk.accounts.dev>
NEXT_PUBLIC_CLERK_FRONTEND_API=<...clerk.accounts.dev>
```

> **주의**: `.env.local`은 `.gitignore`에 포함되어 있습니다. Clerk 테스트 키는 프로젝트 관리자에게 문의하세요.

### 3. 개발 서버 시작

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000) 에서 확인

---

## 페이지 구조

| 경로 | 설명 |
|------|------|
| `/` | 홈 (소개 페이지) |
| `/enter` | 기능 분기 선택 (판례 / 법령 / 전략 / AI 에이전트) |
| `/agent` | AI 에이전트 인터페이스 |
| `/cases` | 판례 분석 |
| `/law` | 법령 탐색 |
| `/strategy` | 전략 콘텐츠 |

---

## AI 에이전트 페이지 (`/agent`)

두 가지 에이전트를 UI에서 직접 실행할 수 있습니다.

**종합 리서치 에이전트** (`POST /api/agent/multi`)
- 판례 DB + ITCL 법령 교차 분석
- 질의만 입력하면 됨

**판례 심층 분석 에이전트** (`POST /api/agent/insight`)
- 특정 판례의 논증 구조 심층 분석
- 질의 + 사건번호 입력

> 백엔드가 `DEV_MODE=true`로 실행 중이면 Clerk JWT 없이도 API 호출 가능합니다.

---

## 환경변수 레퍼런스

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_API_BASE` | 백엔드 FastAPI 서버 주소 |
| `NEXT_PUBLIC_DEV_MODE` | `true`이면 Clerk `getToken()` 호출 스킵 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 (테스트: `pk_test_...`, 프로덕션: `pk_live_...`) |
| `CLERK_SECRET_KEY` | Clerk 시크릿 키 (서버 사이드 전용) |
| `CLERK_ISSUER` | Clerk 인스턴스 URL |

---

## 빌드 / 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm start
```

배포는 Vercel을 사용합니다. `main` 브랜치 푸시 시 자동 배포.
프로덕션 환경변수(Clerk 프로덕션 키 등)는 Vercel 대시보드에서 관리합니다.
