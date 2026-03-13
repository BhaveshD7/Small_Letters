import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
    navigate('/')
  }

  const handleDashboardClick = () => {
    setShowUserMenu(false)
    navigate('/dashboard')
  }

  const handleAdminClick = () => {
    setShowUserMenu(false)
    navigate('/admin/dashboard')
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <Link to="/" className="logo-area">
            <div className="logo-wordmark">Small Letters</div>
            <div className="logo-byline">by WTV</div>
          </Link>
        </div>

        <div className="topbar-right">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin/write" className="btn-write">+ write</Link>
              )}

              <div className="user-menu" ref={menuRef}>
                <button
                  className="user-name"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  type="button"
                >
                  {user.name} ▾
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={handleDashboardClick}
                      type="button"
                    >
                      My Dashboard
                    </button>

                    {user.role === 'admin' && (
                      <button
                        className="dropdown-item"
                        onClick={handleAdminClick}
                        type="button"
                      >
                        Admin Panel
                      </button>
                    )}

                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      type="button"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn-subscribe">Subscribe</Link>
              <Link to="/signin" className="btn-in">Sign in</Link>
            </>
          )}
        </div>
      </header>

      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/series" className={({ isActive }) => isActive ? 'active' : ''}>Love in Small Letters</NavLink>
        <NavLink to="/archive" className={({ isActive }) => isActive ? 'active' : ''}>Archive</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
      </nav>
    </>
  )
}