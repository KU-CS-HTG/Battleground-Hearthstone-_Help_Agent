import { useState, type FormEvent } from 'react'
import { signIn, signOut } from '../lib/auth'
import { useAuth } from '../lib/AuthContext'

export default function LoginControl() {
  const { isLoggedIn, isLoading } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) return null

  if (isLoggedIn) {
    return (
      <button
        onClick={() => void signOut()}
        className="text-sm text-gray-400 hover:text-white"
      >
        로그아웃
      </button>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const err = await signIn(email, password)
    setIsSubmitting(false)
    if (err) {
      setError('로그인에 실패했습니다.')
      return
    }
    setIsFormOpen(false)
    setPassword('')
  }

  if (!isFormOpen) {
    return (
      <button
        onClick={() => setIsFormOpen(true)}
        className="text-sm text-gray-400 hover:text-white"
      >
        로그인
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 text-sm">
      <input
        type="email"
        required
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-36 rounded border border-white/20 bg-transparent px-2 py-1"
      />
      <input
        type="password"
        required
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-28 rounded border border-white/20 bg-transparent px-2 py-1"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 disabled:opacity-50"
      >
        확인
      </button>
      <button
        type="button"
        onClick={() => {
          setIsFormOpen(false)
          setError(null)
        }}
        className="text-gray-500 hover:text-white"
      >
        취소
      </button>
      {error && <span className="text-red-400">{error}</span>}
    </form>
  )
}
