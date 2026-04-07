export default function ProfileSkeleton() {
  return (
    <div className="profile-page">
      <div className="back-btn" style={{ visibility: 'hidden' }}>Back</div>
      <div className="profile-header">
        <aside className="profile-sidebar">
          <div className="skeleton skeleton-avatar" style={{ marginBottom: 20 }}></div>
          <div className="skeleton skeleton-text" style={{ width: '70%', height: 24, marginBottom: 8 }}></div>
          <div className="skeleton skeleton-text-sm" style={{ width: '50%', marginBottom: 12 }}></div>
          <div className="skeleton skeleton-text" style={{ width: '90%', marginBottom: 6 }}></div>
          <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: 16 }}></div>
          <div className="skeleton skeleton-text-sm" style={{ width: '60%', marginBottom: 8 }}></div>
          <div className="skeleton skeleton-text-sm" style={{ width: '55%', marginBottom: 8 }}></div>
          <div className="skeleton skeleton-text-sm" style={{ width: '50%', marginBottom: 20 }}></div>
          <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 12 }}></div>
        </aside>
        <div className="profile-main">
          <div className="stats-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton skeleton-stat"></div>
            ))}
          </div>
          <div className="skeleton" style={{ height: 120, borderRadius: 16, marginTop: 16 }}></div>
          <div className="skeleton" style={{ height: 80, borderRadius: 16, marginTop: 16 }}></div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
            gap: 12,
            marginTop: 16
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
