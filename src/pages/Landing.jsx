import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    { icon: '✏️', title: 'Создавай за минуты', desc: '4 типа опросов: викторина, тест, анкета, рабочий. Конструктор в 3 шага.', color: '#f5f3ff', border: '#ddd6fe' },
    { icon: '🎮', title: 'Геймификация',        desc: 'Таймер, очки, уровни и таблица лидеров — как в Kahoot, но твой.',       color: '#ecfdf5', border: '#a7f3d0' },
    { icon: '📊', title: 'Аналитика',           desc: 'Графики по каждому вопросу, статистика участников, история ответов.',    color: '#fffbeb', border: '#fcd34d' },
  ]

  const stats = [
    { value: '4',  label: 'типа опросов' },
    { value: '∞',  label: 'вопросов'    },
    { value: '🆓', label: 'бесплатно'   },
  ]

  return (
    <div style={{minHeight:'100vh', background:'#fff', fontFamily:"'Unbounded',system-ui,sans-serif"}}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes floatUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,0.3)} 50%{box-shadow:0 0 0 8px rgba(124,58,237,0)} }
        .hero-bg { background:linear-gradient(135deg,#faf5ff 0%,#ede9fe 40%,#dbeafe 70%,#f0fdf4 100%); background-size:300% 300%; animation:gradMove 8s ease infinite; }
        .feature-card { transition:transform 0.25s cubic-bezier(.34,1.56,.64,1),box-shadow 0.25s ease; cursor:default; }
        .feature-card:hover { transform:translateY(-10px) scale(1.02); box-shadow:0 20px 48px rgba(124,58,237,0.13); }
        .btn-primary { display:inline-flex; align-items:center; gap:10px; padding:16px 36px; background:#7c3aed; color:white; border:none; border-radius:16px; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 4px 24px rgba(124,58,237,0.3); transition:background 0.2s,transform 0.2s,box-shadow 0.2s; font-family:'Unbounded',system-ui,sans-serif; }
        .btn-primary:hover { background:#6d28d9; transform:translateY(-3px); box-shadow:0 10px 36px rgba(124,58,237,0.4); }
        .btn-white { display:inline-flex; align-items:center; gap:10px; padding:16px 36px; background:white; color:#7c3aed; border:none; border-radius:16px; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 4px 24px rgba(0,0,0,0.12); transition:background 0.2s,color 0.2s,transform 0.2s; font-family:'Unbounded',system-ui,sans-serif; }
        .btn-white:hover { background:#f5f3ff; color:#5b21b6; transform:translateY(-3px); }
        .badge { animation:badgePulse 2.5s ease-in-out infinite; }
        .hero-text { animation:floatUp 0.7s ease both; }
        .hero-text-2 { animation:floatUp 0.7s 0.15s ease both; }
        .hero-btn { animation:floatUp 0.7s 0.3s ease both; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .nav-wrap { padding: 14px 20px !important; }
          .hero-section { padding: 48px 20px 36px !important; }
          .hero-title { font-size: 32px !important; letter-spacing: -1px !important; }
          .hero-desc { font-size: 15px !important; }
          .stats-row { gap: 10px !important; }
          .stat-card { min-width: 80px !important; padding: 12px 16px !important; }
          .stat-val { font-size: 22px !important; }
          .features-grid { grid-template-columns: 1fr !important; padding: 0 20px 48px !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .cta-section { padding: 48px 20px !important; }
          .cta-title { font-size: 26px !important; }
          .btn-primary, .btn-white { font-size: 14px !important; padding: 14px 24px !important; width: 100%; justify-content: center; }
          .features-title { font-size: 24px !important; }
          .steps-section { padding: 48px 20px !important; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 26px !important; }
          .stats-row { flex-direction: column !important; align-items: center !important; }
          .stat-card { width: 100% !important; }
        }
      `}</style>

      {/* Nav */}
      <nav className="nav-wrap" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 56px', background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid #f3f4f6', position:'sticky', top:0, zIndex:100}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:26}}>🎯</span>
          <span style={{fontWeight:800, fontSize:20, color:'#111', letterSpacing:'-0.5px'}}>QuizApp</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-bg hero-section" style={{padding:'100px 56px 80px', textAlign:'center'}}>
        <div className="badge" style={{display:'inline-flex', alignItems:'center', gap:8, background:'white', color:'#7c3aed', fontSize:12, fontWeight:600, padding:'8px 18px', borderRadius:100, marginBottom:28, border:'1px solid #ddd6fe'}}>
          🚀 Платформа интерактивных опросов с геймификацией
        </div>
        <h1 className="hero-text hero-title" style={{fontSize:64, fontWeight:900, color:'#0f0f0f', lineHeight:1.08, marginBottom:20, letterSpacing:'-2px'}}>
          Создавай опросы.<br/>
          <span style={{color:'#7c3aed'}}>Играй. Побеждай.</span>
        </h1>
        <p className="hero-text-2 hero-desc" style={{fontSize:18, color:'#6b7280', lineHeight:1.7, marginBottom:40, maxWidth:520, margin:'0 auto 40px'}}>
          Викторины, тесты и анкеты с геймификацией — очки, уровни, таблица лидеров. Всё бесплатно.
        </p>
        <div className="hero-btn" style={{display:'flex', justifyContent:'center'}}>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            <GoogleIcon />
            Начать бесплатно
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row" style={{display:'flex', justifyContent:'center', gap:16, marginTop:48, flexWrap:'wrap'}}>
          {stats.map((s,i) => (
            <div key={i} className="stat-card" style={{background:'white', borderRadius:16, padding:'16px 28px', border:'1px solid #e5e7eb', minWidth:110, textAlign:'center'}}>
              <div className="stat-val" style={{fontSize:26, fontWeight:800, color:'#7c3aed'}}>{s.value}</div>
              <div style={{fontSize:12, color:'#9ca3af', marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{maxWidth:1100, margin:'0 auto', padding:'64px 56px'}}>
        <h2 className="features-title" style={{fontSize:32, fontWeight:800, color:'#111', textAlign:'center', marginBottom:10, letterSpacing:'-0.5px'}}>Всё что нужно — в одном месте</h2>
        <p style={{textAlign:'center', color:'#9ca3af', fontSize:14, marginBottom:40}}>Никаких лишних инструментов. Создал — запустил — получил результат.</p>
        <div className="features-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20}}>
          {features.map((f,i) => (
            <div key={i} className="feature-card" style={{background:f.color, border:`1.5px solid ${f.border}`, borderRadius:24, padding:28}}>
              <div style={{fontSize:34, marginBottom:14}}>{f.icon}</div>
              <h3 style={{fontSize:16, fontWeight:700, color:'#111', marginBottom:8}}>{f.title}</h3>
              <p style={{fontSize:13, color:'#6b7280', lineHeight:1.7}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="steps-section" style={{background:'#fafafa', padding:'64px 56px', borderTop:'1px solid #f3f4f6', borderBottom:'1px solid #f3f4f6'}}>
        <div style={{maxWidth:900, margin:'0 auto', textAlign:'center'}}>
          <h2 style={{fontSize:32, fontWeight:800, color:'#111', marginBottom:10, letterSpacing:'-0.5px'}}>Как это работает?</h2>
          <p style={{color:'#9ca3af', fontSize:14, marginBottom:48}}>Три шага — и опрос готов</p>
          <div className="steps-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:32}}>
            {[
              { step:'01', title:'Создай опрос',     desc:'Выбери тип, добавь вопросы и настрой доступ — публичный или по коду.', color:'#7c3aed' },
              { step:'02', title:'Поделись ссылкой', desc:'Отправь участникам ссылку или код. Они заходят без регистрации.',       color:'#059669' },
              { step:'03', title:'Смотри результаты',desc:'В реальном времени следи за ответами и анализируй статистику.',         color:'#d97706' },
            ].map((s,i) => (
              <div key={i} style={{textAlign:'left'}}>
                <div style={{fontSize:36, fontWeight:900, color:s.color, opacity:0.15, marginBottom:6}}>{s.step}</div>
                <h3 style={{fontSize:16, fontWeight:700, color:'#111', marginBottom:8}}>{s.title}</h3>
                <p style={{fontSize:13, color:'#6b7280', lineHeight:1.7}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section" style={{background:'linear-gradient(135deg,#7c3aed,#4f46e5)', padding:'72px 56px', textAlign:'center'}}>
        <h2 className="cta-title" style={{fontSize:38, fontWeight:900, color:'white', marginBottom:14, letterSpacing:'-1px'}}>Готов начать?</h2>
        <p style={{color:'#c4b5fd', fontSize:15, marginBottom:36}}>Бесплатно. Без ограничений. Прямо сейчас.</p>
        <button className="btn-white" onClick={() => navigate('/login')}>
          <GoogleIcon />
          Войти через Google →
        </button>
      </div>

      <footer style={{padding:'24px', textAlign:'center', fontSize:12, color:'#9ca3af', borderTop:'1px solid #f3f4f6'}}>
        © 2026 QuizApp — Дипломный проект · КГТУ им. И. Раззакова
      </footer>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{flexShrink:0}}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}