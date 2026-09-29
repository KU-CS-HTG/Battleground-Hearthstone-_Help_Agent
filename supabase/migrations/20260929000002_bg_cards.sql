-- HearthstoneJSON에서 동기화한 전장 카드 캐시 (하수인 / 선술집 주문 / 장신구)
-- 쓰기는 항상 서버(서비스 롤 키를 쓰는 Vercel 서버리스 함수)에서만 수행되므로
-- 클라이언트(anon/authenticated)에는 select 정책만 부여한다.

create table public.bg_cards (
  id text primary key,                 -- HearthstoneJSON의 카드 id (예: "BG27_002")
  dbf_id integer not null,
  name text not null,
  kind text not null check (kind in ('minion', 'spell', 'trinket')),
  tech_level integer,                  -- 하수인/선술집 주문의 선술집 등급 (1~7)
  trinket_rank text check (trinket_rank in ('lesser', 'greater')), -- 장신구 등급
  race text,                           -- 주 종족 (Race enum, 예: NAGA, ABERRATION)
  races text[] not null default '{}',  -- 복수 종족 지원 카드
  associated_races text[] not null default '{}', -- battlegroundsAssociatedRaces (주로 장신구)
  cost integer,
  card_text text,
  is_pool boolean not null default false, -- isBattlegroundsPoolMinion/Spell (현재 로테이션 여부, 장신구는 항상 false)
  raw jsonb not null default '{}',     -- 원본 필드 보관 (추후 확장 대비)
  updated_at timestamptz not null default now()
);

create index bg_cards_kind_idx on public.bg_cards (kind);
create index bg_cards_race_idx on public.bg_cards (race);

alter table public.bg_cards enable row level security;

create policy "bg_cards_select_all"
  on public.bg_cards for select
  using (true);

-- insert/update/delete 정책 없음: 서비스 롤 키로만 갱신 (RLS 우회)
