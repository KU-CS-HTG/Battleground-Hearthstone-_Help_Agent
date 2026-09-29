import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import CardDetailPage from './pages/CardDetailPage'
import CompDetailPage from './pages/CompDetailPage'
import HomePage from './pages/HomePage'
import InfoBoardPage from './pages/InfoBoardPage'
import InfoDetailPage from './pages/InfoDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/comp/:id" element={<CompDetailPage />} />
        <Route path="/card/:cardId" element={<CardDetailPage />} />
        <Route path="/info" element={<InfoBoardPage />} />
        <Route path="/info/:id" element={<InfoDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
