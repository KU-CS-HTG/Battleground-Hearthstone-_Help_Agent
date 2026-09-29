-- 사용자 정의 카드 그룹 (예: "초반 템포", "나중에 공부")
create table public.card_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.card_groups enable row level security;

create policy "card_groups_select_all"
  on public.card_groups for select
  using (true);

create policy "card_groups_insert_auth"
  on public.card_groups for insert
  with check (auth.role() = 'authenticated');

create policy "card_groups_update_auth"
  on public.card_groups for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "card_groups_delete_auth"
  on public.card_groups for delete
  using (auth.role() = 'authenticated');

-- 라이브러리 안에서의 카드 재배치/그룹 배치 상태.
-- group_id가 null이면 기본 라이브러리 목록 안에서의 순서를 의미한다.
create table public.card_positions (
  card_id text primary key,
  group_id uuid references public.card_groups(id) on delete set null,
  order_index integer not null default 0,
  updated_at timestamptz not null default now()
);

create trigger card_positions_set_updated_at
  before update on public.card_positions
  for each row execute function public.set_updated_at();

alter table public.card_positions enable row level security;

create policy "card_positions_select_all"
  on public.card_positions for select
  using (true);

create policy "card_positions_insert_auth"
  on public.card_positions for insert
  with check (auth.role() = 'authenticated');

create policy "card_positions_update_auth"
  on public.card_positions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "card_positions_delete_auth"
  on public.card_positions for delete
  using (auth.role() = 'authenticated');
