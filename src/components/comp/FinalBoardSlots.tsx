import CardSearchPicker from '../CardSearchPicker'
import type { LibraryCard } from '../../lib/library'
import CompCardIcon from './CompCardIcon'
import SlotDropZone from './SlotDropZone'

const SLOT_COUNT = 7

export default function FinalBoardSlots({
  zonePrefix,
  slots,
  cardsById,
  editable,
  onClear,
  onSet,
  onCardClick,
}: {
  zonePrefix: string
  slots: (string | null)[]
  cardsById: Map<string, LibraryCard>
  editable: boolean
  onClear: (index: number) => void
  onSet: (index: number, cardId: string) => void
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
            id={`${zonePrefix}:slot:${index}`}
            disabled={!editable}
            className="flex min-h-20 w-20 flex-col items-center justify-center gap-1 rounded border border-dashed border-white/20"
          >
            {card ? (
              <CompCardIcon card={card} editable={editable} onClick={() => onCardClick(card)} onRemove={() => onClear(index)} />
            ) : editable ? (
              <CardSearchPicker compact onSelect={(id) => onSet(index, id)} />
            ) : (
              <span className="text-[10px] text-gray-600">{index + 1}</span>
            )}
          </SlotDropZone>
        )
      })}
    </div>
  )
}
