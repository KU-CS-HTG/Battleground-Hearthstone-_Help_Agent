import { useParams } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function CardDetailPage() {
  const { cardId } = useParams<{ cardId: string }>()
  usePageTitle(`카드 상세 (${cardId})`)

  return (
    <div className="p-6">
      <p className="text-gray-400 text-sm">카드 활용법 페이지 – 추후 구현 예정 (cardId: {cardId})</p>
    </div>
  )
}
