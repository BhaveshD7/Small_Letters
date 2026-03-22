import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import './Auth.css'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-form-wrapper">
                    <Link to="/" className="auth-logo">Small Letter</Link>
                    <h3>Check your email</h3>
                    <p className="auth-sub">
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <Link to="/signin" className="btn-primary auth-btn">
                        Back to Sign in
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-form-wrapper">
                <div className="auth-logo">Small Letter</div>
                <h3>Reset password</h3>
                <p className="auth-sub">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div className="msg-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Sending…' : 'Send reset link'}
                    </button>
                </form>

                <p className="auth-switch">
                    Remember your password? <Link to="/signin">Sign in</Link>
                </p>
            </div>
        </div>
    )
}