import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#7c3aed', '#059669', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

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

  const responses = quiz.responses || []
  const totalResponses = responses.length
  const avgScore = totalResponses ? Math.round(responses.reduce((a, r) => a + r.score, 0) / totalResponses) : 0
  const avgPercent = totalResponses ? Math.round(responses.reduce((a, r) => {
    const correct = r.answers?.filter(a => a.isCorrect).length || 0
    return a + (correct / quiz.questions.length * 100)
  }, 0) / totalResponses) : 0
  const maxScore = totalResponses ? Math.max(...responses.map(r => r.score)) : 0
  const correctTotal = responses.reduce((a, r) => a + (r.answers?.filter(x => x.isCorrect).length || 0), 0)
  const wrongTotal   = responses.reduce((a, r) => a + (r.answers?.filter(x => !x.isCorrect).length || 0), 0)

  const pieData = [
    { name: 'Правильно', value: correctTotal },
    { name: 'Неправильно', value: wrongTotal },
  ]

  const scoreDistribution = [
    { range: '0-20%',  count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p < 20 }).length },
    { range: '20-40%', count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 20 && p < 40 }).length },
    { range: '40-60%', count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 40 && p < 60 }).length },
    { range: '60-80%', count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 60 && p < 80 }).length },
    { range: '80-100%',count: responses.filter(r => { const p = r.answers?.filter(a=>a.isCorrect).length/quiz.questions.length*100; return p >= 80 }).length },
  ]

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .tab-btn { padding:10px 20px; border:none; border-radius:12px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s; font-family:'Unbounded',system-ui,sans-serif; }
        .tab-btn.active { background:#7c3aed; color:white; box-shadow:0 4px 12px rgba(124,58,237,0.25); }
        .tab-btn:not(.active) { background:white; color:#6b7280; }
        .tab-btn:not(.active):hover { background:#f5f3ff; color:#7c3aed; }
        .stat-card { background:white; border-radius:18px; border:1.5px solid #e5e7eb; padding:20px; text-align:center; transition:transform 0.2s; }
        .stat-card:hover { transform:translateY(-3px); }
        .q-card { background:white; border-radius:18px; border:1.5px solid #e5e7eb; padding:24px; margin-bottom:16px; }
        .progress-bar { height:8px; background:#f3f4f6; border-radius:8px; overflow:hidden; margin-top:4px; }
        .progress-fill { height:100%; border-radius:8px; transition:width 0.5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.4s ease both; }
      `}</style>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#46178f,#5b21b6)', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:16}}>
          <button onClick={() => navigate('/dashboard')}
            style={{color:'rgba(255,255,255,0.7)', background:'transparent', border:'none', cursor:'pointer', fontSize:13, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            ← Назад
          </button>
          <div>
            <div style={{color:'white', fontWeight:800, fontSize:15}}>📊 Аналитика</div>
            <div style={{color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:2}}>{quiz.title}</div>
          </div>
        </div>
        <div style={{color:'rgba(255,255,255,0.7)', fontSize:12}}>
          {totalResponses} ответов
        </div>
      </div>

      <div style={{maxWidth:1000, margin:'0 auto', padding:'28px 24px'}}>

        {/* Tabs */}
        <div style={{display:'flex', gap:8, marginBottom:24}}>
          {[['summary','📈 Сводка'],['questions','❓ По вопросам'],['respondents','👥 Участники']].map(([id,label]) => (
            <button key={id} className={`tab-btn ${activeTab===id?'active':''}`} onClick={() => setActiveTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="fade-in">
            {/* Stats grid */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24}}>
              {[
                { label:'Ответов',       value: totalResponses, color:'#7c3aed', bg:'#f5f3ff', icon:'👥' },
                { label:'Средний балл',  value: avgScore,       color:'#059669', bg:'#ecfdf5', icon:'⭐' },
                { label:'Средний %',     value: `${avgPercent}%`, color:'#d97706', bg:'#fffbeb', icon:'📊' },
                { label:'Лучший балл',   value: maxScore,       color:'#2563eb', bg:'#eff6ff', icon:'🏆' },
              ].map((s,i) => (
                <div key={i} className="stat-card" style={{background:s.bg, border:`1.5px solid ${s.bg}`}}>
                  <div style={{fontSize:24, marginBottom:8}}>{s.icon}</div>
                  <div style={{fontSize:24, fontWeight:900, color:s.color}}>{s.value}</div>
                  <div style={{fontSize:11, color:'#6b7280', marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24}}>
              {/* Score distribution */}
              <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:24}}>
                <h3 style={{fontSize:13, fontWeight:800, color:'#111', marginBottom:16}}>Распределение результатов</h3>
                {totalResponses === 0 ? (
                  <div style={{textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:12}}>Нет данных</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scoreDistribution}>
                      <XAxis dataKey="range" tick={{fontSize:10, fontFamily:'Unbounded'}} />
                      <YAxis tick={{fontSize:10}} allowDecimals={false} />
                      <Tooltip contentStyle={{fontFamily:'Unbounded', fontSize:12, borderRadius:8}} />
                      <Bar dataKey="count" name="Участников" fill="#7c3aed" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie chart */}
              <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:24}}>
                <h3 style={{fontSize:13, fontWeight:800, color:'#111', marginBottom:16}}>Правильные vs Неправильные</h3>
                {totalResponses === 0 ? (
                  <div style={{textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:12}}>Нет данных</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({name,percent}) => `${name} ${Math.round(percent*100)}%`} labelLine={false}>
                        <Cell fill="#059669" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{fontFamily:'Unbounded', fontSize:12, borderRadius:8}} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Questions correct rate */}
            <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', padding:24}}>
              <h3 style={{fontSize:13, fontWeight:800, color:'#111', marginBottom:16}}>Процент правильных по вопросам</h3>
              {totalResponses === 0 ? (
                <div style={{textAlign:'center', padding:'40px 0', color:'#9ca3af', fontSize:12}}>Нет данных</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={quiz.questions.map((q,i) => ({
                    name: `В${i+1}`,
                    '%': totalResponses ? Math.round(responses.filter(r => r.answers?.[i]?.isCorrect).length / totalResponses * 100) : 0,
                  }))}>
                    <XAxis dataKey="name" tick={{fontSize:11, fontFamily:'Unbounded'}} />
                    <YAxis tick={{fontSize:11}} domain={[0,100]} unit="%" />
                    <Tooltip formatter={v => `${v}%`} contentStyle={{fontFamily:'Unbounded', fontSize:12, borderRadius:8}} />
                    <Bar dataKey="%" fill="#7c3aed" radius={[6,6,0,0]}>
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

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="fade-in">
            {quiz.questions.map((q, i) => {
              const correctCount = responses.filter(r => r.answers?.[i]?.isCorrect).length
              const correctPct   = totalResponses ? Math.round(correctCount / totalResponses * 100) : 0
              const correctArr   = Array.isArray(q.correct) ? q.correct : [q.correct]

              return (
                <div key={q.id} className="q-card">
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16}}>
                    <div style={{flex:1}}>
                      <span style={{fontSize:11, color:'#9ca3af', fontWeight:700}}>Вопрос {i+1}</span>
                      <p style={{fontSize:14, fontWeight:800, color:'#111', margin:'6px 0 0'}}>{q.text}</p>
                    </div>
                    <div style={{textAlign:'center', marginLeft:16}}>
                      <div style={{fontSize:22, fontWeight:900, color: correctPct>=70?'#059669':correctPct>=40?'#d97706':'#ef4444'}}>{correctPct}%</div>
                      <div style={{fontSize:10, color:'#9ca3af'}}>правильно</div>
                    </div>
                  </div>

                  {/* Options with bars */}
                  <div style={{display:'flex', flexDirection:'column', gap:10}}>
                    {q.options?.filter(o=>o).map((opt, j) => {
                      const selCount = responses.filter(r => {
                        const sel = r.answers?.[i]?.selected
                        return Array.isArray(sel) ? sel.includes(j) : sel === j
                      }).length
                      const pct = totalResponses ? Math.round(selCount / totalResponses * 100) : 0
                      const isCorrect = correctArr.includes(j)
                      return (
                        <div key={j}>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
                            <span style={{fontSize:12, fontWeight: isCorrect?700:400, color: isCorrect?'#059669':'#374151', display:'flex', alignItems:'center', gap:6}}>
                              {isCorrect && <span style={{background:'#ecfdf5', color:'#059669', borderRadius:6, padding:'2px 8px', fontSize:10, fontWeight:800}}>✓</span>}
                              {opt}
                            </span>
                            <span style={{fontSize:11, color:'#6b7280', fontWeight:700}}>{selCount} чел. ({pct}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{
                              width:`${pct}%`,
                              background: isCorrect ? '#059669' : '#e5e7eb'
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{marginTop:12, padding:'8px 12px', background:'#f8f7ff', borderRadius:10, display:'flex', gap:16}}>
                    <span style={{fontSize:11, color:'#7c3aed', fontWeight:700}}>✓ Правильно: {correctCount}</span>
                    <span style={{fontSize:11, color:'#ef4444', fontWeight:700}}>✗ Неправильно: {totalResponses - correctCount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* RESPONDENTS TAB */}
        {activeTab === 'respondents' && (
          <div className="fade-in">
            {totalResponses === 0 ? (
              <div style={{textAlign:'center', padding:'80px 0', background:'white', borderRadius:18, border:'1.5px solid #e5e7eb'}}>
                <div style={{fontSize:48, marginBottom:12}}>👥</div>
                <p style={{fontSize:14, color:'#9ca3af', fontWeight:700}}>Ещё никто не прошёл опрос</p>
              </div>
            ) : (
              <div style={{background:'white', borderRadius:18, border:'1.5px solid #e5e7eb', overflow:'hidden'}}>
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'#f8f7ff', borderBottom:'1.5px solid #e5e7eb'}}>
                      {['#','Участник','Очки','Правильно','Результат','Дата'].map(h => (
                        <th key={h} style={{padding:'14px 16px', textAlign:'left', fontSize:11, color:'#6b7280', fontWeight:800}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...responses].sort((a,b) => b.score - a.score).map((r, i) => {
                      const correct = r.answers?.filter(a => a.isCorrect).length || 0
                      const percent = Math.round(correct / quiz.questions.length * 100)
                      return (
                        <tr key={i} style={{borderBottom:'1px solid #f3f4f6', transition:'background 0.15s'}}
                          onMouseOver={e => e.currentTarget.style.background='#f8f7ff'}
                          onMouseOut={e => e.currentTarget.style.background='white'}>
                          <td style={{padding:'14px 16px', fontSize:12, color:'#9ca3af', fontWeight:700}}>{i+1}</td>
                          <td style={{padding:'14px 16px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:10}}>
                              <div style={{width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:12, flexShrink:0}}>
                                {(r.userName||'?')[0].toUpperCase()}
                              </div>
                              <span style={{fontSize:12, fontWeight:700, color:'#111'}}>{r.userName}</span>
                            </div>
                          </td>
                          <td style={{padding:'14px 16px'}}>
                            <span style={{fontSize:13, fontWeight:900, color:'#7c3aed'}}>{r.score}</span>
                          </td>
                          <td style={{padding:'14px 16px', fontSize:12, color:'#374151', fontWeight:700}}>
                            {correct}/{quiz.questions.length}
                          </td>
                          <td style={{padding:'14px 16px'}}>
                            <span style={{
                              padding:'4px 12px', borderRadius:8, fontSize:11, fontWeight:800,
                              background: percent>=70?'#ecfdf5':percent>=40?'#fffbeb':'#fef2f2',
                              color: percent>=70?'#059669':percent>=40?'#d97706':'#ef4444'
                            }}>
                              {percent}%
                            </span>
                          </td>
                          <td style={{padding:'14px 16px', fontSize:11, color:'#9ca3af'}}>
                            {new Date(r.date).toLocaleDateString('ru-RU')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}