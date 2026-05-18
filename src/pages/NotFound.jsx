import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🎯</div>
        <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Страница не найдена</h2>
        <p className="text-gray-500 mb-8">Похоже эта страница исчезла как неправильный ответ!</p>
        <button onClick={() => navigate('/')}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all">
          На главную →
        </button>
      </div>
    </div>
  )
}