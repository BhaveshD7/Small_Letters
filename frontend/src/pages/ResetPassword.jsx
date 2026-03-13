import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './Auth.css'

export default function ResetPassword() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const validatePassword = (pwd) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
        return regex.test(pwd)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!validatePassword(password)) {
            return setError('Password must be 8+ characters with uppercase, lowercase, number, and special character')
        }

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        setLoading(true)

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
                password
            })
            setSuccess(true)
            setTimeout(() => navigate('/signin'), 3000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-page container">
                <div className="auth-card">
                    <Link to="/" ><div className="auth-logo">Small Letter</div></Link>
                    <h3>Password Reset Successful! ✓</h3>
                    <p className="auth-sub">
                        Your password has been reset successfully. Redirecting to sign in...
                    </p>
                    <Link to="/signin" className="btn-primary auth-btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                        Sign in now
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page container">
            <div className="auth-card">
                <div className="auth-logo">Small Letter</div>
                <h3>Create new password</h3>
                <p className="auth-sub">
                    Enter your new password below.
                </p>

                {error && <div className="msg-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            required
                        />
                    </div>

                    <div className="password-requirements">
                        <p><strong>Password must contain:</strong></p>
                        <ul>
                            <li>At least 8 characters</li>
                            <li>One uppercase letter (A-Z)</li>
                            <li>One lowercase letter (a-z)</li>
                            <li>One number (0-9)</li>
                            <li>One special character (!@#$%^&*)</li>
                        </ul>
                    </div>

                    <div className="field">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Resetting…' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}