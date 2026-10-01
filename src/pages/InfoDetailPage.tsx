import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackToHomeLink from '../components/BackToHomeLink'
import Lightbox from '../components/Lightbox'
import MarkdownEditor from '../components/MarkdownEditor'
import Modal from '../components/Modal'
import BoardNoteList from '../components/comp/BoardNoteList'
import ImageTile from '../components/info/ImageTile'
import ImageUploadZone from '../components/info/ImageUploadZone'
import CardDetailContent from '../components/library/CardDetailContent'
import CardLibrary, { type CardLibraryHandle } from '../components/library/CardLibrary'
import { useAllCards } from '../hooks/useAllCards'
import { useAutosaveText } from '../hooks/useAutosaveText'
import { usePageTitle } from '../hooks/usePageTitle'
import { infoPostImageUrl, uploadInfoPostImage } from '../lib/cardImages'
import type { BoardNote } from '../lib/comps'
import { compressImage } from '../lib/imageCompression'
import {
  addImage,
  deleteImage,
  fetchImages,
  fetchPost,
  reorderImages,
  updateImageCaption,
  updateImageSize,
  updatePost,
  type InfoPost,
  type InfoPostImage,
} from '../lib/infoPosts'
import { useAuth } from '../lib/AuthContext'
import type { LibraryCard } from '../lib/library'
import { supabase } from '../lib/supabaseClient'

