import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)

 useEffect(() => {
    const loadQuiz = async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('../../firebase')
      const snap = await getDoc(doc(db, 'quizzes', id))
      if (snap.exists()) setQuiz({ id: snap.id, ...snap.data() })
    }
    loadQuiz()
  }, [id])
  
  if (!quiz) return <div className="flex items-center justify-center h-screen text-gray-400">Загрузка...</div>

  const responses = quiz.responses || []
  const avgScore = responses.length ? Math.round(responses.reduce((a, r) => a + r.score, 0) / responses.length) : 0
  const avgPercent = responses.length ? Math.round(responses.reduce((a, r) => {
    const correct = r.answers.filter(a => a.isCorrect).length
    return a + (correct / quiz.questions.length * 100)
  }, 0) / responses.length) : 0

  const COLORS = ['#7F77DD', '#1D9E75', '#EF9F27', '#D85A30']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">← Назад</button>
          <span className="font-bold text-gray-800">Аналитика: {quiz.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">{responses.length}</div>
            <div className="text-sm text-gray-500 mt-1">Прошли опрос</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-2xl font-bold text-teal-600">{avgScore}</div>
            <div className="text-sm text-gray-500 mt-1">Средний балл</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-2xl font-bold text-amber-500">{avgPercent}%</div>
            <div className="text-sm text-gray-500 mt-1">Средний результат</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-2xl font-bold text-gray-700">{quiz.questions.length}</div>
            <div className="text-sm text-gray-500 mt-1">Вопросов</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4">Результаты по вопросам</h2>
            {quiz.questions.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quiz.questions.map((q, i) => ({
                  name: `В${i+1}`,
                  правильно: responses.filter(r => r.answers[i]?.isCorrect).length,
                  неправильно: responses.filter(r => !r.answers[i]?.isCorrect).length,
                }))}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip />
                  <Bar dataKey="правильно" fill="#1D9E75" radius={[4,4,0,0]} />
                  <Bar dataKey="неправильно" fill="#F09595" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4">Распределение ответов</h2>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Ещё никто не прошёл опрос</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Правильно', value: responses.reduce((a,r) => a + r.answers.filter(x => x.isCorrect).length, 0) },
                    { name: 'Неправильно', value: responses.reduce((a,r) => a + r.answers.filter(x => !x.isCorrect).length, 0) },
                  ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    <Cell fill="#1D9E75" />
                    <Cell fill="#F09595" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">Ответы участников</h2>
          {responses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm">Ещё никто не прошёл этот опрос</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-gray-500 font-medium">Участник</th>
                    <th className="text-left py-3 text-gray-500 font-medium">Очки</th>
                    <th className="text-left py-3 text-gray-500 font-medium">Результат</th>
                    <th className="text-left py-3 text-gray-500 font-medium">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, i) => {
                    const correct = r.answers.filter(a => a.isCorrect).length
                    const percent = Math.round(correct / quiz.questions.length * 100)
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{r.userName}</td>
                        <td className="py-3 text-purple-600 font-medium">{r.score}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${percent >= 70 ? 'bg-teal-50 text-teal-700' : percent >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                            {correct}/{quiz.questions.length} · {percent}%
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-xs">{new Date(r.date).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Детали по вопросам</h2>
          <div className="space-y-4">
            {quiz.questions.map((q, i) => {
              const totalAnswers = responses.length
              return (
                <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-800 mb-3">{i+1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.options.filter(o => o).map((opt, j) => {
                      const count = responses.filter(r => r.answers[i]?.selected === j).length
                      const pct = totalAnswers ? Math.round(count / totalAnswers * 100) : 0
                      return (
                        <div key={j}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={j === q.correct ? 'text-teal-600 font-medium' : 'text-gray-500'}>
                              {j === q.correct ? '✓ ' : ''}{opt}
                            </span>
                            <span className="text-gray-400">{count} ({pct}%)</span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${j === q.correct ? 'bg-teal-500' : 'bg-gray-300'}`} style={{width: `${pct}%`}} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}