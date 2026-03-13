import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function SignIn() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin/write' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page containers">
      <h2 className='wtv'>WTV</h2>
      <div className="auth-card">
        <Link to="/" >
          <div className="auth-logo">Small Letter</div></Link>
        <h3>Sign in</h3>
        <p className="auth-sub">Sign in to continue reading..</p>

        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Subscribe / Sign up</Link>
        </p>
      </div>
    </div>
  )
}
