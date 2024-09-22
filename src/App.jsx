import { lazy, Suspense } from 'react'
import './App.css'
const Home = lazy(()=> import('../src/components/Home'))
// import Home from './components/Home'
import RepoInfo from './components/RepoInfo'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/repo' element={<RepoInfo />} />
      </Routes>
    </Router>
  )
}

export default App
