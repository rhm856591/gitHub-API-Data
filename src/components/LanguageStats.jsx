export default function LanguageStats({ languages }) {
  return (
    <div className="section-card animate-fade-in-up delay-5" id="language-stats">
      <h3 className="section-title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"/>
        </svg>
        Languages
      </h3>

      {/* Stacked bar */}
      <div className="language-bar-container">
        {languages.map((lang) => (
          <div
            key={lang.name}
            className="language-bar-segment"
            style={{
              width: `${lang.percent}%`,
              backgroundColor: lang.color,
            }}
            title={`${lang.name}: ${lang.percent}%`}
          />
        ))}
      </div>

      {/* Language list */}
      <div className="language-list">
        {languages.map((lang) => (
          <div key={lang.name} className="language-item">
            <span className="language-dot" style={{ backgroundColor: lang.color }}></span>
            <span style={{ fontWeight: 500 }}>{lang.name}</span>
            <span className="lang-percent">{lang.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
