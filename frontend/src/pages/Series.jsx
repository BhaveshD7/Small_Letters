import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllSeries } from '../api/posts'
import { SERIES_CONFIG } from '../data/seriesConfig'
import './Series.css'

export default function Series() {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllSeries()
      .then(res => setSeries(res.data.series))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  return (
    <div className="series-page container">
      <div className="series-hero">
        <p className="series-eyebrow">a series in five parts</p>
        <h1>love in small letters</h1>
        <p className="series-tagline">
          Twenty-five pieces about the way love actually feels —<br />
          not in grand gestures, but in small, quiet, ordinary moments.
        </p>
      </div>

      <div className="series-grid">
        {SERIES_CONFIG.map((meta) => {
          const data = series.find(s => s.seriesSlug === meta.slug)
          const count = data?.count || 0

          return (
            <Link key={meta.slug} to={`/series/${meta.slug}`} className="series-card">
              <div className="series-card-num">{meta.num}</div>
              <div className="series-card-body">
                <p className="series-card-label">love in small letters · {meta.num}</p>
                <h3>{meta.title}</h3>
                <p className="series-card-desc">{meta.desc}</p>
                <div className="series-card-footer">
                  <span className="series-count">{count}/{meta.totalParts} pieces</span>
                  <span className="series-read">read series →</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}