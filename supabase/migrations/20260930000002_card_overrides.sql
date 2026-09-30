-- 원문 텍스트가 깨져 있거나 패치로 선술집 등급이 바뀐 경우 등,
-- 자동으로 받아온 bg_cards 값을 내가 직접 고칠 수 있게 하는 오버라이드 테이블.
-- 카드 데이터 갱신(/api/refresh-cards)이 bg_cards를 통째로 교체해도
-- 이 값은 별도 테이블이라 유지된다.
create table public.card_overrides (
  card_id text primary key,
  tech_level integer,
  card_text text,
  updated_at timestamptz not null default now()
);

create trigger card_overrides_set_updated_at
  before update on public.card_overrides
  for each row execute function public.set_updated_at();

alter table public.card_overrides enable row level security;

create policy "card_overrides_select_all"
  on public.card_overrides for select
  using (true);

create policy "card_overrides_insert_auth"
  on public.card_overrides for insert
  with check (auth.role() = 'authenticated');

create policy "card_overrides_update_auth"
  on public.card_overrides for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "card_overrides_delete_auth"
  on public.card_overrides for delete
  using (auth.role() = 'authenticated');
