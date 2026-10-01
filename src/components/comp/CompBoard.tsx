import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import {
  createComp,
  deleteComp,
  duplicateComp,
  fetchComps,
  reorderComps,
  updateComp,
  type Comp,
} from '../../lib/comps'
import { useAllCards } from '../../hooks/useAllCards'
import { RACE_ORDER, raceLabel } from '../../lib/races'
import type { LibraryCard } from '../../lib/library'
import CompCard from './CompCard'
import Modal from '../Modal'
import CardDetailContent from '../library/CardDetailContent'

export interface CompBoardHandle {
  handleReorder: (event: DragEndEvent) => void
  handleDropCard: (event: DragEndEvent) => void
}

const CompBoard = forwardRef<CompBoardHandle>(function CompBoard(_props, ref) {
  const { isLoggedIn } = useAuth()
  const [comps, setComps] = useState<Comp[]>([])
  const [raceFilter, setRaceFilter] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<LibraryCard | null>(null)
  const cards = useAllCards()
  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

  async function reload() {
    setComps(await fetchComps())
  }

  useEffect(() => {
    reload().catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (raceFilter.length === 0) return comps
    return comps.filter((c) => c.races.some((r) => raceFilter.includes(r)))
  }, [comps, raceFilter])

  async function handleAddComp() {
    const comp = await createComp(comps.length)
    setComps((prev) => [...prev, comp])
  }

  async function handleDuplicate(comp: Comp) {
    const copy = await duplicateComp(comp, comps.length)
    setComps((prev) => [...prev, copy])
  }

  async function handleDelete(comp: Comp) {
    if (!window.confirm(`"${comp.name}" 조합을 삭제할까요?`)) return
    await deleteComp(comp.id)
    setComps((prev) => prev.filter((c) => c.id !== comp.id))
  }

  function handlePatch(comp: Comp, patch: Partial<Comp>) {
    setComps((prev) => prev.map((c) => (c.id === comp.id ? { ...c, ...patch } : c)))
    updateComp(comp.id, patch).catch(() => reload())
  }

  useImperativeHandle(ref, () => ({
    handleReorder(event) {
      const { active, over } = event
      if (!over) return
      const activeId = String(active.id).replace('compcard:', '')
      const overId = String(over.id).replace('compcard:', '')
      if (activeId === overId) return

      const oldIndex = comps.findIndex((c) => c.id === activeId)
      const newIndex = comps.findIndex((c) => c.id === overId)
      if (oldIndex === -1 || newIndex === -1) return

      const next = [...comps]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      setComps(next)
      reorderComps(next.map((c, idx) => ({ id: c.id, orderIndex: idx }))).catch(() => reload())
    },
    handleDropCard(event) {
      const { active, over } = event
      if (!over) return
      const cardId = String(active.id)
      const overId = String(over.id)

      const compMatch = overId.match(/^comp:([^:]+):(trinket|slot):?(\d+)?$/)
      if (compMatch) {
        const [, compId, field, indexStr] = compMatch
        const comp = comps.find((c) => c.id === compId)
        if (!comp) return
        if (field === 'trinket') {
          if (comp.trinkets.includes(cardId)) return
          handlePatch(comp, { trinkets: [...comp.trinkets, cardId] })
        } else if (field === 'slot' && indexStr !== undefined) {
          const next = [...comp.finalBoard]
          next[Number(indexStr)] = cardId
          handlePatch(comp, { finalBoard: next })
        }
        return
      }

      const scenarioMatch = overId.match(/^scenario:([^:]+):([^:]+):slot:(\d+)$/)
      if (scenarioMatch) {
        const [, compId, scenarioId, indexStr] = scenarioMatch
        const comp = comps.find((c) => c.id === compId)
        if (!comp) return
        const nextScenarios = comp.scenarios.map((s) => {
          if (s.id !== scenarioId) return s
          const board = [...s.board]
          board[Number(indexStr)] = cardId
          return { ...s, board }
        })
        handlePatch(comp, { scenarios: nextScenarios })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [comps])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {RACE_ORDER.map((race) => (
            <button
              key={race}
              onClick={() =>
                setRaceFilter((prev) => (prev.includes(race) ? prev.filter((r) => r !== race) : [...prev, race]))
              }
              className={`rounded px-2 py-0.5 text-xs ${
                raceFilter.includes(race) ? 'bg-purple-500/40' : 'bg-white/10 text-gray-500'
              }`}
            >
              {raceLabel(race)}
            </button>
          ))}
        </div>
        {isLoggedIn && (
          <button onClick={handleAddComp} className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
            + 조합 추가
          </button>
        )}
      </div>

      <SortableContext items={filtered.map((c) => `compcard:${c.id}`)} strategy={rectSortingStrategy}>
        <div className="space-y-4">
          {filtered.map((comp) => (
            <CompCard
              key={comp.id}
              comp={comp}
              cardsById={cardsById}
              editable={isLoggedIn}
              onPatch={(patch) => handlePatch(comp, patch)}
              onDelete={() => handleDelete(comp)}
              onDuplicate={() => handleDuplicate(comp)}
              onCardClick={setSelectedCard}
            />
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-500">조합이 없습니다.</p>}
        </div>
      </SortableContext>

      {selectedCard && (
        <Modal onClose={() => setSelectedCard(null)}>
          <CardDetailContent card={selectedCard} />
        </Modal>
      )}
    </div>
  )
})

export default CompBoard
