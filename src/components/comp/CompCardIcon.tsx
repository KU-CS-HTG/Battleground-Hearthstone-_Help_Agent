import type { LibraryCard } from '../../lib/library'

export default function CompCardIcon({
  card,
  editable,
  onClick,
  onRemove,
}: {
  card: LibraryCard
  editable: boolean
  onClick: () => void
  onRemove?: () => void
}) {
  return (
    <div className="relative w-20 overflow-hidden rounded border border-white/10 bg-white/5" title={card.name}>
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -right-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-red-500/80 text-[10px] hover:bg-red-500"
        >
          ✕
        </button>
      )}
      <button onClick={onClick} className="block w-full">
        {card.tileUrl ? (
          <img src={card.tileUrl} alt={card.name} className="aspect-square w-full object-cover" draggable={false} />
        ) : (
          <div className="aspect-square w-full bg-white/10" />
        )}
      </button>
    </div>
  )
}
