import { useState, useCallback } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import ProfilePage from './components/ProfilePage'
import Footer from './components/Footer'

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('gitscope-theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('gitscope-theme', next)
      return next
    })
  }, [])

  document.documentElement.setAttribute('data-theme', theme)

  return (
    <Router>
      <div className="app-container">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/profile/:username' element={<ProfilePage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
