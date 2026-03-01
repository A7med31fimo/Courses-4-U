// src/components/VideoUploader.jsx
//
// A complete self-contained video upload component.
//
// Flow:
//   1. User drops or selects a video file
//   2. Component calls POST /api/uploads/sign to get a Cloudinary signature
//   3. Browser uploads DIRECTLY to Cloudinary (not via your server)
//   4. On success, calls onUpload({ video_url, cloudinary_public_id, thumbnail_url })
//   5. Parent stores those values in the lesson form and sends them to Laravel
//
// Props:
//   onUpload(result)   — called with Cloudinary result when upload completes
//   onDelete()         — called when user removes the current video
//   currentVideo       — { video_url, thumbnail_url, cloudinary_public_id } or null
//   disabled           — disable the component

import { useCallback, useRef, useState } from 'react'
import api from '../api/axios'

const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
const MAX_SIZE_MB = 500

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoUploader({ onUpload, onDelete, currentVideo, disabled }) {
  const inputRef          = useRef(null)
  const [dragging, setDragging]       = useState(false)
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState(null)      // local object URL
  const [progress, setProgress]       = useState(0)
  const [status, setStatus]           = useState('idle')    // idle | uploading | success | error
  const [error, setError]             = useState('')
  const [cloudResult, setCloudResult] = useState(currentVideo || null)

  // ── Validation ─────────────────────────────────────────────────
  const validate = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Unsupported format. Use MP4, WebM, OGG, MOV, or AVI.'
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Max ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  // ── File picked ───────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    setError('')
    const validationError = validate(f)
    if (validationError) { setError(validationError); return }

    setFile(f)
    setStatus('idle')
    setProgress(0)
    const objectUrl = URL.createObjectURL(f)
    setPreview(objectUrl)
  }, [])

  // ── Drag events ───────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true)  }
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false) }
  const onDrop      = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  // ── Upload to Cloudinary ──────────────────────────────────────
  const upload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    setError('')

    try {
      // 1. Get signed params from our Laravel backend
      const { data: signData } = await api.post('/uploads/sign', {
        folder: 'learn-you/lessons',
      })

      // 2. Build multipart form for Cloudinary
      const formData = new FormData()
      formData.append('file',       file)
      formData.append('api_key',    signData.api_key)
      formData.append('timestamp',  signData.timestamp)
      formData.append('signature',  signData.signature)
      formData.append('folder',     signData.folder)
      formData.append('resource_type', 'video')

      // 3. Upload directly to Cloudinary with XHR (for progress tracking)
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(`Cloudinary error: ${xhr.responseText}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error during upload.')))

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signData.cloud_name}/video/upload`)
        xhr.send(formData)
      })

      // 4. Build result object to return to parent
      const uploadResult = {
        video_url:            result.secure_url,
        cloudinary_public_id: result.public_id,
        thumbnail_url:        result.secure_url.replace(/\.[^/.]+$/, '.jpg').replace('/upload/', '/upload/so_0/'),
        duration:             result.duration,
        format:               result.format,
        bytes:                result.bytes,
      }

      setCloudResult(uploadResult)
      setStatus('success')
      onUpload(uploadResult)

    } catch (err) {
      setStatus('error')
      setError(err.message || 'Upload failed. Please try again.')
    }
  }

  // ── Remove / reset ────────────────────────────────────────────
  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setProgress(0)
    setStatus('idle')
    setError('')
    setCloudResult(null)
    onDelete?.()
    if (inputRef.current) inputRef.current.value = ''
  }

  // ── Render: already has an uploaded Cloudinary video ─────────
  if (cloudResult?.video_url && status !== 'idle') {
    return (
      <div className="rounded-xl border border-green/30 bg-green/5 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green/20 flex items-center justify-center text-green">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium text-green">Video uploaded</p>
              {file && <p className="text-xs text-dim">{file.name} · {formatBytes(file.size)}</p>}
            </div>
          </div>
          <button onClick={handleRemove} className="btn-ghost btn-sm text-xs">
            Replace
          </button>
        </div>

        {/* Preview player */}
        <video
          src={cloudResult.video_url}
          controls
          className="w-full rounded-lg bg-ink max-h-48 object-contain"
          preload="metadata"
        />
      </div>
    )
  }

  // ── Render: current video from DB (edit mode) ─────────────────
  if (currentVideo?.video_url && !file && status === 'idle') {
    return (
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center text-teal">▶</div>
            <div>
              <p className="text-sm font-medium text-light">Video attached</p>
              <p className="text-xs text-dim font-mono truncate max-w-[200px]">{currentVideo.cloudinary_public_id}</p>
            </div>
          </div>
          <button onClick={handleRemove} className="btn-danger btn-sm text-xs">
            Remove
          </button>
        </div>
        <video
          src={currentVideo.video_url}
          controls
          className="w-full rounded-lg bg-ink max-h-48 object-contain"
          preload="metadata"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer select-none
            ${dragging
              ? 'border-amber bg-amber/5 scale-[1.01]'
              : 'border-line hover:border-amber/50 hover:bg-card/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            disabled={disabled}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="text-4xl mb-3 transition-transform" style={{ transform: dragging ? 'scale(1.15)' : 'scale(1)' }}>
            {dragging ? '⬇️' : '🎬'}
          </div>
          <p className="font-medium text-light text-sm mb-1">
            {dragging ? 'Drop to upload' : 'Drag & drop your video here'}
          </p>
          <p className="text-xs text-dim mb-3">or click to browse</p>
          <p className="text-xs text-dim">MP4, WebM, MOV, AVI · Max {MAX_SIZE_MB} MB</p>
        </div>
      ) : (
        // File selected — show preview + upload button
        <div className="border border-line rounded-xl bg-card overflow-hidden">
          {/* Video preview */}
          <div className="relative bg-ink">
            <video
              src={preview}
              className="w-full max-h-52 object-contain"
              preload="metadata"
              onLoadedMetadata={(e) => {
                // You can read duration here if needed
              }}
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/80 backdrop-blur text-light hover:text-coral flex items-center justify-center text-sm transition-colors"
            >
              ×
            </button>
          </div>

          <div className="p-4">
            {/* File info */}
            <div className="flex items-center justify-between mb-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-light truncate">{file.name}</p>
                <p className="text-xs text-dim mt-0.5">{formatBytes(file.size)}</p>
              </div>
              <span className="badge-soft text-xs ml-3 shrink-0 uppercase">{file.type.split('/')[1]}</span>
            </div>

            {/* Progress bar */}
            {status === 'uploading' && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-dim mb-1.5">
                  <span>Uploading to Cloudinary…</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-coral/10 border border-coral/20 text-coral text-xs rounded-lg px-3 py-2 mb-3">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleRemove}
                className="btn-ghost btn-sm flex-1"
                disabled={status === 'uploading'}
              >
                Cancel
              </button>
              <button
                onClick={upload}
                disabled={status === 'uploading' || disabled}
                className="btn-primary btn-sm flex-1"
              >
                {status === 'uploading' ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {progress}%
                  </span>
                ) : status === 'error' ? (
                  'Retry Upload'
                ) : (
                  '☁️ Upload Video'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idle error (validation) */}
      {error && status === 'idle' && (
        <p className="text-xs text-coral">{error}</p>
      )}
    </div>
  )
}
