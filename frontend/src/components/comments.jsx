import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './comments.css'
import api from '../api/axios';


const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export default function Comments({ postId }) {
    const { user } = useAuth()
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadComments()
    }, [postId])

    const loadComments = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/comments/post/${postId}`)
            setComments(res.data.comments)
        } catch (error) {
            console.error('Load comments error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            alert('Please sign in to comment')
            return
        }

        if (newComment.trim().length === 0) {
            alert('Comment cannot be empty')
            return
        }

        try {
            setSubmitting(true)

            console.log('Submitting comment to:', `${API_URL}/api/comments/post/${postId}`)
            console.log('Comment text:', newComment)
            console.log('Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing')

            const res = await axios.post(
                `${API_URL}/api/comments/post/${postId}`,
                { commentText: newComment },
                getAuthHeader()
            )

            console.log('Comment added successfully:', res.data)

            setComments([res.data.comment, ...comments])
            setNewComment('')
            // alert('Comment added successfully!')
        } catch (error) {
            console.error('Add comment error:', error)
            console.error('Error response:', error.response)

            if (error.response) {
                // Server responded with error
                alert(`Failed to add comment: ${error.response.data.message || error.response.statusText}`)
            } else if (error.request) {
                // Request made but no response
                alert('Failed to add comment: No response from server')
            } else {
                // Something else went wrong
                alert('Failed to add comment: ' + error.message)
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (commentId) => {
        // if (!confirm('Delete this comment?')) return

        try {
            await axios.delete(
                `${API_URL}/api/comments/${commentId}`,
                getAuthHeader()
            )

            setComments(comments.filter(c => c.id !== commentId))
        } catch (error) {
            console.error('Delete comment error:', error)
            alert('Failed to delete comment')
        }
    }

    const formatDate = (date) => {
        const now = new Date()
        const commentDate = new Date(date)
        const diffMs = now - commentDate
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

        return commentDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="comments-section">
                <div className="comments-loading">Loading comments...</div>
            </div>
        )
    }

    return (
        <div className="comments-section">
            <h3 className="comments-title">
                Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="comment-form">
                    <div className="comment-input-wrapper">
                        <div className="comment-avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <textarea
                            className="comment-input"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            disabled={submitting}
                        />
                    </div>
                    <div className="comment-form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setNewComment('')}
                            disabled={submitting || newComment.length === 0}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={submitting || newComment.trim().length === 0}
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="comment-signin-prompt">
                    <p>
                        <Link to="/signin">Sign in</Link> to join the conversation
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="comments-list">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                {comment.user.avatar ? (
                                    <img src={comment.user.avatar} alt={comment.user.name} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {comment.user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="comment-content">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.user.name}</span>
                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="comment-text">{comment.commentText}</p>
                                {user && (user.id === comment.user.id || user.role === 'admin') && (
                                    <button
                                        className="comment-delete"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="comments-empty">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    )
}