-- 카테고리 구조 개편 + 사용자 지정 취미.
-- 원칙: 기존 취미 행(ID)은 삭제하지 않고 이름·분류만 갱신한다. 기록·북마크·관심 취미의 참조는 그대로 유지된다.
-- 여러 번 실행해도 같은 결과가 되도록 작성했다(재실행 안전).

-- 1) hobbies: 개인 취미 소유자, 보관 시각
alter table public.hobbies add column if not exists owner_id uuid references auth.users (id) on delete cascade;
alter table public.hobbies add column if not exists archived_at timestamptz;

-- (category_id, name) 유일 제약은 개인 취미가 같은 이름을 쓸 수 있도록 범위별 유일 인덱스로 교체한다.
alter table public.hobbies drop constraint if exists hobbies_category_id_name_key;
create unique index if not exists hobbies_default_name_key on public.hobbies (name) where owner_id is null;
create unique index if not exists hobbies_owner_name_key on public.hobbies (owner_id, name) where owner_id is not null;
create index if not exists hobbies_owner_idx on public.hobbies (owner_id) where owner_id is not null;

-- 2) 취미 ↔ 대분류 연결 (한 취미를 여러 대분류에서 탐색). hobbies.category_id는 대표 분류로 유지한다.
create table if not exists public.hobby_category_links (
  hobby_id smallint not null references public.hobbies (id) on delete cascade,
  category_id smallint not null references public.hobby_categories (id),
  sort_order smallint not null default 0,
  primary key (hobby_id, category_id)
);
create index if not exists hobby_category_links_category_idx on public.hobby_category_links (category_id, sort_order);
alter table public.hobby_category_links enable row level security;

-- 3) 대분류 이름·순서 (ID 1~9 유지)
update public.hobby_categories c
set name = v.name, sort_order = v.ord
from (values
  (1::smallint, '운동 · 스포츠', 1::smallint),
  (5::smallint, '여행 · 아웃도어', 2::smallint),
  (2::smallint, '문화 · 예술', 3::smallint),
  (3::smallint, '창작 · 공예', 4::smallint),
  (6::smallint, '맛집 · 카페', 5::smallint),
  (7::smallint, '게임 · 놀이', 6::smallint),
  (4::smallint, '학습 · 성장', 7::smallint),
  (8::smallint, '일상 · 힐링', 8::smallint),
  (9::smallint, '데이트', 9::smallint)
) as v (id, name, ord)
where c.id = v.id;

-- 4) 기존 취미: 이름 변경·분류 이동 (ID 유지). 기본 취미(owner_id is null)만 대상.
update public.hobbies h
set name = m.new_name, category_id = m.category_id
from (values
  ('헬스', '헬스 · 웨이트', 1::smallint),
  ('구기', '구기 스포츠', 1::smallint),
  ('공연', '콘서트 · 공연', 2::smallint),
  ('전시', '전시회', 2::smallint),
  ('독서', '독서', 2::smallint),
  ('그림', '그림 · 드로잉', 3::smallint),
  ('사진', '사진 촬영', 3::smallint),
  ('DIY', 'DIY · 만들기', 3::smallint),
  ('글쓰기', '글쓰기', 3::smallint),
  ('외국어', '외국어 학습', 4::smallint),
  ('미식 탐방', '맛집 탐방', 6::smallint),
  ('비디오 게임', 'PC · 콘솔 게임', 7::smallint),
  ('원예', '식물 키우기', 8::smallint)
) as m (old_name, new_name, category_id)
where h.owner_id is null and h.name = m.old_name
  and not exists (select 1 from public.hobbies x where x.owner_id is null and x.name = m.new_name and x.id <> h.id);

