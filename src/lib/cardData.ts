import { supabase } from './supabaseClient'

export interface CardDataMeta {
  buildNumber: number
  refreshedAt: string
  cardCount: number
}

export async function fetchCardDataMeta(): Promise<CardDataMeta | null> {
  const { data, error } = await supabase.from('app_meta').select('value').eq('key', 'card_data').maybeSingle()
  if (error || !data) return null
  return data.value as CardDataMeta
}

export async function refreshCardData(): Promise<CardDataMeta> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('로그인이 필요합니다.')

  const res = await fetch('/api/refresh-cards', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? '카드 데이터 갱신에 실패했습니다.')
  return body as CardDataMeta
}
