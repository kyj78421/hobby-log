-- 비회원도 취미 카테고리·세부 취미 목록을 볼 수 있게 한다 (중급 과제: 비회원 취미 탐색).
-- 읽기 전용 참조 데이터만 공개한다. 쓰기 정책은 없고, 다른 테이블 권한은 바꾸지 않는다.
create policy "카테고리는 비회원도 조회" on public.hobby_categories
  for select to anon using (true);
create policy "세부 취미는 비회원도 조회" on public.hobbies
  for select to anon using (true);
