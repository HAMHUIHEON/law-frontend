# Lapis Nexus

> 판례를 요약하는 AI가 아닌, 법원의 **논증 구조**를 분석하는 AI

**[https://lapis.nexus](https://lapis.nexus)**

---

## 무엇을 할 수 있나

**판례 분석** — 판결문 PDF를 업로드하면 논증 구조를 자동으로 분해합니다.
사실인정 / 법리 / 판단 / 결론이 어떻게 연결되는지, 법원이 왜 그 결론에 도달했는지를 보여줍니다.

**AI 에이전트** — 자연어로 질의하면 판례 DB와 법령을 교차 분석해 전략 보고서를 생성합니다.
응답 시간 30초 이내.

**법령 탐색** — 국제조세조정에 관한 법률(ITCL) 조문과 쟁점 구조를 탐색합니다.

**전략 콘텐츠** — OECD 가이드라인 기반 실무 판단 지원.

---

## AI 에이전트 직접 써보기

[lapis.nexus/agent](https://lapis.nexus/agent) 에서 바로 실행할 수 있습니다.

**종합 리서치** — 질의만 입력
```
이전가격 과세처분 취소 판례의 주요 판단 기준은?
```

**판례 심층 분석** — 질의 + 사건번호 입력
```
질의: 정상가격 산정 방법 및 비교대상 거래 선정 기준
사건번호: 2009누513
```

결과: 핵심 결론 / 주요 쟁점 / 법원 논리 / 당사자 입장 / 리스크 전망

---

## 기술 스택

Next.js 16 (App Router, TypeScript) — Vercel 배포
백엔드: FastAPI + LangGraph on Railway ([law-backend](https://github.com/HAMHUIHEON/law-backend))

---

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.local` 설정이 필요합니다 — 백엔드 주소, Clerk 테스트 키.
자세한 내용은 백엔드 README 참고.
