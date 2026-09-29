import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export function bgTileUrl(cardId: string) {
  return `https://art.hearthstonejson.com/v1/tiles/${cardId}.jpg`
}

export function bgRenderUrl(cardId: string) {
  return `https://art.hearthstonejson.com/v1/render/latest/koKR/256x/${cardId}.png`
}

export function customCardImageUrl(imagePath: string | null) {
  if (!imagePath) return null
  return `${SUPABASE_URL}/storage/v1/object/public/bg-assets/${imagePath}`
}

export async function uploadCustomCardImage(file: File, cardId: string) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `custom-cards/${cardId}.${ext}`
  const { error } = await supabase.storage.from('bg-assets').upload(path, file, { upsert: true })
  if (error) throw error
  return path
}
