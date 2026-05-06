import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  {
    to: '/catalog',
    label: 'Catalog',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    to: '/planner',
    label: 'Planner',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/planner/custom',
    label: 'My Plan',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    to: '/graph',
    label: 'Graph',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
];

// onLogout is passed from App.jsx — it clears localStorage + sets token to null
export default function Navbar({ onLogout }) {
  return (
    <nav style={styles.nav}>
      {/* Brand */}
      <div style={styles.brand}>
        <span style={styles.brandIcon}>◈</span>
        <span style={styles.brandText}>DegreeMap</span>
        <span style={styles.brandSub}>LAU</span>
      </div>

      {/* Links */}
      <ul style={styles.links}>
        {NAV_LINKS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/planner'}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              <span style={styles.linkIcon}>{icon}</span>
              <span>{label}</span>
              <NavLink to={to} end={to === '/planner'}>
                {({ isActive }) =>
                  isActive ? <span style={styles.activeBar} /> : null
                }
              </NavLink>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout — calls App's handleLogout */}
      <button onClick={onLogout} style={styles.logout}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Logout</span>
      </button>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    height: '60px',
    backgroundColor: '#1a6b3c',
    boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    fontFamily: "'Geist', 'DM Sans', sans-serif",
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '8px',
    textDecoration: 'none', userSelect: 'none',
  },
  brandIcon: { fontSize: '20px', color: '#f0c040', lineHeight: 1 },
  brandText: { fontSize: '17px', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.3px' },
  brandSub: {
    fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.5)',
    letterSpacing: '1.5px', textTransform: 'uppercase', marginLeft: '2px', paddingTop: '2px',
  },
  links: {
    display: 'flex', alignItems: 'center', gap: '4px',
    listStyle: 'none', margin: 0, padding: 0,
  },
  link: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '6px 14px', borderRadius: '6px',
    fontSize: '14px', fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    position: 'relative', cursor: 'pointer',
  },
  linkActive: { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.14)' },
  linkIcon: { opacity: 0.85, display: 'flex', alignItems: 'center' },
  activeBar: {
    position: 'absolute', bottom: '-1px', left: '14px', right: '14px',
    height: '2px', backgroundColor: '#f0c040', borderRadius: '2px 2px 0 0',
  },
  logout: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '6px 14px', borderRadius: '6px',
    fontSize: '13.5px', fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer', transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  },
};