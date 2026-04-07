import { useMemo } from 'react'

export default function ContributionHeatmap({ events }) {
  const heatmapData = useMemo(() => {
    // Build a map of date -> event count for the last 365 days
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(today.getFullYear() - 1)

    const dateMap = {}
    
    // Initialize all days
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      dateMap[key] = 0
    }

    // Count events per day
    events.forEach(event => {
      const key = event.created_at.split('T')[0]
      if (dateMap[key] !== undefined) {
        dateMap[key]++
      }
    })

    // Group into weeks (columns) with 7 days each (rows)
    const sortedDates = Object.keys(dateMap).sort()
    const weeks = []
    let currentWeek = []

    // Start from the first Sunday
    const firstDate = new Date(sortedDates[0])
    const firstDay = firstDate.getDay()
    
    // Pad the first week with empty cells
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }

    sortedDates.forEach(date => {
      currentWeek.push({ date, count: dateMap[date] })
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    // Get month labels
    const months = []
    let lastMonth = -1
    weeks.forEach((week, i) => {
      const validCell = week.find(c => c !== null)
      if (validCell) {
        const m = new Date(validCell.date).getMonth()
        if (m !== lastMonth) {
          months.push({ index: i, name: new Date(validCell.date).toLocaleString('en', { month: 'short' }) })
          lastMonth = m
        }
      }
    })

    const totalContributions = Object.values(dateMap).reduce((a, b) => a + b, 0)

    return { weeks, months, totalContributions }
  }, [events])

  function getLevel(count) {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 5) return 2
    if (count <= 10) return 3
    return 4
  }

  return (
    <div className="section-card animate-fade-in-up delay-6" id="contribution-heatmap">
      <h3 className="section-title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25Z"/>
        </svg>
        {heatmapData.totalContributions} contributions in the last year
      </h3>
      
      <div className="heatmap-wrapper">
        {/* Month labels */}
        <div className="heatmap-months" style={{ paddingLeft: 0 }}>
          {heatmapData.months.map((m, i) => (
            <span
              key={i}
              className="heatmap-month-label"
              style={{
                position: 'relative',
                left: `${m.index * 15}px`,
                width: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {m.name}
            </span>
          ))}
        </div>

        <div className="heatmap-scroll">
          <div className="heatmap-grid">
            {heatmapData.weeks.map((week, wi) => (
              <div key={wi} className="heatmap-week">
                {week.map((cell, di) => (
                  cell ? (
                    <div
                      key={di}
                      className="heatmap-cell"
                      data-level={getLevel(cell.count)}
                      title={`${cell.count} events on ${cell.date}`}
                    />
                  ) : (
                    <div key={di} className="heatmap-cell" style={{ visibility: 'hidden' }} />
                  )
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-legend-cell" style={{ background: 'var(--bg-tertiary)' }} />
          <div className="heatmap-legend-cell" style={{ background: 'rgba(63, 185, 80, 0.25)' }} />
          <div className="heatmap-legend-cell" style={{ background: 'rgba(63, 185, 80, 0.5)' }} />
          <div className="heatmap-legend-cell" style={{ background: 'rgba(63, 185, 80, 0.75)' }} />
          <div className="heatmap-legend-cell" style={{ background: 'rgba(63, 185, 80, 1)' }} />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
