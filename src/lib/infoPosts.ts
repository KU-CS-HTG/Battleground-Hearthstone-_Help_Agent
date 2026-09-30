import { supabase } from './supabaseClient'

export interface InfoPost {
  id: string
  title: string
  descriptionMd: string
  tags: string[]
  attachedCards: string[]
  orderIndex: number
}

export interface InfoPostImage {
  id: string
  postId: string
  storagePath: string
  caption: string
  orderIndex: number
}

const POST_COLUMNS = 'id,title,description_md,tags,attached_cards,order_index'

interface PostRow {
  id: string
  title: string
  description_md: string
  tags: string[]
  attached_cards: string[]
  order_index: number
}

function fromPostRow(row: PostRow): InfoPost {
  return {
    id: row.id,
    title: row.title,
    descriptionMd: row.description_md ?? '',
    tags: row.tags ?? [],
    attachedCards: row.attached_cards ?? [],
    orderIndex: row.order_index,
  }
}

export async function fetchPosts(): Promise<InfoPost[]> {
  const { data, error } = await supabase.from('info_posts').select(POST_COLUMNS).order('order_index')
  if (error) throw error
  return (data as PostRow[]).map(fromPostRow)
}

export async function fetchPost(id: string): Promise<InfoPost | null> {
  const { data, error } = await supabase.from('info_posts').select(POST_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? fromPostRow(data as PostRow) : null
}

export async function createPost(orderIndex: number): Promise<InfoPost> {
  const { data, error } = await supabase
    .from('info_posts')
    .insert({ title: '새 글', description_md: '', tags: [], attached_cards: [], order_index: orderIndex })
    .select(POST_COLUMNS)
    .single()
  if (error) throw error
  return fromPostRow(data as PostRow)
}

export interface PostPatch {
  title?: string
  descriptionMd?: string
  tags?: string[]
  attachedCards?: string[]
}

export async function updatePost(id: string, patch: PostPatch) {
  const row: Record<string, unknown> = {}
  if (patch.title !== undefined) row.title = patch.title
  if (patch.descriptionMd !== undefined) row.description_md = patch.descriptionMd
  if (patch.tags !== undefined) row.tags = patch.tags
  if (patch.attachedCards !== undefined) row.attached_cards = patch.attachedCards
  const { error } = await supabase.from('info_posts').update(row).eq('id', id)
  if (error) throw error
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('info_posts').delete().eq('id', id)
  if (error) throw error
}

export async function reorderPosts(order: { id: string; orderIndex: number }[]) {
  const results = await Promise.all(
    order.map((o) => supabase.from('info_posts').update({ order_index: o.orderIndex }).eq('id', o.id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}

export async function fetchImages(postId: string): Promise<InfoPostImage[]> {
  const { data, error } = await supabase
    .from('info_post_images')
    .select('id,post_id,storage_path,caption,order_index')
    .eq('post_id', postId)
    .order('order_index')
  if (error) throw error
  return data.map((r) => ({
    id: r.id,
    postId: r.post_id,
    storagePath: r.storage_path,
    caption: r.caption ?? '',
    orderIndex: r.order_index,
  }))
}

export async function addImage(postId: string, storagePath: string, orderIndex: number): Promise<InfoPostImage> {
  const { data, error } = await supabase
    .from('info_post_images')
    .insert({ post_id: postId, storage_path: storagePath, caption: '', order_index: orderIndex })
    .select('id,post_id,storage_path,caption,order_index')
    .single()
  if (error) throw error
  return {
    id: data.id,
    postId: data.post_id,
    storagePath: data.storage_path,
    caption: data.caption ?? '',
    orderIndex: data.order_index,
  }
}

export async function updateImageCaption(id: string, caption: string) {
  const { error } = await supabase.from('info_post_images').update({ caption }).eq('id', id)
  if (error) throw error
}

export async function deleteImage(id: string) {
  const { error } = await supabase.from('info_post_images').delete().eq('id', id)
  if (error) throw error
}

export async function reorderImages(order: { id: string; orderIndex: number }[]) {
  const results = await Promise.all(
    order.map((o) => supabase.from('info_post_images').update({ order_index: o.orderIndex }).eq('id', o.id)),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}
