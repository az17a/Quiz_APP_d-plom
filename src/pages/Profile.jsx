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

export default function Profile() {
  const navigate = useNavigate()
  const [user,       setUser]       = useState(null)
  const [stats,      setStats]      = useState({ count:0, score:0, best:0 })
  const [history,    setHistory]    = useState([])
  const [selected,   setSelected]   = useState(null) // выбранное прохождение

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      const snap = await getDocs(collection(db, 'quizzes'))
      const quizzes = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      let count = 0, score = 0, best = 0
      const hist = []
      quizzes.forEach(q => {
        ;(q.responses || []).forEach(r => {
          if (r.userId === u.uid) {
            count++
            score += r.score
            const pct = Math.round((r.answers?.filter(a => a.isCorrect).length || 0) / q.questions.length * 100)
            if (pct > best) best = pct
            hist.push({
              title:     q.title,
              questions: q.questions,
              answers:   r.answers,
              score:     r.score,
              percent:   pct,
              date:      r.date,
              type:      q.type,
            })
          }
        })
      })
      hist.sort((a, b) => new Date(b.date) - new Date(a.date))
      setStats({ count, score, best })
      setHistory(hist)
    })
    return () => unsub()
  }, [])

  if (!user) return null

  const earnedBadges = BADGES.filter(b => b.req(stats.count, stats.best, stats.score))
  const level  = Math.floor(stats.score / 50) + 1
  const xpCurr = stats.score % 50
  const xpPct  = (xpCurr / 50) * 100

  const TYPE_ICONS = { quiz:'🎮', test:'📝', survey:'📊', work:'💼' }

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .badge-card { border-radius:14px; padding:14px; text-align:center; transition:transform 0.2s; }
        .badge-card.earned { background:#fffbeb; border:1.5px solid #fcd34d; }
        .badge-card.earned:hover { transform:translateY(-4px); }
        .badge-card.locked { background:#f9fafb; border:1.5px solid #f3f4f6; opacity:0.4; }
        .timeline-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:4px; }
        .timeline-line { width:1px; background:#e5e7eb; flex:1; margin:4px 0; }
        .hist-item { cursor:pointer; transition:background 0.15s; border-radius:12px; padding:10px 12px; }
        .hist-item:hover { background:#f5f3ff; }
        .answer-row { display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid #f3f4f6; }
        .answer-row:last-child { border-bottom:none; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:flex-end; justify-content:center; }
        .modal-sheet { background:white; border-radius:24px 24px 0 0; width:100%; max-width:600px; max-height:85vh; overflow-y:auto; padding:24px 20px; }

        @media (max-width:768px) {
          .profile-pad { padding:14px !important; }
          .header-pad { padding:12px 16px !important; }
          .stats-grid { grid-template-columns:repeat(3,1fr) !important; gap:10px !important; }
          .badges-grid { grid-template-columns:repeat(3,1fr) !important; gap:8px !important; }
          .profile-card { padding:20px 16px !important; }
          .profile-card-top { height:60px !important; }
          .profile-avatar { width:64px !important; height:64px !important; margin-top:10px !important; }
          .profile-name { font-size:15px !important; }
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
        <div className="profile-card" style={{background:'white', borderRadius:22, border:'1.5px solid #e5e7eb', padding:28, marginBottom:16, textAlign:'center', position:'relative', overflow:'hidden'}}>
          <div className="profile-card-top" style={{position:'absolute', top:0, left:0, right:0, height:70, background:'linear-gradient(135deg,#7c3aed,#4f46e5)'}} />
          <div style={{position:'relative', zIndex:1, marginBottom:10}}>
            {user.photoURL ? (
              <img className="profile-avatar" src={user.photoURL} style={{width:72, height:72, borderRadius:'50%', border:'4px solid white', objectFit:'cover', display:'block', margin:'12px auto 0'}} alt=""/>
            ) : (
              <div className="profile-avatar" style={{width:72, height:72, borderRadius:'50%', border:'4px solid white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:26, margin:'12px auto 0'}}>
                {(user.displayName||user.email||'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="profile-name" style={{fontSize:17, fontWeight:900, color:'#111', margin:'10px 0 4px'}}>{user.displayName || 'Пользователь'}</h2>
          <p style={{fontSize:11, color:'#9ca3af', margin:'0 0 14px'}}>{user.email}</p>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'#f5f3ff', color:'#7c3aed', padding:'7px 18px', borderRadius:100, fontSize:12, fontWeight:800, marginBottom:14}}>
            ⚡ Уровень {level}
          </div>
          <div style={{maxWidth:300, margin:'0 auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af', marginBottom:5}}>
              <span>{xpCurr} XP</span>
              <span>до уровня {level+1}: {50 - xpCurr} XP</span>
            </div>
            <div style={{height:7, background:'#f3f4f6', borderRadius:8, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${xpPct}%`, background:'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius:8}}/>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:16}}>
          {[
            { label:'Пройдено', value: stats.count, color:'#7c3aed', bg:'#f5f3ff', icon:'🎮' },
            { label:'Очков',    value: stats.score, color:'#d97706', bg:'#fffbeb', icon:'💰' },
            { label:'Лучший',   value: `${stats.best}%`, color:'#059669', bg:'#ecfdf5', icon:'🏆' },
          ].map((s, i) => (
            <div key={i} style={{background:s.bg, borderRadius:16, padding:'16px 10px', textAlign:'center'}}>
              <div style={{fontSize:24, marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:22, fontWeight:900, color:s.color}}>{s.value}</div>
              <div style={{fontSize:10, color:'#6b7280', marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:18, marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
            <h3 style={{fontSize:13, fontWeight:800, color:'#111', margin:0}}>Значки и достижения</h3>
            <span style={{fontSize:11, color:'#9ca3af', fontWeight:700}}>{earnedBadges.length}/{BADGES.length} получено</span>
          </div>
          <div className="badges-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10}}>
            {BADGES.map(b => {
              const earned = b.req(stats.count, stats.best, stats.score)
              return (
                <div key={b.id} className={`badge-card ${earned ? 'earned' : 'locked'}`}>
                  <div style={{fontSize:28, marginBottom:6}}>{b.icon}</div>
                  <div style={{fontSize:10, fontWeight:800, color:'#374151'}}>{b.label}</div>
                  <div style={{fontSize:9, color:'#9ca3af', marginTop:3}}>{b.desc}</div>
                  {earned && <div style={{fontSize:9, color:'#d97706', fontWeight:800, marginTop:4}}>✓ Получено</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline history */}
        <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:18}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <h3 style={{fontSize:13, fontWeight:800, color:'#111', margin:0}}>История прохождений</h3>
            <span style={{fontSize:11, color:'#9ca3af'}}>{history.length} всего</span>
          </div>

          {history.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px 0', color:'#9ca3af'}}>
              <div style={{fontSize:36, marginBottom:10}}>📝</div>
              <p style={{fontSize:12, fontWeight:700}}>Ты ещё не проходил опросы</p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column'}}>
              {history.map((h, i) => (
                <div key={i} style={{display:'flex', gap:12}}>
                  {/* Timeline */}
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:20, flexShrink:0}}>
                    <div className="timeline-dot" style={{background: h.percent >= 70 ? '#7c3aed' : h.percent >= 40 ? '#d97706' : '#d1d5db'}}/>
                    {i < history.length - 1 && <div className="timeline-line"/>}
                  </div>

                  {/* Content */}
                  <div className="hist-item" style={{flex:1, marginBottom: i < history.length-1 ? 4 : 0}}
                    onClick={() => setSelected(h)}>
                    <div style={{fontSize:10, color:'#9ca3af', marginBottom:3}}>
                      {new Date(h.date).toLocaleDateString('ru-RU')}
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                      <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
                        <span style={{fontSize:16, flexShrink:0}}>{TYPE_ICONS[h.type] || '❓'}</span>
                        <span style={{fontSize:12, fontWeight:700, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{h.title}</span>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
                        <span style={{fontSize:12, fontWeight:800, color:'#7c3aed'}}>{h.score} оч.</span>
                        <span style={{padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:800,
                          background: h.percent>=70?'#ecfdf5':h.percent>=40?'#fffbeb':'#fef2f2',
                          color: h.percent>=70?'#059669':h.percent>=40?'#d97706':'#ef4444'}}>
                          {h.percent}%
                        </span>
                        <span style={{fontSize:11, color:'#9ca3af'}}>›</span>
                      </div>
                    </div>
                    <div style={{fontSize:10, color:'#9ca3af', marginTop:3}}>
                      {h.answers?.filter(a => a.isCorrect).length || 0} из {h.questions?.length || 0} правильно · нажми для деталей
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
              <div>
                <h3 style={{fontSize:14, fontWeight:800, color:'#111', margin:0}}>{selected.title}</h3>
                <p style={{fontSize:11, color:'#9ca3af', margin:'4px 0 0'}}>{new Date(selected.date).toLocaleDateString('ru-RU')}</p>
              </div>
              <button onClick={() => setSelected(null)}
                style={{background:'#f3f4f6', border:'none', borderRadius:10, width:32, height:32, fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                ✕
              </button>
            </div>

            {/* Stats */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20}}>
              {[
                { label:'Очков',      value: selected.score,   color:'#7c3aed', bg:'#f5f3ff' },
                { label:'Правильно',  value: `${selected.answers?.filter(a=>a.isCorrect).length||0}/${selected.questions?.length||0}`, color:'#059669', bg:'#ecfdf5' },
                { label:'Результат',  value: `${selected.percent}%`, color: selected.percent>=70?'#059669':selected.percent>=40?'#d97706':'#ef4444', bg: selected.percent>=70?'#ecfdf5':selected.percent>=40?'#fffbeb':'#fef2f2' },
              ].map((s, i) => (
                <div key={i} style={{background:s.bg, borderRadius:12, padding:'12px 8px', textAlign:'center'}}>
                  <div style={{fontSize:18, fontWeight:900, color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10, color:'#6b7280', marginTop:3}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Answers detail */}
            <h4 style={{fontSize:12, fontWeight:800, color:'#111', marginBottom:12}}>Детали ответов</h4>
            <div style={{display:'flex', flexDirection:'column'}}>
              {selected.questions?.map((q, i) => {
                const ans = selected.answers?.[i]
                const isCorrect = ans?.isCorrect
                const isPartial = ans?.isPartial
                const selectedArr = Array.isArray(ans?.selected) ? ans.selected : ans?.selected !== undefined ? [ans.selected] : []
                const correctArr  = Array.isArray(q.correct) ? q.correct : [q.correct]

                return (
                  <div key={i} className="answer-row">
                    <div style={{width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800,
                      background: isCorrect ? '#ecfdf5' : isPartial ? '#fffbeb' : '#fef2f2',
                      color: isCorrect ? '#059669' : isPartial ? '#d97706' : '#ef4444'}}>
                      {isCorrect ? '✓' : isPartial ? '½' : '✗'}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12, fontWeight:700, color:'#374151', marginBottom:6, wordBreak:'break-word'}}>{q.text}</div>
                      <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
                        {q.options?.filter(o => o).map((opt, j) => {
                          const isSelected = selectedArr.includes(j)
                          const isRight    = correctArr.includes(j)
                          let bg = '#f9fafb', color = '#6b7280', border = '#f3f4f6'
                          if (isRight && isSelected) { bg = '#ecfdf5'; color = '#059669'; border = '#a7f3d0' }
                          else if (isRight) { bg = '#ecfdf5'; color = '#059669'; border = '#a7f3d0' }
                          else if (isSelected) { bg = '#fef2f2'; color = '#ef4444'; border = '#fecaca' }
                          return (
                            <span key={j} style={{fontSize:10, padding:'3px 10px', borderRadius:8,
                              background: bg, color: color, border: `1px solid ${border}`, fontWeight: isRight || isSelected ? 700 : 400}}>
                              {isRight ? '✓ ' : isSelected ? '✗ ' : ''}{opt}
                            </span>
                          )
                        })}
                      </div>
                      {ans?.earnedPoints !== undefined && (
                        <div style={{fontSize:10, color:'#7c3aed', fontWeight:700, marginTop:5}}>
                          +{ans.earnedPoints} баллов
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}