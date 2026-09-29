import { useState, type FormEvent } from 'react'
import Modal from '../Modal'
import { createCustomCard, updateCustomCardImage } from '../../lib/customCards'
import { uploadCustomCardImage } from '../../lib/cardImages'
import type { CardKind } from '../../lib/library'

export default function CustomCardDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<CardKind>('minion')
  const [tier, setTier] = useState('')
  const [race, setRace] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      const id = await createCustomCard({
        name,
        kind,
        tier: tier ? Number(tier) : null,
        race: race || null,
      })
      if (file) {
        const path = await uploadCustomCardImage(file, id)
        await updateCustomCardImage(id, path)
      }
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '추가에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="mb-3 text-lg font-semibold">카드 수동 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="mb-1 block text-gray-400">이름</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/20 p-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-gray-400">종류</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as CardKind)}
            className="w-full rounded border border-white/20 bg-black/20 p-2"
          >
            <option value="minion">하수인</option>
            <option value="spell">선술집 주문</option>
            <option value="trinket">장신구</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-gray-400">등급 (선택)</label>
          <input
            type="number"
            min={1}
            max={7}
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/20 p-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-gray-400">종족 (선택)</label>
          <input
            value={race}
            onChange={(e) => setRace(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/20 p-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-gray-400">이미지 (선택)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        {error && <p className="text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded bg-white/10 p-2 hover:bg-white/20 disabled:opacity-50"
        >
          {isSaving ? '추가 중...' : '추가'}
        </button>
      </form>
    </Modal>
  )
}
