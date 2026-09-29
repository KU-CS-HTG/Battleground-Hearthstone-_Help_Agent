import { useEffect, useState } from 'react'
import { fetchLibraryCards, type LibraryCard } from '../lib/library'

export function useAllCards() {
  const [cards, setCards] = useState<LibraryCard[]>([])

  useEffect(() => {
    fetchLibraryCards().then(setCards)
  }, [])

  return cards
}
