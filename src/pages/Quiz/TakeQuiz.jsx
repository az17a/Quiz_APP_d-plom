import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const particles = useRef([])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const COLORS  = ['#7c3aed','#a855f7','#06b6d4','#f59e0b','#10b981','#ef4444','#ec4899']
    particles.current = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width, y: -Math.random() * canvas.height,
      w: 6 + Math.random() * 8, h: 10 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 2 + Math.random() * 4, angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2, drift: (Math.random() - 0.5) * 1.5,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current.forEach(p => {
        p.y += p.speed; p.x += p.drift; p.angle += p.spin
        ctx.save(); ctx.translate(p.x + p.w/2, p.y + p.h/2); ctx.rotate(p.angle)
        ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore()
      })
      particles.current = particles.current.filter(p => p.y < canvas.height + 20)
      if (particles.current.length > 0) animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
}

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{val}</>
}

// ── Score calculation ─────────────────────────────────────────────────────────
// Returns { earnedPoints, isCorrect, isPartial }
function calcScore(q, selectedArr) {
  const POINTS = 10

  // Single / open / truefalse
  if (!q.qtype || q.qtype === 'single' || q.qtype === 'truefalse' || q.qtype === 'open') {
    const sel = Array.isArray(selectedArr) ? selectedArr[0] : selectedArr
    const isCorrect = sel === q.correct
    return { earnedPoints: isCorrect ? POINTS : 0, isCorrect, isPartial: false }
  }

  // Multiple choice — partial scoring
  if (q.qtype === 'multiple') {
    const correctSet = Array.isArray(q.correct) ? q.correct : [q.correct]
    const selected   = Array.isArray(selectedArr) ? selectedArr : []
    const pointEach  = POINTS / correctSet.length

    let earned = 0
    selected.forEach(s => {
      if (correctSet.includes(s)) earned += pointEach   // correct pick
      else earned -= pointEach                           // wrong pick penalty
    })
    earned = Math.max(0, Math.round(earned))
    const isCorrect = earned === POINTS
    const isPartial = earned > 0 && earned < POINTS
    return { earnedPoints: earned, isCorrect, isPartial }
  }

  return { earnedPoints: 0, isCorrect: false, isPartial: false }
}

