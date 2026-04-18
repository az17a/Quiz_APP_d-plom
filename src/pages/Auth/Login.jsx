import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'participant' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password)
      } else {
        const res = await createUserWithEmailAndPassword(auth, form.email, form.password)
        await updateProfile(res.user, { displayName: form.name })
        await setDoc(doc(db, 'users', res.user.uid), {
          name: form.name, email: form.email, role: form.role, score: 0,
          createdAt: new Date().toISOString()
        })
      }
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 to-purple-800 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <div className="text-5xl mb-6">🎯</div>
          <h2 className="text-4xl font-bold mb-4">QuizApp</h2>
          <p className="text-purple-200 text-lg leading-relaxed mb-8">
            Создавай викторины, тесты и анкеты. Участники играют с геймификацией — очки, уровни, таблица лидеров.
          </p>
          <div className="space-y-4">
            {[
              { icon: '✏️', text: 'Создавай опросы за минуты' },
              { icon: '🎮', text: 'Геймификация как в Kahoot' },
              { icon: '📊', text: 'Подробная аналитика ответов' },
              { icon: '🔒', text: 'Закрытый доступ по коду' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-purple-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl">🎯</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">QuizApp</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Добро пожаловать!' : 'Создать аккаунт'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {isLogin ? 'Войди в свой аккаунт' : 'Зарегистрируйся бесплатно'}
          </p>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>
              Войти
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>
              Регистрация
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Ваше имя</label>
                <input placeholder="Азиза"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all"
                  onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email</label>
              <input placeholder="email@example.com" type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all"
                onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Пароль</label>
              <input placeholder="Минимум 6 символов" type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all"
                onChange={e => setForm({...form, password: e.target.value})} />
            </div>

            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Я хочу:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setForm({...form, role: 'participant'})}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${form.role === 'participant' ? 'border-teal-400 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    🎮 Проходить опросы
                  </button>
                  <button onClick={() => setForm({...form, role: 'creator'})}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${form.role === 'creator' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    ✏️ Создавать опросы
                  </button>
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-3.5 rounded-xl text-sm font-medium transition-all mt-2">
              {loading ? '⏳ Загрузка...' : isLogin ? 'Войти →' : 'Создать аккаунт →'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Нажимая кнопку, вы соглашаетесь с условиями использования
          </p>
        </div>
      </div>
    </div>
  )
}