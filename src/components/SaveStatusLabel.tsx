import type { SaveStatus } from '../hooks/useAutosaveText'

export default function SaveStatusLabel({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  const text = { saving: '저장 중...', saved: '저장됨', error: '저장 실패' }[status]
  const color = status === 'error' ? 'text-red-400' : 'text-gray-500'
  return <span className={`text-xs ${color}`}>{text}</span>
}
