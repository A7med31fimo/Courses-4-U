// src/components/Navbar.jsx — REPLACE existing

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleBadge = ({ role }) => {
  const map = { admin: 'badge-coral', instructor: 'badge-teal', student: 'badge-soft' }
  return <span className={map[role] || 'badge-soft'}>{role}</span>
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => { await logout(); navigate('/login') }
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <header className="sticky top-0 z-50 bg-slate/90 backdrop-blur-md border-b border-line">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center text-amber text-lg transition-all group-hover:bg-amber/20">
            📚
          </div>
          <span className="font-display font-semibold text-snow text-lg leading-none tracking-tight">
            Learn<span className="text-amber">You</span>
          </span>
        </Link>

        {/* Nav links */}
        {user && (
          <div className="hidden sm:flex items-center gap-1">
            <NavLink to="/" active={location.pathname === '/'}>Courses</NavLink>

            {user.role === 'student' && (
              <NavLink to="/my-learning" active={isActive('/my-learning')}>
                My Learning
              </NavLink>
            )}

            {(user.role === 'instructor' || user.role === 'admin') && (
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
            )}

            {user.role === 'admin' && (
              <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
            )}
          </div>
        )}

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-sm font-medium text-light leading-none">{user.name}</p>
                <div className="mt-1 flex items-center gap-1.5 justify-end">
                  <RoleBadge role={user.role} />
                  {/* {!user.email_verified && (
                    <span className="badge bg-amber/15 text-amber text-xs">unverified</span>
                  )} */}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber/30 to-teal/20 border border-line flex items-center justify-center font-display font-semibold text-amber text-sm uppercase">
                {user.name.charAt(0)}
              </div>
            </div>
            <button onClick={handleLogout} className="btn-ghost btn-sm">Sign out</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"    className="btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn-primary btn-sm">Get started</Link>
          </div>
        )}
      </nav>
    </header>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active ? 'bg-amber/10 text-amber' : 'text-dim hover:text-light hover:bg-card'
      }`}
    >
      {children}
    </Link>
  )
}
