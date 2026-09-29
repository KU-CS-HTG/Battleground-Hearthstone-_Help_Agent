-- 데이터 빌드 번호 / 마지막 갱신 시각 등 전역 상태 저장용 키-값 테이블
create table public.app_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger app_meta_set_updated_at
  before update on public.app_meta
  for each row execute function public.set_updated_at();

alter table public.app_meta enable row level security;

create policy "app_meta_select_all"
  on public.app_meta for select
  using (true);

-- insert/update/delete 정책 없음: 카드 갱신 서버리스 함수가 서비스 롤 키로만 기록