-- 5) 새 분류 구성 (대분류 id, 순서, 취미명, 대표 분류 여부)
drop table if exists _desired;
create temp table _desired (category_id smallint, ord smallint, name text, is_primary boolean);
insert into _desired (category_id, ord, name, is_primary) values
  (1,1,'러닝',true),(1,2,'헬스 · 웨이트',true),(1,3,'요가',true),(1,4,'필라테스',true),(1,5,'수영',true),
  (1,6,'자전거',true),(1,7,'클라이밍',true),(1,8,'구기 스포츠',true),(1,9,'댄스',true),
  (5,1,'국내여행',true),(5,2,'해외여행',true),(5,3,'등산',true),(5,4,'캠핑',true),(5,5,'피크닉',true),
  (5,6,'산책',true),(5,7,'드라이브',true),(5,8,'낚시',true),
  (2,1,'영화',true),(2,2,'전시회',true),(2,3,'뮤지컬',true),(2,4,'연극',true),(2,5,'콘서트 · 공연',true),
  (2,6,'독서',true),(2,7,'음악 감상',true),(2,8,'페스티벌',true),
  (3,1,'그림 · 드로잉',true),(3,2,'도예',true),(3,3,'뜨개질',true),(3,4,'DIY · 만들기',true),(3,5,'사진 촬영',true),
  (3,6,'영상 제작',true),(3,7,'글쓰기',true),(3,8,'악기 연주',true),
  (6,1,'맛집 탐방',true),(6,2,'카페 탐방',true),(6,3,'디저트 투어',true),(6,4,'베이킹',true),(6,5,'요리',true),
  (6,6,'홈카페',true),(6,7,'티타임 · 차',true),
  (7,1,'모바일 게임',true),(7,2,'PC · 콘솔 게임',true),(7,3,'보드게임',true),(7,4,'방탈출',true),(7,5,'퍼즐',true),
  (7,6,'레고 · 블록',true),(7,7,'노래방',true),
  (4,1,'외국어 학습',true),(4,2,'프로그래밍',true),(4,3,'자격증 공부',true),(4,4,'강의 수강',true),
  (4,5,'체스 · 두뇌 활동',true),(4,6,'스터디 · 독서 모임',true),(4,7,'새로운 기술 배우기',true),
  (8,1,'식물 키우기',true),(8,2,'반려동물 활동',true),(8,3,'명상',true),(8,4,'자기관리',true),
  (8,5,'일기 쓰기',true),(8,6,'쇼핑 · 소품 구경',true),(8,7,'봉사활동',true),
  (9,1,'맛집 데이트',true),(9,2,'카페 데이트',true),(9,3,'영화 데이트',true),(9,4,'전시 · 공연 데이트',true),
  (9,5,'공방 데이트',true),(9,6,'액티비티 데이트',true),(9,7,'여행 · 나들이',true),(9,8,'기념일',true),(9,9,'홈데이트',true),
  -- 여러 대분류에서 탐색되는 취미 (추가 연결)
  (4,100,'독서',false),(5,100,'사진 촬영',false),(3,100,'베이킹',false);

insert into public.hobbies (category_id, name, sort_order)
select d.category_id, d.name, d.ord
from _desired d
where d.is_primary
  and not exists (select 1 from public.hobbies h where h.owner_id is null and h.name = d.name);

update public.hobbies h
set category_id = d.category_id, sort_order = d.ord
from _desired d
where d.is_primary and h.owner_id is null and h.name = d.name
  and (h.category_id <> d.category_id or h.sort_order <> d.ord);

insert into public.hobby_category_links (hobby_id, category_id, sort_order)
select h.id, d.category_id, d.ord
from _desired d
join public.hobbies h on h.owner_id is null and h.name = d.name
on conflict (hobby_id, category_id) do update set sort_order = excluded.sort_order;

drop table _desired;

-- 6) 새 목록에 대응 항목이 없는 기존 취미는 삭제하지 않고 보관 처리한다(새 선택지에서만 숨김).
update public.hobbies set category_id = 8 where owner_id is null and name = '기타' and category_id = 9;
update public.hobbies set archived_at = now()
where owner_id is null and archived_at is null and name in ('여행', '커피', '수집', '기타');

insert into public.hobby_category_links (hobby_id, category_id, sort_order)
select h.id, h.category_id, h.sort_order
from public.hobbies h
where h.owner_id is null and h.name in ('여행', '커피', '수집', '기타')
on conflict (hobby_id, category_id) do nothing;

