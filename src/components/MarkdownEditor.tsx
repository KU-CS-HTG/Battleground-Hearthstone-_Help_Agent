import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { SaveStatus } from '../hooks/useAutosaveText'
import SaveStatusLabel from './SaveStatusLabel'

interface Props {
  value: string
  status: SaveStatus
  onChange: (value: string) => void
  readOnly: boolean
  placeholder?: string
  rows?: number
}

export default function MarkdownEditor({ value, status, onChange, readOnly, placeholder, rows = 6 }: Props) {
  const [tab, setTab] = useState<'edit' | 'preview'>(readOnly ? 'preview' : 'edit')

  if (readOnly) {
    return (
      <div className="prose prose-invert prose-sm max-w-none text-sm text-gray-300">
        {value ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        ) : (
          <p className="text-gray-500">{placeholder ?? '작성된 메모가 없습니다.'}</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setTab('edit')}
            className={tab === 'edit' ? 'font-semibold text-white' : 'text-gray-500'}
          >
            편집
          </button>
          <button
            onClick={() => setTab('preview')}
            className={tab === 'preview' ? 'font-semibold text-white' : 'text-gray-500'}
          >
            미리보기
          </button>
        </div>
        <SaveStatusLabel status={status} />
      </div>
      {tab === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y rounded border border-white/20 bg-black/20 p-2 text-sm"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none rounded border border-white/10 p-2 text-sm text-gray-300">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-gray-500">미리볼 내용이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}
