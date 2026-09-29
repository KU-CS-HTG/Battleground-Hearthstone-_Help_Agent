-- 조합(덱) 보드
create table public.comps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  races text[] not null default '{}',    -- 종족 태그 (복수 선택, 없음 허용)
  buildups jsonb not null default '[]',  -- [{ id, title, steps: [{ label, description }] }]
  core_cards text[] not null default '{}',  -- 핵심 기물 카드 id 목록
  final_board jsonb not null default '[]',  -- 최종 조합, 최대 7칸: [cardId | null, ...]
  trinkets text[] not null default '{}',    -- 추천 장신구 카드 id 목록
  notes_md text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger comps_set_updated_at
  before update on public.comps
  for each row execute function public.set_updated_at();

alter table public.comps enable row level security;

create policy "comps_select_all"
  on public.comps for select
  using (true);

create policy "comps_insert_auth"
  on public.comps for insert
  with check (auth.role() = 'authenticated');

create policy "comps_update_auth"
  on public.comps for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "comps_delete_auth"
  on public.comps for delete
  using (auth.role() = 'authenticated');
