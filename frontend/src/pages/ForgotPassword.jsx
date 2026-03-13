import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
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

        console.log('Submitting forgot password for:', email);
        console.log('API URL:', import.meta.env.VITE_API_URL);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
                { email }
            );

            console.log('Response:', response.data);
            setSuccess(true)
        } catch (err) {
            console.error('Error:', err);
            console.error('Response:', err.response?.data);

            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-page container">
                <div className="auth-card">
                    <Link to="/" ><div className="auth-logo">Small Letter</div></Link>
                    <h3>Check your email</h3>
                    <p className="auth-sub">
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <Link
                        to="/signin"
                        className="btn-primary auth-btn"
                        style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}
                    >
                        Back to Sign in
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page container">
            <div className="auth-card">
                <div className="auth-logo">Small Letter</div>
                <h3>Reset password</h3>
                <p className="auth-sub">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && <div className="msg-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label>Email</label>
                        <input
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