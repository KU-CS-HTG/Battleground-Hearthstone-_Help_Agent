-- "첨부된 카드"(단순 카드 아이콘 목록)를 "인게임 예시"(7칸 보드 + 마크다운,
-- 여러 개 추가 가능)로 교체한다. 기존 attached_cards 컬럼은 타입이 달라
-- 그대로 재사용할 수 없어 새 컬럼을 추가하고 기존 컬럼은 그대로 둔다.
alter table public.info_posts
  add column if not exists ingame_examples jsonb not null default '[]';
