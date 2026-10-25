# PROGRESS (새 세션은 이 파일부터 읽는다)

마감: 2026-10-28 제출 (GitHub + Vercel). 기준 문서: docs/prd.md · ia.md · usecase.md · design.md

## 완료 (검증됨)
- 환경: Next 16.4.3, Supabase 패키지 설치, `.env.local` 연결 확인(Auth 설정 API 200)
- 비회원 접근 제어: 보호 경로 → `/login?next=` 리다이렉트 (curl 확인)
- 가입 입력 검증(한국어), 로그인 실패 메시지 (브라우저 확인)
- DB 스키마 적용(카테고리 9·세부 취미 33 시드, activities, RLS 6정책), `node scripts/rls-test.mjs` 16개 통과(타 계정 조회·수정·삭제·사칭 차단)
- 로그인 성공/`next` 이동, 로그인 상태의 /login → /, 로그아웃, 로그아웃 후 보호 경로 차단 (브라우저 확인, 테스트 계정은 SQL로 생성·삭제)
- 기록 CRUD (브라우저 확인): 빈 값 검증, 작성→상세, 수정, 삭제(확인창→삭제→아카이브 안내), 카테고리 필터/빈 상태, 타인 기록 URL·잘못된 ID는 "찾을 수 없어요". 삭제 확인창의 '취소' 버튼은 클릭 확인이 불명확(재확인 필요)
- 수정: 로그인/가입 화면에서 만료·삭제된 세션에 갇히지 않도록 proxy가 getUser로 재확인, Supabase 서버 클라이언트에 `connection()` 추가(Date.now() 프리렌더 경고 제거)
- 홈 대시보드(기록 수·최근 5개·기록하기), 마이페이지(계정·누적 기록·관심 취미 미설정 표시·로그아웃): 375px 폭에서 가로 스크롤 없음, 로그아웃 후 보호 경로 차단 확인
- 감정(8종)·만족도(1~5) 입력/수정(토글 해제)·상세·카드 표시 (브라우저 확인: 저장→상세→수정 폼 값 복원→아카이브 카드)
- 사진 1장(Storage 비공개 버킷, 본인 폴더 RLS): 업로드·표시(서명 URL)·교체(WebP)·삭제·기록 삭제 시 파일 정리, 형식/5MB 오류 메시지, `rls-test.mjs`에 Storage 정책 9개 추가 통과
- 캘린더 `/calendar`: 월 이동·오늘 강조·기록일 점/감정 표시·날짜 선택 시 기록 목록·빈 날짜 → `/activities/new?date=` 미리 채움·잘못된 month/date 무시 (브라우저 확인, 375px 가로 스크롤 없음)
- 관심 취미(온보딩) `/onboarding`: 복수 선택·저장(rpc 트랜잭션)·재방문 시 선택 복원·건너뛰기, 마이페이지 표시/변경 링크, 가입 확인 콜백 → `/onboarding`. `rls-test.mjs`에 user_hobbies 8개 추가 통과
- 운영 설정: CLAUDE.md, `.claude/settings.json`(권한·재시도 워치독)

## 10/25 Figma 반영 (완료·검증)
- 근거: `docs/figma-gap.md` (Figma MCP 한도 초과 → 브라우저로 확인한 범위만 반영, 미확인 화면은 추측하지 않음)
- 구현: 모바일 하단 탭·새 기록 CTA·1024+ 240px 사이드바·현재 위치, 로그아웃 확인창, 대시보드, 카드(4:3), Skeleton, 상태 문구, 성공 토스트, 폼 저장/취소 고정 바·이탈 확인·사진 버튼, 캘린더 방향키, 포커스 링·reduced-motion, Pretendard(CDN), 랜딩 문구, 320px 캘린더 44px 셀
- 브라우저 검증(테스트 계정, 종료 후 삭제): 로그인 후 데스크톱 사이드바·active·대시보드(3열·이번 달 2회), 로그아웃 확인창(초기 포커스 취소·ESC 닫힘), 캘린더 방향키+Enter(23→24→31→30 선택), 아카이브 오래된순·카드 메타, 작성 이탈 확인(변경 없으면 즉시 이동/변경 시 확인창·계속 작성), 저장 토스트, 수정(감정·만족도)·삭제(확인→삭제), 390px 하단 탭·FAB·작성 화면 저장 바, 320px 가로 스크롤 없음·캘린더 셀 44px
- 간접 확인: 삭제 확인창 '취소'(취소 후 같은 버튼으로 다시 열림)
- 미반영/미확인: 홈 캘린더 미리보기, Desktop 시안 대조, 아카이브·가입·마이페이지·온보딩 개별 시안, UI States 12종, 사진 업로드 상태 문구("올리는 중이에요…"·[사진 없이 저장]), 세션 만료 시 원고 복구
- `rls-test.mjs` 전체 통과(테스트 후 데이터 정리 확인)

