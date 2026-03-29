import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchPosts, fetchPopularPosts, fetchFeaturedPosts } from '../api/posts'
import PostCard from '../components/PostCard'
import SubscribeForm from '../components/SubscribeForm'
import './Home.css'

export default function Home() {
  const [allPosts, setAllPosts] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [popular, setPopular] = useState([])
  const [allSeries, setAllSeries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [featuredRes, postsRes, popularRes] = await Promise.all([
        fetchFeaturedPosts(),
        fetchPosts(1, 20),
        fetchPopularPosts()
      ])

      setFeaturedPosts(featuredRes.data.posts)
      setAllPosts(postsRes.data.posts)
      setPopular(popularRes.data.posts)

      const posts = postsRes.data.posts
      const uniqueSeries = [...new Set(
        posts
          .filter(p => p.series && p.series.trim() !== '')
          .map(p => p.series)
      )]

      const seriesWithCounts = uniqueSeries.map(seriesSlug => {
        const seriesPosts = posts.filter(p => p.series === seriesSlug)
        return {
          slug: seriesSlug,
          count: seriesPosts.length,
          latestPost: seriesPosts[0]
        }
      })

      setAllSeries(seriesWithCounts)
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // const formatSeriesName = (slug) => {
  //   const parts = slug.split('-')
  //   const roman = parts[parts.length - 1].toUpperCase()
  //   const name = parts.slice(0, -1).join(' ')
  //   return {
  //     name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  //     number: roman
  //   }
  // }
  const formatSeriesName = (slug) => {
    // Check if last part looks like a Roman numeral
    const parts = slug.split('-')
    const lastPart = parts[parts.length - 1].toUpperCase()
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

    if (romanNumerals.includes(lastPart)) {
      const name = parts.slice(0, -1)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      return { name, number: lastPart }
    }

    // For new series with no Roman numeral suffix
    const name = parts
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    return { name, number: null }
  }

  if (loading) return <div className="spinner" />

  return (
    <main>
      <div className="home-tagline">
        <p>love, in the quietest words.</p>
      </div>

      <div className="home-grid container">

        {/* LEFT SIDEBAR */}
        <aside className="col-left">
          <Link to="/series" className="series-promo">
            <span className="series-label">SERIES</span>
            <h4>love in small letters</h4>
            <p>5 chapters · 25 pieces · one feeling at a time</p>
            <span className="series-cta">read the series →</span>
          </Link>

          {allSeries.length > 0 && (
            <div className="dynamic-series-list">
              <div className="series-list-header">Latest Series</div>
              {allSeries.map((series) => {
                const formatted = formatSeriesName(series.slug)
                return (
                  <Link
                    key={series.slug}
                    to={`/series/${series.slug}`}
                    className="dynamic-series-item"
                  >
                    <div className="series-item-header">
                      <span className="series-item-name">
                        {/* {formatted.name} · {formatted.number} */}
                        {formatted.number
                          ? `${formatted.name} · ${formatted.number}`
                          : formatted.name
                        }
                      </span>
                      <span className="series-item-count">{series.count} posts</span>
                    </div>
                    {series.latestPost && (
                      <div className="series-item-latest">
                        Latest: {series.latestPost.title}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </aside>

        {/* CENTER */}
        <section className="col-center">
          {featuredPosts.length > 0 && (
            <div className="featured-section">
              <p className="section-title">Featured</p>
              <div className="featured-posts">
                {featuredPosts.slice(0, 2).map(p => (
                  <PostCard key={p.id} post={p} variant="featured" />

                  //     {posts.slice(0, 3).map(p => (
                  // <PostCard key={p.id} post={p} variant="featured" />

                ))}
              </div>
            </div>
          )}

          {allPosts.length > 0 && (
            <>
              <hr className="divider" />
              <div className="all-posts-grid">
                {allPosts.slice(0, 6).map(p => (
                  <div key={p.id} className="grid-post-card">
                    {p.coverImage && (
                      <Link to={`/post/${p.slug}`} className="grid-post-image">
                        <img src={p.coverImage} alt={p.title} />
                      </Link>
                    )}
                    <div className="grid-post-content">
                      <Link to={`/post/${p.slug}`} className="grid-post-title">
                        {p.title}
                      </Link>
                      {p.subtitle && (
                        <p className="grid-post-subtitle">{p.subtitle}</p>
                      )}
                      <div className="grid-post-meta">
                        <span>{formatDate(p.publishedAt)}</span>
                        <span>·</span>
                        <span>{p.author?.name || 'small letters'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="col-right">
          <div className="sidebar-head">Most loved</div>
          {popular.length > 0 ? (
            popular.map(p => (
              <PostCard key={p.id} post={p} variant="popular" />
            ))
          ) : (
            <p className="sidebar-empty">No posts yet</p>
          )}

          <div className="sidebar-divider" />

          <div className="sidebar-head">Browse by type</div>
          <div className="type-filters">
            {['quote', 'phrase', 'paragraph', 'essay'].map(t => (
              <Link key={t} to={`/archive?type=${t}`} className="type-chip">
                {t}
              </Link>
            ))}
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-subscribe">
            <p className="sidebar-subscribe-hed">words that feel like yours.</p>
            <p className="sidebar-subscribe-sub">Get every new piece in your inbox.</p>
            <SubscribeForm compact />
          </div>
        </aside>

      </div>
    </main>
  )
}