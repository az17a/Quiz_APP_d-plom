import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'quiz',   label: '🎮 Викторина', desc: 'Очки и таймер' },
  { id: 'test',   label: '📝 Тест',      desc: 'Проверка знаний' },
  { id: 'survey', label: '📊 Опрос',     desc: 'Сбор мнений' },
  { id: 'work',   label: '💼 Рабочий',   desc: 'HR и корпоративные' },
]

const Q_TYPES = [
  { id: 'single',   label: 'Один вариант' },
  { id: 'multiple', label: 'Несколько вариантов' },
  { id: 'open',     label: 'Открытый вопрос' },
  { id: 'truefalse',label: 'Да / Нет' },
]

export default function CreateQuiz() {
  const navigate = useNavigate()
  const [user,   setUser]   = useState(null)
  const [saving, setSaving] = useState(false)
  const [quiz,   setQuiz]   = useState({
    title: 'Новый опрос', description: '', type: 'quiz',
    access: 'public', code: '', questions: [],
    shuffle: false, multipleAttempts: false, showResults: true,
  })
  const [newQ, setNewQ] = useState({ text: '', options: ['', '', '', ''], correct: 0, qtype: 'single' })
  const [activeQType, setActiveQType] = useState('single')

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => { if (!u) navigate('/login'); else setUser(u) })
    return () => unsub()
  }, [])

  const addQuestion = () => {
    if (!newQ.text.trim()) { toast.error('Введи текст вопроса'); return }
    setQuiz(q => ({ ...q, questions: [...q.questions, { ...newQ, id: Date.now(), qtype: activeQType }] }))
    setNewQ({ text: '', options: ['', '', '', ''], correct: 0, qtype: activeQType })
    toast.success('Вопрос добавлен!')
  }

  const removeQuestion = (id) => setQuiz(q => ({ ...q, questions: q.questions.filter(x => x.id !== id) }))

  const saveQuiz = async () => {
    if (!quiz.title.trim()) { toast.error('Введи название'); return }
    if (quiz.questions.length === 0) { toast.error('Добавь хотя бы один вопрос'); return }
    if (quiz.access === 'code' && !quiz.code.trim()) { toast.error('Введи код доступа'); return }
    setSaving(true)
    try {
      await addDoc(collection(db, 'quizzes'), {
        ...quiz,
        authorId: user.uid,
        author: user.displayName || user.email,
        createdAt: new Date().toISOString(),
        responses: [],
      })
      toast.success('Опрос опубликован!')
      navigate('/dashboard')
    } catch { toast.error('Ошибка сохранения') }
    setSaving(false)
  }

  if (!user) return null

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .inp { width:100%; border:1.5px solid #e5e7eb; border-radius:12px; padding:12px 16px; font-size:13px; outline:none; font-family:'Unbounded',system-ui,sans-serif; transition:border-color 0.2s; background:white; }
        .inp:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.08); }
        .qtype-btn { padding:8px 14px; border-radius:10px; border:1.5px solid #e5e7eb; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; background:white; font-family:'Unbounded',system-ui,sans-serif; }
        .qtype-btn:hover { border-color:#7c3aed; color:#7c3aed; }
        .qtype-btn.active { background:#7c3aed; color:white; border-color:#7c3aed; }
        .opt-row { display:flex; gap:10px; align-items:center; margin-bottom:8px; }
        .correct-dot { width:22px; height:22px; border-radius:50%; border:2px solid #d1d5db; cursor:pointer; flex-shrink:0; transition:all 0.15s; }
        .correct-dot.on { background:#7c3aed; border-color:#7c3aed; }
        .q-card { background:white; border-radius:14px; border:1.5px solid #e5e7eb; padding:16px; margin-bottom:10px; }
        .q-card:hover { border-color:#c4b5fd; }
        .toggle { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .toggle input { accent-color:#7c3aed; width:16px; height:16px; cursor:pointer; }
        .btn-pub { width:100%; padding:15px; background:linear-gradient(135deg,#7c3aed,#4f46e5); color:white; border:none; border-radius:14px; font-size:14px; font-weight:800; cursor:pointer; font-family:'Unbounded',system-ui,sans-serif; transition:opacity 0.2s,transform 0.2s; }
        .btn-pub:hover { opacity:0.9; transform:translateY(-1px); }
        .btn-pub:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        @media (max-width:768px) {
          .create-layout { grid-template-columns: 1fr !important; }
          .right-panel { position:static !important; }
          .create-pad { padding: 16px !important; }
          .create-header { padding: 12px 16px !important; }
          .create-header-title { font-size: 13px !important; }
          .pub-btn-text { font-size: 12px !important; padding: 8px 14px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#46178f,#5b21b6)', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <button onClick={() => navigate('/dashboard')}
            style={{color:'rgba(255,255,255,0.7)', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            ← Назад
          </button>
          <span style={{color:'white', fontWeight:800, fontSize:15}}>Создание опроса</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <span style={{color:'rgba(255,255,255,0.7)', fontSize:12}}>{quiz.questions.length} вопросов</span>
          <button onClick={saveQuiz} disabled={saving}
            style={{background:'#ffa602', color:'white', border:'none', borderRadius:12, padding:'10px 24px', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            {saving ? '⏳ Сохраняем...' : '✓ Опубликовать'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className='create-layout create-pad' style={{display:'grid', gridTemplateColumns:'1fr 340px', gap:24, maxWidth:1100, margin:'0 auto', padding:'28px 24px'}}>

        {/* LEFT — Settings + Questions list */}
        <div>
          {/* Basic info card */}
          <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:24, marginBottom:20}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h2 style={{fontSize:15, fontWeight:800, color:'#111', margin:0}}>Опрос</h2>
              <span style={{fontSize:11, color:'#9ca3af', background:'#f3f4f6', padding:'4px 12px', borderRadius:8}}>
                {TYPES.find(t=>t.id===quiz.type)?.label}
              </span>
            </div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:11, color:'#6b7280', fontWeight:700, display:'block', marginBottom:6}}>Название</label>
              <input className="inp" value={quiz.title} onChange={e => setQuiz({...quiz, title:e.target.value})} placeholder="Название опроса"/>
            </div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:11, color:'#6b7280', fontWeight:700, display:'block', marginBottom:6}}>Описание (необязательно)</label>
              <textarea className="inp" value={quiz.description} onChange={e => setQuiz({...quiz, description:e.target.value})}
                placeholder="Описание опроса..." rows={2} style={{resize:'none'}}/>
            </div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:11, color:'#6b7280', fontWeight:700, display:'block', marginBottom:8}}>Тип опроса</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setQuiz({...quiz, type:t.id})}
                    style={{padding:'10px 14px', borderRadius:12, border:`1.5px solid ${quiz.type===t.id?'#7c3aed':'#e5e7eb'}`,
                      background: quiz.type===t.id ? '#f5f3ff' : 'white', textAlign:'left', cursor:'pointer', transition:'all 0.15s'}}>
                    <div style={{fontSize:12, fontWeight:800, color: quiz.type===t.id?'#7c3aed':'#374151'}}>{t.label}</div>
                    <div style={{fontSize:10, color:'#9ca3af', marginTop:2}}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Access */}
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11, color:'#6b7280', fontWeight:700, display:'block', marginBottom:8}}>Доступ</label>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                {[['public','🌍 Публичный','Виден всем'],['code','🔒 По коду','Только по коду']].map(([id,label,desc]) => (
                  <button key={id} onClick={() => setQuiz({...quiz, access:id})}
                    style={{padding:'10px 14px', borderRadius:12, border:`1.5px solid ${quiz.access===id?'#7c3aed':'#e5e7eb'}`,
                      background: quiz.access===id ? '#f5f3ff' : 'white', textAlign:'left', cursor:'pointer', transition:'all 0.15s'}}>
                    <div style={{fontSize:12, fontWeight:800, color: quiz.access===id?'#7c3aed':'#374151'}}>{label}</div>
                    <div style={{fontSize:10, color:'#9ca3af', marginTop:2}}>{desc}</div>
                  </button>
                ))}
              </div>
              {quiz.access === 'code' && (
                <input className="inp" value={quiz.code} onChange={e => setQuiz({...quiz, code:e.target.value.toUpperCase()})}
                  placeholder="Придумай код (напр. QUIZ42)" style={{marginTop:10, letterSpacing:3, textAlign:'center', fontWeight:800}}/>
              )}
            </div>

            {/* Options */}
            <div style={{borderTop:'1px solid #f3f4f6', paddingTop:14, display:'flex', flexDirection:'column', gap:10}}>
              {[
                ['shuffle','Случайный порядок вопросов'],
                ['multipleAttempts','Можно проходить несколько раз'],
                ['showResults','Показывать результаты после'],
              ].map(([key,label]) => (
                <label key={key} className="toggle">
                  <input type="checkbox" checked={quiz[key]} onChange={e => setQuiz({...quiz, [key]:e.target.checked})}/>
                  <span style={{fontSize:12, color:'#374151'}}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Questions list */}
          {quiz.questions.length > 0 && (
            <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:20}}>
              <h3 style={{fontSize:13, fontWeight:800, color:'#111', marginBottom:14}}>
                Вопросы ({quiz.questions.length})
              </h3>
              {quiz.questions.map((q, i) => (
                <div key={q.id} className="q-card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <span style={{fontSize:11, color:'#9ca3af', fontWeight:700}}>Вопрос {i+1}</span>
                      <p style={{fontSize:13, fontWeight:700, color:'#374151', margin:'4px 0 8px'}}>{q.text}</p>
                      <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                        {q.options?.filter(o=>o).map((o, j) => (
                          <span key={j} style={{fontSize:11, padding:'3px 10px', borderRadius:8,
                            background: j===q.correct ? '#ede9fe' : '#f9fafb',
                            color: j===q.correct ? '#7c3aed' : '#6b7280',
                            fontWeight: j===q.correct ? 700 : 400}}>
                            {j===q.correct ? '✓ ' : ''}{o}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeQuestion(q.id)}
                      style={{background:'#fee2e2', color:'#ef4444', border:'none', borderRadius:8, padding:'6px 10px', fontSize:11, cursor:'pointer', marginLeft:10, fontWeight:700}}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Add question panel */}
        <div className='right-panel' style={{position:'sticky', top:20, alignSelf:'start'}}>
          <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:20, marginBottom:16}}>
            <h3 style={{fontSize:13, fontWeight:800, color:'#111', marginBottom:14}}>Добавить вопрос</h3>

            {/* Question type buttons */}
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:16}}>
              {Q_TYPES.map(t => (
                <button key={t.id} className={`qtype-btn ${activeQType===t.id?'active':''}`}
                  onClick={() => setActiveQType(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Question text */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11, color:'#6b7280', fontWeight:700, display:'block', marginBottom:6}}>Текст вопроса</label>
              <textarea className="inp" value={newQ.text} onChange={e => setNewQ({...newQ, text:e.target.value})}
                placeholder="Введи вопрос..." rows={3} style={{resize:'none'}}/>
            </div>

            {/* Options for single/multiple */}
            {(activeQType === 'single' || activeQType === 'multiple') && (
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11, color:'#6b7280', fontWeight:700, display:'block', marginBottom:8}}>
                  {activeQType === 'single'
                    ? 'Варианты ответов (выбери правильный)'
                    : 'Варианты ответов (отметь все правильные ✓)'}
                </label>
                {newQ.options.map((opt, i) => {
                  const corrArr = Array.isArray(newQ.correct) ? newQ.correct : [newQ.correct]
                  const isOn = activeQType === 'multiple' ? corrArr.includes(i) : newQ.correct === i
                  const handleClick = () => {
                    if (activeQType === 'multiple') {
                      const prev = Array.isArray(newQ.correct) ? newQ.correct : []
                      const next = prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                      setNewQ({...newQ, correct: next})
                    } else {
                      setNewQ({...newQ, correct: i})
                    }
                  }
                  return (
                    <div key={i} className="opt-row">
                      <div
                        className={`correct-dot ${isOn ? 'on' : ''}`}
                        style={{borderRadius: activeQType === 'multiple' ? '6px' : '50%', display:'flex', alignItems:'center', justifyContent:'center'}}
                        onClick={handleClick}>
                        {activeQType === 'multiple' && isOn && <span style={{color:'white',fontSize:11,fontWeight:900}}>✓</span>}
                      </div>
                      <input className="inp" value={opt}
                        onChange={e => { const o=[...newQ.options]; o[i]=e.target.value; setNewQ({...newQ, options:o}) }}
                        placeholder={`Вариант ${i+1}`} style={{padding:'10px 14px', fontSize:12}}/>
                    </div>
                  )
                })}
                {activeQType === 'multiple' && (
                  <p style={{fontSize:11, color:'#9ca3af', marginTop:6}}>
                    Правильных отмечено: {Array.isArray(newQ.correct) ? newQ.correct.length : 0}
                  </p>
                )}
              </div>
            )}

            {/* True/False */}
            {activeQType === 'truefalse' && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
                {['Да','Нет'].map((label, i) => (
                  <button key={i} onClick={() => setNewQ({...newQ, correct:i, options:['Да','Нет','','']})}
                    style={{padding:'12px', borderRadius:12, border:`2px solid ${newQ.correct===i?'#7c3aed':'#e5e7eb'}`,
                      background: newQ.correct===i ? '#f5f3ff' : 'white', fontWeight:800, fontSize:13,
                      color: newQ.correct===i ? '#7c3aed' : '#6b7280', cursor:'pointer'}}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            <button onClick={addQuestion}
              style={{width:'100%', padding:'12px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white',
                border:'none', borderRadius:12, fontSize:13, fontWeight:800, cursor:'pointer',
                fontFamily:"'Unbounded',system-ui,sans-serif"}}>
              + Добавить вопрос
            </button>
          </div>

          {/* Summary */}
          <div style={{background:'#f5f3ff', borderRadius:18, border:'1.5px solid #ddd6fe', padding:20, marginBottom:16}}>
            <h3 style={{fontSize:12, fontWeight:800, color:'#7c3aed', marginBottom:12}}>Итого</h3>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {[
                ['📌', quiz.title || '—'],
                ['🎯', TYPES.find(t=>t.id===quiz.type)?.label || '—'],
                ['❓', `${quiz.questions.length} вопросов`],
                [quiz.access==='public'?'🌍':'🔒', quiz.access==='public'?'Публичный':`Код: ${quiz.code||'—'}`],
              ].map(([icon, text], i) => (
                <div key={i} style={{display:'flex', gap:8, alignItems:'center'}}>
                  <span style={{fontSize:14}}>{icon}</span>
                  <span style={{fontSize:11, color:'#5b21b6', fontWeight:700}}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-pub" onClick={saveQuiz} disabled={saving}>
            {saving ? '⏳ Публикуем...' : '✓ Опубликовать опрос'}
          </button>
        </div>
      </div>
    </div>
  )
}