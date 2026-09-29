import { useMemo, useState } from 'react'
import { useAllCards } from '../hooks/useAllCards'

export default function CardSearchPicker({ onSelect }: { onSelect: (cardId: string) => void }) {
  const cards = useAllCards()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return cards.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 20)
  }, [cards, query])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded border border-dashed border-white/20 px-2 py-1 text-xs text-gray-400 hover:border-white/40"
      >
        + 검색으로 추가
      </button>
    )
  }

  return (
    <div className="relative inline-block">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="카드 이름 검색"
        className="rounded border border-white/20 bg-black/40 px-2 py-1 text-xs"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-48 overflow-y-auto rounded border border-white/20 bg-[#16171d] text-xs shadow-lg">
          {results.map((c) => (
            <li key={c.id}>
              <button
                onMouseDown={() => {
                  onSelect(c.id)
                  setQuery('')
                  setOpen(false)
                }}
                className="block w-full px-2 py-1 text-left hover:bg-white/10"
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
