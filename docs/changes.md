# HOBBY LOG — Backlog & Change Log

> 기준: `prd.md` · `ia.md` · `usecase.md` · `design.md` (수정 없음) / 구현 상태: `PROGRESS.md` + git log 대조 (코드 직접 검증 안 함)
> 작성: 2026-10-25

**Scope**: 개선 = 정의된 기능의 수정 · 확장 = 문서상 Future/P2 항목의 구체화 · 기존 = 문서 정의 그대로 미구현
**Priority**: P0/P1/P2 = PRD 정의 · Future = PRD §9 범위 밖 · BL-001~004 Priority는 **제안값**
**Status**: Backlog · 승인 필요 · 보류(Figma 대기) · 미검증 · **확인 필요**(구현 여부 불분명)

---

## 1. Backlog

### A. 신규 개선 요구사항 (10/25 요청)

| ID | Feature | Scope | Priority | Status | Source |
| --- | --- | --- | --- | --- | --- |
| BL-001 | Category Taxonomy 개편: 대·소분류 매핑·분류 체계 정비 (기존 기록·user_hobbies 마이그레이션 영향 검토) | 개선 | P2 | Backlog | 요청 · PRD §4.3② · UC-04 |
| BL-002 | Custom Hobby: 사용자 정의 취미 생성·저장·선택 (BL-001 선행 권장) | 확장 | P2 | Backlog | 요청 · PRD §9 · §8.1 · UC-04 |
| BL-003 | Plant Growth System: 활동 누적 기반 성장 로직 (단계 조건·집계 기준·저장 방식, 미기록 시 패널티 없음) | 확장 | P2 | Backlog | 요청 · design §11 |
| BL-004 | 홈 성장 카드 (design상 "MVP에서는 작은 성장 카드만") | 확장 | 확인 필요 | 확인 필요 | design §11.3 · PRD 기능 목록 없음 · PROGRESS 미기재 |

### B. 기존 문서 Future / P2

| ID | Feature | Scope | Priority | Status | Source |
| --- | --- | --- | --- | --- | --- |
| BL-005 | 활동 통계 (월별 횟수, 카테고리 비중) | 기존 | P2 | Backlog | PRD §4.1 · §9 |
| BL-006 | 키워드 검색 (제목·내용) | 기존 | P2 | Backlog | PRD §4.1 · §9 |
| BL-007 | 사진 다중 첨부 | 기존 | Future | Backlog | PRD §9 |
| BL-008 | 사진 편집 (자르기·회전·필터) | 기존 | Future | Backlog | PRD §9 |
| BL-009 | 즐겨찾기 | 기존 | Future | Backlog | PRD §9 |
| BL-010 | 내보내기 (파일 저장) | 기존 | Future | Backlog | PRD §9 |
| BL-011 | 직접 그리기 | 기존 | Future | Backlog | PRD §8.1 · §9 |
| BL-012 | AI 추천 · 소셜 · 유료 결제 (장기 검토) | 기존 | Future | Backlog | PRD §9 |
| BL-013 | 기록 상세 이전/다음 이동 | 기존 | Future | Backlog | design §8.8 |
| BL-014 | 온보딩 취미 검색 | 기존 | Future | Backlog | design §8.4 |

### C. 공개 전 점검

| ID | Feature | Scope | Priority | Status | Source |
| --- | --- | --- | --- | --- | --- |
| BL-015 | 약관 동의 · 개인정보 처리방침 | 기존 | P2 | Backlog | PRD §8.2 · UC-02 · design §8.3 · PROGRESS(약관 미구현) |
| BL-016 | 계정 탈퇴 · 전체 데이터 삭제 (마이페이지 위험 영역) | 기존 | P2 | 확인 필요 | PRD §8.2 · design §8.10 · PROGRESS 미기재 |

### D. 제출 준비 (P0 잔여)

| ID | Feature | Scope | Priority | Status | Source |
| --- | --- | --- | --- | --- | --- |
| BL-017 | GitHub 저장소 생성 · 푸시 | 기존 | P0 | 승인 필요 | PROGRESS 다음 작업 1 · PRD §10.3 · CLAUDE.md |
| BL-018 | Vercel 배포 · 환경변수 2개 · Supabase Redirect URL · 배포 URL 핵심 기능 확인 | 기존 | P0 | 승인 필요 | PROGRESS 다음 작업 1 · PRD §10.3 · CLAUDE.md |
| BL-019 | 제출용 README | 기존 | P0 | 확인 필요 | PROGRESS 다음 작업 2 (미갱신) · git `7257c95 docs: 제출용 README` |
| BL-020 | 가입 확인 메일 → `/auth/callback` 수동 1회 확인 | 기존 | P0 | 미검증 | PROGRESS 구현했으나 미검증 |

