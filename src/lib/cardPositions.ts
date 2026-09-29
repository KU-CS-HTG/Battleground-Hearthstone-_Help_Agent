import { supabase } from './supabaseClient'

export interface CardGroup {
  id: string
  name: string
  orderIndex: number
}

export interface CardPosition {
  cardId: string
  groupId: string | null
  orderIndex: number
}

export async function fetchGroups(): Promise<CardGroup[]> {
  const { data, error } = await supabase.from('card_groups').select('id,name,order_index').order('order_index')
  if (error) throw error
  return data.map((r) => ({ id: r.id, name: r.name, orderIndex: r.order_index }))
}

export async function fetchPositions(): Promise<CardPosition[]> {
  const { data, error } = await supabase.from('card_positions').select('card_id,group_id,order_index')
  if (error) throw error
  return data.map((r) => ({ cardId: r.card_id, groupId: r.group_id, orderIndex: r.order_index }))
}

export async function createGroup(name: string, orderIndex: number): Promise<CardGroup> {
  const { data, error } = await supabase
    .from('card_groups')
    .insert({ name, order_index: orderIndex })
    .select('id,name,order_index')
    .single()
  if (error) throw error
  return { id: data.id, name: data.name, orderIndex: data.order_index }
}

export async function renameGroup(id: string, name: string) {
  const { error } = await supabase.from('card_groups').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deleteGroup(id: string) {
  const { error } = await supabase.from('card_groups').delete().eq('id', id)
  if (error) throw error
}

export async function savePositions(positions: CardPosition[]) {
  if (positions.length === 0) return
  const { error } = await supabase.from('card_positions').upsert(
    positions.map((p) => ({ card_id: p.cardId, group_id: p.groupId, order_index: p.orderIndex })),
  )
  if (error) throw error
}
