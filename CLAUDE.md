@AGENTS.md

# HOBBY LOG 작업 지침

## 새 세션 시작 시
1. 가장 먼저 `PROGRESS.md`를 읽고, "진행 중"과 "다음 작업"부터 이어서 진행한다.
2. `git status`로 커밋되지 않은 변경을 확인한다. 임의로 삭제·되돌리지 않는다.
3. 기획의 기준은 `docs/prd.md`, `docs/ia.md`, `docs/usecase.md`, `docs/design.md`이다. 원칙적으로 수정하지 않고 범위를 확장하지 않는다.

## 개발 원칙
- 기능 하나를 구현 → `npx tsc --noEmit`, `npm run lint`, `npm run build`, 동작 확인 → 통과 후 커밋한다. 검증하지 않은 기능은 완료로 기록하지 않는다.
- 작업 단위가 끝날 때마다 `PROGRESS.md`를 갱신한다.
- 인증은 Supabase Auth 단독(NextAuth 미사용). PRD의 NextAuth 표기는 수정하지 않는다.
- Next.js 16 + Cache Components: 쿠키·세션을 읽는 컴포넌트는 `<Suspense>` 안에 둔다. 코드 작성 전 `node_modules/next/dist/docs/`를 확인한다.
- `.env.local`, 비밀번호, service_role 키, 액세스 토큰은 출력·커밋하지 않는다. `NEXT_PUBLIC_` 값 외에는 클라이언트에 노출하지 않는다.

## 하지 않는 일 (사용자 승인 필요)
- `git push`, Vercel 프로덕션 배포, DB 초기화·운영 데이터 변경, 대량 삭제, 유료 결제, 추가 크레딧 구매·유료 API 전환.
- 사용량 제한에 도달하면 반복 호출하지 말고 `PROGRESS.md`를 갱신한 뒤 대기한다.
