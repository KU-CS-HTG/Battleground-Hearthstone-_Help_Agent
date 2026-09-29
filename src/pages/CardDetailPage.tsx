import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CardDetailContent from '../components/library/CardDetailContent'
import { usePageTitle } from '../hooks/usePageTitle'
import { fetchLibraryCards, type LibraryCard } from '../lib/library'

export default function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>()
  const [card, setCard] = useState<LibraryCard | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!cardId) return
    fetchLibraryCards().then((cards) => {
      const found = cards.find((c) => c.id === cardId)
      if (found) setCard(found)
      else setNotFound(true)
    })
  }, [cardId])

  usePageTitle(card ? card.name : '카드 상세')

  return (
    <div className="p-6">
      {notFound && <p className="text-sm text-gray-400">카드를 찾을 수 없습니다.</p>}
      {card && <CardDetailContent card={card} linkToPage={false} />}
    </div>
  )
}
