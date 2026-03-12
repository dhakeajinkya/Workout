import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const PRIMARY_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/scores', label: 'Scores' },
  { to: '/progression', label: 'Progress' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/achievements', label: 'Character' },
]

const LOG_LINK = { to: '/log', label: 'Log Workout' }

const SECONDARY_GROUPS = [
  { heading: 'Training',  links: [
    { to: '/journal', label: 'Journal' },
    { to: '/compliance', label: 'Compliance' },
    { to: '/frequency', label: 'Frequency' },
  ]},
  { heading: 'Tracking', links: [
    { to: '/tonnage', label: 'Tonnage' },
    { to: '/bodyweight', label: 'Bodyweight' },
    { to: '/amrap', label: 'AMRAP' },
  ]},
  { heading: 'Deep Dive', links: [
    { to: '/muscles', label: 'Muscles' },
    { to: '/overall', label: 'Overall' },
    { to: '/goals', label: 'Goals' },
  ]},
]

const ALL_SECONDARY_LINKS = SECONDARY_GROUPS.flatMap((g) => g.links)

export default function NavBar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  useEffect(() => { setMobileOpen(false); setMoreOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">IronLogs</Link>

        <div className="navbar-links">
          {PRIMARY_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={`navbar-link${isActive(link.to) ? ' active' : ''}`}>{link.label}</Link>
          ))}

          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
              className={`navbar-link border-none bg-transparent cursor-pointer font-inherit${ALL_SECONDARY_LINKS.some((l) => isActive(l.to)) ? ' active' : ''}`}
            >
              More ▾
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-1 rounded-md p-1 min-w-[160px] z-200 shadow-lg border border-border bg-bg-card-solid">
                {SECONDARY_GROUPS.map((group) => (
                  <div key={group.heading}>
                    <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider opacity-40 font-bold">{group.heading}</div>
                    {group.links.map((link) => (
                      <Link key={link.to} to={link.to} onClick={() => setMoreOpen(false)}
                        className={`navbar-link block py-1.5 px-3 text-sm${isActive(link.to) ? ' active' : ''}`}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to={LOG_LINK.to} className="navbar-log-btn">{LOG_LINK.label}</Link>
        </div>

        <button className="navbar-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
      </nav>

      <div className={`navbar-mobile-menu${mobileOpen ? ' open' : ''}`}>
        <div className="navbar-mobile-header">
          <Link to="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>IronLogs</Link>
          <button className="navbar-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <div className="navbar-mobile-links">
          <div style={{ padding: '0.75rem 1.5rem' }}>
            <Link to={LOG_LINK.to} className="navbar-log-btn" style={{ display: 'block', textAlign: 'center' }} onClick={() => setMobileOpen(false)}>{LOG_LINK.label}</Link>
          </div>
          <div className="navbar-mobile-section">Main</div>
          {PRIMARY_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={`navbar-mobile-link${isActive(link.to) ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>{link.label}</Link>
          ))}
          {SECONDARY_GROUPS.map((group) => (
            <div key={group.heading}>
              <div className="navbar-mobile-section">{group.heading}</div>
              {group.links.map((link) => (
                <Link key={link.to} to={link.to} className={`navbar-mobile-link${isActive(link.to) ? ' active' : ''}`} onClick={() => setMobileOpen(false)}>{link.label}</Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