-- 7) RLS: 기본 취미는 모두 조회, 개인 취미는 본인만 조회·등록·수정·삭제
drop policy if exists "세부 취미는 로그인 회원이 조회" on public.hobbies;
drop policy if exists "세부 취미는 비회원도 조회" on public.hobbies;
drop policy if exists "기본 취미는 비회원도 조회" on public.hobbies;
drop policy if exists "기본·본인 취미 조회" on public.hobbies;
drop policy if exists "본인 취미 등록" on public.hobbies;
drop policy if exists "본인 취미 수정" on public.hobbies;
drop policy if exists "본인 취미 삭제" on public.hobbies;

create policy "기본 취미는 비회원도 조회" on public.hobbies
  for select to anon using (owner_id is null);
create policy "기본·본인 취미 조회" on public.hobbies
  for select to authenticated using (owner_id is null or owner_id = (select auth.uid()));
create policy "본인 취미 등록" on public.hobbies
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "본인 취미 수정" on public.hobbies
  for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "본인 취미 삭제" on public.hobbies
  for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "분류 연결은 비회원도 조회" on public.hobby_category_links;
drop policy if exists "분류 연결 조회" on public.hobby_category_links;
drop policy if exists "본인 취미 분류 연결 등록" on public.hobby_category_links;
drop policy if exists "본인 취미 분류 연결 수정" on public.hobby_category_links;
drop policy if exists "본인 취미 분류 연결 삭제" on public.hobby_category_links;

-- 연결은 연결된 취미가 보일 때만 보인다(hobbies의 RLS가 그대로 적용된다).
create policy "분류 연결은 비회원도 조회" on public.hobby_category_links
  for select to anon using (exists (select 1 from public.hobbies h where h.id = hobby_id));
create policy "분류 연결 조회" on public.hobby_category_links
  for select to authenticated using (exists (select 1 from public.hobbies h where h.id = hobby_id));
create policy "본인 취미 분류 연결 등록" on public.hobby_category_links
  for insert to authenticated
  with check (exists (select 1 from public.hobbies h where h.id = hobby_id and h.owner_id = (select auth.uid())));
create policy "본인 취미 분류 연결 수정" on public.hobby_category_links
  for update to authenticated
  using (exists (select 1 from public.hobbies h where h.id = hobby_id and h.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.hobbies h where h.id = hobby_id and h.owner_id = (select auth.uid())));
create policy "본인 취미 분류 연결 삭제" on public.hobby_category_links
  for delete to authenticated
  using (exists (select 1 from public.hobbies h where h.id = hobby_id and h.owner_id = (select auth.uid())));

grant select on public.hobby_category_links to anon, authenticated;
grant insert, update, delete on public.hobby_category_links to authenticated;

-- 8) 다른 사용자의 개인 취미·보관된 취미를 기록/북마크/관심 취미에 새로 연결하지 못하게 한다.
--    invoker 권한으로 hobbies를 조회하므로 RLS에 보이지 않는(타인의) 취미는 거부된다.
create or replace function public.check_hobby_selectable() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.hobby_id is not distinct from old.hobby_id then
    return new;
  end if;
  if not exists (select 1 from public.hobbies h where h.id = new.hobby_id and h.archived_at is null) then
    raise exception '선택할 수 없는 취미예요.' using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists activities_check_hobby on public.activities;
create trigger activities_check_hobby before insert or update of hobby_id on public.activities
  for each row execute function public.check_hobby_selectable();
drop trigger if exists user_hobbies_check_hobby on public.user_hobbies;
create trigger user_hobbies_check_hobby before insert on public.user_hobbies
  for each row execute function public.check_hobby_selectable();
drop trigger if exists hobby_bookmarks_check_hobby on public.hobby_bookmarks;
create trigger hobby_bookmarks_check_hobby before insert on public.hobby_bookmarks
  for each row execute function public.check_hobby_selectable();

-- 9) 사용자 지정 취미 등록·수정·삭제 (RLS가 그대로 적용되는 invoker 함수)
create or replace function public.create_my_hobby(p_name text, p_category_id smallint) returns smallint
language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_name text := btrim(p_name);
  v_id smallint;
