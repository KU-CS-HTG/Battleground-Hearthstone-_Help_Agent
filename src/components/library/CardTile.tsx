import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { LibraryCard } from '../../lib/library'

interface Props {
  card: LibraryCard
  hasNote: boolean
  draggable: boolean
  onClick: () => void
}

export default function CardTile({ card, hasNote, draggable, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { card },
    disabled: !draggable,
  })

  return (
    <button
      ref={setNodeRef}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      onClick={onClick}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      title={card.name}
      className="relative w-24 touch-none overflow-hidden rounded border border-white/10 bg-white/5 hover:border-white/30"
    >
      {hasNote && <span className="absolute right-1 top-1 z-10 h-2 w-2 rounded-full bg-yellow-400" />}
      {card.tileUrl ? (
        <img
          src={card.tileUrl}
          alt={card.name}
          className="aspect-square w-full scale-125 object-cover"
          draggable={false}
        />
      ) : (
        <div className="aspect-square w-full bg-white/10" />
      )}
    </button>
  )
}
