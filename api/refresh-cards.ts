import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const HSJSON_INDEX_URL = 'https://api.hearthstonejson.com/v1/'
const HSJSON_CARDS_URL = 'https://api.hearthstonejson.com/v1/latest/koKR/cards.json'

interface HsCard {
  id: string
  dbfId: number
  name: string
  type: string
  set?: string
  spellSchool?: string
  techLevel?: number
  race?: string
  races?: string[]
  battlegroundsAssociatedRaces?: string[]
  cost?: number
  text?: string
  isBattlegroundsPoolMinion?: boolean
  isBattlegroundsPoolSpell?: boolean
  [key: string]: unknown
}

interface BgCardRow {
  id: string
  dbf_id: number
  name: string
  kind: 'minion' | 'spell' | 'trinket'
  tech_level: number | null
  trinket_rank: 'lesser' | 'greater' | null
  race: string | null
  races: string[]
  associated_races: string[]
  cost: number | null
  card_text: string | null
  is_pool: boolean
  raw: HsCard
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    res.status(500).json({ error: '서버 환경변수(SUPABASE_SERVICE_ROLE_KEY 등)가 설정되지 않았습니다.' })
    return
  }

  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    res.status(401).json({ error: '로그인이 필요합니다.' })
    return
  }

  const authClient = createClient(supabaseUrl, anonKey)
  const { data: userData, error: userError } = await authClient.auth.getUser(token)
  if (userError || !userData.user) {
    res.status(401).json({ error: '로그인이 필요합니다.' })
    return
  }

  try {
    const buildNumber = await fetchLatestBuildNumber()

    const cardsRes = await fetch(HSJSON_CARDS_URL)
    if (!cardsRes.ok) throw new Error(`cards.json 요청 실패: ${cardsRes.status}`)
    const cards = (await cardsRes.json()) as HsCard[]

    const rows = cards
      .map(toBgCardRow)
      .filter((row): row is BgCardRow => row !== null)

    const admin = createClient(supabaseUrl, serviceRoleKey)

    // 로테이션에서 빠진 카드가 사라지도록 캐시를 통째로 교체한다.
    // (card_notes는 카드 id 기준의 별도 테이블이라 영향받지 않는다.)
    const { error: deleteError } = await admin.from('bg_cards').delete().neq('id', '')
    if (deleteError) throw deleteError

    const chunkSize = 500
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      const { error: upsertError } = await admin.from('bg_cards').upsert(chunk)
      if (upsertError) throw upsertError
    }

    const refreshedAt = new Date().toISOString()
    const { error: metaError } = await admin.from('app_meta').upsert({
      key: 'card_data',
      value: { buildNumber, refreshedAt, cardCount: rows.length },
    })
    if (metaError) throw metaError

    res.status(200).json({ buildNumber, refreshedAt, cardCount: rows.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.' })
  }
}

async function fetchLatestBuildNumber(): Promise<number> {
  const res = await fetch(HSJSON_INDEX_URL)
  if (!res.ok) throw new Error('빌드 번호 조회 실패')
  const html = await res.text()
  const matches = [...html.matchAll(/\/v1\/(\d+)\/"/g)].map((m) => Number(m[1]))
  if (matches.length === 0) throw new Error('빌드 번호를 찾을 수 없습니다.')
  return Math.max(...matches)
}

function toBgCardRow(card: HsCard): BgCardRow | null {
  const base = {
    id: card.id,
    dbf_id: card.dbfId,
    name: card.name,
    race: card.race ?? null,
    races: card.races ?? [],
    associated_races: card.battlegroundsAssociatedRaces ?? [],
    cost: card.cost ?? null,
    card_text: card.text ?? null,
    raw: card,
  }

  if (card.type === 'MINION' && card.set === 'BATTLEGROUNDS' && card.isBattlegroundsPoolMinion) {
    return { ...base, kind: 'minion', tech_level: card.techLevel ?? null, trinket_rank: null, is_pool: true }
  }

  if (card.type === 'BATTLEGROUND_SPELL' && card.spellSchool === 'TAVERN' && card.isBattlegroundsPoolSpell) {
    return { ...base, kind: 'spell', tech_level: card.techLevel ?? null, trinket_rank: null, is_pool: true }
  }

  if (card.type === 'BATTLEGROUND_TRINKET') {
    const rank: BgCardRow['trinket_rank'] =
      card.spellSchool === 'GREATER_TRINKET' ? 'greater' : card.spellSchool === 'LESSER_TRINKET' ? 'lesser' : null
    // 장신구는 "현재 로테이션" 플래그가 데이터에 없어 전체 목록을 그대로 캐시한다.
    return { ...base, kind: 'trinket', tech_level: null, trinket_rank: rank, is_pool: false }
  }

  return null
}
