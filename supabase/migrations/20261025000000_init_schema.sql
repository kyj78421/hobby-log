-- HOBBY LOG 초기 스키마: 카테고리·세부 취미(읽기 전용), 활동 기록(본인만 CRUD)

create table public.hobby_categories (
  id smallint primary key generated always as identity,
  name text not null unique,
  sort_order smallint not null
);

create table public.hobbies (
  id smallint primary key generated always as identity,
  category_id smallint not null references public.hobby_categories (id),
  name text not null,
  sort_order smallint not null,
  unique (category_id, name)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  hobby_id smallint not null references public.hobbies (id),
  activity_date date not null,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  content text not null check (char_length(btrim(content)) >= 1),
  emotion text check (emotion in ('excited', 'happy', 'calm', 'proud', 'neutral', 'tired', 'sad', 'frustrated')),
  satisfaction smallint check (satisfaction between 1 and 5),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index activities_user_date_idx on public.activities (user_id, activity_date desc, created_at desc);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger activities_set_updated_at before update on public.activities
for each row execute function public.set_updated_at();

-- RLS
alter table public.hobby_categories enable row level security;
alter table public.hobbies enable row level security;
alter table public.activities enable row level security;

create policy "카테고리는 로그인 회원이 조회" on public.hobby_categories
  for select to authenticated using (true);
create policy "세부 취미는 로그인 회원이 조회" on public.hobbies
  for select to authenticated using (true);

create policy "본인 기록 조회" on public.activities
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "본인 기록 작성" on public.activities
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 기록 수정" on public.activities
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "본인 기록 삭제" on public.activities
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 시드: PRD 4.3 ② 취미 카테고리
insert into public.hobby_categories (name, sort_order) values
  ('스포츠·운동', 1), ('문화·예술', 2), ('창작·공예', 3), ('학습·자기계발', 4),
  ('여행·아웃도어', 5), ('요리·미식', 6), ('게임·엔터테인먼트', 7), ('생활·수집', 8), ('기타', 9);

insert into public.hobbies (category_id, name, sort_order)
select c.id, h.name, h.sort_order
from (values
  ('스포츠·운동', '러닝', 1), ('스포츠·운동', '헬스', 2), ('스포츠·운동', '수영', 3), ('스포츠·운동', '요가', 4), ('스포츠·운동', '구기', 5),
  ('문화·예술', '영화', 1), ('문화·예술', '공연', 2), ('문화·예술', '전시', 3), ('문화·예술', '음악 감상', 4),
  ('창작·공예', '그림', 1), ('창작·공예', '사진', 2), ('창작·공예', '뜨개질', 3), ('창작·공예', '도예', 4), ('창작·공예', 'DIY', 5),
  ('학습·자기계발', '독서', 1), ('학습·자기계발', '외국어', 2), ('학습·자기계발', '프로그래밍', 3), ('학습·자기계발', '글쓰기', 4),
  ('여행·아웃도어', '여행', 1), ('여행·아웃도어', '등산', 2), ('여행·아웃도어', '캠핑', 3), ('여행·아웃도어', '낚시', 4),
  ('요리·미식', '요리', 1), ('요리·미식', '베이킹', 2), ('요리·미식', '커피', 3), ('요리·미식', '미식 탐방', 4),
  ('게임·엔터테인먼트', '비디오 게임', 1), ('게임·엔터테인먼트', '보드게임', 2), ('게임·엔터테인먼트', '퍼즐', 3),
  ('생활·수집', '원예', 1), ('생활·수집', '수집', 2), ('생활·수집', '반려동물 활동', 3),
  ('기타', '기타', 1)
) as h (category_name, name, sort_order)
join public.hobby_categories c on c.name = h.category_name;
