import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPostBySlug } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import SubscribeForm from '../components/SubscribeForm'
import Comments from '../components/comments'
import api from '../api/axios'
import './Post.css'

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function Post() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saveCount, setSaveCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetchPostBySlug(slug)
      .then(res => {
        setPost(res.data.post)
        setLikeCount(res.data.post.likes)
        setSaveCount(res.data.post.saves)
        setSiblings(res.data.seriesPosts || [])

        // Check if user has liked/saved
        if (user) {
          checkUserInteractions(res.data.post.id)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug, user])

  const checkUserInteractions = async (postId) => {
    try {
      const res = await api.get(`/interactions/check/${postId}`)
      setLiked(res.data.liked)
      setSaved(res.data.saved)
    } catch (error) {
      console.error('Check interactions error:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like posts')
      return
    }

    try {
      const res = await api.post(`/interactions/like/${post.id}`)
      setLiked(res.data.liked)
      setLikeCount(res.data.likes)
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to save posts')
      return
    }

    try {
      const res = await api.post(`/interactions/save/${post.id}`)
      setSaved(res.data.saved)
      setSaveCount(res.data.saves)
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  if (loading) return <div className="spinner" />
  if (!post) return <div className="msg-error" style={{ maxWidth: 500, margin: '60px auto' }}>Post not found.</div>

  const showPaywall = post.isPremium && !user
  const prevPost = siblings.find(s => s.seriesPosition === post.seriesPosition - 1)
  const nextPost = siblings.find(s => s.seriesPosition === post.seriesPosition + 1)

  return (
    <article className="post-page container">

      {/* Series breadcrumb */}
      {post.series && (
        <div className="post-series-crumb">
          <Link to={`/series/${post.series}`}>← love in small letters · {post.series.split('-').pop().toUpperCase()}</Link>
          <span>piece {post.seriesPosition} of 5</span>
        </div>
      )}

      {/* Post type badge */}
      {post.postType && post.postType !== 'essay' && (
        <div className="post-type-badge">{post.postType}</div>
      )}

      <h1>{post.title}</h1>
      {post.subtitle && <p className="post-subtitle">{post.subtitle}</p>}

      <div className="post-author-row">
        <div className="author-avatar">WTV</div>
        <div>
          <div className="author-name">{post.author?.name || 'small letters'}</div>
          <div className="post-date">{fmt(post.publishedAt)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <div className="action-pills">
          <button
            className={`pill ${liked ? 'pill-active' : ''}`}
            onClick={handleLike}
          >
            <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {likeCount}
          </button>
          <button
            className={`pill ${saved ? 'pill-active' : ''}`}
            onClick={handleSave}
            title="Save"
          >
            <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            {saveCount}
          </button>
        </div>
      </div>

      {/* Hero image */}
      {/* {post.coverImage && ( */}
      {/* // <div className="post-cover-container"> */}
      {/* <img
            src={post.coverImage}
            alt={post.title}
            className="post-cover"
          /> */}
      {/* </div> */}
      {/* )} */}

      {/* Body */}
      {showPaywall ? (
        <>
          <div className="post-body preview-blur"
            dangerouslySetInnerHTML={{ __html: post.body.substring(0, 500) }} />
          <div className="subscribe-wall">
            <div className="wall-card">
              <p className="wall-eyebrow">this piece continues</p>
              <h3>subscribe to keep reading</h3>
              <p>Join readers who get every new piece from <em>small letters</em> in their inbox.</p>
              <SubscribeForm />
              <p className="wall-signin">Already subscribed? <Link to="/signin">Sign in</Link></p>
            </div>
          </div>
        </>
      ) : (
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.body }} />
      )}

      {/* Series navigation */}
      {siblings.length > 0 && (
        <nav className="series-nav">
          <div className="series-nav-label">more from this series</div>
          <div className="series-nav-links">
            {prevPost && (
              <Link to={`/post/${prevPost.slug}`} className="series-nav-prev">
                ← {prevPost.title}
              </Link>
            )}
            {nextPost && (
              <Link to={`/post/${nextPost.slug}`} className="series-nav-next">
                {nextPost.title} →
              </Link>
            )}
          </div>
          <Link to={`/series/${post.series}`} className="series-nav-all">
            view all pieces in this series
          </Link>
        </nav>
      )}

      {/* Comments Section */}
      <Comments postId={post.id} />

    </article>
  )
}