import { useMemo } from 'react'

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Vue: '#41b883',
}

export default function TopRepos({ repos }) {
  const topRepos = useMemo(() => {
    return [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
  }, [repos])

  if (topRepos.length === 0) return null

  return (
    <div className="section-card top-repos-section animate-fade-in-up delay-3" id="top-repos">
      <h3 className="section-title">
        🏆 Top Repositories
      </h3>
      <div className="top-repos-grid">
        {topRepos.map((repo, i) => (
          <div key={repo.id} className="top-repo-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="top-repo-rank">#{i + 1}</div>
            <a
              className="top-repo-name"
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {repo.name}
            </a>
            {repo.description && (
              <p className="top-repo-desc">{repo.description}</p>
            )}
            <div className="top-repo-stats">
              {repo.language && (
                <div className="top-repo-stat">
                  <span className="lang-color" style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || '#8b949e' }} />
                  {repo.language}
                </div>
              )}
              <div className="top-repo-stat">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
                {repo.stargazers_count}
              </div>
              <div className="top-repo-stat">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
                {repo.forks_count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
