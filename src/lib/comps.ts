import { supabase } from './supabaseClient'

export interface CompRef {
  id: string
  name: string
}

export interface BuildupStep {
  label: string
  description: string
}

export interface Buildup {
  id: string
  title: string
  steps: BuildupStep[]
  board: (string | null)[]
}

export interface Comp {
  id: string
  name: string
  races: string[]
  buildups: Buildup[]
  coreCards: string[]
  finalBoard: (string | null)[]
  trinkets: string[]
  notesMd: string
  orderIndex: number
}

interface CompRow {
  id: string
  name: string
  races: string[]
  buildups: Buildup[]
  core_cards: string[]
  final_board: (string | null)[]
  trinkets: string[]
  notes_md: string
  order_index: number
}

function fromRow(row: CompRow): Comp {
  return {
    id: row.id,
    name: row.name,
    races: row.races ?? [],
    buildups: (row.buildups ?? []).map((b) => ({ ...b, steps: b.steps ?? [], board: b.board ?? [] })),
    coreCards: row.core_cards ?? [],
    finalBoard: row.final_board ?? [],
    trinkets: row.trinkets ?? [],
    notesMd: row.notes_md ?? '',
    orderIndex: row.order_index,
  }
}

const SELECT_COLUMNS = 'id,name,races,buildups,core_cards,final_board,trinkets,notes_md,order_index'

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

export async function createComp(orderIndex: number): Promise<Comp> {
  const { data, error } = await supabase
    .from('comps')
    .insert({
      name: '이름 없는 조합',
      races: [],
      buildups: [],
      core_cards: [],
      final_board: [],
      trinkets: [],
      notes_md: '',
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
      buildups: comp.buildups,
      core_cards: comp.coreCards,
      final_board: comp.finalBoard,
      trinkets: comp.trinkets,
      notes_md: comp.notesMd,
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
  buildups?: Buildup[]
  coreCards?: string[]
  finalBoard?: (string | null)[]
  trinkets?: string[]
  notesMd?: string
}

export async function updateComp(id: string, patch: CompPatch) {
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.races !== undefined) row.races = patch.races
  if (patch.buildups !== undefined) row.buildups = patch.buildups
  if (patch.coreCards !== undefined) row.core_cards = patch.coreCards
  if (patch.finalBoard !== undefined) row.final_board = patch.finalBoard
  if (patch.trinkets !== undefined) row.trinkets = patch.trinkets
  if (patch.notesMd !== undefined) row.notes_md = patch.notesMd

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
