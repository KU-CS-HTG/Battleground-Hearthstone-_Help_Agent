import { useEffect } from 'react'

const SITE_NAME = '전장 도우미'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  }, [title])
}
