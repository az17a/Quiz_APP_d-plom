import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../../firebase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [code, setCode] = useState('')

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async u => {
    if (!u) { navigate('/login'); return }
    setUser(u)
    const snapshot = await getDocs(collection(db, 'quizzes'))
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setQuizzes(data)
  })
  return () => unsubscribe()
}, [])

const enterByCode = () => {
  const found = quizzes.find(q => q.code === code.toUpperCase())
  if (found) navigate(`/quiz/${found.id}`)
  else alert('Опрос с таким кодом не найден')
}

  if (!user) return null

  const publicQuizzes = quizzes.filter(q => q.access === 'public')
  const myQuizzes = quizzes.filter(q => q.authorId === user.uid)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="font-bold text-gray-800">QuizApp</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Привет, {user.displayName || user.email}!</span>
          <button onClick={() => navigate('/leaderboard')} className="text-sm text-gray-500 hover:text-gray-700">🏆 Рейтинг</button>
          <button onClick={() => navigate('/profile')} className="text-sm text-gray-500 hover:text-gray-700">👤 Профиль</button>
          <button onClick={() => { auth.signOut(); navigate('/login') }}
            className="text-sm text-red-400 hover:text-red-600">Выйти</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">{myQuizzes.length}</div>
            <div className="text-sm text-gray-500 mt-1">Моих опросов</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-2xl font-bold text-teal-600">{publicQuizzes.length}</div>
            <div className="text-sm text-gray-500 mt-1">Публичных опросов</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-2xl font-bold text-amber-500">0</div>
            <div className="text-sm text-gray-500 mt-1">Очков заработано</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-1">Создать опрос</h2>
            <p className="text-sm text-gray-500 mb-4">Викторина, тест, анкета или рабочий опрос</p>
            <button onClick={() => navigate('/create')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-all">
              + Создать новый опрос
            </button>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-1">Войти по коду</h2>
            <p className="text-sm text-gray-500 mb-4">Введи код от закрытого опроса</p>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value)}
                placeholder="Например: QUIZ42"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 uppercase" />
              <button onClick={enterByCode}
                className="bg-teal-500 hover:bg-teal-600 text-white px-5 rounded-xl text-sm font-medium transition-all">
                Войти
              </button>
            </div>
          </div>
        </div>

        {myQuizzes.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Мои опросы</h2>
            <div className="grid grid-cols-2 gap-4">
              {myQuizzes.map(q => (
                <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="font-medium text-gray-800 text-sm mb-1">{q.title}</div>
                  <div className="text-xs text-gray-400 mb-3">{q.questions.length} вопросов · {q.access === 'public' ? '🌍 Публичный' : '🔒 По коду'}</div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/analytics/${q.id}`)}
                      className="flex-1 text-xs border border-gray-200 rounded-lg py-1.5 hover:border-purple-300 text-gray-600">
                      📊 Аналитика
                    </button>
                    <button onClick={() => navigate(`/quiz/${q.id}`)}
                      className="flex-1 text-xs bg-purple-50 border border-purple-200 rounded-lg py-1.5 text-purple-600">
                      ▶ Пройти
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Публичные опросы</h2>
          {publicQuizzes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm">Пока нет публичных опросов. Создай первый!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {publicQuizzes.map(q => (
                <div key={q.id} onClick={() => navigate(`/quiz/${q.id}`)}
                  className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-all cursor-pointer">
                  <div className="font-medium text-gray-800 text-sm mb-1">{q.title}</div>
                  <div className="text-xs text-gray-400">{q.questions.length} вопросов · {q.author}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}