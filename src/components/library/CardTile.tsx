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
      className="relative flex w-20 touch-none flex-col items-center gap-1 rounded border border-white/10 bg-white/5 p-1 text-center hover:border-white/30"
    >
      {hasNote && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-yellow-400" />}
      {card.tileUrl ? (
        <img src={card.tileUrl} alt={card.name} className="h-10 w-full rounded object-cover" draggable={false} />
      ) : (
        <div className="h-10 w-full rounded bg-white/10" />
      )}
      <span className="line-clamp-2 text-[10px] leading-tight text-gray-300">{card.name}</span>
    </button>
  )
}
