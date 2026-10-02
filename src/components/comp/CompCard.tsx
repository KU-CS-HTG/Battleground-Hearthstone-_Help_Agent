import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarkdownEditor from '../MarkdownEditor'
import { useAutosaveText } from '../../hooks/useAutosaveText'
import type { LibraryCard } from '../../lib/library'
import type { BoardNote, Comp } from '../../lib/comps'
import { RACE_ORDER, raceLabel } from '../../lib/races'
import BoardNoteList from './BoardNoteList'
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
  const [collapsed, setCollapsed] = useState(true)

  const finalBoardNotes = useAutosaveText(comp.finalBoardNotesMd, async (next) => onPatch({ finalBoardNotesMd: next }))

  function toggleRace(race: string) {
    const next = comp.races.includes(race) ? comp.races.filter((r) => r !== race) : [...comp.races, race]
    onPatch({ races: next })
  }

  function clearSlot(index: number) {
    const next = [...comp.finalBoard]
    next[index] = null
    onPatch({ finalBoard: next })
  }

  function setSlot(index: number, cardId: string) {
    const next = [...comp.finalBoard]
    next[index] = cardId
    onPatch({ finalBoard: next })
  }

  function handleScenariosChange(scenarios: BoardNote[]) {
    onPatch({ scenarios })
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
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label={collapsed ? '펼치기' : '접기'}
            title={collapsed ? '펼치기' : '접기'}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className={`h-4 w-4 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <Link to={`/comp/${comp.id}`} className="text-lg font-semibold hover:underline">
            {comp.name}
          </Link>
          <Link
            to={`/comp/${comp.id}`}
            className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-300 hover:bg-white/20"
          >
            자세히 보기
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

      {!collapsed && (
        <>
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
            <h4 className="mb-1 text-xs font-semibold text-gray-400">최종 조합</h4>
            <FinalBoardSlots
              zonePrefix={`comp:${comp.id}`}
              slots={comp.finalBoard}
              cardsById={cardsById}
              editable={editable}
              onClear={clearSlot}
              onSet={setSlot}
              onCardClick={onCardClick}
            />
            <div className="mt-2">
              <MarkdownEditor
                value={finalBoardNotes.value}
                status={finalBoardNotes.status}
                onChange={finalBoardNotes.handleChange}
                readOnly={!editable}
                placeholder="이 조합에 대한 메모를 남겨보세요 (마크다운)"
              />
            </div>
          </div>

          <div>
            <h4 className="mb-1 text-xs font-semibold text-gray-400">각 보는 방법</h4>
            <BoardNoteList
              zoneKind="scenario"
              ownerId={comp.id}
              items={comp.scenarios}
              cardsById={cardsById}
              editable={editable}
              notesPlaceholder="어떤 상황에 이 덱을 가면 좋은지 적어보세요 (마크다운)"
              emptyLabel="아직 없습니다."
              addLabel="+ 추가"
              onChange={handleScenariosChange}
              onCardClick={onCardClick}
            />
          </div>
        </>
      )}
    </div>
  )
}
