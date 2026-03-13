// import { useState, useEffect } from 'react'
// import { useParams, Link } from 'react-router-dom'
// import { fetchSeriesPosts } from '../api/posts'
// import './SeriesDetail.css'

// const SERIES_META = {
//   'love-in-small-letters-i':   { num: 'I',   title: 'Hidden Gesture' },
//   'love-in-small-letters-ii':  { num: 'II',  title: 'Comfortable Silence' },
//   'love-in-small-letters-iii': { num: 'III', title: 'Little Things That Nobody Else Notices' },
//   'love-in-small-letters-iv':  { num: 'IV',  title: 'The Weight of Almost'},
//   'love-in-small-letters-v':   { num: 'V',   title: 'Love Isn\'t Butterflies' },
// }

// export default function SeriesDetail() {
//   const { seriesSlug }        = useParams()
//   const [posts, setPosts]     = useState([])
//   const [loading, setLoading] = useState(true)
//   const meta = SERIES_META[seriesSlug] || { num: '?', title: 'series' }

//   useEffect(() => {
//     fetchSeriesPosts(seriesSlug)
//       .then(res => setPosts(res.data.posts))
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [seriesSlug])

//   if (loading) return <div className="spinner" />

//   return (
//     <div className="seriesdetail-page container">
//       <Link to="/series" className="back-link">← all series</Link>

//       <div className="sd-hero">
//         <span className="sd-eyebrow">love in small letters · {meta.num}</span>
//         <h1>{meta.title}</h1>
//         <p className="sd-count">{posts.length} of 5 pieces published</p>
//       </div>

//       {/* Progress dots */}
//       <div className="sd-progress">
//         {[1,2,3,4,5].map(n => {
//           const post = posts.find(p => p.seriesPosition === n)
//           return (
//             <div key={n} className={`sd-dot ${post ? 'filled' : 'empty'}`}>
//               {n}
//             </div>
//           )
//         })}
//         <div className="sd-progress-line" />
//       </div>

//       {/* Posts list */}
//       <div className="sd-posts">
//         {posts.map(post => (
//           <Link key={post._id} to={`/post/${post.slug}`} className="sd-post-card">
//             <div className="sd-post-num">{post.seriesPosition}</div>
//             <div className="sd-post-body">
//               <h3>{post.title}</h3>
//               {post.subtitle && <p>{post.subtitle}</p>}
//               <span className="sd-post-date">
//                 {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
//               </span>
//             </div>
//             {post.coverImage && <img src={post.coverImage} alt={post.title} className="sd-post-thumb" />}
//           </Link>
//         ))}

//         {/* Placeholder for unpublished */}
//         {Array.from({ length: 5 - posts.length }).map((_, i) => (
//           <div key={`empty-${i}`} className="sd-post-card sd-coming-soon">
//             <div className="sd-post-num">{posts.length + i + 1}</div>
//             <div className="sd-post-body">
//               <h3>coming soon...</h3>
//               <p>this piece hasn't been written yet. subscribe to get it when it arrives.</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }


import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchSeriesPosts } from '../api/posts'
import './SeriesDetail.css'

const SERIES_META = {
  'love-in-small-letters-i': { num: 'I', title: 'Hidden Gestures' },
  'love-in-small-letters-ii': { num: 'II', title: 'Comfortable Silence' },
  'love-in-small-letters-iii': { num: 'III', title: 'Little Things That Nobody Else Notices' },
  'love-in-small-letters-iv': { num: 'IV', title: 'The Weight of Almost' },
  'love-in-small-letters-v': { num: 'V', title: 'Love Isn\'t Butterflies' },
}

export default function SeriesDetail() {
  const { seriesSlug } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const meta = SERIES_META[seriesSlug] || { num: '?', title: 'series' }

  useEffect(() => {
    fetchSeriesPosts(seriesSlug)
      .then(res => setPosts(res.data.posts))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [seriesSlug])

  if (loading) return <div className="spinner" />

  return (
    <div className="seriesdetail-page container">
      <Link to="/series" className="back-link">← all series</Link>

      <div className="sd-hero">
        <span className="sd-eyebrow">love in small letters · {meta.num}</span>
        <h1>{meta.title}</h1>
        <p className="sd-count">{posts.length} of 5 pieces published</p>
      </div>

      {/* Progress dots */}
      <div className="sd-progress">
        {[1, 2, 3, 4, 5].map(n => {
          const post = posts.find(p => p.seriesPosition === n)
          return (
            <div key={n} className={`sd-dot ${post ? 'filled' : 'empty'}`}>
              {n}
            </div>
          )
        })}
        <div className="sd-progress-line" />
      </div>

      {/* Posts list */}
      <div className="sd-posts">
        {posts.map(post => (
          <Link key={post.id} to={`/post/${post.slug}`} className="sd-post-card">
            <div className="sd-post-num">{post.seriesPosition}</div>
            <div className="sd-post-body">
              <h3>{post.title}</h3>
              {post.subtitle && <p>{post.subtitle}</p>}
              <span className="sd-post-date">
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="sd-post-thumb"
                onError={(e) => {
                  e.target.src = '/default-cover.jpg'
                }}
              />
            )}
          </Link>
        ))}

        {/* Placeholder for unpublished */}
        {Array.from({ length: 5 - posts.length }).map((_, i) => (
          <div key={`empty-${i}`} className="sd-post-card sd-coming-soon">
            <div className="sd-post-num">{posts.length + i + 1}</div>
            <div className="sd-post-body">
              <h3>coming soon...</h3>
              <p>this piece hasn't been written yet. subscribe to get it when it arrives.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}