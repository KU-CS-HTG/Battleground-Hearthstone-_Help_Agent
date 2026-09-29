import type { LibraryCard } from '../../lib/library'
import CompCardIcon from './CompCardIcon'
import SlotDropZone from './SlotDropZone'

const SLOT_COUNT = 7

export default function FinalBoardSlots({
  compId,
  slots,
  cardsById,
  editable,
  onClear,
  onCardClick,
}: {
  compId: string
  slots: (string | null)[]
  cardsById: Map<string, LibraryCard>
  editable: boolean
  onClear: (index: number) => void
  onCardClick: (card: LibraryCard) => void
}) {
  const filled = Array.from({ length: SLOT_COUNT }, (_, i) => slots[i] ?? null)

  return (
    <div className="flex flex-wrap gap-2">
      {filled.map((cardId, index) => {
        const card = cardId ? cardsById.get(cardId) : undefined
        return (
          <SlotDropZone
            key={index}
            id={`comp:${compId}:slot:${index}`}
            disabled={!editable}
            className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-white/20"
          >
            {card ? (
              <CompCardIcon card={card} editable={editable} onClick={() => onCardClick(card)} onRemove={() => onClear(index)} />
            ) : (
              <span className="text-[10px] text-gray-600">{index + 1}</span>
            )}
          </SlotDropZone>
        )
      })}
    </div>
  )
}
