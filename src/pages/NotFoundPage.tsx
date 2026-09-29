import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('페이지를 찾을 수 없음')

  return (
    <div className="p-6">
      <p className="text-gray-400 text-sm">페이지를 찾을 수 없습니다.</p>
    </div>
  )
}
