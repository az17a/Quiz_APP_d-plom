import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)

  useEffect(() => { setTimeout(() => setShow(true), 100) }, [])

  return (
    <div style={{minHeight:'100vh', fontFamily:"'Unbounded',system-ui,sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden'}}>
      <style>{`
        @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .not-found-bg { position:fixed; inset:0; background:linear-gradient(135deg,#faf5ff,#ede9fe,#dbeafe,#f0fdf4); background-size:300% 300%; animation:gradMove 8s ease infinite; z-index:0; }
        .emoji-float { animation:float 3s ease-in-out infinite; display:inline-block; }
        .card-anim { animation:fadeUp 0.6s ease both; }
      `}</style>

      <div className="not-found-bg" />

      {/* Floating dots */}
      <div style={{position:'fixed', width:200, height:200, borderRadius:'50%', background:'rgba(124,58,237,0.08)', top:-50, right:-50, zIndex:0}} />
      <div style={{position:'fixed', width:150, height:150, borderRadius:'50%', background:'rgba(79,70,229,0.08)', bottom:-30, left:-30, zIndex:0}} />

      <div className="card-anim" style={{
        position:'relative', zIndex:1,
        background:'rgba(255,255,255,0.8)',
        backdropFilter:'blur(20px)',
        borderRadius:28, padding:'48px 40px',
        maxWidth:440, width:'100%', textAlign:'center',
        border:'1.5px solid rgba(255,255,255,0.9)',
        boxShadow:'0 24px 64px rgba(124,58,237,0.12)',
        opacity: show?1:0, transform: show?'translateY(0)':'translateY(20px)',
        transition:'opacity 0.5s ease, transform 0.5s ease'
      }}>
        <div className="emoji-float" style={{fontSize:72, marginBottom:16}}>🎯</div>

        <div style={{fontSize:72, fontWeight:900, color:'#7c3aed', lineHeight:1, marginBottom:8, letterSpacing:'-3px'}}>
          404
        </div>

        <h2 style={{fontSize:20, fontWeight:800, color:'#111', marginBottom:10}}>
          Страница не найдена
        </h2>
        <p style={{fontSize:13, color:'#9ca3af', lineHeight:1.7, marginBottom:32}}>
          Похоже эта страница исчезла как неправильный ответ в викторине! 😅
        </p>

        <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
          <button onClick={() => navigate('/')}
            style={{padding:'14px 28px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', border:'none', borderRadius:14, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif", boxShadow:'0 4px 16px rgba(124,58,237,0.3)', transition:'transform 0.15s'}}
            onMouseOver={e=>e.target.style.transform='translateY(-2px)'}
            onMouseOut={e=>e.target.style.transform='translateY(0)'}>
            🏠 На главную
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{padding:'14px 28px', background:'white', color:'#7c3aed', border:'1.5px solid #ddd6fe', borderRadius:14, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Unbounded',system-ui,sans-serif", transition:'transform 0.15s'}}
            onMouseOver={e=>e.target.style.transform='translateY(-2px)'}
            onMouseOut={e=>e.target.style.transform='translateY(0)'}>
            🎮 К опросам
          </button>
        </div>
      </div>
    </div>
  )
}