import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './UserDashboard.css'

export default function UserDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('liked')
    const [likedPosts, setLikedPosts] = useState([])
    const [savedPosts, setSavedPosts] = useState([])
    const [myComments, setMyComments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            navigate('/signin')
            return
        }
        loadUserData()
    }, [user, navigate])

    const loadUserData = async () => {
        try {
            setLoading(true)
            const [likedRes, savedRes, commentsRes] = await Promise.all([
                api.get('/interactions/liked'),
                api.get('/interactions/saved'),
                api.get('/comments/user/my-comments'),
            ])

            setLikedPosts(likedRes.data.posts)
            setSavedPosts(savedRes.data.posts)
            setMyComments(commentsRes.data.comments)
        } catch (error) {
            console.error('Load user data error:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    if (!user) return null

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="user-dashboard">

            <div className="dashboard-header">
                <div className="user-profile">
                    <div className="user-avatar-large">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder-large">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="user-info">
                        <h1>{user.name}</h1>
                        <p className="user-email">{user.email}</p>
                        <p className="user-role">{user.role === 'admin' ? '✨ Admin' : '📖 Reader'}</p>
                    </div>
                </div>
                <div className="header-actions">
                    {user.role === 'admin' && (
                        <button
                            className="btn-secondary"
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            Admin Dashboard
                        </button>
                    )}
                    <button className="btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="user-stats">
                <div className="stat-item">
                    <div className="stat-value">{likedPosts.length}</div>
                    <div className="stat-label">Liked Posts</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{savedPosts.length}</div>
                    <div className="stat-label">Saved Posts</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{myComments.length}</div>
                    <div className="stat-label">Comments</div>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'liked' ? 'active' : ''}`}
                    onClick={() => setActiveTab('liked')}
                >
                    ❤️ Liked Posts
                </button>
                <button
                    className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    💾 Saved Posts
                </button>
                <button
                    className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    💬 My Comments
                </button>
            </div>

            <div className="dashboard-content">

                {activeTab === 'liked' && (
                    <div className="posts-grid">
                        {likedPosts.length > 0 ? (
                            likedPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/post/${post.slug}`}
                                    className="post-card"
                                >
                                    {post.coverImage && (
                                        <div className="post-card-image">
                                            <img src={post.coverImage} alt={post.title} />
                                        </div>
                                    )}
                                    <div className="post-card-content">
                                        {post.postType && post.postType !== 'essay' && (
                                            <span className="post-card-badge">{post.postType}</span>
                                        )}
                                        <h3 className="post-card-title">{post.title}</h3>
                                        {post.subtitle && (
                                            <p className="post-card-subtitle">{post.subtitle}</p>
                                        )}
                                        <div className="post-card-meta">
                                            <span>{formatDate(post.publishedAt)}</span>
                                            <div className="post-card-stats">
                                                <span>❤️ {post.likes}</span>
                                                <span>👁️ {post.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>You haven't liked any posts yet.</p>
                                <Link to="/archive" className="btn-primary">
                                    Explore Posts
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="posts-grid">
                        {savedPosts.length > 0 ? (
                            savedPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/post/${post.slug}`}
                                    className="post-card"
                                >
                                    {post.coverImage && (
                                        <div className="post-card-image">
                                            <img src={post.coverImage} alt={post.title} />
                                        </div>
                                    )}
                                    <div className="post-card-content">
                                        {post.postType && post.postType !== 'essay' && (
                                            <span className="post-card-badge">{post.postType}</span>
                                        )}
                                        <h3 className="post-card-title">{post.title}</h3>
                                        {post.subtitle && (
                                            <p className="post-card-subtitle">{post.subtitle}</p>
                                        )}
                                        <div className="post-card-meta">
                                            <span>{formatDate(post.publishedAt)}</span>
                                            <div className="post-card-stats">
                                                <span>❤️ {post.likes}</span>
                                                <span>👁️ {post.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>You haven't saved any posts yet.</p>
                                <Link to="/archive" className="btn-primary">
                                    Explore Posts
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="comments-list-dashboard">
                        {myComments.length > 0 ? (
                            myComments.map((comment) => (
                                <div key={comment.id} className="comment-card">
                                    <div className="comment-card-header">
                                        <Link
                                            to={`/post/${comment.post.slug}`}
                                            className="comment-post-link"
                                        >
                                            On: {comment.post.title}
                                        </Link>
                                        <span className="comment-date">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="comment-card-text">{comment.commentText}</p>
                                    <Link
                                        to={`/post/${comment.post.slug}`}
                                        className="comment-view-link"
                                    >
                                        View Post →
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>You haven't commented on any posts yet.</p>
                                <Link to="/archive" className="btn-primary">
                                    Explore Posts
                                </Link>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}