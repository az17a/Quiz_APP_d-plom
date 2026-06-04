import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Analytics() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')

  useEffect(() => {
    const loadQuiz = async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('../../firebase')
      const snap = await getDoc(doc(db, 'quizzes', id))
      if (snap.exists()) setQuiz({ id: snap.id, ...snap.data() })
    }
    loadQuiz()
  }, [id])

  if (!quiz) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Unbounded',system-ui,sans-serif", color:'#9ca3af'}}>
      Загрузка...
    </div>
  )

  const responses     = quiz.responses || []
  const totalResponses = responses.length
  const avgScore      = totalResponses ? Math.round(responses.reduce((a, r) => a + r.score, 0) / totalResponses) : 0
  const avgPercent    = totalResponses ? Math.round(responses.reduce((a, r) => {
    const correct = r.answers?.filter(a => a.isCorrect).length || 0
    return a + (correct / quiz.questions.length * 100)
  }, 0) / totalResponses) : 0
  const maxScore      = totalResponses ? Math.max(...responses.map(r => r.score)) : 0
  const correctTotal  = responses.reduce((a, r) => a + (r.answers?.filter(x => x.isCorrect).length || 0), 0)
  const wrongTotal    = responses.reduce((a, r) => a + (r.answers?.filter(x => !x.isCorrect).length || 0), 0)

  const pieData = [
    { name: 'Правильно',    value: correctTotal },
    { name: 'Неправильно',  value: wrongTotal   },
  ]

  const scoreDistribution = [
    { range: '0-20',  count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p < 20 }).length },
    { range: '20-40', count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 20 && p < 40 }).length },
    { range: '40-60', count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 40 && p < 60 }).length },
    { range: '60-80', count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 60 && p < 80 }).length },
    { range: '80+',   count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 80 }).length },
  ]

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .tab-btn { padding:9px 14px; border:none; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.15s; font-family:'Unbounded',system-ui,sans-serif; white-space:nowrap; }
        .tab-btn.active { background:#7c3aed; color:white; box-shadow:0 4px 12px rgba(124,58,237,0.25); }
        .tab-btn:not(.active) { background:white; color:#6b7280; }
        .q-card { background:white; border-radius:16px; border:1.5px solid #e5e7eb; padding:18px; margin-bottom:14px; }
        .progress-bar { height:8px; background:#f3f4f6; border-radius:8px; overflow:hidden; margin-top:4px; }
        .progress-fill { height:100%; border-radius:8px; transition:width 0.5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.35s ease both; }

        /* Stats grid */
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
        /* Charts grid */
        .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        /* Table scroll wrapper */
        .table-wrap { overflow-x:auto; }

        @media (max-width:768px) {
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; gap:10px !important; }
          .charts-grid { grid-template-columns:1fr !important; }
          .main-pad { padding:14px !important; }
          .header-pad { padding:12px 16px !important; }
          .tabs-scroll { overflow-x:auto; padding-bottom:4px; }
          .hide-mobile { display:none !important; }
          .table-wrap td, .table-wrap th { padding:10px 8px !important; font-size:10px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="header-pad" style={{background:'linear-gradient(135deg,#46178f,#5b21b6)', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
        <div style={{display:'flex', alignItems:'center', gap:12, minWidth:0}}>
          <button onClick={() => navigate('/dashboard')}
            style={{color:'rgba(255,255,255,0.7)', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontFamily:"'Unbounded',system-ui,sans-serif", flexShrink:0}}>
            ← Назад
          </button>
          <div style={{minWidth:0}}>
            <div style={{color:'white', fontWeight:800, fontSize:14}}>📊 Аналитика</div>
            <div style={{color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{quiz.title}</div>
          </div>
        </div>
        <div style={{color:'rgba(255,255,255,0.7)', fontSize:12, flexShrink:0}}>
          {totalResponses} ответов
        </div>
      </div>

      <div className="main-pad" style={{maxWidth:1000, margin:'0 auto', padding:'20px 20px'}}>

        {/* Tabs */}
        <div className="tabs-scroll" style={{display:'flex', gap:8, marginBottom:20}}>
          {[['summary','📈 Сводка'],['questions','❓ Вопросы'],['respondents','👥 Участники']].map(([tid, label]) => (
            <button key={tid} className={`tab-btn ${activeTab === tid ? 'active' : ''}`} onClick={() => setActiveTab(tid)}>
              {label}
            </button>
          ))}
        </div>

        {/* SUMMARY */}
        {activeTab === 'summary' && (
          <div className="fade-in">
            {/* Stats */}
            <div className="stats-grid">
              {[
                { label:'Ответов',      value: totalResponses,   color:'#7c3aed', bg:'#f5f3ff', icon:'👥' },
                { label:'Средний балл', value: avgScore,         color:'#059669', bg:'#ecfdf5', icon:'⭐' },
                { label:'Средний %',    value: `${avgPercent}%`, color:'#d97706', bg:'#fffbeb', icon:'📊' },
                { label:'Лучший балл',  value: maxScore,         color:'#2563eb', bg:'#eff6ff', icon:'🏆' },
              ].map((s, i) => (
                <div key={i} style={{background:s.bg, borderRadius:16, padding:'16px 12px', textAlign:'center'}}>
                  <div style={{fontSize:22, marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:22, fontWeight:900, color:s.color}}>{s.value}</div>
                  <div style={{fontSize:10, color:'#6b7280', marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div style={{background:'white', borderRadius:16, border:'1.5px solid #e5e7eb', padding:18}}>
                <h3 style={{fontSize:12, fontWeight:800, color:'#111', marginBottom:14}}>Распределение результатов</h3>
                {totalResponses === 0 ? (
                  <div style={{textAlign:'center', padding:'32px 0', color:'#9ca3af', fontSize:12}}>Нет данных</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={scoreDistribution}>
                      <XAxis dataKey="range" tick={{fontSize:9, fontFamily:'Unbounded'}} />
                      <YAxis tick={{fontSize:9}} allowDecimals={false} />
                      <Tooltip contentStyle={{fontFamily:'Unbounded', fontSize:11, borderRadius:8}} />
                      <Bar dataKey="count" name="Участников" fill="#7c3aed" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{background:'white', borderRadius:16, border:'1.5px solid #e5e7eb', padding:18}}>
                <h3 style={{fontSize:12, fontWeight:800, color:'#111', marginBottom:14}}>Правильные vs Неправильные</h3>
                {totalResponses === 0 ? (
                  <div style={{textAlign:'center', padding:'32px 0', color:'#9ca3af', fontSize:12}}>Нет данных</div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                        label={({name, percent}) => `${Math.round(percent*100)}%`} labelLine={false}>
                        <Cell fill="#059669" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{fontFamily:'Unbounded', fontSize:11, borderRadius:8}} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bar by question */}
            <div style={{background:'white', borderRadius:16, border:'1.5px solid #e5e7eb', padding:18}}>
              <h3 style={{fontSize:12, fontWeight:800, color:'#111', marginBottom:14}}>% правильных по вопросам</h3>
              {totalResponses === 0 ? (
                <div style={{textAlign:'center', padding:'32px 0', color:'#9ca3af', fontSize:12}}>Нет данных</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={quiz.questions.map((q, i) => ({
                    name: `В${i+1}`,
                    '%': totalResponses ? Math.round(responses.filter(r => r.answers?.[i]?.isCorrect).length / totalResponses * 100) : 0,
                  }))}>
                    <XAxis dataKey="name" tick={{fontSize:10, fontFamily:'Unbounded'}} />
                    <YAxis tick={{fontSize:10}} domain={[0,100]} unit="%" />
                    <Tooltip formatter={v => `${v}%`} contentStyle={{fontFamily:'Unbounded', fontSize:11, borderRadius:8}} />
                    <Bar dataKey="%" fill="#7c3aed" radius={[4,4,0,0]}>
                      {quiz.questions.map((_, i) => {
                        const pct = totalResponses ? Math.round(responses.filter(r => r.answers?.[i]?.isCorrect).length / totalResponses * 100) : 0
                        return <Cell key={i} fill={pct >= 70 ? '#059669' : pct >= 40 ? '#f59e0b' : '#ef4444'} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* QUESTIONS */}
        {activeTab === 'questions' && (
          <div className="fade-in">
            {quiz.questions.map((q, i) => {
              const correctCount = responses.filter(r => r.answers?.[i]?.isCorrect).length
              const correctPct   = totalResponses ? Math.round(correctCount / totalResponses * 100) : 0
              const correctArr   = Array.isArray(q.correct) ? q.correct : [q.correct]
              return (
                <div key={q.id} className="q-card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
                    <div style={{flex:1, minWidth:0}}>
                      <span style={{fontSize:11, color:'#9ca3af', fontWeight:700}}>Вопрос {i+1}</span>
                      <p style={{fontSize:13, fontWeight:800, color:'#111', margin:'4px 0 0', wordBreak:'break-word'}}>{q.text}</p>
                    </div>
                    <div style={{textAlign:'center', marginLeft:12, flexShrink:0}}>
                      <div style={{fontSize:20, fontWeight:900, color: correctPct>=70?'#059669':correctPct>=40?'#d97706':'#ef4444'}}>{correctPct}%</div>
                      <div style={{fontSize:10, color:'#9ca3af'}}>верно</div>
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {q.options?.filter(o => o).map((opt, j) => {
                      const selCount = responses.filter(r => {
                        const sel = r.answers?.[i]?.selected
                        return Array.isArray(sel) ? sel.includes(j) : sel === j
                      }).length
                      const pct = totalResponses ? Math.round(selCount / totalResponses * 100) : 0
                      const isCorrect = correctArr.includes(j)
                      return (
                        <div key={j}>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4, gap:8}}>
                            <span style={{fontSize:11, fontWeight: isCorrect?700:400, color: isCorrect?'#059669':'#374151', display:'flex', alignItems:'center', gap:6, minWidth:0}}>
                              {isCorrect && <span style={{background:'#ecfdf5', color:'#059669', borderRadius:6, padding:'2px 6px', fontSize:10, fontWeight:800, flexShrink:0}}>✓</span>}
                              <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{opt}</span>
                            </span>
                            <span style={{fontSize:11, color:'#6b7280', fontWeight:700, flexShrink:0}}>{selCount} ({pct}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{width:`${pct}%`, background: isCorrect ? '#059669' : '#e5e7eb'}} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{marginTop:10, padding:'8px 12px', background:'#f8f7ff', borderRadius:10, display:'flex', gap:12, flexWrap:'wrap'}}>
                    <span style={{fontSize:11, color:'#7c3aed', fontWeight:700}}>✓ {correctCount}</span>
                    <span style={{fontSize:11, color:'#ef4444', fontWeight:700}}>✗ {totalResponses - correctCount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* RESPONDENTS */}
        {activeTab === 'respondents' && (
          <div className="fade-in">
            {totalResponses === 0 ? (
              <div style={{textAlign:'center', padding:'60px 20px', background:'white', borderRadius:16, border:'1.5px solid #e5e7eb'}}>
                <div style={{fontSize:44, marginBottom:12}}>👥</div>
                <p style={{fontSize:13, color:'#9ca3af', fontWeight:700}}>Ещё никто не прошёл опрос</p>
              </div>
            ) : (
              <div style={{background:'white', borderRadius:16, border:'1.5px solid #e5e7eb', overflow:'hidden'}}>
                <div className="table-wrap">
                  <table style={{width:'100%', borderCollapse:'collapse', minWidth:400}}>
                    <thead>
                      <tr style={{background:'#f8f7ff', borderBottom:'1.5px solid #e5e7eb'}}>
                        {['#','Участник','Очки','Верно','%','Дата'].map(h => (
                          <th key={h} style={{padding:'12px 12px', textAlign:'left', fontSize:11, color:'#6b7280', fontWeight:800, whiteSpace:'nowrap'}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...responses].sort((a, b) => b.score - a.score).map((r, i) => {
                        const correct = r.answers?.filter(a => a.isCorrect).length || 0
                        const percent = Math.round(correct / quiz.questions.length * 100)
                        return (
                          <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'12px 12px', fontSize:12, color:'#9ca3af', fontWeight:700}}>{i+1}</td>
                            <td style={{padding:'12px 12px'}}>
                              <div style={{display:'flex', alignItems:'center', gap:8}}>
                                <div style={{width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:11, flexShrink:0}}>
                                  {(r.userName||'?')[0].toUpperCase()}
                                </div>
                                <span style={{fontSize:11, fontWeight:700, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:100}}>{r.userName}</span>
                              </div>
                            </td>
                            <td style={{padding:'12px 12px'}}>
                              <span style={{fontSize:13, fontWeight:900, color:'#7c3aed'}}>{r.score}</span>
                            </td>
                            <td style={{padding:'12px 12px', fontSize:12, color:'#374151', fontWeight:700}}>
                              {correct}/{quiz.questions.length}
                            </td>
                            <td style={{padding:'12px 12px'}}>
                              <span style={{padding:'3px 10px', borderRadius:8, fontSize:11, fontWeight:800, whiteSpace:'nowrap',
                                background: percent>=70?'#ecfdf5':percent>=40?'#fffbeb':'#fef2f2',
                                color: percent>=70?'#059669':percent>=40?'#d97706':'#ef4444'}}>
                                {percent}%
                              </span>
                            </td>
                            <td style={{padding:'12px 12px', fontSize:10, color:'#9ca3af', whiteSpace:'nowrap'}}>
                              {new Date(r.date).toLocaleDateString('ru-RU')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}