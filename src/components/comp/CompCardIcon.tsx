import FitText from '../FitText'
import type { LibraryCard } from '../../lib/library'

const ICON_WIDTH_PX = 80
const NAME_MAX_WIDTH_PX = ICON_WIDTH_PX - 8

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
    <div className="relative w-20 rounded border border-white/10 bg-white/5" title={card.name}>
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
        <div className="aspect-square w-full overflow-hidden rounded-t">
          {card.tileUrl ? (
            <img
              src={card.tileUrl}
              alt={card.name}
              className="h-full w-full scale-125 object-cover"
              draggable={false}
            />
          ) : (
            <div className="h-full w-full bg-white/10" />
          )}
        </div>
        <div className="px-1 py-0.5 text-gray-300">
          <FitText text={card.name} maxWidthPx={NAME_MAX_WIDTH_PX} basePx={10} />
        </div>
      </button>
    </div>
  )
}