### E. UI · 품질 잔여

| ID | Feature | Scope | Priority | Status | Source |
| --- | --- | --- | --- | --- | --- |
| BL-021 | App Shell 반응형 (사이드바 · 모바일 하단 탭 · Floating CTA, 375px 헤더 링크 줄바꿈) | 기존 | P1 | 보류(Figma 대기) | design §7 · PROGRESS 알려진 사항 |
| BL-022 | 아카이브 썸네일 비율 통일 · 사진 없음 placeholder | 기존 | P1 | 보류(Figma 대기) | design §6.2 · PROGRESS 알려진 사항 |
| BL-023 | 캘린더 키보드 방향키 이동 | 기존 | P1 | 보류(Figma 대기) | design §6.7 · §12 · PROGRESS 알려진 사항 |
| BL-024 | 폰트 적용 (Pretendard · Noto Serif KR · tabular-nums) | 기존 | P1 | Backlog | design §4 · PROGRESS(Pretendard 미적용) |
| BL-025 | 320px 폭 검증 | 기존 | P1 | 미검증 | design §10 · PROGRESS (375px만 통과) |
| BL-026 | 아카이브 '오래된순' 정렬 UI 동작 확인 | 기존 | P0 | 확인 필요 | UC-06 · PROGRESS 알려진 사항 |
| BL-027 | 삭제 확인창 '취소' 버튼 동작 재확인 | 기존 | P0 | 확인 필요 | UC-09 · PROGRESS 완료 항목 비고 |
| BL-028 | 대시보드 P1 확장 (이번 달 활동 횟수 · 캘린더 미리보기) | 기존 | P1 | 확인 필요 | PRD §4.3⑤ · IA · UC-10 · PROGRESS 홈 항목에 미기재 |
| BL-029 | UC 예외 처리 세부 (중복 제출 방지 · 실패 시 입력 유지 · 세션 만료 안내 · 404 · 비밀번호 표시 토글) | 기존 | P0 | 확인 필요 | UC-01/02/05 · PROGRESS 미기재 |
| BL-030 | Design Guide 세부 (Toast · Skeleton · Empty 일러스트 · 수정 이탈 확인 · 작성 2단계/미리보기 · 캘린더 +N 점 · reduced-motion · 사진 alt · 삭제 Undo) | 기존 | P1 | 확인 필요 | design §6 · §8 · §9 · §12 · PROGRESS 미기재 |

---

## 2. 제외 (구현 완료 — PROGRESS 검증 기준)

인증(가입·로그인·로그아웃·접근 제어) · 기록 CRUD · 카테고리 9/세부 33 시드 · 아카이브 필터 · 감정·만족도 · 사진 1장(Storage) · 캘린더 · 관심 취미(온보딩) · 홈 기본 · 마이페이지 · RLS

## 3. 문서 간 불일치 (문서 수정 안 함)

- **인증**: PRD §7 NextAuth ↔ 구현 Supabase Auth 단독 (CLAUDE.md 결정, PRD 표기 유지)
- **BL-002**: PRD §8.1 "커스텀 카테고리 초기 범위 제외" · UC-04 "직접 생성 불가" → 착수 시 PRD/UC 개정 필요
- **BL-004**: design §11.3 "MVP 성장 카드" ↔ PRD §4.2 기능 목록에 없음

---

## 4. Change Log

| Date | ID | Change | Status |
| --- | --- | --- | --- |
| 2026-10-25 | — | `docs/changes.md` 신설 (Backlog 30건, 문서 4종 + PROGRESS 대조) | Done (문서) |
| 2026-10-25 | BL-001~003 | 신규 개선 요구사항 3건 Backlog 등록 (구현·설계 미착수) | Registered |
| 2026-10-25 | BL-004 | design §11.3 성장 카드 구현 여부 확인 필요 항목 등록 | Registered |
| 2026-10-25 | BL-005~016 | PRD §9 · design Future/P2 항목 등록 | Registered |
| 2026-10-25 | BL-017~030 | PROGRESS 잔여 · 미검증 · 확인 필요 항목 등록 | Registered |
