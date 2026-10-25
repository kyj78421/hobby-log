-- 취미 북마크 (중급 과제: 북마크 + 카테고리별 북마크 통계). 관심 취미(user_hobbies)와는 별도 목적.
-- 세부 취미 단위로 북마크하고, 대분류별 통계는 hobbies.category_id 조인으로 집계한다.
create table public.hobby_bookmarks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  hobby_id smallint not null references public.hobbies (id),
  created_at timestamptz not null default now(),
  primary key (user_id, hobby_id)  -- 중복 북마크 방지
);

alter table public.hobby_bookmarks enable row level security;

create policy "본인 북마크 조회" on public.hobby_bookmarks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "본인 북마크 추가" on public.hobby_bookmarks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 북마크 삭제" on public.hobby_bookmarks
  for delete to authenticated using ((select auth.uid()) = user_id);
