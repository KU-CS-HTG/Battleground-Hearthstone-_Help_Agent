import { useEffect, useRef, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosaveText(initialValue: string, onSave: (value: string) => Promise<void>, delay = 800) {
  const [value, setValue] = useState(initialValue)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<number | undefined>(undefined)
  const initialRef = useRef(initialValue)

  useEffect(() => {
    if (initialValue !== initialRef.current) {
      initialRef.current = initialValue
      setValue(initialValue)
      setStatus('idle')
    }
  }, [initialValue])

  function handleChange(next: string) {
    setValue(next)
    setStatus('saving')
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      onSave(next)
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'))
    }, delay)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return { value, status, handleChange }
}
