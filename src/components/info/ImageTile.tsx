import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import MarkdownEditor from '../MarkdownEditor'
import { useAutosaveText } from '../../hooks/useAutosaveText'
import { infoPostImageUrl } from '../../lib/cardImages'
import type { InfoPostImage } from '../../lib/infoPosts'

const RESIZE_CORNER_PX = 20

export default function ImageTile({
  image,
  editable,
  onCaptionChange,
  onSizeChange,
  onDelete,
  onOpen,
}: {
  image: InfoPostImage
  editable: boolean
  onCaptionChange: (caption: string) => Promise<void> | void
  onSizeChange: (width: number, height: number) => void
  onDelete: () => void
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `img:${image.id}`,
    disabled: !editable,
  })
  const boxRef = useRef<HTMLDivElement>(null)
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null)

  const caption = useAutosaveText(image.caption, async (next) => {
    await onCaptionChange(next)
  })

  // 크기가 지정되지 않은(기본 크기) 이미지는 반응형으로 표시되므로, 설명란
  // 가로 길이를 이미지 가로 길이에 맞추기 위해 실제 렌더링 폭을 계속 관찰한다.
  useEffect(() => {
    if (image.width != null) return
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setNaturalWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [image.width])

  const hasFixedSize = image.width != null && image.height != null
  const captionWidth = hasFixedSize ? image.width : naturalWidth

  // 브라우저 기본 리사이즈 핸들(우하단 모서리)로 드래그를 시작했을 때만
  // 크기를 저장한다. 이미지를 그냥 클릭했을 때는(전체화면 보기) 저장하지 않는다.
  function handleMouseDown(e: React.MouseEvent) {
    const box = boxRef.current
    if (!box || !editable) return
    const rect = box.getBoundingClientRect()
    const nearRight = rect.right - e.clientX <= RESIZE_CORNER_PX
    const nearBottom = rect.bottom - e.clientY <= RESIZE_CORNER_PX
    if (!nearRight || !nearBottom) return

    function handleMouseUp() {
      window.removeEventListener('mouseup', handleMouseUp)
      const current = boxRef.current
      if (!current) return
      const r = current.getBoundingClientRect()
      onSizeChange(Math.round(r.width), Math.round(r.height))
    }
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="w-fit touch-none space-y-1 rounded border border-white/10 bg-white/5 p-2"
    >
      <div className="flex items-center gap-2">
        {editable && (
          <span {...attributes} {...listeners} className="cursor-grab text-xs text-gray-500">
            ⠿
          </span>
        )}
        {editable && (
          <button onClick={onDelete} className="ml-auto text-xs text-red-400 hover:text-red-300">
            ✕ 삭제
          </button>
        )}
      </div>
      <div
        ref={boxRef}
        onMouseDown={handleMouseDown}
        style={hasFixedSize ? { width: `${image.width}px`, height: `${image.height}px` } : undefined}
        className={`inline-block overflow-hidden rounded bg-black/20 ${hasFixedSize ? '' : 'max-w-[700px]'} ${editable ? 'resize' : ''}`}
      >
        <button
          onClick={onOpen}
          className={`block cursor-pointer p-0 ${hasFixedSize ? 'h-full w-full' : ''}`}
        >
          <img
            src={infoPostImageUrl(image.storagePath)}
            alt=""
            className={hasFixedSize ? 'h-full w-full object-contain' : 'block h-auto max-w-full'}
          />
        </button>
      </div>
      <div style={{ width: captionWidth != null ? `${captionWidth}px` : undefined }}>
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
