import SubscribeForm from '../components/SubscribeForm'
import './About.css'

export default function About() {
  return (
    <div className="about-page container">

      <div className="about-mark">sl</div>
      <h1>small letters</h1>
      <p className="about-tagline">love, written down before it disappears.</p>

      <div className="about-body">
        <p>
          There's a kind of love that doesn't announce itself. It arrives in small things —
          a sentence that stays with you, a feeling you couldn't name until someone else did,
          a paragraph that says everything you'd given up trying to say.
        </p>
        <p>
          <em>Small Letters</em> is where I write that love down. Quotes, phrases, paragraphs,
          essays — all circling the same feeling, from different angles.
        </p>
        <p>
          The centrepiece is <strong>Love in Small Letters</strong> — a series in five parts,
          each part containing five pieces. It's not a story. It's more like a feeling, stretched
          out across twenty-five windows.
        </p>
        <p>
          If something here felt like it was written for you — it was.
        </p>
      </div>

      <div className="about-series-list">
        <p className="about-series-title">the series, in order</p>
        {[
          ['I', 'the beginning of love'],
          ['II', 'love that stays'],
          ['III', 'the distance between us'],
          ['IV', 'what love leaves behind'],
          ['V', 'loving yourself, finally'],
        ].map(([n, t]) => (
          <div key={n} className="about-series-item">
            <span className="about-series-num">{n}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>

      <div className="about-subscribe">
        <p className="about-subscribe-hed">get every new piece.</p>
        <SubscribeForm />
      </div>

    </div>
  )
}
