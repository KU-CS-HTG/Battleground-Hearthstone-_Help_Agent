import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

// 아이콘용 정사각 카드 아트. "/v1/tiles/"(256x59 얇은 크롭)는 아이콘에 쓰기엔
// 잘려서 알아보기 어려워 정사각 아트("/v1/256x/")를 대신 사용한다.
export function bgTileUrl(cardId: string) {
  return `https://art.hearthstonejson.com/v1/256x/${cardId}.jpg`
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

export function infoPostImageUrl(storagePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/bg-assets/${storagePath}`
}

export async function uploadInfoPostImage(file: File, postId: string) {
  const path = `info-posts/${postId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('bg-assets').upload(path, file, { upsert: true })
  if (error) throw error
  return path
}

export async function uploadCardImageOverride(file: File, cardId: string) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `card-overrides/${cardId}.${ext}`
  const { error } = await supabase.storage.from('bg-assets').upload(path, file, { upsert: true })
  if (error) throw error
  return path
}
