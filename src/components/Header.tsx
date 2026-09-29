import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Header() {
  const { isLoggedIn } = useAuth()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <Link to="/" className="text-lg font-bold">
        전장 도우미
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <a href="/info" target="_blank" rel="noopener noreferrer" className="hover:underline">
          기타 정보
        </a>
        <span className="text-gray-500">{isLoggedIn ? '로그인됨' : '읽기 전용'}</span>
      </nav>
    </header>
  )
}
