import { supabase } from './supabaseClient'

export interface CompRef {
  id: string
  name: string
}

/** 카드가 핵심 기물/최종 조합/추천 장신구 중 어디에든 쓰인 조합 목록. */
export async function fetchCompsUsingCard(cardId: string): Promise<CompRef[]> {
  const { data, error } = await supabase.from('comps').select('id,name,core_cards,final_board,trinkets')
  if (error) throw error

  return data
    .filter((comp) => {
      const finalBoard = (comp.final_board ?? []) as (string | null)[]
      return (
        (comp.core_cards ?? []).includes(cardId) ||
        (comp.trinkets ?? []).includes(cardId) ||
        finalBoard.includes(cardId)
      )
    })
    .map((comp) => ({ id: comp.id as string, name: comp.name as string }))
}
