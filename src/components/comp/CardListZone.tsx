import CardSearchPicker from '../CardSearchPicker'
import type { LibraryCard } from '../../lib/library'
import CompCardIcon from './CompCardIcon'
import SlotDropZone from './SlotDropZone'

interface Props {
  zoneId: string
  cardIds: string[]
  cardsById: Map<string, LibraryCard>
  editable: boolean
  onAdd: (cardId: string) => void
  onRemove: (cardId: string) => void
  onCardClick: (card: LibraryCard) => void
  emptyLabel: string
}

export default function CardListZone({
  zoneId,
  cardIds,
  cardsById,
  editable,
  onAdd,
  onRemove,
  onCardClick,
  emptyLabel,
}: Props) {
  return (
    <div className="space-y-1">
      <SlotDropZone
        id={zoneId}
        disabled={!editable}
        className="flex min-h-[56px] flex-wrap gap-2 rounded border border-dashed border-white/10 p-2"
      >
        {cardIds.map((id) => {
          const card = cardsById.get(id)
          if (!card) return null
          return (
            <CompCardIcon
              key={id}
              card={card}
              editable={editable}
              onClick={() => onCardClick(card)}
              onRemove={() => onRemove(id)}
            />
          )
        })}
        {cardIds.length === 0 && <p className="text-xs text-gray-600">{emptyLabel}</p>}
      </SlotDropZone>
      {editable && <CardSearchPicker onSelect={onAdd} />}
    </div>
  )
}
