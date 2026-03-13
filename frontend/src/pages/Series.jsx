import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllSeries } from '../api/posts'
import './Series.css'

const SERIES_META = {
  'love-in-small-letters-i': { num: 'I', title: 'Hidden Gestures', desc: 'The things I do that she\'ll never see. Small acts of care that exist in silence, unnoticed and unspoken.' },
  'love-in-small-letters-ii': { num: 'II', title: 'Comfortable silence', desc: 'When words become optional and presence says everything. The evolution of quiet between two people learning to just exist together.' },
  'love-in-small-letters-iii': { num: 'III', title: 'Small Things That Nobody Else Notices', desc: 'Tiny details the world walks past but I memorize. The microscopic language of someone I\'ve learned to read.Letters written across silence, across distance, across time zones and missed calls.' },
  'love-in-small-letters-iv': { num: 'IV', title: 'The Weight of Almost', desc: 'Endings that aren\'t really endings. What remains when the feeling has been felt.' },
  'love-in-small-letters-v': { num: 'V', title: 'Love isn\'t Butterflies', desc: 'Love isn\'t butterflies for me anymore. It\'s deeper than that. It\'s comfort. It\'s showing up. It\'s choosing someone on ordinary days.' },
}

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
        {Object.entries(SERIES_META).map(([slug, meta], idx) => {
          const data = series.find(s => s.seriesSlug === slug)
          const count = data?.count || 0

          return (
            <Link key={slug} to={`/series/${slug}`} className="series-card">
              <div className="series-card-num">{meta.num}</div>
              <div className="series-card-body">
                <p className="series-card-label">love in small letters · {meta.num}</p>
                <h3>{meta.title}</h3>
                <p className="series-card-desc">{meta.desc}</p>
                <div className="series-card-footer">
                  <span className="series-count">{count}/5 pieces</span>
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
