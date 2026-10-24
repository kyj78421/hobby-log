-- 활동 사진 버킷: 비공개, 5MB, JPG/PNG/WebP. 경로는 {user_id}/{파일명}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('activity-photos', 'activity-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "본인 폴더 사진 조회" on storage.objects
  for select to authenticated
  using (bucket_id = 'activity-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "본인 폴더에 사진 업로드" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'activity-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "본인 폴더 사진 삭제" on storage.objects
  for delete to authenticated
  using (bucket_id = 'activity-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 기록의 photo_path는 반드시 본인 폴더 안의 경로여야 한다.
alter table public.activities
  add constraint activities_photo_path_own_folder
  check (photo_path is null or photo_path like user_id::text || '/%');
