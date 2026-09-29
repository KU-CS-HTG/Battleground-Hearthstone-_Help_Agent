import { supabase } from './supabaseClient'

export async function fetchNote(cardId: string): Promise<string> {
  const { data, error } = await supabase.from('card_notes').select('note_md').eq('card_id', cardId).maybeSingle()
  if (error) throw error
  return data?.note_md ?? ''
}

export async function saveNote(cardId: string, noteMd: string) {
  const { error } = await supabase.from('card_notes').upsert({ card_id: cardId, note_md: noteMd })
  if (error) throw error
}
