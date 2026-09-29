import { useMemo } from 'react'

let measureCanvas: HTMLCanvasElement | null = null

function measureTextWidth(text: string, fontPx: number) {
  if (typeof document === 'undefined') return text.length * fontPx * 0.6
  measureCanvas ??= document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d')
  if (!ctx) return text.length * fontPx * 0.6
  ctx.font = `${fontPx}px system-ui, sans-serif`
  return ctx.measureText(text).width
}

/** 텍스트가 한 줄에 다 들어가도록, 필요하면 글씨 크기를 줄인 px 값을 계산한다. */
export function useFitFontSize(text: string, maxWidthPx: number, basePx: number, minPx = 6) {
  return useMemo(() => {
    const naturalWidth = measureTextWidth(text, basePx)
    if (naturalWidth <= maxWidthPx || naturalWidth === 0) return basePx
    const fitted = Math.floor((basePx * maxWidthPx) / naturalWidth)
    return Math.max(minPx, Math.min(basePx, fitted))
  }, [text, maxWidthPx, basePx, minPx])
}
