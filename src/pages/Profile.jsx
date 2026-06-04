import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

const BADGES = [
  { id: 'first',   icon: '🎯', label: 'Первый опрос',    desc: 'Пройди 1 опрос',           req: (c)      => c >= 1   },
  { id: 'five',    icon: '🔥', label: 'На разогреве',    desc: 'Пройди 5 опросов',          req: (c)      => c >= 5   },
  { id: 'ten',     icon: '🏅', label: 'Ветеран',         desc: 'Пройди 10 опросов',         req: (c)      => c >= 10  },
  { id: 'perfect', icon: '⭐', label: 'Отличник',        desc: 'Набери 100% в опросе',      req: (_,p)    => p >= 100 },
  { id: 'hundred', icon: '💯', label: 'Сто очков',       desc: 'Набери 100 очков суммарно', req: (_,__,s) => s >= 100 },
  { id: 'streak',  icon: '⚡', label: 'Стремительный',   desc: 'Набери 50+ очков за раз',   req: (_,p)    => p >= 50  },
]

const TYPE_ICONS = { quiz:'🎮', test:'📝', survey:'📊', work:'💼' }

export default function Profile() {
  const navigate = useNavigate()
  const [user,        setUser]        = useState(null)
  const [stats,       setStats]       = useState({ count:0, score:0, best:0 })
  const [quizGroups,  setQuizGroups]  = useState([]) // сгруппированные по опросу
  const [expandedQuiz,setExpandedQuiz]= useState(null) // открытый опрос
  const [selectedRun, setSelectedRun] = useState(null) // выбранное прохождение

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      const snap = await getDocs(collection(db, 'quizzes'))
      const quizzes = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      let count = 0, score = 0, best = 0
      const groups = {}

      quizzes.forEach(q => {
        ;(q.responses || []).forEach(r => {
          if (r.userId === u.uid) {
            count++
            score += r.score
            const pct = Math.round((r.answers?.filter(a => a.isCorrect).length || 0) / q.questions.length * 100)
            if (pct > best) best = pct

            if (!groups[q.id]) {
              groups[q.id] = {
                id:        q.id,
                title:     q.title,
                type:      q.type,
                questions: q.questions,
                runs:      [],
              }
            }
            groups[q.id].runs.push({
              score, percent: pct, date: r.date,
              answers: r.answers, score: r.score,
            })
          }
        })
      })

      // sort runs inside each group
      Object.values(groups).forEach(g => {
        g.runs.sort((a, b) => new Date(b.date) - new Date(a.date))
      })

      // sort groups by latest run
      const sorted = Object.values(groups).sort((a, b) =>
        new Date(b.runs[0]?.date) - new Date(a.runs[0]?.date)
      )

      setStats({ count, score, best })
      setQuizGroups(sorted)
    })
    return () => unsub()
  }, [])

  if (!user) return null

  const earnedBadges = BADGES.filter(b => b.req(stats.count, stats.best, stats.score))
  const level  = Math.floor(stats.score / 50) + 1
  const xpCurr = stats.score % 50
  const xpPct  = (xpCurr / 50) * 100

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .badge-card { border-radius:14px; padding:14px; text-align:center; transition:transform 0.2s; }
        .badge-card.earned { background:#fffbeb; border:1.5px solid #fcd34d; }
        .badge-card.earned:hover { transform:translateY(-4px); }
        .badge-card.locked { background:#f9fafb; border:1.5px solid #f3f4f6; opacity:0.4; }
        .quiz-group { border-radius:14px; border:1.5px solid #e5e7eb; overflow:hidden; margin-bottom:10px; background:white; transition:border-color 0.15s; }
        .quiz-group.open { border-color:#7c3aed; }
        .quiz-group-header { display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; transition:background 0.15s; }
        .quiz-group-header:hover { background:#f8f7ff; }
        .run-row { display:flex; align-items:center; padding:12px 16px; border-top:1px solid #f3f4f6; cursor:pointer; transition:background 0.15s; gap:12px; }
        .run-row:hover { background:#f5f3ff; }
        .answer-row { display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid #f3f4f6; }
        .answer-row:last-child { border-bottom:none; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:flex-end; justify-content:center; }
        .modal-sheet { background:white; border-radius:24px 24px 0 0; width:100%; max-width:600px; max-height:88vh; overflow-y:auto; padding:24px 20px 32px; }

        @media (max-width:768px) {
          .profile-pad { padding:14px !important; }
          .header-pad { padding:12px 16px !important; }
          .stats-grid { grid-template-columns:repeat(3,1fr) !important; gap:10px !important; }
          .badges-grid { grid-template-columns:repeat(3,1fr) !important; gap:8px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="header-pad" style={{background:'linear-gradient(135deg,#46178f,#5b21b6)', padding:'14px 24px', display:'flex', alignItems:'center', gap:16}}>
        <button onClick={() => navigate('/dashboard')}
          style={{color:'rgba(255,255,255,0.7)', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
          ← Назад
        </button>
        <span style={{color:'white', fontWeight:800, fontSize:14}}>👤 Мой профиль</span>
      </div>

      <div className="profile-pad" style={{maxWidth:800, margin:'0 auto', padding:'20px 20px'}}>

        {/* Profile card */}
        <div style={{background:'white', borderRadius:22, border:'1.5px solid #e5e7eb', padding:24, marginBottom:16, textAlign:'center', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, left:0, right:0, height:65, background:'linear-gradient(135deg,#7c3aed,#4f46e5)'}}/>
          <div style={{position:'relative', zIndex:1, marginBottom:10}}>
            {user.photoURL ? (
              <img src={user.photoURL} style={{width:68, height:68, borderRadius:'50%', border:'4px solid white', objectFit:'cover', display:'block', margin:'10px auto 0'}} alt=""/>
            ) : (
              <div style={{width:68, height:68, borderRadius:'50%', border:'4px solid white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:24, margin:'10px auto 0'}}>
                {(user.displayName||user.email||'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <h2 style={{fontSize:16, fontWeight:900, color:'#111', margin:'10px 0 3px'}}>{user.displayName || 'Пользователь'}</h2>
          <p style={{fontSize:11, color:'#9ca3af', margin:'0 0 12px'}}>{user.email}</p>
          <div style={{display:'inline-flex', alignItems:'center', gap:6, background:'#f5f3ff', color:'#7c3aed', padding:'6px 16px', borderRadius:100, fontSize:12, fontWeight:800, marginBottom:12}}>
            ⚡ Уровень {level}
          </div>
          <div style={{maxWidth:300, margin:'0 auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:10, color:'#9ca3af', marginBottom:5}}>
              <span>{xpCurr} XP</span>
              <span>до уровня {level+1}: {50-xpCurr} XP</span>
            </div>
            <div style={{height:7, background:'#f3f4f6', borderRadius:8, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${xpPct}%`, background:'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius:8}}/>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16}}>
          {[
            { label:'Пройдено', value: stats.count,       color:'#7c3aed', bg:'#f5f3ff', icon:'🎮' },
            { label:'Очков',    value: stats.score,       color:'#d97706', bg:'#fffbeb', icon:'💰' },
            { label:'Лучший',   value: `${stats.best}%`,  color:'#059669', bg:'#ecfdf5', icon:'🏆' },
          ].map((s, i) => (
            <div key={i} style={{background:s.bg, borderRadius:14, padding:'14px 8px', textAlign:'center'}}>
              <div style={{fontSize:22, marginBottom:5}}>{s.icon}</div>
              <div style={{fontSize:20, fontWeight:900, color:s.color}}>{s.value}</div>
              <div style={{fontSize:10, color:'#6b7280', marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:16, marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <h3 style={{fontSize:13, fontWeight:800, color:'#111', margin:0}}>Значки и достижения</h3>
            <span style={{fontSize:10, color:'#9ca3af', fontWeight:700}}>{earnedBadges.length}/{BADGES.length}</span>
          </div>
          <div className="badges-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
            {BADGES.map(b => {
              const earned = b.req(stats.count, stats.best, stats.score)
              return (
                <div key={b.id} className={`badge-card ${earned?'earned':'locked'}`}>
                  <div style={{fontSize:26, marginBottom:5}}>{b.icon}</div>
                  <div style={{fontSize:10, fontWeight:800, color:'#374151'}}>{b.label}</div>
                  <div style={{fontSize:9, color:'#9ca3af', marginTop:2}}>{b.desc}</div>
                  {earned && <div style={{fontSize:9, color:'#d97706', fontWeight:800, marginTop:4}}>✓ Получено</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Quiz groups */}
        <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <h3 style={{fontSize:13, fontWeight:800, color:'#111', margin:0}}>История прохождений</h3>
            <span style={{fontSize:10, color:'#9ca3af'}}>{quizGroups.length} опросов</span>
          </div>

          {quizGroups.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px 0', color:'#9ca3af'}}>
              <div style={{fontSize:36, marginBottom:10}}>📝</div>
              <p style={{fontSize:12, fontWeight:700}}>Ты ещё не проходил опросы</p>
            </div>
          ) : (
            quizGroups.map(group => {
              const isOpen = expandedQuiz === group.id
              const bestRun = Math.max(...group.runs.map(r => r.percent))
              return (
                <div key={group.id} className={`quiz-group ${isOpen ? 'open' : ''}`}>
                  {/* Group header */}
                  <div className="quiz-group-header" onClick={() => setExpandedQuiz(isOpen ? null : group.id)}>
                    <div style={{width:40, height:40, borderRadius:12, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0}}>
                      {TYPE_ICONS[group.type] || '❓'}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12, fontWeight:800, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{group.title}</div>
                      <div style={{fontSize:10, color:'#9ca3af', marginTop:2}}>
                        {group.runs.length} прохождений · лучший {bestRun}%
                      </div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
                      <span style={{fontSize:11, color:'#7c3aed', fontWeight:700}}>{group.runs.length}x</span>
                      <span style={{fontSize:14, color:'#9ca3af', transition:'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'}}>›</span>
                    </div>
                  </div>

                  {/* Runs list */}
                  {isOpen && group.runs.map((run, i) => (
                    <div key={i} className="run-row" onClick={() => setSelectedRun({...run, title: group.title, questions: group.questions})}>
                      <div style={{width:8, height:8, borderRadius:'50%', flexShrink:0,
                        background: run.percent>=70?'#7c3aed':run.percent>=40?'#d97706':'#d1d5db'}}/>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:11, color:'#374151', fontWeight:600}}>
                          {new Date(run.date).toLocaleDateString('ru-RU')} · {new Date(run.date).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}
                        </div>
                        <div style={{fontSize:10, color:'#9ca3af', marginTop:2}}>
                          {run.answers?.filter(a => a.isCorrect).length || 0} из {group.questions?.length || 0} правильно
                        </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
                        <span style={{fontSize:12, fontWeight:800, color:'#7c3aed'}}>{run.score} оч.</span>
                        <span style={{padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:800,
                          background: run.percent>=70?'#ecfdf5':run.percent>=40?'#fffbeb':'#fef2f2',
                          color: run.percent>=70?'#059669':run.percent>=40?'#d97706':'#ef4444'}}>
                          {run.percent}%
                        </span>
                        <span style={{fontSize:11, color:'#9ca3af'}}>›</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedRun && (
        <div className="modal-overlay" onClick={() => setSelectedRun(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <div>
                <h3 style={{fontSize:14, fontWeight:800, color:'#111', margin:0}}>{selectedRun.title}</h3>
                <p style={{fontSize:11, color:'#9ca3af', margin:'4px 0 0'}}>
                  {new Date(selectedRun.date).toLocaleDateString('ru-RU')} · {new Date(selectedRun.date).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}
                </p>
              </div>
              <button onClick={() => setSelectedRun(null)}
                style={{background:'#f3f4f6', border:'none', borderRadius:10, width:32, height:32, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                ✕
              </button>
            </div>

            {/* Stats */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20}}>
              {[
                { label:'Очков',     value: selectedRun.score,   color:'#7c3aed', bg:'#f5f3ff' },
                { label:'Правильно', value: `${selectedRun.answers?.filter(a=>a.isCorrect).length||0}/${selectedRun.questions?.length||0}`, color:'#059669', bg:'#ecfdf5' },
                { label:'Результат', value: `${selectedRun.percent}%`, color: selectedRun.percent>=70?'#059669':selectedRun.percent>=40?'#d97706':'#ef4444', bg: selectedRun.percent>=70?'#ecfdf5':selectedRun.percent>=40?'#fffbeb':'#fef2f2' },
              ].map((s, i) => (
                <div key={i} style={{background:s.bg, borderRadius:12, padding:'12px 8px', textAlign:'center'}}>
                  <div style={{fontSize:17, fontWeight:900, color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10, color:'#6b7280', marginTop:3}}>{s.label}</div>
                </div>
              ))}
            </div>

            <h4 style={{fontSize:12, fontWeight:800, color:'#111', marginBottom:12}}>Ответы по вопросам</h4>
            {selectedRun.questions?.map((q, i) => {
              const ans = selectedRun.answers?.[i]
              const isCorrect = ans?.isCorrect
              const isPartial = ans?.isPartial
              const selectedArr = Array.isArray(ans?.selected) ? ans.selected : ans?.selected !== undefined ? [ans.selected] : []
              const correctArr  = Array.isArray(q.correct) ? q.correct : [q.correct]

              return (
                <div key={i} className="answer-row">
                  <div style={{width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800,
                    background: isCorrect?'#ecfdf5':isPartial?'#fffbeb':'#fef2f2',
                    color: isCorrect?'#059669':isPartial?'#d97706':'#ef4444'}}>
                    {isCorrect?'✓':isPartial?'½':'✗'}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, wordBreak:'break-word'}}>{i+1}. {q.text}</div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
                      {q.options?.filter(o => o).map((opt, j) => {
                        const isSel   = selectedArr.includes(j)
                        const isRight = correctArr.includes(j)
                        let bg = '#f9fafb', color = '#6b7280', border = 'transparent'
                        if (isRight && isSel)  { bg='#ecfdf5'; color='#059669'; border='#a7f3d0' }
                        else if (isRight)       { bg='#ecfdf5'; color='#059669'; border='#a7f3d0' }
                        else if (isSel)         { bg='#fef2f2'; color='#ef4444'; border='#fecaca' }
                        return (
                          <span key={j} style={{fontSize:10, padding:'3px 10px', borderRadius:8,
                            background:bg, color:color, border:`1px solid ${border}`, fontWeight: isRight||isSel?700:400}}>
                            {isRight?'✓ ':isSel?'✗ ':''}{opt}
                          </span>
                        )
                      })}
                    </div>
                    {ans?.earnedPoints !== undefined && (
                      <div style={{fontSize:10, color:'#7c3aed', fontWeight:700, marginTop:5}}>+{ans.earnedPoints} баллов</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}