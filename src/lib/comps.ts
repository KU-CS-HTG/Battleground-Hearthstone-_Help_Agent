import { supabase } from './supabaseClient'

export interface CompRef {
  id: string
  name: string
}

/** 7칸 카드 보드 + 마크다운 메모. "각 보는 방법"과 "플레이 팁"이 공유하는 모양. */
export interface BoardNote {
  id: string
  board: (string | null)[]
  notesMd: string
}

export interface Comp {
  id: string
  name: string
  races: string[]
  finalBoard: (string | null)[]
  finalBoardNotesMd: string
  scenarios: BoardNote[]
  trinkets: string[]
  trinketsNotesMd: string
  playTips: BoardNote[]
  orderIndex: number
}

interface CompRow {
  id: string
  name: string
  races: string[]
  final_board: (string | null)[]
  final_board_notes_md: string
  scenarios: BoardNote[]
  trinkets: string[]
  trinkets_notes_md: string
  play_tips: BoardNote[]
  order_index: number
}

export function normalizeBoardNotes(items: BoardNote[] | null | undefined): BoardNote[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    board: item.board ?? [],
    notesMd: item.notesMd ?? '',
  }))
}

function fromRow(row: CompRow): Comp {
  return {
    id: row.id,
    name: row.name,
    races: row.races ?? [],
    finalBoard: row.final_board ?? [],
    finalBoardNotesMd: row.final_board_notes_md ?? '',
    scenarios: normalizeBoardNotes(row.scenarios),
    trinkets: row.trinkets ?? [],
    trinketsNotesMd: row.trinkets_notes_md ?? '',
    playTips: normalizeBoardNotes(row.play_tips),
    orderIndex: row.order_index,
  }
}

const SELECT_COLUMNS =
  'id,name,races,final_board,final_board_notes_md,scenarios,trinkets,trinkets_notes_md,play_tips,order_index'

export async function fetchComps(): Promise<Comp[]> {
  const { data, error } = await supabase.from('comps').select(SELECT_COLUMNS).order('order_index')
  if (error) throw error
  return (data as CompRow[]).map(fromRow)
}

export async function fetchComp(id: string): Promise<Comp | null> {
  const { data, error } = await supabase.from('comps').select(SELECT_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? fromRow(data as CompRow) : null
}

/** 카드가 최종 조합/추천 장신구/각 보는 방법/플레이 팁 중 어디에든 쓰인 조합 목록. */
export async function fetchCompsUsingCard(cardId: string): Promise<CompRef[]> {
  const { data, error } = await supabase.from('comps').select('id,name,final_board,trinkets,scenarios,play_tips')
  if (error) throw error

  return data
    .filter((comp) => {
      const finalBoard = (comp.final_board ?? []) as (string | null)[]
      const scenarios = (comp.scenarios ?? []) as BoardNote[]
      const playTips = (comp.play_tips ?? []) as BoardNote[]
      const boardNoteHasCard = (items: BoardNote[]) => items.some((item) => (item.board ?? []).includes(cardId))
      return (
        (comp.trinkets ?? []).includes(cardId) ||
        finalBoard.includes(cardId) ||
        boardNoteHasCard(scenarios) ||
        boardNoteHasCard(playTips)
      )
    })
    .map((comp) => ({ id: comp.id as string, name: comp.name as string }))
}

export async function createComp(orderIndex: number): Promise<Comp> {
  const { data, error } = await supabase
    .from('comps')
    .insert({
      name: '이름 없는 조합',
      races: [],
      final_board: [],
      final_board_notes_md: '',
      scenarios: [],
      trinkets: [],
      trinkets_notes_md: '',
      play_tips: [],
      order_index: orderIndex,
    })
    .select(SELECT_COLUMNS)
    .single()
  if (error) throw error
  return fromRow(data as CompRow)
}

export async function duplicateComp(comp: Comp, orderIndex: number): Promise<Comp> {
  const { data, error } = await supabase
    .from('comps')
    .insert({
      name: `${comp.name} (복사본)`,
      races: comp.races,
      final_board: comp.finalBoard,
      final_board_notes_md: comp.finalBoardNotesMd,
      scenarios: comp.scenarios,
      trinkets: comp.trinkets,
      trinkets_notes_md: comp.trinketsNotesMd,
      play_tips: comp.playTips,
      order_index: orderIndex,
    })
    .select(SELECT_COLUMNS)
    .single()
  if (error) throw error
  return fromRow(data as CompRow)
}

export interface CompPatch {
  name?: string
  races?: string[]
  finalBoard?: (string | null)[]
  finalBoardNotesMd?: string
  scenarios?: BoardNote[]
  trinkets?: string[]
  trinketsNotesMd?: string
  playTips?: BoardNote[]
}

export async function updateComp(id: string, patch: CompPatch) {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.races !== undefined) row.races = patch.races
  if (patch.finalBoard !== undefined) row.final_board = patch.finalBoard
  if (patch.finalBoardNotesMd !== undefined) row.final_board_notes_md = patch.finalBoardNotesMd
  if (patch.scenarios !== undefined) row.scenarios = patch.scenarios
  if (patch.trinkets !== undefined) row.trinkets = patch.trinkets
  if (patch.trinketsNotesMd !== undefined) row.trinkets_notes_md = patch.trinketsNotesMd
  if (patch.playTips !== undefined) row.play_tips = patch.playTips

  const { error } = await supabase.from('comps').update(row).eq('id', id)
  if (error) throw error
}

export async function deleteComp(id: string) {
  const { error } = await supabase.from('comps').delete().eq('id', id)
  if (error) throw error
}

export async function reorderComps(order: { id: string; orderIndex: number }[]) {
  const results = await Promise.all(
    order.map((o) => supabase.from('comps').update({ order_index: o.orderIndex }).eq('id', o.id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}
