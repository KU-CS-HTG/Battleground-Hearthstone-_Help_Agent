import { usePageTitle } from '../hooks/usePageTitle'

export default function InfoBoardPage() {
  usePageTitle('기타 정보')

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">기타 정보</h1>
      <p className="text-gray-400 text-sm">게시판 목록 – 추후 구현 예정 (기능 3)</p>
    </div>
  )
}
