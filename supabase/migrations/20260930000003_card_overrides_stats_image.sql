-- 카드 오버라이드에 공격력/생명력, 대체 이미지 저장 공간 추가.
-- attack/health는 API 데이터에서 못 가져오거나 틀린 경우 직접 입력,
-- image_path는 이미지가 잘못 연결된 카드를 내가 원하는 이미지로 바꿀 때 사용한다.
alter table public.card_overrides
  add column if not exists attack integer,
  add column if not exists health integer,
  add column if not exists image_path text;
