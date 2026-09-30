import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { infoPostImageUrl } from '../../lib/cardImages'
import type { InfoPostImage } from '../../lib/infoPosts'

export default function ImageTile({
  image,
  editable,
  onCaptionChange,
  onDelete,
  onOpen,
}: {
  image: InfoPostImage
  editable: boolean
  onCaptionChange: (caption: string) => void
  onDelete: () => void
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `img:${image.id}`,
    disabled: !editable,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative w-40 touch-none overflow-hidden rounded border border-white/10 bg-white/5"
    >
      {editable && (
        <button
          onClick={onDelete}
          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-xs hover:bg-red-500"
        >
          ✕
        </button>
      )}
      <button
        {...(editable ? attributes : {})}
        {...(editable ? listeners : {})}
        onClick={onOpen}
        className="block w-full cursor-pointer"
      >
        <img src={infoPostImageUrl(image.storagePath)} alt={image.caption} className="h-32 w-full object-cover" />
      </button>
      {editable ? (
        <input
          value={image.caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="캡션"
          className="w-full bg-black/30 px-1 py-0.5 text-xs text-gray-300"
        />
      ) : (
        image.caption && <p className="px-1 py-0.5 text-xs text-gray-400">{image.caption}</p>
      )}
    </div>
  )
}
