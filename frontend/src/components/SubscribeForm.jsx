import { useState } from 'react'
import { subscribeEmail } from '../api/auth'
import './SubscribeForm.css'

export default function SubscribeForm({ compact = false }) {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await subscribeEmail(email)
      setStatus('success')
      setMessage(res.data.message)
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="subscribe-success">
        <span>🎉</span>
        <p>{message}</p>
      </div>
    )
  }

  return (
    <form className={`subscribe-form ${compact ? 'compact' : ''}`} onSubmit={handleSubmit}>
      {status === 'error' && <div className="msg-error">{message}</div>}
      <div className="subscribe-row">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {!compact && (
        <p className="subscribe-note">No spam. Unsubscribe any time.</p>
      )}
    </form>
  )
}
