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
- 운영 설정: CLAUDE.md, `.claude/settings.json`(권한·재시도 워치독)

## 구현했으나 미검증
- 회원가입 성공 → 확인 메일 → `/auth/callback` (실제 메일 발송이 필요해 자동화 불가. 사용자가 직접 1회 확인)

## 진행 중
- P1 사진 첨부(Supabase Storage). P0·감정·만족도는 완료

## 다음 작업 (순서)
1. P1: 사진(Storage) → 캘린더 → 온보딩
2. Vercel 배포·검수 (프로덕션 배포는 사용자 승인)

## 알려진 사항
- 320px 폭 미검증(375px은 통과), 아카이브 '오래된순' 정렬 UI 동작 미확인
- 인증은 Supabase Auth 단독. Pretendard 폰트 미적용. 약관 동의 미구현(PRD에 약관 없음).
- 사용량 제한: 데스크톱 한도 카드의 "Auto-continue when limits reset" 체크 필요(사용자 클릭)

## 재개 방법
1. `git status`, `git log --oneline` 확인 → 이 문서의 "진행 중"부터 이어서
2. `npm run dev`(포트 3000), 검증: `npx tsc --noEmit && npm run lint && npm run build`

## 테스트 도구
- `node scripts/rls-test.mjs`: 테스트 계정 2개를 SQL로 만들어 RLS 검증 후 삭제. `.env.local`의 `SUPABASE_ACCESS_TOKEN` 필요(커밋 금지).
- `node scripts/sbq.mjs .env.local <sql파일>` : Management API로 SQL 실행.
