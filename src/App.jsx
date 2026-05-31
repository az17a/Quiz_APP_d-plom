import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Auth/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import CreateQuiz from './pages/Quiz/CreateQuiz'
import EditQuiz from './pages/Quiz/EditQuiz'
import TakeQuiz from './pages/Quiz/TakeQuiz'
import Analytics from './pages/Analytics/Analytics'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><EditQuiz /></PrivateRoute>} />
        <Route path="/quiz/:id" element={<PrivateRoute><TakeQuiz /></PrivateRoute>} />
        <Route path="/analytics/:id" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App