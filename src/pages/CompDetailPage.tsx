import { useParams } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export default function CompDetailPage() {
  const { id } = useParams<{ id: string }>()
  usePageTitle(`조합 상세 (${id})`)

  return (
    <div className="p-6">
      <p className="text-gray-400 text-sm">조합 상세 페이지 – 추후 구현 예정 (id: {id})</p>
    </div>
  )
}