export default function InfoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isLoggedIn } = useAuth()
  const [post, setPost] = useState<InfoPost | null>(null)
  const [images, setImages] = useState<InfoPostImage[]>([])
  const [notFound, setNotFound] = useState(false)
  const [selectedCard, setSelectedCard] = useState<LibraryCard | null>(null)
  const [lightboxImage, setLightboxImage] = useState<InfoPostImage | null>(null)
  const libraryRef = useRef<CardLibraryHandle>(null)
  const cards = useAllCards()
  const cardsById = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards])

  async function reloadPost() {
    if (!id) return
    const p = await fetchPost(id)
    if (p) setPost(p)
  }

  async function reloadImages() {
    if (!id) return
    setImages(await fetchImages(id))
  }

  useEffect(() => {
    if (!id) return
    fetchPost(id)
      .then((p) => {
        if (p) setPost(p)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
    fetchImages(id)
      .then(setImages)
      .catch(() => {})
  }, [id])

  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`info-post-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'info_posts', filter: `id=eq.${id}` }, () => {
        reloadPost()
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'info_post_images', filter: `post_id=eq.${id}` },
        () => {
          reloadImages()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  usePageTitle(post ? post.title : '기타 정보')

  const description = useAutosaveText(post?.descriptionMd ?? '', async (next) => {
    if (post) await updatePost(post.id, { descriptionMd: next })
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  if (notFound) {
    return (
      <div className="space-y-3 p-6">
        <BackToHomeLink />
        <p className="text-sm text-gray-400">글을 찾을 수 없습니다.</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="space-y-3 p-6">
        <BackToHomeLink />
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  function patch(next: Partial<InfoPost>) {
    if (!post) return
    setPost({ ...post, ...next })
    updatePost(post.id, next).catch(() => reloadPost())
  }

  function addTag() {
    if (!post) return
    const tag = window.prompt('태그를 입력하세요')
    if (!tag || post.tags.includes(tag)) return
    patch({ tags: [...post.tags, tag] })
  }

  function removeTag(tag: string) {
    if (!post) return
    patch({ tags: post.tags.filter((t) => t !== tag) })
  }

  async function handleFiles(files: File[]) {
    if (!id) return
    let nextIndex = images.length
    for (const file of files) {
      const compressed = await compressImage(file)
      const path = await uploadInfoPostImage(compressed, id)
      const image = await addImage(id, path, nextIndex++)
      setImages((prev) => [...prev, image])
    }
  }

  async function handleDeleteImage(image: InfoPostImage) {
    if (!window.confirm('이 이미지를 삭제할까요?')) return
    await deleteImage(image.id)
    setImages((prev) => prev.filter((i) => i.id !== image.id))
  }

  async function handleCaptionChange(image: InfoPostImage, caption: string) {
    setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, caption } : i)))
    try {
      await updateImageCaption(image.id, caption)
    } catch {
      await reloadImages()
    }
  }

  function handleSizeChange(image: InfoPostImage, width: number, height: number) {
    setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, width, height } : i)))
    updateImageSize(image.id, width, height).catch(() => reloadImages())
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!post) return
    const activeId = String(event.active.id)
    const overId = String(event.over?.id ?? '')
    if (!overId) return

    if (activeId.startsWith('img:')) {
      const from = activeId.replace('img:', '')
      const to = overId.replace('img:', '')
      const oldIndex = images.findIndex((i) => i.id === from)
      const newIndex = images.findIndex((i) => i.id === to)
      if (oldIndex === -1 || newIndex === -1) return
      const next = [...images]
      const [moved] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, moved)
      setImages(next)
      reorderImages(next.map((img, idx) => ({ id: img.id, orderIndex: idx }))).catch(() => reloadImages())
      return
    }

    const exampleMatch = overId.match(/^example:([^:]+):([^:]+):slot:(\d+)$/)
    if (exampleMatch) {
      const [, , exampleId, indexStr] = exampleMatch
      const nextExamples = post.ingameExamples.map((ex) => {
        if (ex.id !== exampleId) return ex
        const board = [...ex.board]
        board[Number(indexStr)] = activeId
        return { ...ex, board }
      })
      patch({ ingameExamples: nextExamples })
      return
    }

    libraryRef.current?.handleDragEnd(event)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <BackToHomeLink />
        {isLoggedIn ? (
          <input
            value={post.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="w-full rounded border border-white/20 bg-black/20 px-2 py-1 text-2xl font-bold"
          />
        ) : (
          <h1 className="text-2xl font-bold">{post.title}</h1>
        )}

        <div className="flex flex-wrap items-center gap-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              onClick={() => isLoggedIn && removeTag(tag)}
              className={`rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400 ${isLoggedIn ? 'cursor-pointer hover:bg-white/20' : ''}`}
            >
              {tag}
              {isLoggedIn && ' ✕'}
            </span>
          ))}
          {isLoggedIn && (
            <button onClick={addTag} className="rounded border border-dashed border-white/20 px-2 py-0.5 text-xs text-gray-500">
              + 태그
            </button>
          )}
        </div>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">설명</h3>
          <MarkdownEditor
            value={description.value}
            status={description.status}
            onChange={description.handleChange}
            readOnly={!isLoggedIn}
            placeholder="설명을 마크다운으로 작성하세요"
            rows={10}
          />
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">이미지</h3>
          {isLoggedIn && <ImageUploadZone onFiles={handleFiles} />}
          <SortableContext items={images.map((i) => `img:${i.id}`)} strategy={rectSortingStrategy}>
            <div className="mt-2 flex flex-wrap gap-4">
              {images.map((image) => (
                <ImageTile
                  key={image.id}
                  image={image}
                  editable={isLoggedIn}
                  onCaptionChange={(caption) => handleCaptionChange(image, caption)}
                  onSizeChange={(width, height) => handleSizeChange(image, width, height)}
                  onDelete={() => handleDeleteImage(image)}
                  onOpen={() => setLightboxImage(image)}
                />
              ))}
              {images.length === 0 && <p className="text-xs text-gray-500">이미지가 없습니다.</p>}
            </div>
          </SortableContext>
        </section>

        <section>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">인게임 예시</h3>
          <BoardNoteList
            zoneKind="example"
            ownerId={post.id}
            items={post.ingameExamples}
            cardsById={cardsById}
            editable={isLoggedIn}
            notesPlaceholder="이 예시 상황에 대해 설명해보세요 (마크다운)"
            emptyLabel="아직 없습니다."
            addLabel="+ 추가"
            onChange={(ingameExamples: BoardNote[]) => patch({ ingameExamples })}
            onCardClick={setSelectedCard}
          />
        </section>

        <section>
          <h3 className="mb-2 text-lg font-semibold">카드 라이브러리</h3>
          <CardLibrary ref={libraryRef} />
        </section>

        {selectedCard && (
          <Modal onClose={() => setSelectedCard(null)}>
            <CardDetailContent card={selectedCard} />
          </Modal>
        )}

        {lightboxImage && (
          <Lightbox
            src={infoPostImageUrl(lightboxImage.storagePath)}
            alt={lightboxImage.caption}
            onClose={() => setLightboxImage(null)}
          />
        )}
      </div>
    </DndContext>
  )
}
