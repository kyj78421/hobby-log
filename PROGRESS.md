# PROGRESS (새 세션은 이 파일부터 읽는다)

마감: 2026-10-28 제출 (GitHub + Vercel). 기준 문서: docs/prd.md · ia.md · usecase.md · design.md

## 완료 (검증됨)
- 환경: Next 16.4.3, Supabase 패키지 설치, `.env.local` 연결 확인(Auth 설정 API 200)
- 비회원 접근 제어: 보호 경로 → `/login?next=` 리다이렉트 (curl 확인)
- 가입 입력 검증(한국어), 로그인 실패 메시지 (브라우저 확인)
- 운영 설정: CLAUDE.md, `.claude/settings.json`(권한·재시도 워치독)

## 구현했으나 미검증
- 회원가입 성공 → 확인 메일 → `/auth/callback`, 로그인 성공, 로그아웃, 로그인 상태의 `/login` 리다이렉트
  (실제 계정이 필요. 테스트 계정 생성에 Supabase 액세스 토큰 필요)

## 진행 중
- DB 스키마 적용: `supabase/migrations/20261025000000_init_schema.sql` 작성 완료, **아직 DB에 적용 안 함**

## 다음 작업 (순서)
1. 스키마 적용 + RLS 검증(타 계정 접근 차단)
2. 인증 자동 테스트(테스트 계정 SQL 생성 → 로그인/로그아웃/접근제어 → 삭제)
3. 기록 작성 `/activities/new` → 상세 → 아카이브(필터·정렬) → 수정 → 삭제
4. 홈 대시보드(기본), 마이페이지
5. P1: 감정·만족도 → 사진(Storage) → 캘린더 → 온보딩
6. Vercel 배포·검수 (프로덕션 배포는 사용자 승인)

## 알려진 사항
- 인증은 Supabase Auth 단독. Pretendard 폰트 미적용. 약관 동의 미구현(PRD에 약관 없음).
- 사용량 제한: 데스크톱 한도 카드의 "Auto-continue when limits reset" 체크 필요(사용자 클릭)

## 재개 방법
1. `git status`, `git log --oneline` 확인 → 이 문서의 "진행 중"부터 이어서
2. `npm run dev`(포트 3000), 검증: `npx tsc --noEmit && npm run lint && npm run build`
