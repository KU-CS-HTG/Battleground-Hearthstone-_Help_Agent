import type { DragEndEvent } from '@dnd-kit/core'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import {
  createGroup,
  deleteGroup,
  fetchGroups,
  fetchPositions,
  renameGroup,
  savePositions,
  type CardGroup,
  type CardPosition,
} from '../../lib/cardPositions'
import { fetchLibraryCards, fetchNotedCardIds, type CardKind, type LibraryCard } from '../../lib/library'
import { NO_RACE_FILTER, raceLabel } from '../../lib/races'
import CardDetailContent from './CardDetailContent'
import CardZone from './CardZone'
import CustomCardDialog from './CustomCardDialog'
import Modal from '../Modal'

const TABS: { kind: CardKind; label: string }[] = [
  { kind: 'minion', label: '하수인' },
  { kind: 'spell', label: '선술집 주문' },
  { kind: 'trinket', label: '장신구' },
]

type PositionsState = Record<string, { groupId: string | null; orderIndex: number }>

function zoneId(groupId: string | null) {
  return groupId === null ? 'ungrouped' : `group:${groupId}`
}

function groupIdFromZone(zone: string): string | null {
  return zone === 'ungrouped' ? null : zone.replace('group:', '')
}

export interface CardLibraryHandle {
  handleDragEnd: (event: DragEndEvent) => void
}

function isLibraryZone(id: string) {
  return id === 'ungrouped' || id.startsWith('group:')
}

