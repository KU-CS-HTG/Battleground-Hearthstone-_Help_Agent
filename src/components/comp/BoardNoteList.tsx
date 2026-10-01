import type { LibraryCard } from '../../lib/library'
import type { BoardNote } from '../../lib/comps'
import BoardNoteItem from './BoardNoteItem'

export default function BoardNoteList({
  zoneKind,
  compId,
  items,
  cardsById,
  editable,
  notesPlaceholder,
  emptyLabel,
  addLabel,
  onChange,
  onCardClick,
}: {
  zoneKind: string
  compId: string
  items: BoardNote[]
  cardsById: Map<string, LibraryCard>
  editable: boolean
  notesPlaceholder: string
  emptyLabel: string
  addLabel: string
  onChange: (items: BoardNote[]) => void
  onCardClick: (card: LibraryCard) => void
}) {
  function handleAdd() {
    const next: BoardNote = { id: crypto.randomUUID(), board: [], notesMd: '' }
    onChange([...items, next])
  }

  function handleBoardChange(itemId: string, board: (string | null)[]) {
    onChange(items.map((it) => (it.id === itemId ? { ...it, board } : it)))
  }

  function handleNotesChange(itemId: string, notesMd: string) {
    onChange(items.map((it) => (it.id === itemId ? { ...it, notesMd } : it)))
  }

  function handleDelete(itemId: string) {
    if (!window.confirm('삭제할까요?')) return
    onChange(items.filter((it) => it.id !== itemId))
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <BoardNoteItem
          key={item.id}
          zonePrefix={`${zoneKind}:${compId}:${item.id}`}
          item={item}
          cardsById={cardsById}
          editable={editable}
          notesPlaceholder={notesPlaceholder}
          onBoardChange={(board) => handleBoardChange(item.id, board)}
          onNotesChange={(notesMd) => handleNotesChange(item.id, notesMd)}
          onDelete={() => handleDelete(item.id)}
          onCardClick={onCardClick}
        />
      ))}
      {items.length === 0 && <p className="text-xs text-gray-500">{emptyLabel}</p>}
      {editable && (
        <button onClick={handleAdd} className="text-xs text-blue-400 hover:underline">
          {addLabel}
        </button>
      )}
    </div>
  )
}
