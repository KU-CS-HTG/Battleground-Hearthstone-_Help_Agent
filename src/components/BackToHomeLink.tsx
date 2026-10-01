import { Link } from 'react-router-dom'

export default function BackToHomeLink() {
  return (
    <Link to="/" className="inline-block text-sm text-gray-400 hover:text-white hover:underline">
      ← 메인 화면으로 돌아가기
    </Link>
  )
}
