import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [leaders, setLeaders] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async u => {
      setCurrentUser(u)
      const snap = await getDocs(collection(db, 'quizzes'))
      const quizzes = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const scores = {}
      quizzes.forEach(q => {
        ;(q.responses || []).forEach(r => {
          const key = r.userId || r.userName
          if (!scores[key]) scores[key] = { name: r.userName, userId: r.userId, score: 0, count: 0 }
          scores[key].score += r.score
          scores[key].count += 1
        })
      })
      const sorted = Object.values(scores).sort((a, b) => b.score - a.score)
      setLeaders(sorted)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const medals = ['🥇', '🥈', '🥉']
  const medalColors = ['#f59e0b', '#9ca3af', '#d97706']
  const medalBg = ['#fffbeb', '#f9fafb', '#fff7ed']

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .leader-row { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid #f3f4f6; transition:background 0.15s; }
        .leader-row:hover { background:#f8f7ff; }
        .leader-row.me { background:#f5f3ff; border-left:3px solid #7c3aed; }
        .leader-row.top1 { background:#fffbeb; }
        .leader-row.top2 { background:#f9fafb; }
        .leader-row.top3 { background:#fff7ed; }
        @media(max-width:768px){
          .lb-pad { padding: 16px !important; }
          .lb-header { padding: 12px 16px !important; }
          .top3-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="lb-header" style={{background:'linear-gradient(135deg,#46178f,#5b21b6)', padding:'16px 32px', display:'flex', alignItems:'center', gap:16}}>
        <button onClick={() => navigate('/dashboard')}
          style={{color:'rgba(255,255,255,0.7)', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
          ← Назад
        </button>
        <span style={{color:'white', fontWeight:800, fontSize:15}}>🏆 Таблица лидеров</span>
      </div>

      <div className="lb-pad" style={{maxWidth:700, margin:'0 auto', padding:'28px 24px'}}>

        {loading ? (
          <div style={{textAlign:'center', padding:'80px 0', color:'#9ca3af', fontSize:13}}>Загрузка...</div>
        ) : leaders.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 0', background:'white', borderRadius:20, border:'1.5px solid #e5e7eb'}}>
            <div style={{fontSize:56, marginBottom:12}}>🏆</div>
            <p style={{fontSize:13, color:'#9ca3af', fontWeight:700}}>Пока никто не прошёл ни одного опроса</p>
            <button onClick={() => navigate('/dashboard')}
              style={{marginTop:20, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
              Перейти к опросам
            </button>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {leaders.length >= 3 && (
              <div className="top3-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24}}>
                {[1, 0, 2].map(pos => {
                  const l = leaders[pos]
                  if (!l) return null
                  const isMe = l.userId === currentUser?.uid
                  return (
                    <div key={pos} style={{background:'white', borderRadius:20, border:`1.5px solid ${pos===0?'#fcd34d':pos===1?'#e5e7eb':'#fed7aa'}`, padding:'20px 16px', textAlign:'center', position:'relative', order: pos===0?1:pos===1?0:2}}>
                      {pos === 0 && <div style={{position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', fontSize:20}}>👑</div>}
                      <div style={{fontSize:28, marginBottom:6}}>{medals[pos]}</div>
                      <div style={{width:44, height:44, borderRadius:'50%', background:`linear-gradient(135deg,${pos===0?'#f59e0b,#d97706':pos===1?'#7c3aed,#4f46e5':'#d97706,#ea580c'})`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:16, margin:'0 auto 10px'}}>
                        {(l.name||'?')[0].toUpperCase()}
                      </div>
                      <div style={{fontSize:11, fontWeight:800, color:'#111', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {l.name}{isMe?' (Вы)':''}
                      </div>
                      <div style={{fontSize:18, fontWeight:900, color: pos===0?'#d97706':pos===1?'#7c3aed':'#ea580c'}}>{l.score}</div>
                      <div style={{fontSize:10, color:'#9ca3af', marginTop:2}}>очков</div>
                      <div style={{fontSize:10, color:'#9ca3af'}}>{l.count} опросов</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full list */}
            <div style={{background:'white', borderRadius:20, border:'1.5px solid #e5e7eb', overflow:'hidden'}}>
              <div style={{padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{fontSize:13, fontWeight:800, color:'#111'}}>Все участники</span>
                <span style={{fontSize:11, color:'#9ca3af'}}>{leaders.length} человек</span>
              </div>
              {leaders.map((l, i) => {
                const isMe = l.userId === currentUser?.uid
                const isTop = i < 3
                return (
                  <div key={i} className={`leader-row ${isMe?'me':''} ${i===0?'top1':i===1?'top2':i===2?'top3':''}`}>
                    <div style={{width:28, textAlign:'center', fontSize: i<3?20:13, color:'#9ca3af', fontWeight:700, flexShrink:0}}>
                      {i < 3 ? medals[i] : i+1}
                    </div>
                    <div style={{width:38, height:38, borderRadius:'50%', background: isTop?`linear-gradient(135deg,${medalColors[i]},${i===0?'#d97706':i===1?'#6b7280':'#b45309'})`:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:14, flexShrink:0}}>
                      {(l.name||'?')[0].toUpperCase()}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:12, fontWeight:700, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                        {l.name} {isMe && <span style={{fontSize:10, background:'#ede9fe', color:'#7c3aed', padding:'2px 8px', borderRadius:6, marginLeft:4}}>Вы</span>}
                      </div>
                      <div style={{fontSize:11, color:'#9ca3af', marginTop:2}}>{l.count} опросов пройдено</div>
                    </div>
                    <div style={{textAlign:'right', flexShrink:0}}>
                      <div style={{fontSize:16, fontWeight:900, color: i===0?'#d97706':i===1?'#6b7280':i===2?'#b45309':'#7c3aed'}}>{l.score}</div>
                      <div style={{fontSize:10, color:'#9ca3af'}}>очков</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}