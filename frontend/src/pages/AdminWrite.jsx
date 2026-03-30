import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../api/posts'
import { useDropzone } from 'react-dropzone'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './AdminWrite.css'
import { SERIES_CONFIG } from '../../data/seriesConfig';


const POST_TYPES = ['essay', 'quote', 'phrase', 'paragraph', 'series']

export default function AdminWrite() {
  const navigate = useNavigate()

  // Form state
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    body: '',
    coverImage: '',
    postType: 'essay',
    series: '',
    seriesPosition: '',
    isPremium: false,
    isPublished: false,
    tags: '',
    scheduledDate: null,
    seoTitle: '',
    seoDescription: '',
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [lastSaved, setLastSaved] = useState(null)

  // Series management state
  const [seriesMode, setSeriesMode] = useState('existing') // 'existing' or 'new'
  const [newSeriesName, setNewSeriesName] = useState('') // For creating new simple series

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (form.title || form.body) {
        saveDraft()
      }
    }, 30000)
    return () => clearInterval(timer)
  }, [form])

  const saveDraft = () => {
    localStorage.setItem('admin_draft', JSON.stringify(form))
    setLastSaved(new Date())
  }

  const loadDraft = () => {
    const draft = localStorage.getItem('admin_draft')
    if (draft) {
      setForm(JSON.parse(draft))
    }
  }

  const clearDraft = () => {
    localStorage.removeItem('admin_draft')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  // Image upload with drag & drop
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload to server
    const formData = new FormData()
    formData.append('image', file)

    try {
      setUploadProgress(0)
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await res.json()
      setForm({ ...form, coverImage: data.url })
      setUploadProgress(100)
    } catch (err) {
      setError('Failed to upload image')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 5242880 // 5MB
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...form,
        // If creating new series, use the custom name and convert to slug
        series: seriesMode === 'new' && newSeriesName
          ? newSeriesName.toLowerCase().replace(/\s+/g, '-')
          : form.series,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        seriesPosition: form.seriesPosition ? parseInt(form.seriesPosition) : null,
      }

      const res = await createPost(payload)
      setSuccess(`${form.isPublished ? 'Published' : 'Draft saved'} — redirecting…`)
      clearDraft()
      setTimeout(() => navigate(`/post/${res.data.post.slug}`), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate reading time
  const calculateReadingTime = () => {
    const wordsPerMinute = 200
    const words = form.body.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  // Helper function to get series title from slug
  // const getSeriesTitle = (slug) => {
  //   const titles = {
  //     'love-in-small-letters-i': 'Hidden Gestures',
  //     'love-in-small-letters-ii': 'Comfortable Silence',
  //     'love-in-small-letters-iii': 'Little Things That Nobody Else Notices',
  //     'love-in-small-letters-iv': 'The Weight of Almost',
  //     'love-in-small-letters-v': "Love Isn't Butterflies"
  //   }
  //   return titles[slug] || slug
  // }
  const getSeriesTitle = (slug) => {
    const found = SERIES_CONFIG.find(s => s.slug === slug)
    return found ? found.title : slug
  }

  return (
    <div className="admin-write-page">

      {/* Top Bar */}
      <div className="admin-header">
        <div className="admin-header-left">
          <button
            className="btn-back"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>
          <div className="auto-save-status">
            {lastSaved && (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        <div className="admin-header-right">
          <button
            className="btn-ghost1"
            onClick={loadDraft}
          >
            Restore Draft
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            type="submit"
            form="post-form"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving…' : form.isPublished ? 'Publish' : 'Save Draft'}
          </button>
        </div>
      </div>

      {error && <div className="msg-error">{error}</div>}
      {success && <div className="msg-success">{success}</div>}

      {/* Main Content - Split View */}
      <div className={`admin-content ${showPreview ? 'split' : 'full'}`}>

        {/* LEFT SIDE - Form */}
        <div className="admin-form-panel">
          <form id="post-form" onSubmit={handleSubmit} className="admin-form">

            {/* Post Type */}
            <div className="form-section">
              <h3>Post Settings</h3>

              <div className="field">
                <label>Post Type</label>
                <div className="post-type-pills">
                  {POST_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      className={`pill ${form.postType === type ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, postType: type })}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* SERIES SECTION - Only show if postType is 'series' */}
              {form.postType === 'series' && (
                <div className="series-section">

                  {/* Series Mode Toggle */}
                  <div className="field">
                    <label>Series Management</label>
                    <div className="series-choice">
                      <button
                        type="button"
                        className={`choice-btn ${seriesMode === 'existing' ? 'active' : ''}`}
                        onClick={() => {
                          setSeriesMode('existing')
                          setNewSeriesName('')
                        }}
                      >
                        Existing Series
                      </button>
                      <button
                        type="button"
                        className={`choice-btn ${seriesMode === 'new' ? 'active' : ''}`}
                        onClick={() => {
                          setSeriesMode('new')
                          setForm({ ...form, series: '' })
                        }}
                      >
                        Create New Series
                      </button>
                    </div>
                  </div>

                  {seriesMode === 'existing' ? (
                    // EXISTING SERIES - "Love in Small Letters" sub-series
                    <>
                      <div className="field">
                        <label>Which sub-series? *</label>
                        {/* <select
                          name="series"
                          value={form.series}
                          onChange={handleChange}
                          className="nice-select"
                          required
                        >
                          <option value="">— Select a sub-series —</option>
                          <option value="love-in-small-letters-i">I · Hidden Gestures</option>
                          <option value="love-in-small-letters-ii">II · Comfortable Silence</option>
                          <option value="love-in-small-letters-iii">III · Little Things That Nobody Else Notices</option>
                          <option value="love-in-small-letters-iv">IV · The Weight of Almost</option>
                          <option value="love-in-small-letters-v">V · Love Isn't Butterflies</option>
                           <option value="the-way-you-taste">The Way You Taste</option>
                        </select> */}
                        <select
                          name="series"
                          value={form.series}
                          onChange={handleChange}
                          className="nice-select"
                          required
                        >
                          <option value="">— Select a sub-series —</option>
                          {SERIES_CONFIG.map(s => (
                            <option key={s.slug} value={s.slug}>
                              {s.num} · {s.title}
                            </option>
                          ))}
                        </select>
                        <small className="field-hint">
                          Part of the main "Love in Small Letters" series
                        </small>
                      </div>

                      {/* Position in Series */}
                      {form.series && (
                        <div className="field">
                          <label>Position in this sub-series (1-5) *</label>
                          <input
                            type="number"
                            name="seriesPosition"
                            min="1"
                            max="5"
                            value={form.seriesPosition}
                            onChange={handleChange}
                            placeholder="e.g., 1"
                            required
                          />
                          <small className="field-hint">
                            ✍️ This will be piece <strong>#{form.seriesPosition || '?'}</strong> of 5 in "<strong>{getSeriesTitle(form.series)}</strong>"
                          </small>
                        </div>
                      )}

                      {/* Series Preview */}
                      {form.series && form.seriesPosition && (
                        <div className="series-preview">
                          <div className="preview-label">What you're creating:</div>
                          <div className="preview-content">
                            <strong>Love in Small Letters</strong> → <em>{getSeriesTitle(form.series)}</em> → Piece #{form.seriesPosition}/5
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // NEW SERIES - Simple standalone series
                    <>
                      <div className="field">
                        <label>New Series Name *</label>
                        <input
                          type="text"
                          value={newSeriesName}
                          onChange={(e) => setNewSeriesName(e.target.value)}
                          placeholder="e.g., Midnight Thoughts"
                          required
                        />
                        <small className="field-hint">
                          This will create a new standalone series
                        </small>
                      </div>

                      <div className="field">
                        <label>Position in series</label>
                        <input
                          type="number"
                          name="seriesPosition"
                          min="1"
                          value={form.seriesPosition}
                          onChange={handleChange}
                          placeholder="e.g., 1 (optional)"
                        />
                        <small className="field-hint">
                          Leave empty if this series doesn't need numbering
                        </small>
                      </div>

                      {/* New Series Preview */}
                      {newSeriesName && (
                        <div className="series-preview">
                          <div className="preview-label">New series you're creating:</div>
                          <div className="preview-content">
                            <strong>{newSeriesName}</strong>
                            {form.seriesPosition && ` → Piece #${form.seriesPosition}`}
                          </div>
                          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.9 }}>
                            💡 This will appear as a new promo box on the homepage
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="form-section">
              <h3>Content</h3>

              <div className="field">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter your post title..."
                  className="title-input"
                  required
                />
                <div className="field-hint">
                  {form.title.length} characters
                </div>
              </div>

              <div className="field">
                <label>Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="Optional one-liner that appears below the title"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="form-section">
              <h3>Cover Image</h3>

              <div className="image-upload-area">
                <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'active' : ''}`}
                >
                  <input {...getInputProps()} />
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImagePreview('')
                          setForm({ ...form, coverImage: '' })
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-content">
                      <svg viewBox="0 0 24 24" width="48" height="48">
                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      <p>Drag & drop an image here, or click to browse</p>
                      <span className="hint">PNG, JPG, WEBP • Max 5MB</span>
                    </div>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}

                <div className="or-divider">
                  <span>OR</span>
                </div>

                <div className="field">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="coverImage"
                    value={form.coverImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="form-section">
              <h3>Post Body *</h3>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={20}
                placeholder="Write your story here... (HTML supported)"
                className="body-textarea"
                required
              />
              <div className="editor-stats">
                <span>{calculateReadingTime()} min read</span>
                <span>•</span>
                <span>{form.body.split(/\s+/).length} words</span>
              </div>
            </div>

            {/* Tags */}
            <div className="form-section">
              <h3>Tags & Categories</h3>
              <div className="field">
                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="love, longing, distance (comma-separated)"
                />
                <div className="field-hint">
                  Popular tags: love, series, longing, distance, hope
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="form-section collapsible">
              <h3>SEO Settings (Optional)</h3>
              <div className="field">
                <label>SEO Title</label>
                <input
                  type="text"
                  name="seoTitle"
                  value={form.seoTitle}
                  onChange={handleChange}
                  placeholder="Leave blank to use post title"
                  maxLength={60}
                />
                <div className="field-hint">
                  {form.seoTitle.length}/60 characters
                </div>
              </div>

              <div className="field">
                <label>Meta Description</label>
                <textarea
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description for search engines..."
                  maxLength={160}
                />
                <div className="field-hint">
                  {form.seoDescription.length}/160 characters
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="form-section">
              <h3>Publishing Options</h3>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={form.isPremium}
                  onChange={handleChange}
                />
                <span>Premium Content (show paywall to non-subscribers)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={handleChange}
                />
                <span>Publish Immediately</span>
              </label>

              {!form.isPublished && (
                <div className="field">
                  <label>Schedule For Later</label>
                  <DatePicker
                    selected={form.scheduledDate}
                    onChange={(date) => setForm({ ...form, scheduledDate: date })}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    placeholderText="Select date and time..."
                    minDate={new Date()}
                    className="date-picker"
                  />
                </div>
              )}
            </div>

          </form>
        </div>

        {/* RIGHT SIDE - Live Preview */}
        {showPreview && (
          <div className="admin-preview-panel">
            <div className="preview-header">
              <h4>Live Preview</h4>
              <span className="preview-device">Desktop</span>
            </div>

            <div className="preview-content">
              <article className="post-preview">
                {form.postType && form.postType !== 'essay' && (
                  <div className="preview-badge">{form.postType}</div>
                )}

                <h1 className="preview-title">{form.title || 'Your Title Here'}</h1>

                {form.subtitle && (
                  <p className="preview-subtitle">{form.subtitle}</p>
                )}

                <div className="preview-meta">
                  <div className="preview-author">
                    <div className="avatar">s</div>
                    <div>
                      <div className="name">small letters</div>
                      <div className="date">
                        {new Date().toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="preview-stats">
                    {calculateReadingTime()} min read
                  </div>
                </div>

                {(imagePreview || form.coverImage) && (
                  <img
                    src={imagePreview || form.coverImage}
                    alt="Cover"
                    className="preview-cover"
                  />
                )}

                <div
                  className="preview-body"
                  dangerouslySetInnerHTML={{
                    __html: form.body || '<p>Your content will appear here...</p>'
                  }}
                />
              </article>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}