import { Link } from 'react-router-dom'
import LoginControl from './LoginControl'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <Link to="/" className="text-lg font-bold">
        전장 도우미
      </Link>
      <nav className="flex items-center gap-4">
        <a href="/info" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
          기타 정보
        </a>
        <LoginControl />
      </nav>
    </header>
  )
}
