import CardDataStatus from '../components/CardDataStatus'
import CardLibrary from '../components/library/CardLibrary'
import { usePageTitle } from '../hooks/usePageTitle'

export default function HomePage() {
  usePageTitle()

  return (
    <div className="p-6 space-y-8">
      <CardDataStatus />
      <section>
        <h2 className="text-xl font-semibold mb-2">조합 보드</h2>
        <p className="text-gray-400 text-sm">추후 구현 예정 (기능 1)</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">카드 라이브러리</h2>
        <CardLibrary />
      </section>
    </div>
  )
}
