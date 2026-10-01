-- 전장 플레이 가이드 이미지의 가로/세로 크기를 사용자가 직접 조절하고
-- 저장할 수 있도록 컬럼을 추가한다. null이면 원본(기본) 크기로 표시한다.
alter table public.info_post_images
  add column if not exists width integer,
  add column if not exists height integer;
