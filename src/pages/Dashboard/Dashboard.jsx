import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [code, setCode] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('discover')

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
    else toast.error('Опрос с таким кодом не найден')
  }

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Удалить опрос?')) return
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'quizzes', quizId))
    setQuizzes(quizzes.filter(q => q.id !== quizId))
    toast.success('Опрос удалён!')
  }

  if (!user) return null

  const publicQuizzes = quizzes.filter(q => q.access === 'public')
  const myQuizzes = quizzes.filter(q => q.authorId === user.uid)
  const typeLabels = { quiz: 'Викторина', test: 'Тест', survey: 'Опрос', work: 'Рабочий' }
  const typeColors = {
    quiz: '#46178f',
    test: '#1368ce',
    survey: '#e21b3c',
    work: '#d89e00'
  }

  const filteredPublic = publicQuizzes
    .filter(q => filter === 'all' || q.type === filter)
    .filter(q => q.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen" style={{background: '#f0f0f0'}}>

      <div style={{background: '#46178f'}} className="px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          <span className="font-bold text-2xl text-white">QuizApp</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/leaderboard')}
            className="text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all">
            🏆 Рейтинг
          </button>
          <button onClick={() => navigate('/profile')}
            className="text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all">
            👤 {user.displayName || user.email}
          </button>
          <button onClick={() => { auth.signOut(); toast.success('Вы вышли'); navigate('/login') }}
            className="bg-white text-purple-700 text-sm font-bold px-5 py-2 rounded-full hover:bg-gray-100 transition-all">
            Выйти
          </button>
        </div>
      </div>

      <div style={{background: '#46178f'}} className="px-8 pb-8 pt-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 bg-white rounded-2xl flex items-center px-5 gap-3">
              <span className="text-gray-400 text-xl">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Найти опрос..."
                className="flex-1 py-4 text-sm outline-none text-gray-700" />
            </div>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Введи PIN"
              className="bg-white rounded-2xl px-5 py-4 text-sm outline-none text-gray-700 w-36 text-center font-bold uppercase" />
            <button onClick={enterByCode}
              style={{background: '#ffa602'}}
              className="text-white font-bold px-6 rounded-2xl text-sm hover:opacity-90 transition-all">
              Войти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">

        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab('discover')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'discover' ? 'bg-purple-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            Каталог
          </button>
          <button onClick={() => setTab('my')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${tab === 'my' ? 'bg-purple-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            Мои опросы {myQuizzes.length > 0 && `(${myQuizzes.length})`}
          </button>
          <button onClick={() => navigate('/create')}
            style={{background: '#46178f'}}
            className="ml-auto text-white font-bold px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-all">
            + Создать опрос
          </button>
        </div>

        {tab === 'discover' && (
          <div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'quiz', 'test', 'survey', 'work'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-purple-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {f === 'all' ? 'Все' : f === 'quiz' ? '🎮 Викторина' : f === 'test' ? '📝 Тест' : f === 'survey' ? '📊 Опрос' : '💼 Рабочий'}
                </button>
              ))}
            </div>

            {filteredPublic.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-500 font-medium">Опросов не найдено</p>
                <button onClick={() => navigate('/create')}
                  style={{background: '#46178f'}}
                  className="mt-4 text-white font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                  Создать первый!
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredPublic.map((q, i) => {
                  const colors = ['#46178f', '#1368ce', '#e21b3c', '#d89e00', '#26890c']
                  const bg = typeColors[q.type] || colors[i % colors.length]
                  return (
                    <div key={q.id} onClick={() => navigate(`/quiz/${q.id}`)}
                      className="rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all shadow-md">
                      <div style={{background: bg}} className="p-5 h-32 flex flex-col justify-between">
                        <div className="text-3xl">
                          {q.type === 'quiz' ? '🎮' : q.type === 'test' ? '📝' : q.type === 'survey' ? '📊' : '💼'}
                        </div>
                        <div className="text-white font-bold text-sm leading-tight">{q.title}</div>
                      </div>
                      <div className="bg-white p-3">
                        <div className="text-xs text-gray-500">{q.questions.length} вопросов · {q.author}</div>
                        <div className="text-xs text-gray-400 mt-1">{q.responses?.length || 0} прохождений</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'my' && (
          <div>
            {myQuizzes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">✏️</div>
                <p className="text-gray-500 font-medium mb-4">У тебя пока нет опросов</p>
                <button onClick={() => navigate('/create')}
                  style={{background: '#46178f'}}
                  className="text-white font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-all">
                  Создать первый опрос
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {myQuizzes.map((q, i) => {
                  const colors = ['#46178f', '#1368ce', '#e21b3c', '#d89e00', '#26890c']
                  const bg = typeColors[q.type] || colors[i % colors.length]
                  return (
                    <div key={q.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div style={{background: bg}} className="p-4 flex items-center gap-3">
                        <div className="text-3xl">
                          {q.type === 'quiz' ? '🎮' : q.type === 'test' ? '📝' : q.type === 'survey' ? '📊' : '💼'}
                        </div>
                        <div>
                          <div className="text-white font-bold">{q.title}</div>
                          <div className="text-white text-opacity-75 text-xs mt-0.5">
                            {q.questions.length} вопросов · {q.access === 'public' ? '🌍 Публичный' : `🔒 Код: ${q.code}`}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {q.responses?.length || 0} прохождений
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/analytics/${q.id}`)}
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:border-purple-300 hover:text-purple-600 text-gray-600 transition-all">
                            📊 Аналитика
                          </button>
                          <button onClick={() => navigate(`/quiz/${q.id}`)}
                            style={{background: '#46178f'}}
                            className="text-xs text-white rounded-lg px-3 py-1.5 hover:opacity-90 transition-all">
                            ▶ Пройти
                          </button>
                          <button onClick={() => deleteQuiz(q.id)}
                            className="text-xs border border-red-100 rounded-lg px-3 py-1.5 text-red-400 hover:bg-red-50 transition-all">
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}