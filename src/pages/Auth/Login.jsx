import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import toast from 'react-hot-toast'

const provider = new GoogleAuthProvider()

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || 'Пользователь',
          email: user.email,
          photo: user.photoURL || '',
          role: 'participant',
          score: 0,
          createdAt: new Date().toISOString()
        })
      }
      toast.success('Добро пожаловать, ' + (user.displayName?.split(' ')[0] || '') + '!')
      navigate('/dashboard')
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        toast.error('Ошибка входа через Google')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Unbounded',system-ui,sans-serif", position:'relative', overflow:'hidden'}}>

      <style>{`
        @keyframes gradMove {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.25); }
          50%     { box-shadow: 0 0 0 12px rgba(124,58,237,0); }
        }
        @keyframes float-dot {
          0%,100% { transform: translateY(0) scale(1); }
          50%     { transform: translateY(-18px) scale(1.1); }
        }
        .login-bg {
          position:fixed; inset:0; z-index:0;
          background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 35%, #dbeafe 65%, #f0fdf4 100%);
          background-size: 300% 300%;
          animation: gradMove 8s ease infinite;
        }
        .login-card {
          position:relative; z-index:1;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 28px;
          padding: 52px 48px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 80px rgba(124,58,237,0.12), 0 4px 24px rgba(0,0,0,0.06);
          text-align: center;
          animation: floatUp 0.6s ease both;
        }
        .logo-wrap {
          display:inline-flex; align-items:center; justify-content:center;
          width:72px; height:72px; border-radius:20px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          font-size:36px; margin-bottom:24px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.35);
          animation: pulse-ring 3s ease-in-out infinite;
        }
        .google-btn {
          display:flex; align-items:center; justify-content:center; gap:12px;
          width:100%; padding:16px 24px;
          background:white; color:#1f2937;
          border: 1.5px solid #e5e7eb;
          border-radius:14px; font-size:15px; font-weight:600;
          cursor:pointer; margin-top:32px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .google-btn:hover {
          background:#f9fafb;
          border-color:#7c3aed;
          box-shadow: 0 4px 20px rgba(124,58,237,0.15);
          transform: translateY(-2px);
        }
        .google-btn:active { transform:scale(0.98); }
        .google-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

        .dot {
          position:fixed; border-radius:50%; opacity:0.18; z-index:0;
        }
        .dot-1 { width:320px; height:320px; background:#7c3aed; top:-80px; right:-80px; animation: float-dot 7s ease-in-out infinite; }
        .dot-2 { width:220px; height:220px; background:#4f46e5; bottom:-60px; left:-60px; animation: float-dot 9s ease-in-out infinite 1s; }
        .dot-3 { width:120px; height:120px; background:#10b981; top:40%; right:10%; animation: float-dot 6s ease-in-out infinite 0.5s; }
      `}</style>

      {/* Background */}
      <div className="login-bg" />
      <div className="dot dot-1" />
      <div className="dot dot-2" />
      <div className="dot dot-3" />

      {/* Card */}
      <div className="login-card">
        <div className="logo-wrap">🎯</div>

        <h1 style={{fontSize:28, fontWeight:800, color:'#111', margin:'0 0 10px', letterSpacing:'-0.5px'}}>
          QuizApp
        </h1>
        <p style={{fontSize:15, color:'#6b7280', lineHeight:1.6, margin:0}}>
          Создавай викторины и тесты.<br/>Играй, побеждай, анализируй.
        </p>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          {loading ? (
            <span style={{color:'#9ca3af'}}>⏳ Входим...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{flexShrink:0}}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Войти через Google
            </>
          )}
        </button>

        <p style={{fontSize:12, color:'#d1d5db', marginTop:20}}>
          Нажимая кнопку, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  )
}