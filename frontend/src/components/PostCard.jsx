// import { Link } from 'react-router-dom'
// import './PostCard.css'

// const formatDate = (dateStr) => {
//   if (!dateStr) return ''
//   return new Date(dateStr).toLocaleDateString('en-US', {
//     month: 'short', day: 'numeric', year: 'numeric'
//   })
// }
import { Link } from 'react-router-dom';
import './PostCard.css';

// Add this helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return '';
  }
};

export default function PostCard({ post, variant = 'small' }) {
  // variant: 'small' (left col), 'featured' (center), 'popular' (right sidebar)
  if (variant === 'popular') {
    return (
      <Link to={`/post/${post.slug}`} className="popular-item">
        <div className="popular-item-text">
          <h5>{post.title}</h5>
          <div className="pop-meta">
            {formatDate(post.publishedAt)} · {post.author?.name}
          </div>
        </div>
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="popular-thumb" />
        )}
        {!post.coverImage && <div className="popular-thumb thumb-placeholder" />}
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <div className="featured-card">
        <Link to={`/post/${post.slug}`}>
          {post.coverImage
            ? <img src={post.coverImage} alt={post.title} className="featured-img" />
            : <div className="featured-img thumb-placeholder" />}
        </Link>
        <Link to={`/post/${post.slug}`} className="featured-title">{post.title}</Link>
        {post.subtitle && <p className="featured-sub">{post.subtitle}</p>}
        {/* <div className="post-meta">
          <span className="avatar-tiny" />
          <span>{formatDate(post.publishedAt)}</span>
          <span className="dot">•</span>
          <span>{post.author?.name}</span>
        </div> */}
        <div className="post-meta">
          <span className="avatar-tiny" />
          <span>{formatDate(post.publishedAt)}</span>
          {post.author?.name && (
            <>
              <span className="dot">•</span>
              <span>{post.author.name}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  // default: small
  return (
    <Link to={`/post/${post.slug}`} className="post-card-small">
      {post.coverImage
        ? <img src={post.coverImage} alt={post.title} className="card-img" />
        : <div className="card-img thumb-placeholder" />}
      <h3>{post.title}</h3>
      {post.subtitle && <p>{post.subtitle}</p>}
      <div className="post-meta">
        <span className="avatar-tiny" />
        <span>{formatDate(post.publishedAt)}</span>
        <span className="dot">•</span>
        <span>{post.author?.name}</span>
      </div>
    </Link>
  )
}
