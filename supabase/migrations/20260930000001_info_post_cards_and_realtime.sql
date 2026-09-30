-- 게시글에 첨부된 카드 아이콘 목록 (라이브러리에서 드래그하거나 검색으로 추가)
alter table public.info_posts
  add column if not exists attached_cards text[] not null default '{}';

-- 다른 탭/기기에서 수정 시 실시간으로 반영되도록 Realtime 구독 대상에 추가
alter publication supabase_realtime add table public.info_posts;
alter publication supabase_realtime add table public.info_post_images;
