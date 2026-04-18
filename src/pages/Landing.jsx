import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      
      <nav className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="font-bold text-xl text-gray-800">QuizApp</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-all">
            Войти
          </button>
          <button onClick={() => navigate('/login')}
            className="px-5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all">
            Начать бесплатно
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 text-sm font-medium px-4 py-2 rounded-full mb-8">
          🚀 Платформа интерактивных опросов
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Создавай опросы.<br/>
          <span className="text-purple-600">Играй. Побеждай.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Создавай викторины, тесты и анкеты за минуты. Участники проходят с геймификацией — очки, уровни, таблица лидеров.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/login')}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-base font-medium transition-all">
            Создать опрос бесплатно →
          </button>
          <button onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-base font-medium transition-all">
            Войти по коду
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-purple-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">✏️</div>
            <h3 className="font-bold text-gray-800 mb-2">Создавай легко</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Конструктор вопросов как в Google Forms. Викторина, тест, анкета или рабочий опрос.</p>
          </div>
          <div className="bg-teal-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">🎮</div>
            <h3 className="font-bold text-gray-800 mb-2">Играй с азартом</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Таймер, очки за скорость, серии правильных ответов и таблица лидеров как в Kahoot.</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="font-bold text-gray-800 mb-2">Анализируй результаты</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Подробная аналитика — кто как ответил, графики по вопросам, экспорт данных.</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Виды опросов</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: '🎮', title: 'Викторина', desc: 'С правильными ответами и очками', color: 'bg-purple-50' },
              { icon: '📝', title: 'Тест', desc: 'Проверка знаний и оценка', color: 'bg-blue-50' },
              { icon: '📊', title: 'Опрос', desc: 'Сбор мнений без правильных ответов', color: 'bg-teal-50' },
              { icon: '💼', title: 'Рабочий', desc: 'HR и корпоративные опросы', color: 'bg-amber-50' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} rounded-2xl p-5 text-center`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-bold text-gray-800 text-sm mb-1">{item.title}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Готов начать?</h2>
        <p className="text-gray-500 mb-8">Бесплатно. Без ограничений. Прямо сейчас.</p>
        <button onClick={() => navigate('/login')}
          className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-base font-medium transition-all">
          Создать аккаунт бесплатно →
        </button>
      </div>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © 2026 QuizApp — Дипломный проект
      </footer>
    </div>
  )
}