begin
  if v_uid is null then raise exception '로그인이 필요해요.' using errcode = '28000'; end if;
  if char_length(v_name) not between 1 and 30 then
    raise exception '취미 이름은 1~30자로 입력해 주세요.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.hobby_categories where id = p_category_id) then
    raise exception '대분류를 선택해 주세요.' using errcode = '22023';
  end if;
  if exists (select 1 from public.hobbies where owner_id is null and archived_at is null and name = v_name) then
    raise exception '이미 기본 취미에 있는 이름이에요.' using errcode = '23505';
  end if;

  -- 보관해 둔 같은 이름의 내 취미가 있으면 되살린다.
  select id into v_id from public.hobbies where owner_id = v_uid and name = v_name and archived_at is not null;
  if v_id is not null then
    update public.hobbies set archived_at = null, category_id = p_category_id where id = v_id;
  else
    if (select count(*) from public.hobbies where owner_id = v_uid and archived_at is null) >= 50 then
      raise exception '직접 만든 취미는 50개까지 만들 수 있어요.' using errcode = '54000';
    end if;
    insert into public.hobbies (category_id, name, sort_order, owner_id)
    values (p_category_id, v_name, 1000, v_uid) returning id into v_id;
  end if;

  delete from public.hobby_category_links where hobby_id = v_id;
  insert into public.hobby_category_links (hobby_id, category_id, sort_order) values (v_id, p_category_id, 1000);
  return v_id;
end $$;

create or replace function public.update_my_hobby(p_id smallint, p_name text, p_category_id smallint) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_name text := btrim(p_name);
begin
  if v_uid is null then raise exception '로그인이 필요해요.' using errcode = '28000'; end if;
  if char_length(v_name) not between 1 and 30 then
    raise exception '취미 이름은 1~30자로 입력해 주세요.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.hobby_categories where id = p_category_id) then
    raise exception '대분류를 선택해 주세요.' using errcode = '22023';
  end if;
  if exists (select 1 from public.hobbies where owner_id is null and archived_at is null and name = v_name) then
    raise exception '이미 기본 취미에 있는 이름이에요.' using errcode = '23505';
  end if;

  update public.hobbies set name = v_name, category_id = p_category_id
  where id = p_id and owner_id = v_uid and archived_at is null;
  if not found then raise exception '수정할 취미를 찾을 수 없어요.' using errcode = 'P0002'; end if;

  delete from public.hobby_category_links where hobby_id = p_id;
  insert into public.hobby_category_links (hobby_id, category_id, sort_order) values (p_id, p_category_id, 1000);
end $$;

-- 기록이 연결된 취미는 보관 처리(기록은 그대로), 연결된 기록이 없으면 삭제. 'archived' | 'deleted' 반환.
create or replace function public.delete_my_hobby(p_id smallint) returns text
language plpgsql security invoker set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception '로그인이 필요해요.' using errcode = '28000'; end if;
  if not exists (select 1 from public.hobbies where id = p_id and owner_id = v_uid and archived_at is null) then
    raise exception '삭제할 취미를 찾을 수 없어요.' using errcode = 'P0002';
  end if;

  delete from public.user_hobbies where hobby_id = p_id and user_id = v_uid;
  delete from public.hobby_bookmarks where hobby_id = p_id and user_id = v_uid;

  if exists (select 1 from public.activities where hobby_id = p_id and user_id = v_uid) then
    update public.hobbies set archived_at = now() where id = p_id and owner_id = v_uid;
    return 'archived';
  end if;
  delete from public.hobbies where id = p_id and owner_id = v_uid;
  return 'deleted';
end $$;

revoke execute on function public.create_my_hobby(text, smallint) from public, anon;
revoke execute on function public.update_my_hobby(smallint, text, smallint) from public, anon;
revoke execute on function public.delete_my_hobby(smallint) from public, anon;
grant execute on function public.create_my_hobby(text, smallint) to authenticated;
grant execute on function public.update_my_hobby(smallint, text, smallint) to authenticated;
grant execute on function public.delete_my_hobby(smallint) to authenticated;
