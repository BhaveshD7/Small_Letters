import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts } from '../api/posts'
import './Archive.css'

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function Archive() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetchPosts(page, 12)
      .then(res => {
        setPosts(res.data.posts)
        setTotalPages(res.data.pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="archive-page container">
      <h2>Archive</h2>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="archive-list">
            {posts.map(post => (
              <Link key={post._id} to={`/post/${post.slug}`} className="archive-item">
                {post.coverImage
                  ? <img src={post.coverImage} alt={post.title} className="archive-thumb" />
                  : <div className="archive-thumb thumb-placeholder" />}
                <div className="archive-item-body">
                  <h3>{post.title}</h3>
                  {post.subtitle && <p>{post.subtitle}</p>}
                  <span className="arch-meta">{formatDate(post.publishedAt)} · {post.author?.name}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
