import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import RepoCard from './RepoCard'
import LanguageStats from './LanguageStats'
import ActivityFeed from './ActivityFeed'
import ProfileSkeleton from './ProfileSkeleton'
import ContributionHeatmap from './ContributionHeatmap'
import TopRepos from './TopRepos'
import FollowersGrid from './FollowersGrid'
import Organizations from './Organizations'

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Lua: '#000080', Vim: '#019833',
  Makefile: '#427819', Dockerfile: '#384d54', Vue: '#41b883', Svelte: '#ff3e00',
  SCSS: '#c6538c', Jupyter: '#DA5B0B', R: '#198CE7', Scala: '#c22d40', Perl: '#0298c3',
  Haskell: '#5e5086', Elixir: '#6e4a7e', Clojure: '#db5855', EJS: '#a91e50',
}

function getLanguageColor(lang) {
  return LANGUAGE_COLORS[lang] || '#8b949e'
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num?.toString() || '0'
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export default function ProfilePage() {
  const { username } = useParams()
  const [user, setUser] = useState(null)
  const [repos, setRepos] = useState([])
  const [events, setEvents] = useState([])
  const [starredRepos, setStarredRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('repos')
  const [repoFilter, setRepoFilter] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [langFilter, setLangFilter] = useState('')
  const [copied, setCopied] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      setActiveTab('repos')
      setRepoFilter('')
      setSortBy('updated')
      setLangFilter('')
      try {
        const [userRes, repoRes, eventsRes, starredRes] = await Promise.all([
          axios.get(`https://api.github.com/users/${username}`),
          axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
          axios.get(`https://api.github.com/users/${username}/events/public?per_page=100`),
          axios.get(`https://api.github.com/users/${username}/starred?per_page=30`).catch(() => ({ data: [] })),
        ])
        setUser(userRes.data)
        setRepos(repoRes.data)
        setEvents(eventsRes.data)
        setStarredRepos(starredRes.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('User not found')
        } else if (err.response?.status === 403) {
          setError('API rate limit reached. Please wait a minute.')
        } else {
          setError('Failed to fetch data. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [username])

  // Language statistics
  const languageStats = useMemo(() => {
    const langs = {}
    repos.forEach(r => {
      if (r.language) {
        langs[r.language] = (langs[r.language] || 0) + 1
      }
    })
    const total = Object.values(langs).reduce((a, b) => a + b, 0)
    return Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percent: ((count / total) * 100).toFixed(1),
        color: getLanguageColor(name),
      }))
  }, [repos])

  // All unique languages for filter
  const allLanguages = useMemo(() => {
    return [...new Set(repos.map(r => r.language).filter(Boolean))].sort()
  }, [repos])

  // Filtered & sorted repos
  const filteredRepos = useMemo(() => {
    let result = [...repos]

    if (repoFilter) {
      const q = repoFilter.toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      )
    }

    if (langFilter) {
      result = result.filter(r => r.language === langFilter)
    }

    switch (sortBy) {
      case 'stars':
        result.sort((a, b) => b.stargazers_count - a.stargazers_count)
        break
      case 'forks':
        result.sort((a, b) => b.forks_count - a.forks_count)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'updated':
      default:
        result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    }
    return result
  }, [repos, repoFilter, langFilter, sortBy])

  const showToast = useCallback((msg) => {
    setToastMessage(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }, [])

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/profile/${username}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      showToast('✅ Profile link copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      showToast('❌ Failed to copy link')
    })
  }, [username, showToast])

  if (loading) return <ProfileSkeleton />

  if (error) {
    return (
      <div className="profile-page">
        <Link to="/" className="back-btn" id="back-home-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Search
        </Link>
        <div className="no-results">
          <div className="no-results-icon">😵</div>
          <h3>{error}</h3>
          <p>Try searching for a different username.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page" id="profile-page">
      {/* Toast */}
      <div className={`toast ${toastVisible ? 'visible' : ''}`}>{toastMessage}</div>

      <Link to="/" className="back-btn" id="back-home-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Search
      </Link>

      <div className="profile-header">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              className="profile-avatar"
              id="profile-avatar"
            />
            <div className="profile-status" title="Online"></div>
          </div>

          <h1 className="profile-name" id="profile-name">{user.name || user.login}</h1>
          <p className="profile-login">@{user.login}</p>

          {user.bio && <p className="profile-bio" id="profile-bio">{user.bio}</p>}

          <div className="profile-meta">
            {user.company && (
              <div className="profile-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.777.871.777 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"/></svg>
                <span>{user.company}</span>
              </div>
            )}
            {user.location && (
              <div className="profile-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192 0ZM8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
                <span>{user.location}</span>
              </div>
            )}
            {user.blog && (
              <div className="profile-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"/></svg>
                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer">
                  {user.blog.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {user.twitter_username && (
              <div className="profile-meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <a href={`https://x.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer">
                  @{user.twitter_username}
                </a>
              </div>
            )}
            {user.email && (
              <div className="profile-meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"/></svg>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </div>
            )}
            <div className="profile-meta-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0Zm0 3.5h6.5a.25.25 0 0 1 .25.25V6h-11V3.75a.25.25 0 0 1 .25-.25Zm-2.25 4v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Z"/></svg>
              <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="profile-social-stats">
            <div className="social-stat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"/></svg>
              <strong>{formatNumber(user.followers)}</strong> followers
            </div>
            <div className="social-stat">
              <span>·</span>
              <strong>{formatNumber(user.following)}</strong> following
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-view-btn"
              id="view-on-github-btn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z"/></svg>
              View on GitHub
            </a>
            <button
              className={`share-btn ${copied ? 'copied' : ''}`}
              onClick={handleShare}
              id="share-profile-btn"
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Share Profile
                </>
              )}
            </button>
          </div>

          {/* Organizations */}
          <Organizations username={username} />
        </aside>

        {/* Main Content */}
        <div className="profile-main">
          {/* Stats */}
          <div className="stats-grid" id="stats-grid">
            <div className="stat-card animate-fade-in-up delay-1">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{formatNumber(user.public_repos)}</div>
              <div className="stat-label">Repositories</div>
            </div>
            <div className="stat-card animate-fade-in-up delay-2">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{formatNumber(repos.reduce((a, r) => a + r.stargazers_count, 0))}</div>
              <div className="stat-label">Total Stars</div>
            </div>
            <div className="stat-card animate-fade-in-up delay-3">
              <div className="stat-icon">🍴</div>
              <div className="stat-value">{formatNumber(repos.reduce((a, r) => a + r.forks_count, 0))}</div>
              <div className="stat-label">Total Forks</div>
            </div>
            <div className="stat-card animate-fade-in-up delay-4">
              <div className="stat-icon">👁️</div>
              <div className="stat-value">{formatNumber(user.public_gists)}</div>
              <div className="stat-label">Public Gists</div>
            </div>
          </div>

          {/* Top Repos */}
          <TopRepos repos={repos} />

          {/* Language Stats */}
          {languageStats.length > 0 && (
            <LanguageStats languages={languageStats} />
          )}

          {/* Contribution Heatmap */}
          {events.length > 0 && (
            <ContributionHeatmap events={events} />
          )}

          {/* Tabs */}
          <div className="tabs-container" id="tabs">
            <div className="tabs-header">
              <button
                className={`tab-btn ${activeTab === 'repos' ? 'active' : ''}`}
                onClick={() => setActiveTab('repos')}
                id="tab-repos"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>
                Repositories
                <span className="tab-count">{repos.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'starred' ? 'active' : ''}`}
                onClick={() => setActiveTab('starred')}
                id="tab-starred"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
                Starred
                <span className="tab-count">{starredRepos.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
                onClick={() => setActiveTab('followers')}
                id="tab-followers"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"/></svg>
                People
                <span className="tab-count">{user.followers + user.following}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('activity')}
                id="tab-activity"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"/></svg>
                Activity
                <span className="tab-count">{events.length}</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'repos' && (
            <>
              <div className="repo-controls" id="repo-controls">
                <div className="filter-input-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Find a repository..."
                    value={repoFilter}
                    onChange={(e) => setRepoFilter(e.target.value)}
                    id="repo-filter-input"
                  />
                </div>

                <select
                  className="language-filter"
                  value={langFilter}
                  onChange={(e) => setLangFilter(e.target.value)}
                  id="language-filter"
                >
                  <option value="">All Languages</option>
                  {allLanguages.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>

                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  id="sort-select"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="stars">Most Stars</option>
                  <option value="forks">Most Forks</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {filteredRepos.length === 0 ? (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No repositories found</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="repo-grid" id="repo-grid">
                  {filteredRepos.map((repo, i) => (
                    <RepoCard key={repo.id} repo={repo} index={i} getLanguageColor={getLanguageColor} timeAgo={timeAgo} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'starred' && (
            starredRepos.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">⭐</div>
                <h3>No starred repos</h3>
                <p>This user hasn't starred any repositories yet.</p>
              </div>
            ) : (
              <div className="repo-grid" id="starred-grid">
                {starredRepos.map((repo, i) => (
                  <RepoCard key={repo.id} repo={repo} index={i} getLanguageColor={getLanguageColor} timeAgo={timeAgo} />
                ))}
              </div>
            )
          )}

          {activeTab === 'followers' && (
            <FollowersGrid
              username={username}
              followersCount={user.followers}
              followingCount={user.following}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityFeed events={events} timeAgo={timeAgo} />
          )}
        </div>
      </div>
    </div>
  )
}
