import { supabase } from './supabaseClient'

export interface CardOverride {
  techLevel: number | null
  cardText: string | null
}

export async function fetchOverrides(): Promise<Map<string, CardOverride>> {
  const map = new Map<string, CardOverride>()
  const { data, error } = await supabase.from('card_overrides').select('card_id,tech_level,card_text')
  // 마이그레이션 전이라 테이블이 없는 경우에도 카드 라이브러리 자체는 정상 동작해야 하므로
  // 오버라이드 조회 실패는 무시하고 빈 맵을 반환한다.
  if (error) return map
  data.forEach((row) => {
    map.set(row.card_id, { techLevel: row.tech_level, cardText: row.card_text })
  })
  return map
}

export async function saveTechLevelOverride(cardId: string, techLevel: number) {
  const { error } = await supabase.from('card_overrides').upsert({ card_id: cardId, tech_level: techLevel })
  if (error) throw error
}

export async function saveTextOverride(cardId: string, cardText: string) {
  const { error } = await supabase.from('card_overrides').upsert({ card_id: cardId, card_text: cardText })
  if (error) throw error
}
