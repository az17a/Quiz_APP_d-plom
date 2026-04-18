import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'

export default function TakeQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(20)

useEffect(() => {
    const loadQuiz = async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('../../firebase')
      const snap = await getDoc(doc(db, 'quizzes', id))
      if (snap.exists()) setQuiz({ id: snap.id, ...snap.data() })
    }
    loadQuiz()
  }, [id])

  useEffect(() => {
    if (!quiz || finished) return
    setTimer(20)
    const t = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { handleNext(true); return 20 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [current, quiz, finished])

  const handleNext = (timeout = false) => {
    const q = quiz.questions[current]
    const isCorrect = !timeout && selected === q.correct
    const newAnswers = [...answers, { questionId: q.id, selected, correct: q.correct, isCorrect }]
    setAnswers(newAnswers)
    if (isCorrect) setScore(s => s + 10)

    if (current + 1 >= quiz.questions.length) {
      saveResult(newAnswers)
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  const saveResult = async (ans) => {
    const user = auth.currentUser
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
    const { db } = await import('../../firebase')
    const correct = ans.filter(a => a.isCorrect).length
    const finalScore = correct * 10
    const response = {
      userId: user?.uid || 'anonymous',
      userName: user?.displayName || user?.email || 'Аноним',
      answers: ans,
      score: finalScore,
      date: new Date().toISOString()
    }
    await updateDoc(doc(db, 'quizzes', id), {
      responses: arrayUnion(response)
    })
  }

  if (!quiz) return <div className="flex items-center justify-center h-screen text-gray-400">Опрос не найден</div>

  if (finished) {
    const total = quiz.questions.length
    const correct = answers.filter(a => a.isCorrect).length
    const percent = Math.round((correct / total) * 100)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="text-6xl mb-4">{percent >= 70 ? '🏆' : percent >= 40 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Опрос завершён!</h2>
          <p className="text-gray-500 mb-6">{quiz.title}</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{score}</div>
              <div className="text-xs text-gray-500 mt-1">Очков</div>
            </div>
            <div className="bg-teal-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-teal-600">{correct}/{total}</div>
              <div className="text-xs text-gray-500 mt-1">Правильно</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-500">{percent}%</div>
              <div className="text-xs text-gray-500 mt-1">Результат</div>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-all">
            На главную
          </button>
        </div>
      </div>
    )
  }

  const q = quiz.questions[current]
  const progress = ((current) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">{quiz.title}</span>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${timer <= 5 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
              {timer}
            </div>
          </div>
          <div className="bg-gray-100 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full transition-all" style={{width: `${progress}%`}} />
          </div>
          <div className="text-xs text-gray-400 mt-1">Вопрос {current + 1} из {quiz.questions.length}</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{q.text}</h2>
        <div className="space-y-3 mb-8">
          {q.options.filter(o => o).map((opt, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all ${selected === i ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}>
              <span className="mr-3 opacity-50">{['A','B','C','D'][i]}</span>{opt}
            </button>
          ))}
        </div>
        <button onClick={() => handleNext()}
          disabled={selected === null}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl text-sm font-medium transition-all">
          {current + 1 === quiz.questions.length ? 'Завершить' : 'Следующий вопрос →'}
        </button>
      </div>
    </div>
  )
}