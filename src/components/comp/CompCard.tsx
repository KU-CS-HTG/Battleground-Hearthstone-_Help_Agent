import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import type { LibraryCard } from '../../lib/library'
import type { Comp } from '../../lib/comps'
import { RACE_ORDER, raceLabel } from '../../lib/races'
import CardListZone from './CardListZone'
import FinalBoardSlots from './FinalBoardSlots'

interface Props {
  comp: Comp
  cardsById: Map<string, LibraryCard>
  editable: boolean
  onPatch: (patch: Partial<Comp>) => void
  onDelete: () => void
  onDuplicate: () => void
  onCardClick: (card: LibraryCard) => void
}

export default function CompCard({ comp, cardsById, editable, onPatch, onDelete, onDuplicate, onCardClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `compcard:${comp.id}`,
    disabled: !editable,
  })

  function toggleRace(race: string) {
    const next = comp.races.includes(race) ? comp.races.filter((r) => r !== race) : [...comp.races, race]
    onPatch({ races: next })
  }

  function addCard(field: 'coreCards' | 'trinkets', cardId: string) {
    if (comp[field].includes(cardId)) return
    onPatch({ [field]: [...comp[field], cardId] })
  }

  function removeCard(field: 'coreCards' | 'trinkets', cardId: string) {
    onPatch({ [field]: comp[field].filter((id) => id !== cardId) })
  }

  function clearSlot(index: number) {
    const next = [...comp.finalBoard]
    next[index] = null
    onPatch({ finalBoard: next })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="space-y-3 rounded border border-white/10 bg-white/5 p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {editable && (
            <span {...attributes} {...listeners} className="cursor-grab touch-none text-gray-500">
              ⠿
            </span>
          )}
          <Link to={`/comp/${comp.id}`} className="text-lg font-semibold hover:underline">
            {comp.name}
          </Link>
        </div>
        {editable && (
          <div className="flex gap-2 text-xs text-gray-400">
            <button onClick={onDuplicate} className="hover:text-white">
              복제
            </button>
            <button onClick={onDelete} className="hover:text-red-400">
              삭제
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {RACE_ORDER.map((race) => (
          <button
            key={race}
            disabled={!editable}
            onClick={() => toggleRace(race)}
            className={`rounded px-2 py-0.5 text-xs ${
              comp.races.includes(race) ? 'bg-purple-500/40' : 'bg-white/10 text-gray-500'
            } ${editable ? '' : 'cursor-default'}`}
          >
            {raceLabel(race)}
          </button>
        ))}
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold text-gray-400">핵심 기물</h4>
        <CardListZone
          zoneId={`comp:${comp.id}:core`}
          cardIds={comp.coreCards}
          cardsById={cardsById}
          editable={editable}
          onAdd={(id) => addCard('coreCards', id)}
          onRemove={(id) => removeCard('coreCards', id)}
          onCardClick={onCardClick}
          emptyLabel="라이브러리에서 드래그하거나 검색으로 추가하세요."
        />
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold text-gray-400">최종 조합</h4>
        <FinalBoardSlots
          compId={comp.id}
          slots={comp.finalBoard}
          cardsById={cardsById}
          editable={editable}
          onClear={clearSlot}
          onCardClick={onCardClick}
        />
      </div>

      <div>
        <h4 className="mb-1 text-xs font-semibold text-gray-400">추천 장신구</h4>
        <CardListZone
          zoneId={`comp:${comp.id}:trinket`}
          cardIds={comp.trinkets}
          cardsById={cardsById}
          editable={editable}
          onAdd={(id) => addCard('trinkets', id)}
          onRemove={(id) => removeCard('trinkets', id)}
          onCardClick={onCardClick}
          emptyLabel="라이브러리에서 드래그하거나 검색으로 추가하세요."
        />
      </div>

      <Link to={`/comp/${comp.id}`} className="inline-block text-xs text-blue-400 hover:underline">
        빌드업 {comp.buildups.length}개 · 자세히 보기 →
      </Link>
    </div>
  )
}
