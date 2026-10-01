import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackToHomeLink from '../components/BackToHomeLink'
import MarkdownEditor from '../components/MarkdownEditor'
import Modal from '../components/Modal'
import BoardNoteList from '../components/comp/BoardNoteList'
import CardListZone from '../components/comp/CardListZone'
import FinalBoardSlots from '../components/comp/FinalBoardSlots'
import CardDetailContent from '../components/library/CardDetailContent'
import CardLibrary, { type CardLibraryHandle } from '../components/library/CardLibrary'
import { useAllCards } from '../hooks/useAllCards'
import { useAutosaveText } from '../hooks/useAutosaveText'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../lib/AuthContext'
import { fetchComp, updateComp, type BoardNote, type Comp } from '../lib/comps'
import type { LibraryCard } from '../lib/library'
import { RACE_ORDER, raceLabel } from '../lib/races'

export default function CompDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isLoggedIn } = useAuth()
  const [comp, setComp] = useState<Comp | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [selectedCard, setSelectedCard] = useState<LibraryCard | null>(null)
  const libraryRef = useRef<CardLibraryHandle>(null)
  const cards = useAllCards()
  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  async function reloadComp() {
    if (!id) return
    const p = await fetchComp(id)
    if (p) setComp(p)
  }

  useEffect(() => {
    if (!id) return
    fetchComp(id)
      .then((c) => {
        if (c) setComp(c)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [id])

  usePageTitle(comp ? comp.name : '조합 상세')

  const finalBoardNotes = useAutosaveText(comp?.finalBoardNotesMd ?? '', async (next) => {
    if (comp) await updateComp(comp.id, { finalBoardNotesMd: next })
  })
  const trinketsNotes = useAutosaveText(comp?.trinketsNotesMd ?? '', async (next) => {
    if (comp) await updateComp(comp.id, { trinketsNotesMd: next })
  })

  if (notFound) {
    return (
      <div className="space-y-3 p-6">
        <BackToHomeLink />
        <p className="text-sm text-gray-400">조합을 찾을 수 없습니다.</p>
      </div>
    )
  }

  if (!comp) {
    return (
      <div className="space-y-3 p-6">
        <BackToHomeLink />
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  function patch(next: Partial<Comp>) {
    if (!comp) return
    setComp({ ...comp, ...next })
    updateComp(comp.id, next).catch(() => reloadComp())
  }

  function toggleRace(race: string) {
    if (!comp) return
    const next = comp.races.includes(race) ? comp.races.filter((r) => r !== race) : [...comp.races, race]
    patch({ races: next })
  }

  function addTrinket(cardId: string) {
    if (!comp || comp.trinkets.includes(cardId)) return
    patch({ trinkets: [...comp.trinkets, cardId] })
  }

  function removeTrinket(cardId: string) {
    if (!comp) return
    patch({ trinkets: comp.trinkets.filter((c) => c !== cardId) })
  }

  function clearSlot(index: number) {
    if (!comp) return
    const next = [...comp.finalBoard]
    next[index] = null
    patch({ finalBoard: next })
  }

  function setSlot(index: number, cardId: string) {
    if (!comp) return
    const next = [...comp.finalBoard]
    next[index] = cardId
    patch({ finalBoard: next })
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!comp) return
    const activeId = String(event.active.id)
    const overId = String(event.over?.id ?? '')
    if (!overId) return

    const compMatch = overId.match(/^comp:([^:]+):(trinket|slot):?(\d+)?$/)
    if (compMatch) {
      const [, , field, indexStr] = compMatch
      if (field === 'trinket') {
        addTrinket(activeId)
      } else if (field === 'slot' && indexStr !== undefined) {
        setSlot(Number(indexStr), activeId)
      }
      return
    }

    const scenarioMatch = overId.match(/^scenario:([^:]+):([^:]+):slot:(\d+)$/)
    if (scenarioMatch) {
      const [, , scenarioId, indexStr] = scenarioMatch
      const nextScenarios = comp.scenarios.map((s) => {
        if (s.id !== scenarioId) return s
        const board = [...s.board]
        board[Number(indexStr)] = activeId
        return { ...s, board }
      })
      patch({ scenarios: nextScenarios })
      return
    }

    const playTipMatch = overId.match(/^playtip:([^:]+):([^:]+):slot:(\d+)$/)
    if (playTipMatch) {
      const [, , tipId, indexStr] = playTipMatch
      const nextTips = comp.playTips.map((t) => {
        if (t.id !== tipId) return t
        const board = [...t.board]
        board[Number(indexStr)] = activeId
        return { ...t, board }
      })
      patch({ playTips: nextTips })
      return
    }

    libraryRef.current?.handleDragEnd(event)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <BackToHomeLink />
        {isLoggedIn ? (
          <input
            value={comp.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="w-full rounded border border-white/20 bg-black/20 px-2 py-1 text-2xl font-bold"
          />
        ) : (
          <h1 className="text-2xl font-bold">{comp.name}</h1>
        )}

        <div className="flex flex-wrap gap-1">
          {RACE_ORDER.map((race) => (
            <button
              key={race}
              disabled={!isLoggedIn}
              onClick={() => toggleRace(race)}
              className={`rounded px-2 py-0.5 text-xs ${
                comp.races.includes(race) ? 'bg-purple-500/40' : 'bg-white/10 text-gray-500'
              }`}
            >
              {raceLabel(race)}
            </button>
          ))}
        </div>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">최종 조합</h3>
          <FinalBoardSlots
            zonePrefix={`comp:${comp.id}`}
            slots={comp.finalBoard}
            cardsById={cardsById}
            editable={isLoggedIn}
            onClear={clearSlot}
            onSet={setSlot}
            onCardClick={setSelectedCard}
          />
          <div className="mt-2">
            <MarkdownEditor
              value={finalBoardNotes.value}
              status={finalBoardNotes.status}
              onChange={finalBoardNotes.handleChange}
              readOnly={!isLoggedIn}
              placeholder="이 조합에 대한 메모를 남겨보세요 (마크다운)"
            />
          </div>
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">각 보는 방법</h3>
          <BoardNoteList
            zoneKind="scenario"
            ownerId={comp.id}
            items={comp.scenarios}
            cardsById={cardsById}
            editable={isLoggedIn}
            notesPlaceholder="어떤 상황에 이 덱을 가면 좋은지 적어보세요 (마크다운)"
            emptyLabel="아직 없습니다."
            addLabel="+ 추가"
            onChange={(scenarios) => patch({ scenarios })}
            onCardClick={setSelectedCard}
          />
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">추천 장신구</h3>
          <CardListZone
            zoneId={`comp:${comp.id}:trinket`}
            cardIds={comp.trinkets}
            cardsById={cardsById}
            editable={isLoggedIn}
            onAdd={addTrinket}
            onRemove={removeTrinket}
            onCardClick={setSelectedCard}
            emptyLabel="아래 카드 라이브러리에서 드래그하거나 검색으로 추가하세요."
          />
          <div className="mt-2">
            <MarkdownEditor
              value={trinketsNotes.value}
              status={trinketsNotes.status}
              onChange={trinketsNotes.handleChange}
              readOnly={!isLoggedIn}
              placeholder="장신구 선택 기준 등을 적어보세요 (마크다운)"
            />
          </div>
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">플레이 팁</h3>
          <BoardNoteList
            zoneKind="playtip"
            ownerId={comp.id}
            items={comp.playTips}
            cardsById={cardsById}
            editable={isLoggedIn}
            notesPlaceholder="이 하수인/선술집 주문/장신구를 어떻게 활용해야 하는지 적어보세요 (마크다운)"
            emptyLabel="아직 없습니다."
            addLabel="+ 추가"
            onChange={(playTips: BoardNote[]) => patch({ playTips })}
            onCardClick={setSelectedCard}
          />
        </section>

        <section>
          <h3 className="mb-2 text-lg font-semibold">카드 라이브러리</h3>
          <CardLibrary ref={libraryRef} />
        </section>

        {selectedCard && (
          <Modal onClose={() => setSelectedCard(null)}>
            <CardDetailContent card={selectedCard} />
          </Modal>
        )}
      </div>
    </DndContext>
  )
}
