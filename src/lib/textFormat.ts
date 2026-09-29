/** HearthstoneJSON 카드 텍스트의 간단한 서식 태그를 제거해 순수 텍스트로 바꾼다. */
export function stripCardTags(text: string): string {
  return text.replace(/<[^>]+>/g, '')
}
