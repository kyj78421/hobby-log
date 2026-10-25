# HOBBY LOG

취미 활동을 캘린더와 사진 일기로 기록하는 개인 아카이빙 웹서비스.
"좋아하는 순간을 기록하고, 나만의 취미 역사를 쌓다."

## 주요 기능

- 이메일 회원가입(이메일 확인)·로그인·로그아웃, 비회원 접근 제어
- 취미 기록 작성·상세·수정·삭제 (날짜, 취미 분류/세부 취미, 제목, 내용)
- 아카이브: 카테고리 필터, 날짜 정렬, 빈 상태 안내
- 감정 이모지(8종)·만족도(1~5점)·사진 1장(JPG/PNG/WebP, 5MB 이하)
- 월간 취미 캘린더(날짜별 기록·감정 표시)
- 취미 북마크(`/bookmarks`)와 마이페이지의 대분류별 북마크 통계
- 관심 취미 설정(온보딩/마이페이지), 홈 대시보드, 마이페이지
- 사용자별 데이터 분리 (Supabase Row Level Security)

## 기술 스택

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Auth, Postgres, Storage)

> 인증은 Supabase Auth 하나만 사용합니다. 기획 문서(docs/prd.md)의 NextAuth 표기는 보존했고,
> RLS(`auth.uid()`)와 직접 연동되는 Supabase Auth로 구현했습니다.

## 실행 방법

```bash
npm install
cp .env.example .env.local   # Supabase URL과 Publishable Key 입력
npm run dev                  # http://localhost:3000
```

환경변수

| 이름 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable(anon) 키 — 브라우저에 공개되는 값 |

## 데이터베이스

`supabase/migrations/`의 SQL을 순서대로 Supabase SQL Editor에서 실행합니다.
(스키마·RLS 정책·카테고리 시드, 사진 Storage 버킷, 관심 취미, 취미 북마크)

Supabase 대시보드 Authentication > URL Configuration에 Site URL과 Redirect URLs(`<배포 주소>/**`, `http://localhost:3000/**`)를 등록해야 가입 확인 메일 링크가 동작합니다.

## 문서

기획 문서는 `docs/`에 있습니다 (PRD, IA, 유스케이스, 디자인 가이드).
