import { DndContext } from '@dnd-kit/core'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import MarkdownEditor from '../components/MarkdownEditor'
import Modal from '../components/Modal'
import CardListZone from '../components/comp/CardListZone'
import FinalBoardSlots from '../components/comp/FinalBoardSlots'
import CardDetailContent from '../components/library/CardDetailContent'
import { useAllCards } from '../hooks/useAllCards'
import { useAutosaveText } from '../hooks/useAutosaveText'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../lib/AuthContext'
import { fetchComp, updateComp, type Buildup, type Comp } from '../lib/comps'
import type { LibraryCard } from '../lib/library'
import { RACE_ORDER, raceLabel } from '../lib/races'

export default function CompDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isLoggedIn } = useAuth()
  const [comp, setComp] = useState<Comp | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [selectedCard, setSelectedCard] = useState<LibraryCard | null>(null)
  const cards = useAllCards()
  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

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

  const notes = useAutosaveText(comp?.notesMd ?? '', async (next) => {
    if (comp) await updateComp(comp.id, { notesMd: next })
  })

  if (notFound) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400">조합을 찾을 수 없습니다.</p>
      </div>
    )
  }

  if (!comp) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  function patch(next: Partial<Comp>) {
    if (!comp) return
    setComp({ ...comp, ...next })
    updateComp(comp.id, next).catch(() => {
      if (id) fetchComp(id).then((c) => c && setComp(c))
    })
  }

  function toggleRace(race: string) {
    if (!comp) return
    const next = comp.races.includes(race) ? comp.races.filter((r) => r !== race) : [...comp.races, race]
    patch({ races: next })
  }

  function addCard(field: 'coreCards' | 'trinkets', cardId: string) {
    if (!comp || comp[field].includes(cardId)) return
    patch({ [field]: [...comp[field], cardId] })
  }

  function removeCard(field: 'coreCards' | 'trinkets', cardId: string) {
    if (!comp) return
    patch({ [field]: comp[field].filter((c) => c !== cardId) })
  }

  function clearSlot(index: number) {
    if (!comp) return
    const next = [...comp.finalBoard]
    next[index] = null
    patch({ finalBoard: next })
  }

  function addBuildup() {
    if (!comp) return
    const buildup: Buildup = { id: crypto.randomUUID(), title: '새 빌드업', steps: [] }
    patch({ buildups: [...comp.buildups, buildup] })
  }

  function updateBuildup(buildupId: string, next: Partial<Buildup>) {
    if (!comp) return
    patch({ buildups: comp.buildups.map((b) => (b.id === buildupId ? { ...b, ...next } : b)) })
  }

  function deleteBuildup(buildupId: string) {
    if (!comp) return
    if (!window.confirm('이 빌드업을 삭제할까요?')) return
    patch({ buildups: comp.buildups.filter((b) => b.id !== buildupId) })
  }

  function addStep(buildup: Buildup) {
    updateBuildup(buildup.id, { steps: [...buildup.steps, { label: '', description: '' }] })
  }

  function updateStep(buildup: Buildup, index: number, field: 'label' | 'description', value: string) {
    const steps = buildup.steps.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    updateBuildup(buildup.id, { steps })
  }

  function deleteStep(buildup: Buildup, index: number) {
    updateBuildup(buildup.id, { steps: buildup.steps.filter((_, i) => i !== index) })
  }

  return (
    <DndContext onDragEnd={() => {}}>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
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
          <h3 className="mb-1 text-sm font-semibold text-gray-300">핵심 기물</h3>
          <CardListZone
            zoneId={`comp:${comp.id}:core`}
            cardIds={comp.coreCards}
            cardsById={cardsById}
            editable={isLoggedIn}
            onAdd={(cid) => addCard('coreCards', cid)}
            onRemove={(cid) => removeCard('coreCards', cid)}
            onCardClick={setSelectedCard}
            emptyLabel="검색으로 추가하세요."
          />
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">최종 조합</h3>
          <FinalBoardSlots
            compId={comp.id}
            slots={comp.finalBoard}
            cardsById={cardsById}
            editable={isLoggedIn}
            onClear={clearSlot}
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
            onAdd={(cid) => addCard('trinkets', cid)}
            onRemove={(cid) => removeCard('trinkets', cid)}
            onCardClick={setSelectedCard}
            emptyLabel="검색으로 추가하세요."
          />
        </section>

        <section>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">빌드업 예시</h3>
            {isLoggedIn && (
              <button onClick={addBuildup} className="text-xs text-blue-400 hover:underline">
                + 빌드업 추가
              </button>
            )}
          </div>
          <div className="space-y-3">
            {comp.buildups.map((buildup) => (
              <div key={buildup.id} className="rounded border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  {isLoggedIn ? (
                    <input
                      value={buildup.title}
                      onChange={(e) => updateBuildup(buildup.id, { title: e.target.value })}
                      className="flex-1 rounded border border-white/20 bg-black/20 px-2 py-1 text-sm font-semibold"
                    />
                  ) : (
                    <h4 className="text-sm font-semibold">{buildup.title}</h4>
                  )}
                  {isLoggedIn && (
                    <button onClick={() => deleteBuildup(buildup.id)} className="text-xs text-red-400 hover:underline">
                      삭제
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {buildup.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      {isLoggedIn ? (
                        <>
                          <input
                            value={step.label}
                            onChange={(e) => updateStep(buildup, idx, 'label', e.target.value)}
                            placeholder="턴/등급"
                            className="w-24 rounded border border-white/20 bg-black/20 px-2 py-1"
                          />
                          <input
                            value={step.description}
                            onChange={(e) => updateStep(buildup, idx, 'description', e.target.value)}
                            placeholder="설명"
                            className="flex-1 rounded border border-white/20 bg-black/20 px-2 py-1"
                          />
                          <button onClick={() => deleteStep(buildup, idx)} className="text-xs text-red-400">
                            ✕
                          </button>
                        </>
                      ) : (
                        <p>
                          <span className="font-semibold text-gray-400">{step.label}</span> {step.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {isLoggedIn && (
                    <button onClick={() => addStep(buildup)} className="text-xs text-blue-400 hover:underline">
                      + 단계 추가
                    </button>
                  )}
                </div>
              </div>
            ))}
            {comp.buildups.length === 0 && <p className="text-xs text-gray-500">아직 빌드업이 없습니다.</p>}
          </div>
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">자유 메모</h3>
          <MarkdownEditor
            value={notes.value}
            status={notes.status}
            onChange={notes.handleChange}
            readOnly={!isLoggedIn}
            placeholder="자유롭게 메모를 남겨보세요 (마크다운)"
          />
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
