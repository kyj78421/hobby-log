-- 관심 취미 (PRD 4.3 ⑧). 본인 것만 조회·변경.
create table public.user_hobbies (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  hobby_id smallint not null references public.hobbies (id),
  primary key (user_id, hobby_id)
);

alter table public.user_hobbies enable row level security;

create policy "본인 관심 취미 조회" on public.user_hobbies
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "본인 관심 취미 추가" on public.user_hobbies
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 관심 취미 삭제" on public.user_hobbies
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 한 번에 교체(삭제+추가를 한 트랜잭션으로). RLS가 그대로 적용되는 invoker 함수.
create function public.set_my_hobbies(hobby_ids smallint[]) returns void
language sql security invoker set search_path = '' as $$
  delete from public.user_hobbies where user_id = (select auth.uid());
  insert into public.user_hobbies (user_id, hobby_id)
  select (select auth.uid()), h from unnest(hobby_ids) as h;
$$;

revoke execute on function public.set_my_hobbies(smallint[]) from public, anon;
grant execute on function public.set_my_hobbies(smallint[]) to authenticated;
