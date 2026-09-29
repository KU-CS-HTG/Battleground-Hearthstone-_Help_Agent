import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useRef } from 'react'
import CardDataStatus from '../components/CardDataStatus'
import CompBoard, { type CompBoardHandle } from '../components/comp/CompBoard'
import CardLibrary, { type CardLibraryHandle } from '../components/library/CardLibrary'
import { usePageTitle } from '../hooks/usePageTitle'

export default function HomePage() {
  usePageTitle()
  const compBoardRef = useRef<CompBoardHandle>(null)
  const libraryRef = useRef<CardLibraryHandle>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = String(event.over?.id ?? '')
    if (!overId) return

    if (activeId.startsWith('compcard:')) {
      compBoardRef.current?.handleReorder(event)
    } else if (overId.startsWith('comp:')) {
      compBoardRef.current?.handleDropCard(event)
    } else {
      libraryRef.current?.handleDragEnd(event)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="p-6 space-y-8">
        <CardDataStatus />
        <section>
          <h2 className="text-xl font-semibold mb-2">조합 보드</h2>
          <CompBoard ref={compBoardRef} />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">카드 라이브러리</h2>
          <CardLibrary ref={libraryRef} />
        </section>
      </div>
    </DndContext>
  )
}
