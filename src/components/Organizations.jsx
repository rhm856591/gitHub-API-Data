import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Organizations({ username }) {
  const [orgs, setOrgs] = useState([])

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await axios.get(`https://api.github.com/users/${username}/orgs`)
        setOrgs(res.data)
      } catch (err) {
        console.error('Failed to fetch orgs', err)
      }
    }
    fetchOrgs()
  }, [username])

  if (orgs.length === 0) return null

  return (
    <div className="orgs-section" id="organizations">
      <div className="orgs-title">Organizations</div>
      <div className="orgs-list">
        {orgs.map(org => (
          <a
            key={org.id}
            href={`https://github.com/${org.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="org-badge"
            title={org.description || org.login}
          >
            <img src={org.avatar_url} alt={org.login} className="org-avatar" />
            {org.login}
          </a>
        ))}
      </div>
    </div>
  )
}
