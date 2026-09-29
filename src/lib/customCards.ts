import type { CardKind } from './library'
import { supabase } from './supabaseClient'

export interface NewCustomCard {
  name: string
  kind: CardKind
  tier: number | null
  race: string | null
}

export async function createCustomCard(input: NewCustomCard): Promise<string> {
  const { data, error } = await supabase
    .from('custom_cards')
    .insert({ name: input.name, kind: input.kind, tier: input.tier, race: input.race })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function updateCustomCardImage(id: string, imagePath: string) {
  const { error } = await supabase.from('custom_cards').update({ image_path: imagePath }).eq('id', id)
  if (error) throw error
}

export async function deleteCustomCard(id: string) {
  const { error } = await supabase.from('custom_cards').delete().eq('id', id)
  if (error) throw error
}
