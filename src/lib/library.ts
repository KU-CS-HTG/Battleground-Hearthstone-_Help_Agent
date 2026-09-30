import { bgRenderUrl, bgTileUrl, customCardImageUrl } from './cardImages'
import { fetchOverrides } from './cardOverrides'
import { supabase } from './supabaseClient'

export type CardKind = 'minion' | 'spell' | 'trinket'

export interface LibraryCard {
  id: string
  name: string
  kind: CardKind
  techLevel: number | null
  trinketRank: 'lesser' | 'greater' | null
  race: string | null
  races: string[]
  cost: number | null
  text: string | null
  tileUrl: string
  renderUrl: string
  isCustom: boolean
}

interface BgCardRow {
  id: string
  name: string
  kind: CardKind
  tech_level: number | null
  trinket_rank: 'lesser' | 'greater' | null
  race: string | null
  races: string[]
  cost: number | null
  card_text: string | null
}

interface CustomCardRow {
  id: string
  name: string
  kind: CardKind
  tier: number | null
  race: string | null
  image_path: string | null
}

export async function fetchLibraryCards(): Promise<LibraryCard[]> {
  const [bgRes, customRes, overrides] = await Promise.all([
    supabase
      .from('bg_cards')
      .select('id,name,kind,tech_level,trinket_rank,race,races,cost,card_text'),
    supabase.from('custom_cards').select('id,name,kind,tier,race,image_path'),
    fetchOverrides(),
  ])

  if (bgRes.error) throw bgRes.error
  if (customRes.error) throw customRes.error

  const bgCards: LibraryCard[] = (bgRes.data as BgCardRow[]).map((row) => {
    const override = overrides.get(row.id)
    return {
      id: row.id,
      name: row.name,
      kind: row.kind,
      techLevel: override?.techLevel ?? row.tech_level,
      trinketRank: row.trinket_rank,
      race: row.race,
      races: row.races ?? [],
      cost: row.cost,
      text: override?.cardText ?? row.card_text,
      tileUrl: bgTileUrl(row.id),
      renderUrl: bgRenderUrl(row.id),
      isCustom: false,
    }
  })

  const customCards: LibraryCard[] = (customRes.data as CustomCardRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    techLevel: row.tier,
    trinketRank: null,
    race: row.race,
    races: row.race ? [row.race] : [],
    cost: null,
    text: null,
    tileUrl: customCardImageUrl(row.image_path) ?? '',
    renderUrl: customCardImageUrl(row.image_path) ?? '',
    isCustom: true,
  }))

  return [...bgCards, ...customCards]
}

export async function fetchNotedCardIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from('card_notes').select('card_id').not('note_md', 'eq', '')
  if (error) throw error
  return new Set(data.map((r) => r.card_id as string))
}