// ── Result screen ─────────────────────────────────────────────────────────────
function ResultScreen({ quiz, score, answers, onHome, onRetry }) {
  const [show, setShow] = useState(false)
  const total   = quiz.questions.length
  const correct = answers.filter(a => a.isCorrect).length
  const percent = Math.round((correct / total) * 100)

  const grade = percent >= 90 ? { emoji:'🏆', label:'Отлично!',      bg:'from-amber-50 to-yellow-50' }
              : percent >= 70 ? { emoji:'🎉', label:'Хорошо!',       bg:'from-purple-50 to-violet-50' }
              : percent >= 40 ? { emoji:'👍', label:'Неплохо!',      bg:'from-teal-50 to-cyan-50' }
              :                 { emoji:'📚', label:'Нужно учиться', bg:'from-rose-50 to-pink-50' }

  useEffect(() => { setTimeout(() => setShow(true), 100) }, [])

  return (
    <>
      <Confetti active={percent >= 70} />
      <div className={`min-h-screen bg-gradient-to-br ${grade.bg} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          style={{ opacity: show?1:0, transform: show?'translateY(0) scale(1)':'translateY(40px) scale(0.95)', transition:'opacity 0.5s ease, transform 0.5s cubic-bezier(.34,1.56,.64,1)' }}>
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-8 pt-8 pb-6 text-center">
            <div className="text-7xl mb-3" style={{ display:'inline-block', animation: show?'bounceIn 0.6s 0.4s both':'none' }}>
              {grade.emoji}
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">{grade.label}</h2>
            <p className="text-purple-200 text-sm truncate">{quiz.title}</p>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label:'Очков',     value: score,   suffix:'',         color:'text-purple-600', bg:'bg-purple-50' },
                { label:'Правильно', value: correct,  suffix:`/${total}`, color:'text-teal-600',   bg:'bg-teal-50'   },
                { label:'Результат', value: percent,  suffix:'%',        color:'text-amber-500',  bg:'bg-amber-50'  },
              ].map((s, i) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}
                  style={{ opacity: show?1:0, transform: show?'translateY(0)':'translateY(20px)', transition:`opacity 0.4s ${0.3+i*0.1}s ease, transform 0.4s ${0.3+i*0.1}s ease` }}>
                  <div className={`text-2xl font-extrabold ${s.color}`}>
                    {show ? <Counter target={s.value} /> : 0}{s.suffix}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Прогресс</span><span>{percent}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
                  style={{ width: show?`${percent}%`:'0%', transition:'width 1s 0.6s cubic-bezier(.4,0,.2,1)' }} />
              </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto mb-6 pr-1">
              {answers.map((a, i) => (
                <div key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm ${
                    a.isCorrect ? 'bg-green-50 text-green-700' : a.isPartial ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}
                  style={{ opacity: show?1:0, transform: show?'translateX(0)':'translateX(-16px)', transition:`opacity 0.3s ${0.5+i*0.06}s ease, transform 0.3s ${0.5+i*0.06}s ease` }}>
                  <span>{a.isCorrect ? '✓' : a.isPartial ? '½' : '✗'}</span>
                  <span className="truncate">Вопрос {i + 1}</span>
                  <span className="ml-auto text-xs font-bold shrink-0">+{a.earnedPoints} бал.</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={onRetry}
                className="flex-1 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 py-3 rounded-xl text-sm font-semibold transition-all">
                🔄 Ещё раз
              </button>
              <button onClick={onHome}
                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-200">
                На главную
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes bounceIn{0%{transform:scale(0.3) rotate(-10deg);opacity:0}60%{transform:scale(1.2) rotate(5deg);opacity:1}80%{transform:scale(0.9) rotate(-3deg)}100%{transform:scale(1) rotate(0deg)}}`}</style>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function TakeQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz,      setQuiz]      = useState(null)
  const [current,   setCurrent]   = useState(0)
  const [selected,  setSelected]  = useState([])   // always array
  const [answers,   setAnswers]   = useState([])
  const [finished,  setFinished]  = useState(false)
  const [score,     setScore]     = useState(0)
  const [timer,     setTimer]     = useState(20)
  const [flash,     setFlash]     = useState(null)

  useEffect(() => {
    const loadQuiz = async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db }          = await import('../../firebase')
      const snap = await getDoc(doc(db, 'quizzes', id))
      if (snap.exists()) setQuiz({ id: snap.id, ...snap.data() })
    }
    loadQuiz()
  }, [id])

  useEffect(() => {
    if (!quiz || finished) return
    setTimer(20)
    const t = setInterval(() => {
      setTimer(prev => { if (prev <= 1) { handleNext(true); return 20 } return prev - 1 })
    }, 1000)
    return () => clearInterval(t)
  }, [current, quiz, finished])

  const isMultiple = () => quiz?.questions[current]?.qtype === 'multiple'

  const toggleOption = (i) => {
    if (flash) return
    if (isMultiple()) {
      setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
    } else {
      setSelected([i])
    }
  }

  const handleNext = (timeout = false) => {
    const q = quiz.questions[current]
    const sel = timeout ? [] : selected

    const { earnedPoints, isCorrect, isPartial } = timeout
      ? { earnedPoints: 0, isCorrect: false, isPartial: false }
      : calcScore(q, sel)

    const newAnswers = [...answers, {
      questionId: q.id, selected: sel, correct: q.correct,
      isCorrect, isPartial, earnedPoints
    }]
    setAnswers(newAnswers)
    setScore(s => s + earnedPoints)

    if (!timeout && sel.length > 0) setFlash(isCorrect ? 'correct' : isPartial ? 'partial' : 'wrong')

    setTimeout(() => {
      setFlash(null)
      if (current + 1 >= quiz.questions.length) {
        saveResult(newAnswers, score + earnedPoints)
        setFinished(true)
      } else {
        setCurrent(c => c + 1)
        setSelected([])
      }
    }, 400)
  }

  const saveResult = async (ans, finalScore) => {
    const user = auth.currentUser
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
    const { db } = await import('../../firebase')
    await updateDoc(doc(db, 'quizzes', id), {
      responses: arrayUnion({
        userId:   user?.uid || 'anonymous',
        userName: user?.displayName || user?.email || 'Аноним',
        answers:  ans, score: finalScore,
        date:     new Date().toISOString(),
      })
    })
  }

  const handleRetry = () => {
    setCurrent(0); setSelected([]); setAnswers([])
    setFinished(false); setScore(0); setTimer(20); setFlash(null)
  }

  if (!quiz) return <div className="flex items-center justify-center h-screen text-gray-400">Загрузка...</div>

  if (finished) return (
    <ResultScreen quiz={quiz} score={score} answers={answers}
      onHome={() => navigate('/dashboard')} onRetry={handleRetry} />
  )

  const q        = quiz.questions[current]
  const progress = (current / quiz.questions.length) * 100
  const timerPct = (timer / 20) * 100
  const multiple = q.qtype === 'multiple'

  const flashBg = flash === 'correct' ? 'bg-green-50'
                : flash === 'partial' ? 'bg-amber-50'
                : flash === 'wrong'   ? 'bg-red-50'
                : 'bg-gray-50'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${flashBg}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="take-header-inner flex justify-between items-center mb-3">
            <div>
              <span className="text-sm font-medium text-gray-600 truncate max-w-xs block">{quiz.title}</span>
              {multiple && (
                <span className="text-xs text-purple-500 font-semibold">Выбери все правильные варианты</span>
              )}
            </div>
            <div className="relative w-11 h-11">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke={timer <= 5 ? '#ef4444' : '#7c3aed'} strokeWidth="3"
                  strokeDasharray="94.2" strokeDashoffset={94.2 - (timerPct / 100) * 94.2}
                  style={{ transition:'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${timer <= 5 ? 'text-red-600' : 'text-purple-700'}`}>
                {timer}
              </span>
            </div>
          </div>
          <div className="bg-gray-100 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width:`${progress}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1">Вопрос {current + 1} из {quiz.questions.length}</div>
        </div>
      </div>

      {/* Question */}
      <div className="take-content max-w-2xl mx-auto px-6 py-8">
        <div key={current} style={{ animation:'slideIn 0.35s cubic-bezier(.4,0,.2,1)' }}>
          <h2 className="take-title text-xl font-bold text-gray-800 mb-6">{q.text}</h2>

          <div className="space-y-3 mb-8">
            {q.options.filter(o => o).map((opt, i) => {
              const isSelected = selected.includes(i)
              return (
                <button key={i} onClick={() => toggleOption(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md shadow-purple-100 scale-[1.01]'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40 text-gray-700'}`}>
                  {/* Checkbox for multiple, letter badge for single */}
                  {multiple ? (
                    <span className={`inline-flex w-7 h-7 rounded-md items-center justify-center text-xs font-bold mr-3 border-2 transition-all
                      ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  ) : (
                    <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold mr-3
                      ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {['A','B','C','D'][i]}
                    </span>
                  )}
                  {opt}
                </button>
              )
            })}
          </div>

          {multiple && selected.length > 0 && (
            <p className="text-xs text-purple-500 text-center mb-3">
              Выбрано: {selected.length} вариант(а)
            </p>
          )}

          <button onClick={() => handleNext()}
            disabled={selected.length === 0 || !!flash}
            className="take-next w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-100 disabled:shadow-none"
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-100 disabled:shadow-none">
            {current + 1 === quiz.questions.length ? '✓ Завершить' : 'Следующий вопрос →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @media(max-width:768px){
          .take-header-inner{padding:12px 16px !important;}
          .take-content{padding:16px !important;}
          .take-title{font-size:17px !important;}
          .take-opt{padding:14px 14px !important; font-size:13px !important;}
          .take-next{font-size:13px !important; padding:14px !important;}
        }
      `}</style>
    </div>
  )
}