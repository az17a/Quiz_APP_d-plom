import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [leaders, setLeaders] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(u)
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const scores = {}
    quizzes.forEach(q => {
      (q.responses || []).forEach(r => {
        if (!scores[r.userName]) scores[r.userName] = { name: r.userName, score: 0, count: 0 }
        scores[r.userName].score += r.score
        scores[r.userName].count += 1
      })
    })
    const sorted = Object.values(scores).sort((a, b) => b.score - a.score)
    setLeaders(sorted)
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">← Назад</button>
          <span className="font-bold text-gray-800">Таблица лидеров</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {leaders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-sm">Пока никто не прошёл ни одного опроса</p>
            </div>
          ) : (
            <div>
              {leaders.map((l, i) => (
                <div key={i} className={`flex items-center gap-4 px-6 py-4 border-b border-gray-50 ${l.name === (user?.name || user?.email) ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                  <div className="w-8 text-center text-lg">
                    {i < 3 ? medals[i] : <span className="text-gray-400 text-sm font-medium">{i+1}</span>}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                    {l.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{l.name} {l.name === (user?.name || user?.email) ? '(Вы)' : ''}</div>
                    <div className="text-xs text-gray-400">{l.count} опросов пройдено</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{l.score}</div>
                    <div className="text-xs text-gray-400">очков</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}