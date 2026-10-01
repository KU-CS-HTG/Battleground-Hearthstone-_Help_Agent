import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BackToHomeLink from '../components/BackToHomeLink'
import { usePageTitle } from '../hooks/usePageTitle'
import { useAuth } from '../lib/AuthContext'
import { createPost, deletePost, fetchPosts, reorderPosts, updatePost, type InfoPost } from '../lib/infoPosts'

function PostRow({
  post,
  editable,
  onDelete,
  onTagsChange,
}: {
  post: InfoPost
  editable: boolean
  onDelete: () => void
  onTagsChange: (tags: string[]) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: post.id,
    disabled: !editable,
  })

  function addTag() {
    const tag = window.prompt('태그를 입력하세요')
    if (!tag || post.tags.includes(tag)) return
    onTagsChange([...post.tags, tag])
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-3 rounded border border-white/10 bg-white/5 p-3"
    >
      {editable && (
        <span {...attributes} {...listeners} className="cursor-grab touch-none text-gray-500">
          ⠿
        </span>
      )}
      <Link to={`/info/${post.id}`} className="flex-1 font-medium hover:underline">
        {post.title}
      </Link>
      <div className="flex flex-wrap gap-1">
        {post.tags.map((tag) => (
          <span
            key={tag}
            onClick={() => editable && onTagsChange(post.tags.filter((t) => t !== tag))}
            className={`rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400 ${editable ? 'cursor-pointer hover:bg-white/20' : ''}`}
          >
            {tag}
            {editable && ' ✕'}
          </span>
        ))}
        {editable && (
          <button onClick={addTag} className="rounded border border-dashed border-white/20 px-2 py-0.5 text-xs text-gray-500">
            + 태그
          </button>
        )}
      </div>
      {editable && (
        <button onClick={onDelete} className="text-xs text-red-400 hover:underline">
          삭제
        </button>
      )}
    </div>
  )
}

export default function InfoBoardPage() {
  usePageTitle('전장 플레이 가이드')
  const { isLoggedIn } = useAuth()
  const [posts, setPosts] = useState<InfoPost[]>([])

  async function reload() {
    setPosts(await fetchPosts())
  }

  useEffect(() => {
    reload().catch(() => {})
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  async function handleAdd() {
    const post = await createPost(posts.length)
    setPosts((prev) => [...prev, post])
  }

  async function handleDelete(post: InfoPost) {
    if (!window.confirm(`"${post.title}" 글을 삭제할까요?`)) return
    await deletePost(post.id)
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
  }

  function handleTagsChange(post: InfoPost, tags: string[]) {
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, tags } : p)))
    updatePost(post.id, { tags }).catch(() => reload())
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = posts.findIndex((p) => p.id === active.id)
    const newIndex = posts.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const next = [...posts]
    const [moved] = next.splice(oldIndex, 1)
    next.splice(newIndex, 0, moved)
    setPosts(next)
    reorderPosts(next.map((p, idx) => ({ id: p.id, orderIndex: idx }))).catch(() => reload())
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <BackToHomeLink />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">전장 플레이 가이드</h1>
        {isLoggedIn && (
          <button onClick={handleAdd} className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20">
            + 글 추가
          </button>
        )}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                editable={isLoggedIn}
                onDelete={() => handleDelete(post)}
                onTagsChange={(tags) => handleTagsChange(post, tags)}
              />
            ))}
            {posts.length === 0 && <p className="text-sm text-gray-500">글이 없습니다.</p>}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
