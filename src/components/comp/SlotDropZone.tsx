import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'

export default function SlotDropZone({
  id,
  disabled,
  className,
  children,
}: {
  id: string
  disabled: boolean
  className?: string
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled })
  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ''} ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      {children}
    </div>
  )
}
