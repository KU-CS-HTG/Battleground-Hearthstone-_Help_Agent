import { Link } from 'react-router-dom'
import LoginControl from './LoginControl'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <Link to="/" className="text-lg font-bold">
        전장 도우미
      </Link>
      <nav className="flex items-center gap-4">
        <Link to="/info" className="text-sm hover:underline">
          전장 플레이 가이드
        </Link>
        <LoginControl />
      </nav>
    </header>
  )
}
