import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function FollowersGrid({ username, followersCount, followingCount }) {
  const [activeView, setActiveView] = useState('followers')
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)
  const [loadingFollowing, setLoadingFollowing] = useState(false)
  const [followersPage, setFollowersPage] = useState(1)
  const [followingPage, setFollowingPage] = useState(1)

  useEffect(() => {
    fetchFollowers(1)
    fetchFollowing(1)
  }, [username])

  const fetchFollowers = async (page) => {
    setLoadingFollowers(true)
    try {
      const res = await axios.get(`https://api.github.com/users/${username}/followers?per_page=30&page=${page}`)
      if (page === 1) {
        setFollowers(res.data)
      } else {
        setFollowers(prev => [...prev, ...res.data])
      }
    } catch (err) {
      console.error('Failed to fetch followers', err)
    }
    setLoadingFollowers(false)
  }

  const fetchFollowing = async (page) => {
    setLoadingFollowing(true)
    try {
      const res = await axios.get(`https://api.github.com/users/${username}/following?per_page=30&page=${page}`)
      if (page === 1) {
        setFollowing(res.data)
      } else {
        setFollowing(prev => [...prev, ...res.data])
      }
    } catch (err) {
      console.error('Failed to fetch following', err)
    }
    setLoadingFollowing(false)
  }

  const loadMoreFollowers = () => {
    const next = followersPage + 1
    setFollowersPage(next)
    fetchFollowers(next)
  }

  const loadMoreFollowing = () => {
    const next = followingPage + 1
    setFollowingPage(next)
    fetchFollowing(next)
  }

  const data = activeView === 'followers' ? followers : following
  const isLoading = activeView === 'followers' ? loadingFollowers : loadingFollowing
  const total = activeView === 'followers' ? followersCount : followingCount
  const hasMore = data.length < total

  return (
    <div className="followers-wrapper" id="followers-grid">
      <div className="followers-header">
        <div className="followers-toggle">
          <button
            className={`followers-toggle-btn ${activeView === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveView('followers')}
          >
            👥 Followers ({followersCount})
          </button>
          <button
            className={`followers-toggle-btn ${activeView === 'following' ? 'active' : ''}`}
            onClick={() => setActiveView('following')}
          >
            ➡️ Following ({followingCount})
          </button>
        </div>
      </div>

      {data.length === 0 && !isLoading ? (
        <div className="no-results">
          <div className="no-results-icon">👤</div>
          <h3>No {activeView} yet</h3>
        </div>
      ) : (
        <>
          <div className="followers-grid">
            {data.map((user, i) => (
              <Link
                key={user.id}
                to={`/profile/${user.login}`}
                className="follower-card"
                style={{ animationDelay: `${Math.min(i * 0.03, 0.5)}s` }}
              >
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="follower-avatar"
                  loading="lazy"
                />
                <div>
                  <div className="follower-name">{user.login}</div>
                  <div className="follower-login">@{user.login}</div>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <button
              className="load-more-btn"
              onClick={activeView === 'followers' ? loadMoreFollowers : loadMoreFollowing}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Loading...
                </>
              ) : (
                <>Load More ({data.length} of {total})</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}
