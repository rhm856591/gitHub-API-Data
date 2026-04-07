const EVENT_CONFIG = {
  PushEvent: { icon: '⬆️', label: 'push', className: 'push' },
  CreateEvent: { icon: '✨', label: 'create', className: 'create' },
  WatchEvent: { icon: '⭐', label: 'star', className: 'star' },
  ForkEvent: { icon: '🍴', label: 'fork', className: 'fork' },
  IssuesEvent: { icon: '🐛', label: 'issue', className: 'issue' },
  IssueCommentEvent: { icon: '💬', label: 'create', className: 'create' },
  PullRequestEvent: { icon: '🔀', label: 'create', className: 'create' },
  PullRequestReviewEvent: { icon: '👀', label: 'create', className: 'create' },
  DeleteEvent: { icon: '🗑️', label: 'delete', className: 'issue' },
  ReleaseEvent: { icon: '🚀', label: 'create', className: 'create' },
}

function getEventDescription(event) {
  const repo = event.repo?.name || ''
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload?.commits?.length || 0
      return <><a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a> — pushed {count} commit{count !== 1 ? 's' : ''}</>
    }
    case 'CreateEvent': {
      const ref = event.payload?.ref_type || 'repository'
      return <><a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a> — created {ref} {event.payload?.ref || ''}</>
    }
    case 'WatchEvent':
      return <>starred <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a></>
    case 'ForkEvent':
      return <>forked <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a></>
    case 'IssuesEvent':
      return <><a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a> — {event.payload?.action} issue</>
    case 'IssueCommentEvent':
      return <>commented on issue in <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a></>
    case 'PullRequestEvent':
      return <><a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a> — {event.payload?.action} PR</>
    case 'PullRequestReviewEvent':
      return <>reviewed PR in <a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a></>
    case 'DeleteEvent':
      return <><a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a> — deleted {event.payload?.ref_type}</>
    case 'ReleaseEvent':
      return <><a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a> — published release</>
    default:
      return <><a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">{repo}</a> — {event.type.replace('Event', '')}</>
  }
}

export default function ActivityFeed({ events, timeAgo }) {
  if (!events.length) {
    return (
      <div className="no-results">
        <div className="no-results-icon">📭</div>
        <h3>No recent activity</h3>
        <p>This user hasn't had any public activity recently.</p>
      </div>
    )
  }

  return (
    <div className="activity-list" id="activity-feed">
      {events.map((event, i) => {
        const config = EVENT_CONFIG[event.type] || { icon: '📋', label: event.type, className: 'create' }
        return (
          <div
            key={event.id}
            className="activity-item"
            style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
          >
            <div className={`activity-icon ${config.className}`}>
              {config.icon}
            </div>
            <div className="activity-content">
              <div className="activity-title">
                {getEventDescription(event)}
              </div>
              <div className="activity-time">{timeAgo(event.created_at)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
