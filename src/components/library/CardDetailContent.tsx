import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MarkdownEditor from '../MarkdownEditor'
import { fetchCompsUsingCard, type CompRef } from '../../lib/comps'
import { fetchNote, saveNote } from '../../lib/cardNotes'
import { useAutosaveText } from '../../hooks/useAutosaveText'
import { useAuth } from '../../lib/AuthContext'
import type { LibraryCard } from '../../lib/library'
import { stripCardTags } from '../../lib/textFormat'

const KIND_LABEL: Record<LibraryCard['kind'], string> = {
  minion: '하수인',
  spell: '선술집 주문',
  trinket: '장신구',
}

export default function CardDetailContent({ card, linkToPage = true }: { card: LibraryCard; linkToPage?: boolean }) {
  const { isLoggedIn } = useAuth()
  const [initialNote, setInitialNote] = useState<string | null>(null)
  const [comps, setComps] = useState<CompRef[]>([])

  useEffect(() => {
    setInitialNote(null)
    fetchNote(card.id).then(setInitialNote)
    fetchCompsUsingCard(card.id).then(setComps)
  }, [card.id])

  const { value, status, handleChange } = useAutosaveText(initialNote ?? '', (next) => saveNote(card.id, next))

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <img
          src={card.renderUrl}
          alt={card.name}
          className="h-48 w-auto rounded"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{card.name}</h2>
          <p className="text-xs text-gray-400">
            {KIND_LABEL[card.kind]}
            {card.techLevel != null && ` · 선술집 ${card.techLevel}등급`}
            {card.trinketRank && ` · ${card.trinketRank === 'lesser' ? '약소' : '중요'} 장신구`}
            {card.race && ` · ${card.race}`}
          </p>
          {linkToPage && (
            <Link to={`/card/${card.id}`} className="text-xs text-blue-400 hover:underline">
              카드 단독 페이지 열기 →
            </Link>
          )}
        </div>
      </div>

      {card.text && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-gray-300">원문 텍스트</h3>
          <p className="whitespace-pre-line text-sm text-gray-400">{stripCardTags(card.text)}</p>
        </div>
      )}

      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-300">내 활용법</h3>
        {initialNote === null ? (
          <p className="text-xs text-gray-500">불러오는 중...</p>
        ) : (
          <MarkdownEditor
            value={value}
            status={status}
            onChange={handleChange}
            readOnly={!isLoggedIn}
            placeholder="이 카드를 어떻게 활용하는지 적어보세요 (마크다운)"
          />
        )}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-300">이 카드가 쓰인 내 조합</h3>
        {comps.length === 0 ? (
          <p className="text-xs text-gray-500">아직 없습니다.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {comps.map((c) => (
              <li key={c.id}>
                <Link to={`/comp/${c.id}`} className="text-blue-400 hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
