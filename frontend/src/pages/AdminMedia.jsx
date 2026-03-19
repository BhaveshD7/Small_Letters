import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useDropzone } from 'react-dropzone'
import './AdminMedia.css'

export default function AdminMedia() {
    const navigate = useNavigate()
    const [images, setImages] = useState([])
    const [storageStats, setStorageStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [viewMode, setViewMode] = useState('grid')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadMediaData()
    }, [])

    const loadMediaData = async () => {
        try {
            setLoading(true)
            const [imagesRes, storageRes] = await Promise.all([
                api.get('/media/images'),
                api.get('/media/storage'),
            ])

            setImages(imagesRes.data.images)
            setStorageStats(storageRes.data.stats)
        } catch (error) {
            console.error('Load media error:', error)
        } finally {
            setLoading(false)
        }
    }

    const onDrop = async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            await uploadImage(file)
        }
    }

    const uploadImage = async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        try {
            setUploading(true)
            const res = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (res.data.success) {
                loadMediaData()
            }
        } catch (err) {
            console.error('Upload error:', err)
        } finally {
            setUploading(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxSize: 5242880
    })

    const deleteImage = async (publicId) => {
        if (!confirm('Delete this image? This cannot be undone.')) return

        try {
            const encodedId = encodeURIComponent(publicId)
            await api.delete(`/media/images/${encodedId}`)
            loadMediaData()
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete image')
        }
    }

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url)
        alert('URL copied to clipboard!')
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatStorageSize = (bytes) => {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
    }

    const filteredImages = images.filter(img =>
        img.url.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="media-loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="admin-media">

            <div className="media-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/admin/dashboard')}>
                        ← Dashboard
                    </button>
                    <h1>Media Library</h1>
                    <p>Manage all your uploaded images</p>
                </div>
            </div>

            {storageStats && (
                <div className="storage-card">
                    <div className="storage-info">
                        <h3>Storage Usage</h3>
                        <p>{formatStorageSize(storageStats.used)} of {formatStorageSize(storageStats.limit)} used</p>
                    </div>
                    <div className="storage-bar">
                        <div
                            className="storage-fill"
                            style={{ width: `${storageStats.percentage}%` }}
                        />
                    </div>
                    <div className="storage-percentage">{storageStats.percentage}%</div>
                </div>
            )}

            <div className="upload-section">
                <div {...getRootProps()} className={`dropzone-large ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="uploading-state">
                            <div className="spinner"></div>
                            <p>Uploading...</p>
                        </div>
                    ) : (
                        <div className="dropzone-content">
                            <div className="upload-icon">📤</div>
                            <h3>Upload Images</h3>
                            <p>Drag & drop images here, or click to browse</p>
                            <span className="hint">PNG, JPG, WEBP • Max 5MB per file</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="media-toolbar">
                <div className="toolbar-left">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="image-count">{filteredImages.length} images</span>
                </div>

                <div className="toolbar-right">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        ⊞ Grid
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        ☰ List
                    </button>
                </div>
            </div>

            {filteredImages.length > 0 ? (
                <div className={`media-${viewMode}`}>
                    {filteredImages.map((img) => (
                        <div
                            key={img.publicId}
                            className="media-item"
                            onClick={() => setSelectedImage(img)}
                        >
                            <div className="media-thumbnail">
                                <img src={img.url} alt="" />
                            </div>
                            <div className="media-info">
                                <div className="media-details">
                                    <span className="media-size">{formatSize(img.size)}</span>
                                    <span className="media-format">{img.format.toUpperCase()}</span>
                                    <span className="media-dimensions">{img.width}×{img.height}</span>
                                </div>
                                <div className="media-actions">
                                    <button
                                        className="action-icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            copyUrl(img.url)
                                        }}
                                        title="Copy URL"
                                    >
                                        📋
                                    </button>
                                    <button
                                        className="action-icon danger"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteImage(img.publicId)
                                        }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>No images found. Upload some!</p>
                </div>
            )}

            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedImage(null)}>
                            ✕
                        </button>

                        <img src={selectedImage.url} alt="" className="modal-image" />

                        <div className="modal-details">
                            <h3>Image Details</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Size:</span>
                                    <span className="detail-value">{formatSize(selectedImage.size)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Format:</span>
                                    <span className="detail-value">{selectedImage.format.toUpperCase()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Dimensions:</span>
                                    <span className="detail-value">{selectedImage.width} × {selectedImage.height}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Uploaded:</span>
                                    <span className="detail-value">
                                        {new Date(selectedImage.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => copyUrl(selectedImage.url)}
                                >
                                    📋 Copy URL
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => {
                                        deleteImage(selectedImage.publicId)
                                        setSelectedImage(null)
                                    }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}