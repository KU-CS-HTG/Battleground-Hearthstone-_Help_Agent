-- 조합 구조 개편: "빌드업"(제목+턴별 설명)을 "각 보는 방법"(7칸 보드 + 마크다운,
-- 여러 개 추가 가능)으로 재정의한다. 기존 buildups 컬럼에는 실제 데이터가
-- 없었으므로(테스트용 조합만 존재) 컬럼명만 바꾸고 JSON 모양은 애플리케이션
-- 레벨에서 새로 해석한다.
alter table public.comps rename column buildups to scenarios;

-- 최종 조합/추천 장신구에 마크다운 메모, "플레이 팁"(각 보는 방법과 동일한
-- 구조: 7칸 보드 + 마크다운, 여러 개 추가 가능) 추가.
-- core_cards, notes_md 컬럼은 UI에서 더 이상 쓰지 않지만 기존 데이터 보존을
-- 위해 삭제하지 않는다.
alter table public.comps
  add column if not exists final_board_notes_md text not null default '',
  add column if not exists trinkets_notes_md text not null default '',
  add column if not exists play_tips jsonb not null default '[]';
