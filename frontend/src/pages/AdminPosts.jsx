import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { toggleFeatured } from '../api/posts'
import './AdminPosts.css'

export default function AdminPosts() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [status, setStatus] = useState(searchParams.get('status') || 'all')
    const [selectedPosts, setSelectedPosts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadPosts()
    }, [currentPage, status])

    const loadPosts = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/posts/admin/all-posts?page=${currentPage}&limit=20&status=${status}`)

            setPosts(res.data.posts)
            setTotalPages(res.data.pages)
        } catch (error) {
            console.error('Load posts error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus)
        setCurrentPage(1)
        setSearchParams(newStatus !== 'all' ? { status: newStatus } : {})
    }

    const toggleSelectPost = (postId) => {
        setSelectedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        )
    }

    const toggleSelectAll = () => {
        if (selectedPosts.length === posts.length) {
            setSelectedPosts([])
        } else {
            setSelectedPosts(posts.map(p => p.id))
        }
    }

    const handleToggleFeatured = async (postId) => {
        try {
            const res = await toggleFeatured(postId)
            setPosts(posts.map(p =>
                p.id === postId ? { ...p, isFeatured: res.data.isFeatured } : p
            ))
        } catch (error) {
            console.error('Error toggling featured:', error)
            alert('Failed to toggle featured status')
        }
    }

    const bulkDelete = async () => {
        if (!confirm(`Delete ${selectedPosts.length} post(s)? This cannot be undone.`)) return

        try {
            await Promise.all(
                selectedPosts.map(id => api.delete(`/posts/${id}`))
            )
            setSelectedPosts([])
            loadPosts()
        } catch (error) {
            console.error('Bulk delete error:', error)
            alert('Failed to delete some posts')
        }
    }

    const bulkPublish = async () => {
        try {
            await Promise.all(
                selectedPosts.map(id => api.put(`/posts/${id}`, { isPublished: true }))
            )
            setSelectedPosts([])
            loadPosts()
        } catch (error) {
            console.error('Bulk publish error:', error)
            alert('Failed to publish some posts')
        }
    }

    const bulkUnpublish = async () => {
        try {
            await Promise.all(
                selectedPosts.map(id => api.put(`/posts/${id}`, { isPublished: false }))
            )
            setSelectedPosts([])
            loadPosts()
        } catch (error) {
            console.error('Bulk unpublish error:', error)
            alert('Failed to unpublish some posts')
        }
    }

    const deletePost = async (id) => {
        if (!confirm('Delete this post? This cannot be undone.')) return

        try {
            await api.delete(`/posts/${id}`)
            loadPosts()
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete post')
        }
    }

    const formatDate = (date) => {
        if (!date) return 'Not published'
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="posts-loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="admin-posts">

            <div className="posts-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
                        ← Dashboard
                    </button>
                    <h1>Manage Posts</h1>
                    <p>View, edit, and manage all your posts</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/write')}>
                    Write New Post
                </button>
            </div>

            <div className="posts-filters">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${status === 'all' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('all')}
                    >
                        All Posts
                    </button>
                    <button
                        className={`filter-tab ${status === 'published' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('published')}
                    >
                        Published
                    </button>
                    <button
                        className={`filter-tab ${status === 'draft' ? 'active' : ''}`}
                        onClick={() => handleStatusChange('draft')}
                    >
                        Drafts
                    </button>
                </div>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {selectedPosts.length > 0 && (
                <div className="bulk-actions">
                    <span className="selected-count">
                        {selectedPosts.length} selected
                    </span>
                    <div className="bulk-buttons">
                        <button className="bulk-btn" onClick={bulkPublish}>
                            ✓ Publish
                        </button>
                        <button className="bulk-btn" onClick={bulkUnpublish}>
                            ✕ Unpublish
                        </button>
                        <button className="bulk-btn danger" onClick={bulkDelete}>
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            )}

            <div className="posts-table-container">
                <table className="posts-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedPosts.length === posts.length && posts.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Featured</th>
                            <th>Views</th>
                            <th>Likes</th>
                            <th>Published</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.map((post) => (
                            <tr key={post.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedPosts.includes(post.id)}
                                        onChange={() => toggleSelectPost(post.id)}
                                    />
                                </td>
                                <td>
                                    <div className="post-title-cell">
                                        <Link to={`/post/${post.slug}`} className="post-title-link">
                                            {post.title}
                                        </Link>
                                        {post.subtitle && (
                                            <div className="post-subtitle">{post.subtitle}</div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${post.isPublished ? 'published' : 'draft'}`}>
                                        {post.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td>
                                    <span className="type-badge">{post.postType}</span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleToggleFeatured(post.id)}
                                        className={`featured-toggle ${post.isFeatured ? 'active' : ''}`}
                                        title={post.isFeatured ? 'Remove from featured' : 'Add to featured'}
                                    >
                                        {post.isFeatured ? '⭐' : '☆'}
                                    </button>
                                </td>
                                <td>{post.views || 0}</td>
                                <td>{post.likes || 0}</td>
                                <td>{formatDate(post.publishedAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn"
                                            onClick={() => navigate(`/admin/edit/${post.id}`)}
                                            title="Edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="action-btn danger"
                                            onClick={() => deletePost(post.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredPosts.length === 0 && (
                <div className="empty-state">
                    <p>No posts found</p>
                    <button className="btn-primary" onClick={() => navigate('/admin/write')}>
                        Write Your First Post
                    </button>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        ← Previous
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-number ${page === currentPage ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}

        </div>
    )
}