import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import type { ReactNode } from 'react'
import type { LibraryCard } from '../../lib/library'
import CardTile from './CardTile'

interface Props {
  zoneId: string
  cards: LibraryCard[]
  notedIds: Set<string>
  draggable: boolean
  onCardClick: (card: LibraryCard) => void
  emptyLabel?: string
  footer?: ReactNode
}

export default function CardZone({ zoneId, cards, notedIds, draggable, onCardClick, emptyLabel, footer }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: zoneId, disabled: !draggable })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[64px] rounded border border-dashed p-2 ${isOver ? 'border-blue-400 bg-blue-400/5' : 'border-white/10'}`}
    >
      <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-2">
          {cards.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              hasNote={notedIds.has(card.id)}
              draggable={draggable}
              onClick={() => onCardClick(card)}
            />
          ))}
          {cards.length === 0 && emptyLabel && <p className="text-xs text-gray-600">{emptyLabel}</p>}
        </div>
      </SortableContext>
      {footer}
    </div>
  )
}