## 배포 전 검증 (10/25)
- GitHub: `origin/main` = `e06eda9` 푸시 완료 (푸시 전 비밀 재점검 통과: 토큰·키·프로젝트 주소 0건, env 파일은 `.env.example`뿐)
- 설정: `.claude/settings.json`에서 `git push` 전체 차단 → `--force`만 차단, `vercel deploy*` → `--prod`/`--target production`/`promote` 차단으로 조정(Production 차단 유지)
- **Preview 배포 완료**: https://hobby-5gigaz3u0-hajin7.vercel.app (Vercel 프로젝트 `hobby-log`, Production·도메인 변경 없음)
- **Deployment Protection(Vercel 로그인) 활성**: 비로그인 접속은 `vercel.com/sso-api`로 302 → 외부에서 자동 테스트 불가. 프로젝트 보호 설정은 변경하지 않음
- Supabase Auth 설정 조회 403 = 토큰 권한 부족으로 기록(권한 확장 안 함). Redirect URL 등록 여부 미확인
- **수동 조치 필요**: Supabase 대시보드 > Authentication > URL Configuration > Redirect URLs에 `https://hobby-5gigaz3u0-hajin7.vercel.app/**` 추가(Preview 전체는 `https://hobby-*-hajin7.vercel.app/**`). Site URL은 건드리지 않음
- 미검증(Preview 접속 방법 결정 후): 로그인·기록 CRUD·반응형, 가입 이메일 확인 흐름(수동 항목: 가입 → 메일 링크 → `/onboarding`)

## Preview QA (10/25, Claude in Chrome — 사용자 실제 계정으로 로그인된 세션)
- Preview: https://hobby-5gigaz3u0-hajin7.vercel.app (Production 아님). 기존 실제 기록 2건("두개", "아카이브")은 열람만 했고 수정·삭제 없음
- **Pass (서버 렌더링 결과 기준)**: 로그인 세션 유지 대시보드(전체 2회·이번 달 2회), 아카이브(목록 3건·사진 3장 로드·메타 `2026.10.25 · 스포츠 / 운동 / 러닝`·같은 날 최신 우선), 캘린더(10/21 1건·10/25 2건·오늘 표시·선택일 목록), 기록 작성(테스트 기록 저장 → 상세 + "기록을 저장했어요." 토스트, 감정·만족도·사진 표시, Storage 업로드), 기록 수정(제목 변경 DB 반영·폼 값 복원)
- **Fail/보류 (환경 문제로 판정)**: 이 Chrome에서는 클라이언트 hydration이 완료되지 않음 — Suspense 경계 내용이 `div#S:n[hidden]`에 남고 입력 요소에 React 속성이 없음. 같은 Chrome에서 `localhost:3100`도 동일하게 실패, 내장 브라우저에서는 같은 빌드가 정상 hydration → 앱/배포 결함이 아니라 이 Chrome(확장 연결 프로필) 환경 문제로 보임(원인 미확정). 그래서 사진 제거·로그아웃 확인창·삭제·반응형 폭 전환 등 클릭 상호작용은 Preview에서 검증하지 못함
- **사용자 수동 확인 완료(10/25, 사용자 보고)**: 로그아웃, 사진 제거·교체, 캘린더 방향키, 가입 이메일 확인 흐름(가입 → 메일 링크 → `/onboarding`). 세부 결과 수치는 사용자 보고 기준이며 자동 검증은 아님
- **모바일 크기 사용자 수동 확인 완료(10/25, 사용자 보고)**. 자동 확인은 824px만(하단 탭 표시·사이드바 없음·가로 스크롤 없음). 로컬 빌드는 375/320/1024+ 모두 Pass
- Not Tested(Preview): 1024px 이상(사이드바) 폭만 사용자 확인 여부 미보고
- **정리 완료(10/25)**: 사용자가 일반 브라우저에서 테스트 기록을 삭제 → DB 확인: 기록 2건(실제 기록만), Storage 객체 2개, 고아 객체 0, 사용자 1명. 앱의 삭제 흐름(기록 삭제 + 사진 파일 정리)이 Preview에서 정상 동작함(수동 확인)
- Supabase Redirect URL 등록은 사용자 완료. Auth 설정 조회는 토큰 권한 부족(403)으로 확인 불가

## 구현했으나 미검증
- 회원가입 성공 → 확인 메일 → `/auth/callback` (실제 메일 발송이 필요해 자동화 불가. 사용자가 직접 1회 확인)

## 진행 중
- 기능 구현·Figma 반영 완료. 남은 것: 프로덕션 배포(승인 대기)·제출 준비

## 다음 작업 (순서)
1. Vercel 프로덕션 배포·Supabase Redirect URL·배포 URL 검증 (GitHub 푸시와 Vercel 프로젝트·환경변수는 완료. 프로덕션 배포는 승인 대기)
2. 가입 메일 흐름 사용자 1회 확인

## 알려진 사항
- UI 보류(Figma 대기): 375px에서 헤더 링크 줄바꿈, 모바일 하단 탭·사이드바 레이아웃, 캘린더 키보드 방향키, 아카이브 사진 썸네일 비율 등
- 사용자 지침(10/25): Figma 화면설계서 미확정 → UI 시각 디자인은 확정·재작업하지 말고 기능 검증 우선. 화면설계서 도착 후 비교·보완.
- 320px 폭 미검증(375px은 통과), 아카이브 '오래된순' 정렬 UI 동작 미확인
- 인증은 Supabase Auth 단독. Pretendard 폰트 미적용. 약관 동의 미구현(PRD에 약관 없음).
- 사용량 제한: 데스크톱 한도 카드의 "Auto-continue when limits reset" 체크 필요(사용자 클릭)

## 재개 방법
1. `git status`, `git log --oneline` 확인 → 이 문서의 "진행 중"부터 이어서
2. `npm run dev`(포트 3000), 검증: `npx tsc --noEmit && npm run lint && npm run build`

## 테스트 도구
- `node scripts/rls-test.mjs`: 테스트 계정 2개를 SQL로 만들어 RLS 검증 후 삭제. `.env.local`의 `SUPABASE_ACCESS_TOKEN` 필요(커밋 금지).
- `node scripts/sbq.mjs .env.local <sql파일>` : Management API로 SQL 실행.
