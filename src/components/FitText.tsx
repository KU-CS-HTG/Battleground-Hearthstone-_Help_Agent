import { useFitFontSize } from '../hooks/useFitFontSize'

export default function FitText({
  text,
  maxWidthPx,
  basePx,
  minPx = 6,
  className,
}: {
  text: string
  maxWidthPx: number
  basePx: number
  minPx?: number
  className?: string
}) {
  const fontSize = useFitFontSize(text, maxWidthPx, basePx, minPx)
  return (
    <span className={`block truncate leading-tight ${className ?? ''}`} style={{ fontSize }}>
      {text}
    </span>
  )
}
