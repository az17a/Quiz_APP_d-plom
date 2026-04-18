import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'

const BADGES = [
  { id: 'first', icon: '🎯', label: 'Первый опрос', desc: 'Пройди первый опрос', req: c => c >= 1 },
  { id: 'five', icon: '🔥', label: 'На разогреве', desc: 'Пройди 5 опросов', req: c => c >= 5 },
  { id: 'perfect', icon: '⭐', label: 'Отличник', desc: 'Набери 100% в опросе', req: (c, p) => p >= 100 },
  { id: 'hundred', icon: '💯', label: 'Сто очков', desc: 'Набери 100 очков', req: (c, p, s) => s >= 100 },
  { id: 'ten', icon: '🏅', label: 'Ветеран', desc: 'Пройди 10 опросов', req: c => c >= 10 },
  { id: 'streak', icon: '⚡', label: 'Стремительный', desc: 'Ответь правильно 3 подряд', req: c => c >= 3 },
]

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ count: 0, score: 0, best: 0 })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      let count = 0, score = 0, best = 0
      quizzes.forEach(q => {
        (q.responses || []).forEach(r => {
          if (r.userName === (u.displayName || u.email)) {
            count++
            score += r.score
            const pct = Math.round(r.answers.filter(a => a.isCorrect).length / q.questions.length * 100)
            if (pct > best) best = pct
          }
        })
      })
      setStats({ count, score, best })
    })
    return () => unsubscribe()
  }, [])

  if (!user) return null

  const earnedBadges = BADGES.filter(b => b.req(stats.count, stats.best, stats.score))
  const level = Math.floor(stats.score / 50) + 1
  const xpToNext = 50 - (stats.score % 50)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">← Назад</button>
          <span className="font-bold text-gray-800">Мой профиль</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-3xl font-bold text-purple-600 mx-auto mb-4">
            {(user.displayName || user.email).charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user.displayName || user.email}</h2>
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <span className="text-purple-600 font-bold text-sm">Уровень {level}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>XP до следующего уровня</span>
              <span>{xpToNext} XP</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all"
                style={{width: `${((50 - xpToNext) / 50) * 100}%`}} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.count}</div>
            <div className="text-xs text-gray-500 mt-1">Опросов пройдено</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.score}</div>
            <div className="text-xs text-gray-500 mt-1">Всего очков</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.best}%</div>
            <div className="text-xs text-gray-500 mt-1">Лучший результат</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Значки и достижения</h2>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(b => {
              const earned = b.req(stats.count, stats.best, stats.score)
              return (
                <div key={b.id} className={`p-4 rounded-xl border text-center transition-all ${earned ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}>
                  <div className="text-3xl mb-2">{b.icon}</div>
                  <div className="text-xs font-medium text-gray-800">{b.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{b.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}