import { useEffect, useState } from 'react'
import { fetchCardDataMeta, refreshCardData, type CardDataMeta } from '../lib/cardData'
import { useAuth } from '../lib/AuthContext'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function CardDataStatus() {
  const { isLoggedIn } = useAuth()
  const [meta, setMeta] = useState<CardDataMeta | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCardDataMeta().then(setMeta)
  }, [])

  async function handleRefresh() {
    setStatus('loading')
    setError(null)
    try {
      const next = await refreshCardData()
      setMeta(next)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
      <span>
        데이터 빌드: {meta ? meta.buildNumber : '알 수 없음'} · 마지막 갱신:{' '}
        {meta ? new Date(meta.refreshedAt).toLocaleString('ko-KR') : '갱신 기록 없음'}
      </span>
      {isLoggedIn && (
        <button
          onClick={handleRefresh}
          disabled={status === 'loading'}
          className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50"
        >
          {status === 'loading' ? '갱신 중...' : '카드 데이터 갱신'}
        </button>
      )}
      {status === 'success' && <span className="text-green-400">갱신 완료</span>}
      {status === 'error' && <span className="text-red-400">{error}</span>}
    </div>
  )
}
