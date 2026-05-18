import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'quiz', label: '🎮 Викторина', desc: 'Есть правильный ответ, очки, таймер' },
  { id: 'test', label: '📝 Тест', desc: 'Проверка знаний, оценка в %' },
  { id: 'survey', label: '📊 Опрос', desc: 'Сбор мнений, нет правильного ответа' },
  { id: 'work', label: '💼 Рабочий', desc: 'HR, чек-листы, корпоративные' },
]

export default function CreateQuiz() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [step, setStep] = useState(1)
  const [quiz, setQuiz] = useState({
    title: '', description: '', type: '', access: 'public', code: '', questions: []
  })
  const [newQ, setNewQ] = useState({ text: '', options: ['', '', '', ''], correct: 0 })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
    })
    return () => unsubscribe()
  }, [])

  const addQuestion = () => {
    if (!newQ.text) return
    setQuiz({ ...quiz, questions: [...quiz.questions, { ...newQ, id: Date.now() }] })
    setNewQ({ text: '', options: ['', '', '', ''], correct: 0 })
  }

  const saveQuiz = async () => {
    if (!user) return
    const newQuiz = {
      ...quiz,
      authorId: user.uid,
      author: user.displayName || user.email,
      createdAt: new Date().toISOString(),
      responses: []
    }
    await addDoc(collection(db, 'quizzes'), newQuiz)
    toast.success('Опрос успешно создан!')
    navigate('/dashboard')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">← Назад</button>
          <span className="font-bold text-gray-800">Создать опрос</span>
        </div>
        <div className="flex gap-2">
          {[1,2,3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s ? 'bg-purple-600 text-white' : step > s ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Основная информация</h2>
            <input value={quiz.title} onChange={e => setQuiz({...quiz, title: e.target.value})}
              placeholder="Название опроса"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400" />
            <textarea value={quiz.description} onChange={e => setQuiz({...quiz, description: e.target.value})}
              placeholder="Описание (необязательно)" rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 resize-none" />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Тип опроса</p>
              <div className="grid grid-cols-2 gap-3">
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setQuiz({...quiz, type: t.id})}
                    className={`p-4 rounded-xl border text-left transition-all ${quiz.type === t.id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="font-medium text-sm text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => quiz.title && quiz.type && setStep(2)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-all">
              Далее →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Вопросы ({quiz.questions.length})</h2>

            {quiz.questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-800">{i+1}. {q.text}</p>
                  <button onClick={() => setQuiz({...quiz, questions: quiz.questions.filter((_,j) => j !== i)})}
                    className="text-red-400 text-xs hover:text-red-600">удалить</button>
                </div>
                <div className="mt-2 space-y-1">
                  {q.options.filter(o => o).map((o, j) => (
                    <div key={j} className={`text-xs px-3 py-1 rounded-lg ${j === q.correct ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}>
                      {j === q.correct ? '✓ ' : ''}{o}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white rounded-xl p-5 border border-purple-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Новый вопрос</p>
              <input value={newQ.text} onChange={e => setNewQ({...newQ, text: e.target.value})}
                placeholder="Текст вопроса"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 mb-3" />
              <div className="space-y-2">
                {newQ.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <button onClick={() => setNewQ({...newQ, correct: i})}
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${newQ.correct === i ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`} />
                    <input value={opt} onChange={e => { const o = [...newQ.options]; o[i] = e.target.value; setNewQ({...newQ, options: o}) }}
                      placeholder={`Вариант ${i+1}`}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400" />
                  </div>
                ))}
              </div>
              <button onClick={addQuestion}
                className="mt-3 w-full border border-purple-300 text-purple-600 hover:bg-purple-50 py-2 rounded-xl text-sm font-medium transition-all">
                + Добавить вопрос
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium">← Назад</button>
              <button onClick={() => quiz.questions.length > 0 && setStep(3)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-all">Далее →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Настройки доступа</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setQuiz({...quiz, access: 'public'})}
                className={`p-5 rounded-xl border text-left transition-all ${quiz.access === 'public' ? 'border-teal-400 bg-teal-50' : 'border-gray-200'}`}>
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-medium text-sm text-gray-800">Публичный</div>
                <div className="text-xs text-gray-500 mt-1">Виден всем в каталоге</div>
              </button>
              <button onClick={() => setQuiz({...quiz, access: 'code'})}
                className={`p-5 rounded-xl border text-left transition-all ${quiz.access === 'code' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
                <div className="text-2xl mb-2">🔒</div>
                <div className="font-medium text-sm text-gray-800">По коду</div>
                <div className="text-xs text-gray-500 mt-1">Только по секретному коду</div>
              </button>
            </div>

            {quiz.access === 'code' && (
              <input value={quiz.code} onChange={e => setQuiz({...quiz, code: e.target.value.toUpperCase()})}
                placeholder="Придумай код (напр. QUIZ42)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 uppercase" />
            )}

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Итого:</p>
              <p>📌 {quiz.title}</p>
              <p>🎯 {TYPES.find(t => t.id === quiz.type)?.label}</p>
              <p>❓ {quiz.questions.length} вопросов</p>
              <p>{quiz.access === 'public' ? '🌍 Публичный' : '🔒 По коду: ' + quiz.code}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium">← Назад</button>
              <button onClick={saveQuiz}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl text-sm font-medium transition-all">
                Опубликовать ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}