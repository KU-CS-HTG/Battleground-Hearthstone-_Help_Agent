-- 업로드 이미지용 버킷 1개 (경로는 기능별로 구분: custom-cards/, info-posts/)
insert into storage.buckets (id, name, public)
values ('bg-assets', 'bg-assets', true)
on conflict (id) do nothing;

create policy "bg_assets_select_all"
  on storage.objects for select
  using (bucket_id = 'bg-assets');

create policy "bg_assets_insert_auth"
  on storage.objects for insert
  with check (bucket_id = 'bg-assets' and auth.role() = 'authenticated');

create policy "bg_assets_update_auth"
  on storage.objects for update
  using (bucket_id = 'bg-assets' and auth.role() = 'authenticated')
  with check (bucket_id = 'bg-assets' and auth.role() = 'authenticated');

create policy "bg_assets_delete_auth"
  on storage.objects for delete
  using (bucket_id = 'bg-assets' and auth.role() = 'authenticated');
