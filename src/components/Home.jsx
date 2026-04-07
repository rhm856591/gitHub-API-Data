import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const suggestions = ['rhm856591', 'torvalds', 'gaearon', 'yyx990803', 'sindresorhus']

export default function Home() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (name) => {
    const searchName = name || username.trim()
    if (!searchName) {
      setError('Please enter a GitHub username')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`https://api.github.com/users/${searchName}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError(`User "${searchName}" not found. Check the spelling and try again.`)
        } else if (res.status === 403) {
          setError('API rate limit exceeded. Please wait a moment and try again.')
        } else {
          setError('Something went wrong. Please try again.')
        }
        setLoading(false)
        return
      }
      navigate(`/profile/${searchName}`)
    } catch (err) {
      setError('Network error. Please check your connection.')
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      {/* Animated Orbs */}
      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>

      <div className="search-hero" id="search-hero">
        <h1>
          Explore <span className="gradient-text">GitHub</span> Profiles
        </h1>
        <p>
          Search any developer, explore their repositories, languages, and activity — all in one beautiful dashboard.
        </p>

        <div className="search-container">
          <div className="search-bar" id="search-bar">
            <div className="search-icon">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Enter a GitHub username..."
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              autoFocus
              id="search-input"
            />
            <button
              className="search-btn"
              onClick={() => handleSearch()}
              disabled={loading}
              id="search-btn"
            >
              {loading ? (
                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
              ) : (
                <>
                  <SearchIcon />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="error-message" id="error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
              </svg>
              {error}
            </div>
          )}
        </div>

        <div className="search-suggestions">
          <span>Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              className="suggestion-chip"
              onClick={() => { setUsername(s); handleSearch(s); }}
              id={`suggestion-${s}`}
            >
              @{s}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}