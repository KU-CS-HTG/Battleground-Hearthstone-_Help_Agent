import { useRef, useState, type DragEvent } from 'react'

export default function ImageUploadZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOver, setIsOver] = useState(false)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) onFiles(files)
  }

  function handlePaste(e: React.ClipboardEvent) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null)
    if (files.length > 0) onFiles(files)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      tabIndex={0}
      className={`rounded border border-dashed p-4 text-center text-xs text-gray-400 outline-none ${
        isOver ? 'border-blue-400 bg-blue-400/5' : 'border-white/20'
      }`}
    >
      <p>이미지를 여기로 드래그하거나, 클릭해서 붙여넣기(Ctrl+V) 하세요. (여러 개 추가 가능)</p>
      <button
        onClick={() => inputRef.current?.click()}
        className="mt-2 rounded bg-white/10 px-3 py-1 hover:bg-white/20"
      >
        파일 선택
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length > 0) onFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
