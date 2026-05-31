import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

const BADGES = [
  { id: 'first',   icon: '🎯', label: 'Первый опрос',    desc: 'Пройди 1 опрос',          req: (c)      => c >= 1   },
  { id: 'five',    icon: '🔥', label: 'На разогреве',    desc: 'Пройди 5 опросов',         req: (c)      => c >= 5   },
  { id: 'ten',     icon: '🏅', label: 'Ветеран',         desc: 'Пройди 10 опросов',        req: (c)      => c >= 10  },
  { id: 'perfect', icon: '⭐', label: 'Отличник',        desc: 'Набери 100% в опросе',     req: (_,p)    => p >= 100 },
  { id: 'hundred', icon: '💯', label: 'Сто очков',       desc: 'Набери 100 очков суммарно',req: (_,__,s) => s >= 100 },
  { id: 'streak',  icon: '⚡', label: 'Стремительный',   desc: 'Набери 50+ очков за раз',  req: (_,p)    => p >= 50  },
]

export default function Profile() {
  const navigate = useNavigate()
  const [user,  setUser]  = useState(null)
  const [stats, setStats] = useState({ count:0, score:0, best:0 })
  const [history, setHistory] = useState([])

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      const snap = await getDocs(collection(db, 'quizzes'))
      const quizzes = snap.docs.map(d => ({ id:d.id, ...d.data() }))
      let count=0, score=0, best=0
      const hist = []
      quizzes.forEach(q => {
        ;(q.responses||[]).forEach(r => {
          if (r.userId === u.uid) {
            count++
            score += r.score
            const pct = Math.round((r.answers?.filter(a=>a.isCorrect).length||0) / q.questions.length * 100)
            if (pct > best) best = pct
            hist.push({ title:q.title, score:r.score, percent:pct, date:r.date })
          }
        })
      })
      hist.sort((a,b) => new Date(b.date) - new Date(a.date))
      setStats({ count, score, best })
      setHistory(hist)
    })
    return () => unsub()
  }, [])

  if (!user) return null

  const earnedBadges = BADGES.filter(b => b.req(stats.count, stats.best, stats.score))
  const level   = Math.floor(stats.score / 50) + 1
  const xpCurr  = stats.score % 50
  const xpPct   = (xpCurr / 50) * 100

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .badge-card { border-radius:16px; padding:16px; text-align:center; transition:transform 0.2s; }
        .badge-card.earned { background:#fffbeb; border:1.5px solid #fcd34d; }
        .badge-card.earned:hover { transform:translateY(-4px); }
        .badge-card.locked { background:#f9fafb; border:1.5px solid #f3f4f6; opacity:0.45; }
        .hist-row { display:flex; align-items:center; padding:14px 20px; border-bottom:1px solid #f3f4f6; transition:background 0.15s; }
        .hist-row:hover { background:#f8f7ff; }
      `}</style>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#46178f,#5b21b6)', padding:'16px 32px', display:'flex', alignItems:'center', gap:16}}>
        <button onClick={() => navigate('/dashboard')}
          style={{color:'rgba(255,255,255,0.7)', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
          ← Назад
        </button>
        <span style={{color:'white', fontWeight:800, fontSize:15}}>👤 Мой профиль</span>
      </div>

      <div style={{maxWidth:800, margin:'0 auto', padding:'28px 24px'}}>

        {/* Profile card */}
        <div style={{background:'white', borderRadius:24, border:'1.5px solid #e5e7eb', padding:32, marginBottom:20, textAlign:'center', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, left:0, right:0, height:80, background:'linear-gradient(135deg,#7c3aed,#4f46e5)'}} />

          <div style={{position:'relative', zIndex:1, marginBottom:12}}>
            {user.photoURL ? (
              <img src={user.photoURL} style={{width:80, height:80, borderRadius:'50%', border:'4px solid white', objectFit:'cover', display:'block', margin:'16px auto 0'}} alt="" />
            ) : (
              <div style={{width:80, height:80, borderRadius:'50%', border:'4px solid white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:28, margin:'16px auto 0'}}>
                {(user.displayName||user.email||'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          <h2 style={{fontSize:18, fontWeight:900, color:'#111', margin:'12px 0 4px'}}>{user.displayName || 'Пользователь'}</h2>
          <p style={{fontSize:12, color:'#9ca3af', margin:'0 0 16px'}}>{user.email}</p>

          <div style={{display:'inline-flex', alignItems:'center', gap:8, background:'#f5f3ff', color:'#7c3aed', padding:'8px 20px', borderRadius:100, fontSize:13, fontWeight:800, marginBottom:16}}>
            ⚡ Уровень {level}
          </div>

          <div style={{maxWidth:320, margin:'0 auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af', marginBottom:6}}>
              <span>{xpCurr} XP</span>
              <span>до уровня {level+1}: {50 - xpCurr} XP</span>
            </div>
            <div style={{height:8, background:'#f3f4f6', borderRadius:8, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${xpPct}%`, background:'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius:8, transition:'width 1s ease'}} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20}}>
          {[
            { label:'Опросов пройдено', value: stats.count, color:'#7c3aed', bg:'#f5f3ff', icon:'🎮' },
            { label:'Всего очков',      value: stats.score, color:'#d97706', bg:'#fffbeb', icon:'💰' },
            { label:'Лучший результат', value: `${stats.best}%`, color:'#059669', bg:'#ecfdf5', icon:'🏆' },
          ].map((s,i) => (
            <div key={i} style={{background:s.bg, borderRadius:18, border:`1.5px solid ${s.bg}`, padding:20, textAlign:'center'}}>
              <div style={{fontSize:28, marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:26, fontWeight:900, color:s.color}}>{s.value}</div>
              <div style={{fontSize:11, color:'#6b7280', marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{background:'white', borderRadius:20, border:'1.5px solid #e5e7eb', padding:24, marginBottom:20}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
            <h3 style={{fontSize:14, fontWeight:800, color:'#111', margin:0}}>Значки и достижения</h3>
            <span style={{fontSize:11, color:'#9ca3af', fontWeight:700}}>{earnedBadges.length}/{BADGES.length} получено</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
            {BADGES.map(b => {
              const earned = b.req(stats.count, stats.best, stats.score)
              return (
                <div key={b.id} className={`badge-card ${earned?'earned':'locked'}`}>
                  <div style={{fontSize:32, marginBottom:8}}>{b.icon}</div>
                  <div style={{fontSize:11, fontWeight:800, color:'#374151'}}>{b.label}</div>
                  <div style={{fontSize:10, color:'#9ca3af', marginTop:4}}>{b.desc}</div>
                  {earned && <div style={{fontSize:10, color:'#d97706', fontWeight:800, marginTop:6}}>✓ Получено</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* History */}
        <div style={{background:'white', borderRadius:20, border:'1.5px solid #e5e7eb', overflow:'hidden'}}>
          <div style={{padding:'20px 20px 12px', borderBottom:'1px solid #f3f4f6'}}>
            <h3 style={{fontSize:14, fontWeight:800, color:'#111', margin:0}}>История прохождений</h3>
          </div>
          {history.length === 0 ? (
            <div style={{textAlign:'center', padding:'48px 0', color:'#9ca3af'}}>
              <div style={{fontSize:40, marginBottom:10}}>📝</div>
              <p style={{fontSize:12, fontWeight:700}}>Ты ещё не проходил опросы</p>
            </div>
          ) : (
            history.map((h,i) => (
              <div key={i} className="hist-row">
                <div style={{flex:1}}>
                  <div style={{fontSize:12, fontWeight:700, color:'#111'}}>{h.title}</div>
                  <div style={{fontSize:11, color:'#9ca3af', marginTop:2}}>{new Date(h.date).toLocaleDateString('ru-RU')}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <span style={{fontSize:13, fontWeight:900, color:'#7c3aed'}}>{h.score} очков</span>
                  <span style={{padding:'4px 12px', borderRadius:8, fontSize:11, fontWeight:800,
                    background: h.percent>=70?'#ecfdf5':h.percent>=40?'#fffbeb':'#fef2f2',
                    color: h.percent>=70?'#059669':h.percent>=40?'#d97706':'#ef4444'}}>
                    {h.percent}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}