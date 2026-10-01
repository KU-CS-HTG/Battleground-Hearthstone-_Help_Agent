import MarkdownEditor from '../MarkdownEditor'
import { useAutosaveText } from '../../hooks/useAutosaveText'
import type { LibraryCard } from '../../lib/library'
import type { BoardNote } from '../../lib/comps'
import FinalBoardSlots from './FinalBoardSlots'

export default function BoardNoteItem({
  zonePrefix,
  item,
  cardsById,
  editable,
  notesPlaceholder,
  onBoardChange,
  onNotesChange,
  onDelete,
  onCardClick,
}: {
  zonePrefix: string
  item: BoardNote
  cardsById: Map<string, LibraryCard>
  editable: boolean
  notesPlaceholder: string
  onBoardChange: (board: (string | null)[]) => void
  onNotesChange: (notesMd: string) => void
  onDelete: () => void
  onCardClick: (card: LibraryCard) => void
}) {
  const notes = useAutosaveText(item.notesMd, async (next) => onNotesChange(next))

  function setSlot(index: number, cardId: string) {
    const next = [...item.board]
    next[index] = cardId
    onBoardChange(next)
  }

  function clearSlot(index: number) {
    const next = [...item.board]
    next[index] = null
    onBoardChange(next)
  }

  return (
    <div className="space-y-2 rounded border border-white/10 p-3">
      {editable && (
        <div className="flex justify-end">
          <button onClick={onDelete} className="text-xs text-red-400 hover:underline">
            삭제
          </button>
        </div>
      )}
      <FinalBoardSlots
        zonePrefix={zonePrefix}
        slots={item.board}
        cardsById={cardsById}
        editable={editable}
        onClear={clearSlot}
        onSet={setSlot}
        onCardClick={onCardClick}
      />
      <MarkdownEditor
        value={notes.value}
        status={notes.status}
        onChange={notes.handleChange}
        readOnly={!editable}
        placeholder={notesPlaceholder}
      />
    </div>
  )
}
