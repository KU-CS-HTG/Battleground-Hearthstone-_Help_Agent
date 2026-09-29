-- API 데이터에 없는 카드를 수동으로 추가하기 위한 테이블
create table public.custom_cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('minion', 'spell', 'trinket')),
  tier integer,          -- 하수인/선술집 주문: 선술집 등급(1~7), 장신구: 1(약소)/2(중요) 등 자유 표기
  race text,
  image_path text,       -- Storage 경로 (bg-assets 버킷)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger custom_cards_set_updated_at
  before update on public.custom_cards
  for each row execute function public.set_updated_at();

alter table public.custom_cards enable row level security;

create policy "custom_cards_select_all"
  on public.custom_cards for select
  using (true);

create policy "custom_cards_insert_auth"
  on public.custom_cards for insert
  with check (auth.role() = 'authenticated');

create policy "custom_cards_update_auth"
  on public.custom_cards for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "custom_cards_delete_auth"
  on public.custom_cards for delete
  using (auth.role() = 'authenticated');

-- 카드별 내 활용법 메모. card_id는 bg_cards.id(HearthstoneJSON id) 또는
-- custom_cards.id(uuid, 텍스트로 캐스팅)를 그대로 사용한다. 두 값 공간은
-- 서로 겹치지 않으므로(하나는 HS id 문자열, 하나는 uuid) 별도 구분 컬럼 없이
-- card_id 하나로 참조한다. 카드 데이터를 갱신해도 이 테이블은 그대로 남는다.
create table public.card_notes (
  card_id text primary key,
  note_md text not null default '',
  updated_at timestamptz not null default now()
);

create trigger card_notes_set_updated_at
  before update on public.card_notes
  for each row execute function public.set_updated_at();

alter table public.card_notes enable row level security;

create policy "card_notes_select_all"
  on public.card_notes for select
  using (true);

create policy "card_notes_insert_auth"
  on public.card_notes for insert
  with check (auth.role() = 'authenticated');

create policy "card_notes_update_auth"
  on public.card_notes for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "card_notes_delete_auth"
  on public.card_notes for delete
  using (auth.role() = 'authenticated');
