import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MarkdownEditor from '../MarkdownEditor'
import SaveStatusLabel from '../SaveStatusLabel'
import { fetchCompsUsingCard, type CompRef } from '../../lib/comps'
import { fetchNote, saveNote } from '../../lib/cardNotes'
import { saveImageOverride, saveStatsOverride, saveTechLevelOverride, saveTextOverride } from '../../lib/cardOverrides'
import { customCardImageUrl, uploadCardImageOverride } from '../../lib/cardImages'
import { deleteCustomCard } from '../../lib/customCards'
import { useAutosaveText } from '../../hooks/useAutosaveText'
import { useAuth } from '../../lib/AuthContext'
import type { LibraryCard } from '../../lib/library'
import { raceLabel } from '../../lib/races'
import { stripCardTags } from '../../lib/textFormat'

const KIND_LABEL: Record<LibraryCard['kind'], string> = {
  minion: '하수인',
  spell: '선술집 주문',
  trinket: '장신구',
}

const TRINKET_RANK_LABEL: Record<'lesser' | 'greater', string> = {
  lesser: '하급',
  greater: '상급',
}

export default function CardDetailContent({
  card,
  linkToPage = true,
  onDeleted,
}: {
  card: LibraryCard
  linkToPage?: boolean
  onDeleted?: () => void
}) {
  const { isLoggedIn } = useAuth()
  const [initialNote, setInitialNote] = useState<string | null>(null)
  const [comps, setComps] = useState<CompRef[]>([])
  const [imgSrc, setImgSrc] = useState(card.renderUrl)
  const [imgFailed, setImgFailed] = useState(false)
  const [techLevel, setTechLevel] = useState(card.techLevel)
  const [techLevelStatus, setTechLevelStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [attack, setAttack] = useState(card.attack)
  const [health, setHealth] = useState(card.health)
  const [statsStatus, setStatsStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [imageStatus, setImageStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setInitialNote(null)
    fetchNote(card.id).then(setInitialNote)
    fetchCompsUsingCard(card.id).then(setComps)
    setImgSrc(card.renderUrl)
    setImgFailed(false)
    setTechLevel(card.techLevel)
    setTechLevelStatus('idle')
    setAttack(card.attack)
    setHealth(card.health)
    setStatsStatus('idle')
    setImageStatus('idle')
  }, [card.id, card.renderUrl, card.techLevel, card.attack, card.health])

  const { value, status, handleChange } = useAutosaveText(initialNote ?? '', (next) => saveNote(card.id, next))
  const textOverride = useAutosaveText(stripCardTags(card.text ?? ''), (next) => saveTextOverride(card.id, next))

  function handleImgError() {
    if (imgSrc === card.renderUrl && card.tileUrl) {
      setImgSrc(card.tileUrl)
    } else {
      setImgFailed(true)
    }
  }

  function handleTechLevelChange(next: number) {
    setTechLevel(next)
    setTechLevelStatus('saving')
    saveTechLevelOverride(card.id, next)
      .then(() => setTechLevelStatus('saved'))
      .catch(() => setTechLevelStatus('error'))
  }

  function handleStatsChange(nextAttack: number | null, nextHealth: number | null) {
    setAttack(nextAttack)
    setHealth(nextHealth)
    setStatsStatus('saving')
    saveStatsOverride(card.id, nextAttack, nextHealth)
      .then(() => setStatsStatus('saved'))
      .catch(() => setStatsStatus('error'))
  }

  async function handleDelete() {
    if (!window.confirm(`"${card.name}" 카드를 삭제할까요?`)) return
    setIsDeleting(true)
    try {
      await deleteCustomCard(card.id)
      onDeleted?.()
    } catch {
      setIsDeleting(false)
    }
  }

  async function handleImageChange(file: File) {
    setImageStatus('saving')
    try {
      const path = await uploadCardImageOverride(file, card.id)
      await saveImageOverride(card.id, path)
      const url = customCardImageUrl(path)
      if (url) {
        setImgSrc(url)
        setImgFailed(false)
      }
      setImageStatus('saved')
    } catch {
      setImageStatus('error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          {!imgFailed && (
            <img src={imgSrc} alt={card.name} className="h-48 w-auto rounded" onError={handleImgError} />
          )}
          {isLoggedIn && (
            <div className="mt-1 flex items-center gap-1">
              <label className="cursor-pointer text-xs text-blue-400 hover:underline">
                이미지 변경
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageChange(file)
                    e.target.value = ''
                  }}
                />
              </label>
              <SaveStatusLabel status={imageStatus} />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{card.name}</h2>
          <div className="flex flex-wrap items-center gap-1 text-xs text-gray-400">
            <span>{KIND_LABEL[card.kind]}</span>
            {techLevel != null && (
              <span className="flex items-center gap-1">
                · 선술집{' '}
                {isLoggedIn ? (
                  <select
                    value={techLevel}
                    onChange={(e) => handleTechLevelChange(Number(e.target.value))}
                    className="rounded border border-white/20 bg-black/30 px-1 py-0.5 text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}성
                      </option>
                    ))}
                  </select>
                ) : (
                  `${techLevel}성`
                )}
                <SaveStatusLabel status={techLevelStatus} />
              </span>
            )}
            {card.trinketRank && <span>· {TRINKET_RANK_LABEL[card.trinketRank]} 장신구</span>}
            {card.race && <span>· {raceLabel(card.race)}</span>}
          </div>
          {card.kind === 'minion' && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              {isLoggedIn ? (
                <>
                  <span>공격력</span>
                  <input
                    type="number"
                    value={attack ?? ''}
                    onChange={(e) => handleStatsChange(e.target.value === '' ? null : Number(e.target.value), health)}
                    className="w-14 rounded border border-white/20 bg-black/30 px-1 py-0.5"
                  />
                  <span>/ 생명력</span>
                  <input
                    type="number"
                    value={health ?? ''}
                    onChange={(e) => handleStatsChange(attack, e.target.value === '' ? null : Number(e.target.value))}
                    className="w-14 rounded border border-white/20 bg-black/30 px-1 py-0.5"
                  />
                  <SaveStatusLabel status={statsStatus} />
                </>
              ) : (
                (attack != null || health != null) && (
                  <span>
                    공격력 {attack ?? '?'} / 생명력 {health ?? '?'}
                  </span>
                )
              )}
            </div>
          )}
          {linkToPage && (
            <Link to={`/card/${card.id}`} className="text-xs text-blue-400 hover:underline">
              카드 단독 페이지 열기 →
            </Link>
          )}
          {isLoggedIn && card.isCustom && onDeleted && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="block text-xs text-red-400 hover:underline disabled:opacity-50"
            >
              {isDeleting ? '삭제 중...' : '카드 삭제'}
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-300">원문 텍스트</h3>
        {isLoggedIn ? (
          <div>
            <textarea
              value={textOverride.value}
              onChange={(e) => textOverride.handleChange(e.target.value)}
              placeholder="원문 텍스트가 깨져 있다면 직접 고쳐보세요"
              rows={3}
              className="w-full resize-y rounded border border-white/20 bg-black/20 p-2 text-sm text-gray-300"
            />
            <SaveStatusLabel status={textOverride.status} />
          </div>
        ) : (
          card.text && <p className="whitespace-pre-line text-sm text-gray-400">{stripCardTags(card.text)}</p>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-300">내 활용법</h3>
        {initialNote === null ? (
          <p className="text-xs text-gray-500">불러오는 중...</p>
        ) : (
          <MarkdownEditor
            value={value}
            status={status}
            onChange={handleChange}
            readOnly={!isLoggedIn}
            placeholder="이 카드를 어떻게 활용하는지 적어보세요 (마크다운)"
          />
        )}
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-gray-300">이 카드가 쓰인 내 조합</h3>
        {comps.length === 0 ? (
          <p className="text-xs text-gray-500">아직 없습니다.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {comps.map((c) => (
              <li key={c.id}>
                <Link to={`/comp/${c.id}`} className="text-blue-400 hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
