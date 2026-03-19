import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './AdminDashboard.css'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [popularPosts, setPopularPosts] = useState([])
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            const [statsRes, popularRes, activityRes] = await Promise.all([
                api.get('/posts/admin/stats'),
                api.get('/posts/admin/popular?limit=5'),
                api.get('/posts/admin/activity?limit=10'),
            ])

            setStats(statsRes.data.stats)
            setPopularPosts(popularRes.data.posts)
            setRecentActivity(activityRes.data.activities)
        } catch (error) {
            console.error('Dashboard load error:', error)
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

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="admin-dashboard">

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening with Small Letter.</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/admin/write')}
                >
                    Write New Post
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalPosts || 0}</div>
                        <div className="stat-label">Published Posts</div>
                        <div className="stat-meta">
                            {stats?.postsThisMonth || 0} this month
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalSubscribers || 0}</div>
                        <div className="stat-label">Subscribers</div>
                        <div className="stat-meta">Growing strong</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalViews?.toLocaleString() || 0}</div>
                        <div className="stat-label">Total Views</div>
                        <div className="stat-meta">
                            {stats?.viewsThisMonth?.toLocaleString() || 0} this month
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">❤️</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalLikes || 0}</div>
                        <div className="stat-label">Total Likes</div>
                        <div className="stat-meta">
                            {stats?.totalSaves || 0} saves
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">

                {/* Popular Posts */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Popular Posts</h2>
                        <Link to="/admin/posts" className="view-all-link">View all →</Link>
                    </div>
                    <div className="popular-posts-list">
                        {popularPosts.length > 0 ? (
                            popularPosts.map((post, index) => (
                                <div key={post.id} className="popular-post-item">
                                    <div className="post-rank">#{index + 1}</div>
                                    <div className="post-info">
                                        <Link to={`/post/${post.slug}`} className="post-title">
                                            {post.title}
                                        </Link>
                                        <div className="post-stats">
                                            <span>👁️ {post.views?.toLocaleString() || 0}</span>
                                            <span>❤️ {post.likes || 0}</span>
                                            <span>💾 {post.saves || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No posts yet. Start writing!</p>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Recent Activity</h2>
                    </div>
                    <div className="activity-list">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        {activity.type === 'post_published' ? '📝' : '👤'}
                                    </div>
                                    <div className="activity-content">
                                        {activity.type === 'post_published' ? (
                                            <>
                                                <div className="activity-text">
                                                    <strong>{activity.userName}</strong> published{' '}
                                                    <Link to={`/post/${activity.slug || activity.id}`}>
                                                        {activity.title}
                                                    </Link>
                                                </div>
                                                <div className="activity-time">
                                                    {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="activity-text">
                                                    New subscriber: <strong>{activity.userName}</strong>
                                                </div>
                                                <div className="activity-time">
                                                    {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card quick-actions">
                <div className="card-header">
                    <h2>Quick Actions</h2>
                </div>
                <div className="actions-grid">
                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/write')}
                    >
                        <span className="action-label">Write New Post</span>
                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/posts')}
                    >
                        <span className="action-label">Manage Posts</span>
                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate('/admin/media')}
                    >
                        <span className="action-label">Media Library</span>
                    </button>

                    <button
                        className="action-btn"
                        onClick={() => navigate('/series')}
                    >
                        <span className="action-label">View Series</span>
                    </button>
                </div>
            </div>

            {/* Drafts */}
            {stats?.totalDrafts > 0 && (
                <div className="dashboard-card drafts-card">
                    <div className="card-header">
                        <h2>📋 Drafts</h2>
                    </div>
                    <p>
                        You have <strong>{stats.totalDrafts} draft{stats.totalDrafts !== 1 ? 's' : ''}</strong> waiting to be published.
                        <Link to="/admin/posts?status=draft" className="view-link"> View drafts →</Link>
                    </p>
                </div>
            )}

        </div>
    )
}