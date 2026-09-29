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
    <div className="relative flex w-16 flex-col items-center gap-1 rounded border border-white/10 bg-white/5 p-1 text-center">
      {editable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500/80 text-[10px] hover:bg-red-500"
        >
          ✕
        </button>
      )}
      <button onClick={onClick} className="flex w-full flex-col items-center gap-1">
        {card.tileUrl ? (
          <img src={card.tileUrl} alt={card.name} className="h-8 w-full rounded object-cover" draggable={false} />
        ) : (
          <div className="h-8 w-full rounded bg-white/10" />
        )}
        <span className="line-clamp-2 text-[9px] leading-tight text-gray-300">{card.name}</span>
      </button>
    </div>
  )
}
