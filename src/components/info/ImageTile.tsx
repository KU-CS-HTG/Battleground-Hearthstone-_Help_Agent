import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import MarkdownEditor from '../MarkdownEditor'
import { useAutosaveText } from '../../hooks/useAutosaveText'
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
  onCaptionChange: (caption: string) => Promise<void> | void
  onDelete: () => void
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `img:${image.id}`,
    disabled: !editable,
  })

  const caption = useAutosaveText(image.caption, async (next) => {
    await onCaptionChange(next)
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="relative w-56 touch-none overflow-hidden rounded border border-white/10 bg-white/5"
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
        <img src={infoPostImageUrl(image.storagePath)} alt="" className="h-32 w-full object-cover" />
      </button>
      <div className="p-1">
        <MarkdownEditor
          value={caption.value}
          status={caption.status}
          onChange={caption.handleChange}
          readOnly={!editable}
          placeholder="이미지 설명 (마크다운)"
          rows={3}
        />
      </div>
    </div>
  )
}
