import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import toast from 'react-hot-toast'

const TYPE_ICONS    = { quiz:'🎮', test:'📝', survey:'📊', work:'💼' }
const TYPE_LABELS   = { quiz:'Викторина', test:'Тест', survey:'Опрос', work:'Рабочий' }
const CARD_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#4f46e5)',
  'linear-gradient(135deg,#2563eb,#0891b2)',
  'linear-gradient(135deg,#e21b3c,#f43f5e)',
  'linear-gradient(135deg,#d97706,#f59e0b)',
  'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#db2777,#9333ea)',
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [user,    setUser]    = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [code,    setCode]    = useState('')
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [tab,     setTab]     = useState('discover')
  const [menuOpen,setMenuOpen]= useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      const snap = await getDocs(collection(db, 'quizzes'))
      setQuizzes(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [])

  const enterByCode = () => {
    const found = quizzes.find(q => q.code === code.toUpperCase())
    if (found) navigate(`/quiz/${found.id}`)
    else toast.error('Опрос с таким кодом не найден')
  }

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Удалить опрос?')) return
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'quizzes', quizId))
    setQuizzes(quizzes.filter(q => q.id !== quizId))
    toast.success('Опрос удалён!')
  }

  if (!user) return null

  const publicQuizzes = quizzes.filter(q => q.access === 'public')
  const myQuizzes     = quizzes.filter(q => q.authorId === user.uid)
  const filteredPublic = publicQuizzes
    .filter(q => filter === 'all' || q.type === filter)
    .filter(q => q.title.toLowerCase().includes(search.toLowerCase()))

  const avatar = user.photoURL
    ? <img src={user.photoURL} style={{width:34,height:34,borderRadius:'50%',objectFit:'cover'}} alt=""/>
    : <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:13}}>{(user.displayName||user.email||'U')[0].toUpperCase()}</div>

  return (
    <div style={{minHeight:'100vh', background:'#f8f7ff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        .quiz-card { transition:transform 0.2s,box-shadow 0.2s; cursor:pointer; }
        .quiz-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(124,58,237,0.15) !important; }
        .tab-btn { transition:all 0.15s; }
        .filter-btn { transition:all 0.15s; white-space:nowrap; }
        .action-btn { transition:all 0.15s; }
        .action-btn:hover { opacity:0.8; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.35s ease both; }

        /* Mobile nav menu */
        .mobile-menu { display:none; position:absolute; top:100%; left:0; right:0; background:linear-gradient(135deg,#46178f,#5b21b6); padding:12px 20px; z-index:200; }
        .mobile-menu.open { display:flex; flex-direction:column; gap:8px; }

        /* Responsive */
        @media (max-width:768px) {
          .desktop-nav { display:none !important; }
          .mobile-ham { display:flex !important; }
          .nav-search { display:none !important; }
          .mobile-search { display:flex !important; }
          .catalog-grid { grid-template-columns: repeat(2,1fr) !important; }
          .my-grid { grid-template-columns: 1fr !important; }
          .main-pad { padding: 16px !important; }
          .tabs-row { flex-wrap: wrap !important; }
          .create-btn-text { display:none; }
          .create-btn-icon { display:inline !important; }
        }
        @media (max-width:480px) {
          .catalog-grid { grid-template-columns: 1fr 1fr !important; gap:10px !important; }
        }
        .mobile-ham { display:none; }
        .mobile-search { display:none; }
        .create-btn-icon { display:none; }
      `}</style>

      {/* NAV */}
      <div style={{background:'linear-gradient(135deg,#46178f,#5b21b6)', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:100, boxShadow:'0 2px 16px rgba(70,23,143,0.3)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:24}}>🎯</span>
          <span style={{fontWeight:800, fontSize:18, color:'white'}}>QuizApp</span>
        </div>

        {/* Desktop search */}
        <div className="nav-search" style={{display:'flex', gap:10, flex:1, maxWidth:560, margin:'0 24px'}}>
          <div style={{flex:1, background:'white', borderRadius:12, display:'flex', alignItems:'center', paddingLeft:12, gap:8}}>
            <span style={{fontSize:14, color:'#9ca3af'}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Найти опрос..."
              style={{flex:1, border:'none', outline:'none', fontSize:13, color:'#374151', padding:'11px 0', background:'transparent', fontFamily:"'Unbounded',system-ui,sans-serif"}}/>
          </div>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="PIN"
            style={{width:90, background:'white', border:'none', borderRadius:12, padding:'11px 12px', fontSize:13, outline:'none', textAlign:'center', fontWeight:800, color:'#374151', letterSpacing:2, fontFamily:"'Unbounded',system-ui,sans-serif"}}/>
          <button onClick={enterByCode} className="action-btn"
            style={{background:'#ffa602', color:'white', border:'none', borderRadius:12, padding:'11px 18px', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            Войти
          </button>
        </div>

        {/* Desktop user */}
        <div className="desktop-nav" style={{display:'flex', alignItems:'center', gap:8}}>
          <button className="action-btn" onClick={() => navigate('/leaderboard')}
            style={{color:'white', background:'transparent', border:'none', borderRadius:10, padding:'7px 10px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            🏆 Рейтинг
          </button>
          <button className="action-btn" onClick={() => navigate('/profile')}
            style={{color:'white', background:'transparent', border:'none', borderRadius:10, padding:'7px 10px', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            {avatar}
            <span style={{maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {user.displayName?.split(' ')[0] || user.email}
            </span>
          </button>
          <button className="action-btn" onClick={() => { auth.signOut(); toast.success('Вы вышли'); navigate('/login') }}
            style={{background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.3)', borderRadius:10, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            Выйти
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-ham" onClick={() => setMenuOpen(!menuOpen)}
          style={{background:'transparent', border:'none', color:'white', fontSize:22, cursor:'pointer', display:'none', alignItems:'center'}}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`mobile-menu ${menuOpen?'open':''}`}>
        <div style={{display:'flex', gap:8}}>
          <div style={{flex:1, background:'white', borderRadius:10, display:'flex', alignItems:'center', paddingLeft:10, gap:6}}>
            <span style={{color:'#9ca3af', fontSize:13}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Найти опрос..."
              style={{flex:1, border:'none', outline:'none', fontSize:12, color:'#374151', padding:'10px 0', background:'transparent', fontFamily:"'Unbounded',system-ui,sans-serif"}}/>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="PIN код"
            style={{flex:1, background:'white', border:'none', borderRadius:10, padding:'10px 12px', fontSize:12, outline:'none', textAlign:'center', fontWeight:800, color:'#374151', letterSpacing:2, fontFamily:"'Unbounded',system-ui,sans-serif"}}/>
          <button onClick={enterByCode}
            style={{background:'#ffa602', color:'white', border:'none', borderRadius:10, padding:'10px 16px', fontWeight:800, fontSize:12, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            Войти
          </button>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button onClick={() => { navigate('/leaderboard'); setMenuOpen(false) }}
            style={{color:'white', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            🏆 Рейтинг
          </button>
          <button onClick={() => { navigate('/profile'); setMenuOpen(false) }}
            style={{color:'white', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            {avatar} {user.displayName?.split(' ')[0] || 'Профиль'}
          </button>
          <button onClick={() => { auth.signOut(); toast.success('Вы вышли'); navigate('/login') }}
            style={{color:'white', background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
            Выйти
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-pad" style={{maxWidth:1200, margin:'0 auto', padding:'24px 28px'}}>

        {/* Tabs + Create */}
        <div className="tabs-row" style={{display:'flex', alignItems:'center', marginBottom:20, gap:8}}>
          {[['discover','Каталог'],['my',`Мои${myQuizzes.length>0?' ('+myQuizzes.length+')':''}`]].map(([id,label]) => (
            <button key={id} className="tab-btn" onClick={() => setTab(id)}
              style={{padding:'10px 18px', borderRadius:12, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif",
                background: tab===id ? '#7c3aed' : 'white',
                color: tab===id ? 'white' : '#6b7280',
                boxShadow: tab===id ? '0 4px 12px rgba(124,58,237,0.25)' : '0 1px 4px rgba(0,0,0,0.06)'}}>
              {label}
            </button>
          ))}
          <button className="action-btn" onClick={() => navigate('/create')}
            style={{marginLeft:'auto', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', border:'none', borderRadius:12, padding:'10px 18px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif", display:'flex', alignItems:'center', gap:6, boxShadow:'0 4px 12px rgba(124,58,237,0.3)'}}>
            <span className="create-btn-text">+ Создать опрос</span>
            <span className="create-btn-icon">+</span>
          </button>
        </div>

        {/* CATALOG */}
        {tab === 'discover' && (
          <div className="fade-in">
            <div style={{display:'flex', gap:8, marginBottom:16, overflowX:'auto', paddingBottom:4}}>
              {[['all','Все'],['quiz','🎮 Викторина'],['test','📝 Тест'],['survey','📊 Опрос'],['work','💼 Рабочий']].map(([id,label]) => (
                <button key={id} className="filter-btn" onClick={() => setFilter(id)}
                  style={{padding:'8px 16px', borderRadius:10, border:'none', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif",
                    background: filter===id ? '#ede9fe' : 'white',
                    color: filter===id ? '#7c3aed' : '#6b7280',
                    boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                  {label}
                </button>
              ))}
            </div>

            {filteredPublic.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px 20px', background:'white', borderRadius:20, boxShadow:'0 1px 8px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:48, marginBottom:12}}>🎯</div>
                <p style={{color:'#9ca3af', fontWeight:600, marginBottom:12, fontSize:13}}>Опросов не найдено</p>
                <button onClick={() => navigate('/create')} className="action-btn"
                  style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
                  Создать первый!
                </button>
              </div>
            ) : (
              <div className="catalog-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14}}>
                {filteredPublic.map((q,i) => (
                  <div key={q.id} className="quiz-card" onClick={() => navigate(`/quiz/${q.id}`)}
                    style={{borderRadius:18, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', background:'white'}}>
                    <div style={{background:CARD_GRADIENTS[i%CARD_GRADIENTS.length], padding:'20px 16px', minHeight:110, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                      <span style={{fontSize:28}}>{TYPE_ICONS[q.type]||'❓'}</span>
                      <div style={{color:'white', fontWeight:700, fontSize:13, lineHeight:1.3}}>{q.title}</div>
                    </div>
                    <div style={{padding:'10px 14px'}}>
                      <div style={{fontSize:11, color:'#6b7280', marginBottom:4}}>{q.questions?.length||0} вопр. · {q.author}</div>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <span style={{fontSize:11, color:'#9ca3af'}}>{q.responses?.length||0} прохожд.</span>
                        <span style={{fontSize:10, background:'#ede9fe', color:'#7c3aed', padding:'3px 8px', borderRadius:6, fontWeight:600}}>{TYPE_LABELS[q.type]||'Опрос'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY QUIZZES */}
        {tab === 'my' && (
          <div className="fade-in">
            {myQuizzes.length === 0 ? (
              <div style={{textAlign:'center', padding:'60px 20px', background:'white', borderRadius:20}}>
                <div style={{fontSize:48, marginBottom:12}}>✏️</div>
                <p style={{color:'#9ca3af', fontWeight:600, marginBottom:12, fontSize:13}}>У тебя пока нет опросов</p>
                <button onClick={() => navigate('/create')} className="action-btn"
                  style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
                  Создать первый опрос
                </button>
              </div>
            ) : (
              <div className="my-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14}}>
                {myQuizzes.map((q,i) => (
                  <div key={q.id} className="quiz-card"
                    style={{borderRadius:18, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', background:'white'}}>
                    <div style={{background:CARD_GRADIENTS[i%CARD_GRADIENTS.length], padding:'18px 16px', display:'flex', alignItems:'center', gap:12}}>
                      <span style={{fontSize:28}}>{TYPE_ICONS[q.type]||'❓'}</span>
                      <div>
                        <div style={{color:'white', fontWeight:700, fontSize:14}}>{q.title}</div>
                        <div style={{color:'rgba(255,255,255,0.75)', fontSize:11, marginTop:2}}>
                          {q.questions?.length||0} вопр. · {q.access==='public'?'🌍 Публичный':`🔒 ${q.code}`}
                        </div>
                      </div>
                    </div>
                    <div style={{padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
                      <span style={{fontSize:12, color:'#9ca3af'}}>{q.responses?.length||0} прохождений</span>
                      <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                        <button onClick={() => navigate(`/analytics/${q.id}`)} className="action-btn"
                          style={{fontSize:11, border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 10px', cursor:'pointer', background:'white', color:'#6b7280', fontWeight:600, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
                          📊
                        </button>
                        <button onClick={() => navigate(`/edit/${q.id}`)} className="action-btn"
                          style={{fontSize:11, border:'1px solid #ddd6fe', borderRadius:8, padding:'6px 10px', cursor:'pointer', background:'#f5f3ff', color:'#7c3aed', fontWeight:600, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
                          ✏️
                        </button>
                        <button onClick={() => navigate(`/quiz/${q.id}`)} className="action-btn"
                          style={{fontSize:11, border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontWeight:600, fontFamily:"'Unbounded',system-ui,sans-serif"}}>
                          ▶ Пройти
                        </button>
                        <button onClick={() => deleteQuiz(q.id)} className="action-btn"
                          style={{fontSize:11, border:'1px solid #fee2e2', borderRadius:8, padding:'6px 8px', cursor:'pointer', background:'white', color:'#f87171', fontWeight:600}}>
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{textAlign:'center', padding:'16px', fontSize:11, color:'#d1d5db', borderTop:'1px solid #f3f4f6'}}>
        © 2026 QuizApp — Дипломный проект
      </div>
    </div>
  )
}