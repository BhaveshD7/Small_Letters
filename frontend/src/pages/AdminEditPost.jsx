import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useDropzone } from 'react-dropzone'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './AdminWrite.css'
import { SERIES_CONFIG } from '../data/seriesConfig'

const POST_TYPES = ['essay', 'quote', 'phrase', 'paragraph', 'series']

export default function AdminEditPost() {
    const navigate = useNavigate()
    const { postId } = useParams()

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

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [showPreview, setShowPreview] = useState(false)

    const [seriesMode, setSeriesMode] = useState('existing')
    const [newSeriesName, setNewSeriesName] = useState('')

    useEffect(() => {
        loadPost()
    }, [postId])

    const loadPost = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/posts/id/${postId}`)

            const post = res.data.post
            setForm({
                title: post.title || '',
                subtitle: post.subtitle || '',
                body: post.body || '',
                coverImage: post.cover_image || '',
                postType: post.post_type || 'essay',
                series: post.series || '',
                seriesPosition: post.series_position || '',
                isPremium: post.is_premium || false,
                isPublished: post.is_published || false,
                tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
                scheduledDate: post.scheduled_date ? new Date(post.scheduled_date) : null,
                seoTitle: post.seo_title || '',
                seoDescription: post.seo_description || '',
            })

            if (post.cover_image) {
                setImagePreview(post.cover_image)
            }

            if (post.series) {
                // const existingSeries = ['love-in-small-letters-i', 'love-in-small-letters-ii', 'love-in-small-letters-iii', 'love-in-small-letters-iv', 'love-in-small-letters-v']
                const existingSeries = SERIES_CONFIG.map(s => s.slug)
                if (existingSeries.includes(post.series)) {
                    setSeriesMode('existing')
                } else {
                    setSeriesMode('new')
                    setNewSeriesName(post.series)
                }
            }
        } catch (err) {
            console.error('Load error:', err)
            setError('Failed to load post')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    }

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => setImagePreview(e.target.result)
        reader.readAsDataURL(file)

        const formData = new FormData()
        formData.append('image', file)

        try {
            setUploadProgress(0)
            const res = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            setForm({ ...form, coverImage: res.data.url })
            setUploadProgress(100)
        } catch (err) {
            setError('Failed to upload image')
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1,
        maxSize: 5242880
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const payload = {
                ...form,
                series: seriesMode === 'new' && newSeriesName
                    ? newSeriesName.toLowerCase().replace(/\s+/g, '-')
                    : form.series,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                seriesPosition: form.seriesPosition ? parseInt(form.seriesPosition) : null,
            }

            await api.put(`/posts/${postId}`, payload)

            setSuccess('Post updated successfully!')
            setTimeout(() => navigate('/admin/posts'), 1500)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update post')
        } finally {
            setSaving(false)
        }
    }

    const calculateReadingTime = () => {
        const wordsPerMinute = 200
        const words = form.body.replace(/<[^>]*>/g, '').split(/\s+/).length
        return Math.ceil(words / wordsPerMinute)
    }

    if (loading) {
        return <div className="spinner">Loading post...</div>
    }

    return (
        <div className="admin-write-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <button className="btn-back" onClick={() => navigate('/admin/posts')}>
                        ← All Posts
                    </button>
                </div>

                <div className="admin-header-right">
                    <button className="btn-secondary" onClick={() => setShowPreview(!showPreview)}>
                        {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                    <button type="submit" form="edit-form" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Post'}
                    </button>
                </div>
            </div>

            {error && <div className="msg-error">{error}</div>}
            {success && <div className="msg-success">{success}</div>}

            <div className={`admin-content ${showPreview ? 'split' : 'full'}`}>
                <div className="admin-form-panel">
                    <form id="edit-form" onSubmit={handleSubmit} className="admin-form">

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

                            {form.postType === 'series' && (
                                <div className="series-section">
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
                                                📚 Existing Series
                                            </button>
                                            <button
                                                type="button"
                                                className={`choice-btn ${seriesMode === 'new' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSeriesMode('new')
                                                    setForm({ ...form, series: '' })
                                                }}
                                            >
                                                ✨ Create New Series
                                            </button>
                                        </div>
                                    </div>

                                    {seriesMode === 'existing' ? (
                                        <>
                                            <div className="field">
                                                <label>Which sub-series?</label>
                                                {/* <select name="series" value={form.series} onChange={handleChange} className="nice-select">
                                                    <option value="">— Select series —</option>
                                                    <option value="love-in-small-letters-i">I · Hidden Gestures</option>
                                                    <option value="love-in-small-letters-ii">II · Comfortable Silence</option>
                                                    <option value="love-in-small-letters-iii">III · Little Things That Nobody Else Notices</option>
                                                    <option value="love-in-small-letters-iv">IV · The Weight of Almost</option>
                                                    <option value="love-in-small-letters-v">V · Love Isn't Butterflies</option>
                                                </select> */}
                                                <select
                                                    name="series"
                                                    value={form.series}
                                                    onChange={handleChange}
                                                    className="nice-select"
                                                >
                                                    <option value="">— Select series —</option>
                                                    {SERIES_CONFIG.map(s => (
                                                        <option key={s.slug} value={s.slug}>
                                                            {s.num} · {s.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {form.series && (
                                                <div className="field">
                                                    <label>Position (1-5)</label>
                                                    <input
                                                        type="number"
                                                        name="seriesPosition"
                                                        min="1"
                                                        max="5"
                                                        value={form.seriesPosition}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="field">
                                                <label>New Series Name</label>
                                                <input
                                                    type="text"
                                                    value={newSeriesName}
                                                    onChange={(e) => setNewSeriesName(e.target.value)}
                                                    placeholder="e.g., Midnight Thoughts"
                                                />
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
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Content</h3>
                            <div className="field">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="title-input"
                                    required
                                />
                            </div>

                            <div className="field">
                                <label>Subtitle</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={form.subtitle}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Cover Image</h3>
                            <div className="image-upload-area">
                                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
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
                                            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                )}

                                <div className="or-divider"><span>OR</span></div>

                                <div className="field">
                                    <label>Image URL</label>
                                    <input
                                        type="url"
                                        name="coverImage"
                                        value={form.coverImage}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Post Body *</h3>
                            <textarea
                                name="body"
                                value={form.body}
                                onChange={handleChange}
                                rows={20}
                                className="body-textarea"
                                required
                            />
                            <div className="editor-stats">
                                <span>{calculateReadingTime()} min read</span>
                                <span>•</span>
                                <span>{form.body.split(/\s+/).length} words</span>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Tags</h3>
                            <div className="field">
                                <label>Tags</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={form.tags}
                                    onChange={handleChange}
                                    placeholder="love, longing, distance"
                                />
                            </div>
                        </div>

                        <div className="form-section collapsible">
                            <h3>SEO Settings (Optional)</h3>
                            <div className="field">
                                <label>SEO Title</label>
                                <input
                                    type="text"
                                    name="seoTitle"
                                    value={form.seoTitle}
                                    onChange={handleChange}
                                    maxLength={60}
                                />
                            </div>

                            <div className="field">
                                <label>Meta Description</label>
                                <textarea
                                    name="seoDescription"
                                    value={form.seoDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    maxLength={160}
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Publishing Options</h3>

                            <label className="checkbox-label">
                                <input type="checkbox" name="isPremium" checked={form.isPremium} onChange={handleChange} />
                                <span>Premium Content</span>
                            </label>

                            <label className="checkbox-label">
                                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                                <span>Published</span>
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

                {showPreview && (
                    <div className="admin-preview-panel">
                        <div className="preview-header">
                            <h4>Live Preview</h4>
                        </div>

                        <div className="preview-content">
                            <article className="post-preview">
                                <h1 className="preview-title">{form.title || 'Your Title Here'}</h1>
                                {form.subtitle && <p className="preview-subtitle">{form.subtitle}</p>}

                                <div className="preview-meta">
                                    <span>{calculateReadingTime()} min read</span>
                                </div>

                                {(imagePreview || form.coverImage) && (
                                    <img src={imagePreview || form.coverImage} alt="Cover" className="preview-cover" />
                                )}

                                <div
                                    className="preview-body"
                                    dangerouslySetInnerHTML={{ __html: form.body || '<p>Your content will appear here...</p>' }}
                                />
                            </article>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}