const CardLibrary = forwardRef<CardLibraryHandle>(function CardLibrary(_props, ref) {
  const { isLoggedIn } = useAuth()
  const [cards, setCards] = useState<LibraryCard[]>([])
  const [notedIds, setNotedIds] = useState<Set<string>>(new Set())
  const [groups, setGroups] = useState<CardGroup[]>([])
  const [positions, setPositions] = useState<PositionsState>({})
  const [tab, setTab] = useState<CardKind>('minion')
  const [search, setSearch] = useState('')
  const [techLevelFilter, setTechLevelFilter] = useState<number[]>([])
  const [raceFilter, setRaceFilter] = useState<string[]>([])
  const [trinketRankFilter, setTrinketRankFilter] = useState<('lesser' | 'greater')[]>([])
  const [selectedCard, setSelectedCard] = useState<LibraryCard | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)

  async function reload() {
    const [cardRows, noted, groupRows, positionRows] = await Promise.all([
      fetchLibraryCards(),
      fetchNotedCardIds(),
      fetchGroups(),
      fetchPositions(),
    ])
    setCards(cardRows)
    setNotedIds(noted)
    setGroups(groupRows)

    const state: PositionsState = {}
    positionRows.forEach((p) => {
      state[p.cardId] = { groupId: p.groupId, orderIndex: p.orderIndex }
    })
    // 아직 위치가 없는 카드는 기본값(미분류, 목록 끝)을 부여한다.
    let nextIndex = positionRows.length
    cardRows.forEach((c) => {
      if (!state[c.id]) {
        state[c.id] = { groupId: null, orderIndex: nextIndex++ }
      }
    })
    setPositions(state)
  }

  useEffect(() => {
    reload()
  }, [])

  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

  const races = useMemo(() => {
    const realRaces = Array.from(
      new Set(cards.filter((c) => c.kind === 'minion' && c.race).map((c) => c.race as string)),
    ).sort()
    const hasNoRaceMinion = cards.some((c) => c.kind === 'minion' && !c.race)
    return hasNoRaceMinion ? [...realRaces, NO_RACE_FILTER] : realRaces
  }, [cards])

  function cardsInZone(groupId: string | null, kindFilter?: CardKind): LibraryCard[] {
    return cards
      .filter((c) => {
        const p = positions[c.id]
        if (!p || p.groupId !== groupId) return false
        if (kindFilter && c.kind !== kindFilter) return false
        return true
      })
      .sort((a, b) => positions[a.id].orderIndex - positions[b.id].orderIndex)
  }

  const ungroupedTabCards = useMemo(() => {
    return cardsInZone(null, tab).filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (tab === 'minion' || tab === 'spell') {
        if (techLevelFilter.length > 0 && (c.techLevel == null || !techLevelFilter.includes(c.techLevel))) return false
      }
      if (tab === 'minion') {
        if (raceFilter.length > 0) {
          const matches = c.race ? raceFilter.includes(c.race) : raceFilter.includes(NO_RACE_FILTER)
          if (!matches) return false
        }
      }
      if (tab === 'trinket') {
        if (trinketRankFilter.length > 0 && (!c.trinketRank || !trinketRankFilter.includes(c.trinketRank))) return false
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, positions, tab, search, techLevelFilter, raceFilter, trinketRankFilter])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return
    if (!isLibraryZone(overId) && !positions[overId]) return

    const activeCard = cardsById.get(activeId)
    const activePos = positions[activeId]
    if (!activeCard || !activePos) return

    const overIsZone = overId === 'ungrouped' || overId.startsWith('group:')
    const targetGroupId = overIsZone ? groupIdFromZone(overId) : positions[overId]?.groupId ?? null
    const targetKindFilter = targetGroupId === null ? activeCard.kind : undefined

    const targetSiblings = cardsInZone(targetGroupId, targetKindFilter)
      .filter((c) => c.id !== activeId)
      .map((c) => c.id)

    let insertIndex = targetSiblings.length
    if (!overIsZone) {
      const idx = targetSiblings.indexOf(overId)
      if (idx !== -1) insertIndex = idx
    }
    targetSiblings.splice(insertIndex, 0, activeId)

    const next: PositionsState = { ...positions }
    const changed: CardPosition[] = []
    targetSiblings.forEach((id, idx) => {
      next[id] = { groupId: targetGroupId, orderIndex: idx }
      changed.push({ cardId: id, groupId: targetGroupId, orderIndex: idx })
    })

    if (activePos.groupId !== targetGroupId) {
      const sourceKindFilter = activePos.groupId === null ? activeCard.kind : undefined
      const sourceSiblings = cardsInZone(activePos.groupId, sourceKindFilter)
        .filter((c) => c.id !== activeId)
        .map((c) => c.id)
      sourceSiblings.forEach((id, idx) => {
        next[id] = { groupId: activePos.groupId, orderIndex: idx }
        changed.push({ cardId: id, groupId: activePos.groupId, orderIndex: idx })
      })
    }

    setPositions(next)
    savePositions(changed).catch(() => reload())
  }

  async function handleAddGroup() {
    const name = window.prompt('그룹 이름을 입력하세요')
    if (!name) return
    const group = await createGroup(name, groups.length)
    setGroups((prev) => [...prev, group])
  }

  async function handleRenameGroup(group: CardGroup) {
    const name = window.prompt('새 그룹 이름을 입력하세요', group.name)
    if (!name || name === group.name) return
    await renameGroup(group.id, name)
    setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, name } : g)))
  }

  async function handleDeleteGroup(group: CardGroup) {
    if (!window.confirm(`"${group.name}" 그룹을 삭제할까요? 안의 카드는 미분류로 돌아갑니다.`)) return
    await deleteGroup(group.id)
    setGroups((prev) => prev.filter((g) => g.id !== group.id))
    reload()
  }

  useImperativeHandle(ref, () => ({ handleDragEnd }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.kind}
              onClick={() => setTab(t.kind)}
              className={`rounded px-3 py-1 text-sm ${tab === t.kind ? 'bg-white/20 font-semibold' : 'bg-white/5 text-gray-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowAddCard(true)}
            className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          >
            카드 수동 추가
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름 검색"
          className="rounded border border-white/20 bg-black/20 px-2 py-1 text-sm"
        />
        {(tab === 'minion' || tab === 'spell') && (
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
              <button
                key={lvl}
                onClick={() =>
                  setTechLevelFilter((prev) => (prev.includes(lvl) ? prev.filter((v) => v !== lvl) : [...prev, lvl]))
                }
                className={`rounded px-2 py-0.5 text-xs ${techLevelFilter.includes(lvl) ? 'bg-blue-500/40' : 'bg-white/10 text-gray-400'}`}
              >
                {lvl}성
              </button>
            ))}
          </div>
        )}
        {tab === 'minion' && (
          <div className="flex flex-wrap gap-1">
            {races.map((r) => (
              <button
                key={r}
                onClick={() => setRaceFilter((prev) => (prev.includes(r) ? prev.filter((v) => v !== r) : [...prev, r]))}
                className={`rounded px-2 py-0.5 text-xs ${raceFilter.includes(r) ? 'bg-green-500/40' : 'bg-white/10 text-gray-400'}`}
              >
                {r === NO_RACE_FILTER ? '무종족' : raceLabel(r)}
              </button>
            ))}
          </div>
        )}
        {tab === 'trinket' && (
          <div className="flex flex-wrap gap-1">
            {(['greater', 'lesser'] as const).map((rank) => (
              <button
                key={rank}
                onClick={() =>
                  setTrinketRankFilter((prev) => (prev.includes(rank) ? prev.filter((v) => v !== rank) : [...prev, rank]))
                }
                className={`rounded px-2 py-0.5 text-xs ${trinketRankFilter.includes(rank) ? 'bg-yellow-500/40' : 'bg-white/10 text-gray-400'}`}
              >
                {rank === 'greater' ? '상급' : '하급'}
              </button>
            ))}
          </div>
        )}
      </div>

      <>
        <CardZone
          zoneId="ungrouped"
          cards={ungroupedTabCards}
          notedIds={notedIds}
          draggable={isLoggedIn}
          onCardClick={setSelectedCard}
          emptyLabel="카드가 없습니다."
        />

        {groups.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400">내 그룹</h3>
            {groups.map((group) => (
              <div key={group.id}>
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                  <span className="font-semibold text-gray-200">{group.name}</span>
                  {isLoggedIn && (
                    <>
                      <button onClick={() => handleRenameGroup(group)} className="hover:text-white">
                        이름변경
                      </button>
                      <button onClick={() => handleDeleteGroup(group)} className="hover:text-red-400">
                        삭제
                      </button>
                    </>
                  )}
                </div>
                <CardZone
                  zoneId={zoneId(group.id)}
                  cards={cardsInZone(group.id)}
                  notedIds={notedIds}
                  draggable={isLoggedIn}
                  onCardClick={setSelectedCard}
                  emptyLabel="여기로 카드를 드래그해 보세요."
                />
              </div>
            ))}
          </div>
        )}

        {isLoggedIn && (
          <button onClick={handleAddGroup} className="text-xs text-blue-400 hover:underline">
            + 그룹 추가
          </button>
        )}
      </>

      {selectedCard && (
        <Modal
          onClose={() => {
            setSelectedCard(null)
            reload()
          }}
        >
          <CardDetailContent
            card={selectedCard}
            onDeleted={() => {
              setSelectedCard(null)
              reload()
            }}
          />
        </Modal>
      )}

      {showAddCard && (
        <CustomCardDialog onClose={() => setShowAddCard(false)} onCreated={reload} />
      )}
    </div>
  )
})

export default CardLibrary
