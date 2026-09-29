-- 기타 정보 게시판
create table public.info_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description_md text not null default '',
  tags text[] not null default '{}',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger info_posts_set_updated_at
  before update on public.info_posts
  for each row execute function public.set_updated_at();

alter table public.info_posts enable row level security;

create policy "info_posts_select_all"
  on public.info_posts for select
  using (true);

create policy "info_posts_insert_auth"
  on public.info_posts for insert
  with check (auth.role() = 'authenticated');

create policy "info_posts_update_auth"
  on public.info_posts for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "info_posts_delete_auth"
  on public.info_posts for delete
  using (auth.role() = 'authenticated');

-- 게시글 이미지 (여러 장, 캡션, 순서)
create table public.info_post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.info_posts(id) on delete cascade,
  storage_path text not null,
  caption text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index info_post_images_post_id_idx on public.info_post_images (post_id);

alter table public.info_post_images enable row level security;

create policy "info_post_images_select_all"
  on public.info_post_images for select
  using (true);

create policy "info_post_images_insert_auth"
  on public.info_post_images for insert
  with check (auth.role() = 'authenticated');

create policy "info_post_images_update_auth"
  on public.info_post_images for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "info_post_images_delete_auth"
  on public.info_post_images for delete
  using (auth.role() = 'authenticated');
