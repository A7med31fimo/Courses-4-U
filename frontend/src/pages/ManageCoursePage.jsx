// src/pages/ManageCoursePage.jsx

export const COURSE_CATEGORIES = [
  'Programming', 'Design', 'Business', 'Marketing',
  'Data Science', 'DevOps', 'Mobile Development',
  'Cybersecurity', 'AI & Machine Learning', 'Other',
]

// ── Helper: extract ID from any Google Drive / YouTube URL ───────
function extractVideoId(source, value) {
  const val = value.trim()
  if (source === 'google_drive') {
    // Matches: /file/d/FILE_ID/ or ?id=FILE_ID
    const m = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || val.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    return m ? m[1] : val
  }
  if (source === 'youtube') {
    // Matches: ?v=ID, youtu.be/ID, /embed/ID
    const m = val.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
    return m ? m[1] : val
  }
  return val
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { PageSpinner, ErrorMsg, SuccessMsg, Spinner, Modal } from '../components/UI'
import VideoUploader from '../components/VideoUploader'

// ── Lesson Form Modal ────────────────────────────────────────────
function LessonModal({ open, onClose, onSaved, courseId, lesson }) {
  const isEdit = !!lesson
  const [tab, setTab] = useState('upload')
  const [form, setForm] = useState({
    title: '', description: '', sort_order: 0,
    video_source: 'cloudinary',
    video_url: '', cloudinary_public_id: '', thumbnail_url: '',
    video_file_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    if (lesson) {
      const isCld = lesson.video_source === 'cloudinary' || !!lesson.cloudinary_public_id
      setTab(isCld ? 'upload' : 'manual')
      setForm({
        title: lesson.title || '', description: lesson.description || '',
        sort_order: lesson.sort_order || 0, video_source: lesson.video_source || 'cloudinary',
        video_url: lesson.video_url || '', cloudinary_public_id: lesson.cloudinary_public_id || '',
        thumbnail_url: lesson.thumbnail_url || '', video_file_id: lesson.video_file_id || '',
      })
    } else {
      setTab('upload')
      setForm({
        title: '', description: '', sort_order: 0, video_source: 'cloudinary',
        video_url: '', cloudinary_public_id: '', thumbnail_url: '', video_file_id: ''
      })
    }
  }, [lesson, open])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const switchTab = (t) => {
    setTab(t)
    if (t === 'upload') setForm(f => ({ ...f, video_source: 'cloudinary', video_file_id: '' }))
    else setForm(f => ({ ...f, video_url: '', cloudinary_public_id: '', thumbnail_url: '', video_source: 'google_drive' }))
  }

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const payload = {
        title: form.title, description: form.description, sort_order: form.sort_order,
        video_source: form.video_source,
        ...(form.video_source === 'cloudinary'
          ? { video_url: form.video_url, cloudinary_public_id: form.cloudinary_public_id, thumbnail_url: form.thumbnail_url, video_file_id: null }
          : { video_file_id: form.video_file_id }),
      }
      if (isEdit) await api.put(`/courses/${courseId}/lessons/${lesson.id}`, payload)
      else await api.post(`/courses/${courseId}/lessons`, payload)
      onSaved(); onClose()
    } catch (err) {
      const msgs = err.response?.data?.errors
      setError(msgs ? Object.values(msgs).flat().join(' ') : (err.response?.data?.message || 'Save failed.'))
    } finally { setLoading(false) }
  }

  const currentCld = (form.cloudinary_public_id || (isEdit && lesson?.cloudinary_public_id))
    ? { video_url: form.video_url, cloudinary_public_id: form.cloudinary_public_id, thumbnail_url: form.thumbnail_url }
    : null

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Lesson' : 'Add Lesson'}>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="input-label">Title *</label>
          <input className="input" value={form.title} onChange={set('title')} required placeholder="Lesson title" />
        </div>
        <div>
          <label className="input-label">Description</label>
          <textarea className="input" rows={2} value={form.description} onChange={set('description')} placeholder="What will students learn?" />
        </div>
        <div>
          <label className="input-label">Lesson Video</label>
          <div className="flex gap-1 bg-muted/40 rounded-lg p-1 mb-3 w-fit">
            {[['upload', '☁️ Upload File'], ['manual', '🔗 YouTube / Drive']].map(([t, label]) => (
              <button key={t} type="button" onClick={() => switchTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? 'bg-amber text-ink' : 'text-dim hover:text-light'}`}>
                {label}
              </button>
            ))}
          </div>
          {tab === 'upload' ? (
            <VideoUploader
              onUpload={r => setForm(f => ({ ...f, video_source: 'cloudinary', video_url: r.video_url, cloudinary_public_id: r.cloudinary_public_id, thumbnail_url: r.thumbnail_url || '' }))}
              onDelete={() => setForm(f => ({ ...f, video_url: '', cloudinary_public_id: '', thumbnail_url: '' }))}
              currentVideo={currentCld}
            />
          ) : (
            <div className="space-y-3">
              <select className="input" value={form.video_source} onChange={set('video_source')}>
                <option value="google_drive">Google Drive</option>
                <option value="youtube">YouTube</option>
                <option value="url">Direct URL</option>
              </select>

              <div>
                <input
                  className="input font-mono text-sm"
                  value={form.video_file_id}
                  onChange={(e) => {
                    const extracted = extractVideoId(form.video_source, e.target.value)
                    setForm(f => ({ ...f, video_file_id: extracted }))
                  }}
                  placeholder={
                    form.video_source === 'google_drive'
                      ? 'Paste Google Drive share link or File ID'
                      : form.video_source === 'youtube'
                        ? 'Paste YouTube URL or video ID'
                        : 'https://…'
                  }
                />
                {/* Show extracted ID preview for Drive / YouTube */}
                {form.video_file_id && form.video_source !== 'url' && (
                  <p className="text-xs text-green mt-1.5 font-mono">
                    ✓ ID: {form.video_file_id}
                  </p>
                )}
                {/* Drive sharing reminder */}
                {form.video_source === 'google_drive' && (
                  <p className="text-xs text-dim mt-1.5">
                    ⚠️ Make sure the file is set to <strong className="text-soft">"Anyone with the link can view"</strong> in Google Drive
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="input-label">Sort Order</label>
          <input className="input" type="number" min={0} value={form.sort_order} onChange={set('sort_order')} />
        </div>
        <ErrorMsg message={error} />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : (isEdit ? 'Save Changes' : 'Add Lesson')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Live Session Modal ───────────────────────────────────────────
function LiveSessionModal({ open, onClose, onSaved, courseId }) {
  const [form, setForm] = useState({ title: '', join_url: '', starts_at: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (open) { setForm({ title: '', join_url: '', starts_at: '' }); setError('') } }, [open])
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await api.post(`/courses/${courseId}/live-sessions`, form); onSaved(); onClose() }
    catch (err) { setError(err.response?.data?.message || 'Save failed.') }
    finally { setLoading(false) }
  }
  return (
    <Modal open={open} onClose={onClose} title="Schedule Live Session">
      <form onSubmit={handleSave} className="space-y-4">
        <div><label className="input-label">Title *</label><input className="input" value={form.title} onChange={set('title')} required /></div>
        <div><label className="input-label">Join URL *</label><input className="input" type="url" value={form.join_url} onChange={set('join_url')} required placeholder="https://meet.jit.si/..." /></div>
        <div><label className="input-label">Date & Time *</label><input className="input" type="datetime-local" value={form.starts_at} onChange={set('starts_at')} required /></div>
        <ErrorMsg message={error} />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? <Spinner size="sm" /> : 'Schedule'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ── Main Page ────────────────────────────────────────────────────
export default function ManageCoursePage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()

  const [form, setForm] = useState({ title: '', category: '', description: '', is_published: false })
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lessonModal, setLessonModal] = useState(false)
  const [editLesson, setEditLesson] = useState(null)
  const [liveModal, setLiveModal] = useState(false)

  useEffect(() => {
    if (!isNew) {
      api.get(`/courses/${id}`)
        .then(({ data }) => {
          const c = data.data ?? data
          setCourse(c)
          setForm({ title: c.title, category: c.category ?? '', description: c.description ?? '', is_published: c.is_published })
        })
        .catch(() => navigate('/dashboard'))
        .finally(() => setLoading(false))
    }
  }, [id])

  const refreshCourse = () => api.get(`/courses/${id}`).then(({ data }) => setCourse(data.data ?? data))
  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      if (isNew) {
        const { data } = await api.post('/courses', form)
        navigate(`/dashboard/courses/${(data.data ?? data).id}`, { replace: true })
      } else {
        await api.put(`/courses/${id}`, form)
        setSuccess('Course saved!')
        setTimeout(() => setSuccess(''), 2500)
        refreshCourse()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  const deleteLesson = async (lesson) => {
    if (!confirm(`Delete "${lesson.title}"?`)) return
    await api.delete(`/courses/${id}/lessons/${lesson.id}`)
    if (lesson.cloudinary_public_id) api.delete(`/uploads/${encodeURIComponent(lesson.cloudinary_public_id)}`).catch(() => { })
    refreshCourse()
  }

  const deleteLiveSession = async (s) => {
    if (!confirm(`Delete "${s.title}"?`)) return
    await api.delete(`/courses/${id}/live-sessions/${s.id}`)
    refreshCourse()
  }

  if (loading) return <PageSpinner />

  return (
    <div className="page max-w-3xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-light transition-colors mb-6">← Dashboard</Link>
      <h1 className="font-display text-3xl font-semibold text-snow mb-8 animate-fade-up">{isNew ? 'Create Course' : 'Edit Course'}</h1>

      {/* Course form */}
      <form onSubmit={handleSave} className="card p-6 mb-8 animate-fade-up space-y-5">
        <div>
          <label className="input-label">Course Title *</label>
          <input className="input" value={form.title} onChange={set('title')} required placeholder="e.g. Introduction to Python" />
        </div>
        <div>
          <label className="input-label">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            <option value="">— No category —</option>
            {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={set('description')} placeholder="What will students learn?" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="published" className="w-4 h-4 rounded border-line bg-card accent-amber cursor-pointer" checked={form.is_published} onChange={set('is_published')} />
          <label htmlFor="published" className="text-sm text-soft cursor-pointer select-none">Publish course (visible to students)</label>
        </div>
        <ErrorMsg message={error} />
        <SuccessMsg message={success} />
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Spinner size="sm" /> : (isNew ? 'Create Course' : 'Save Changes')}
        </button>
      </form>

      {/* Lessons */}
      {!isNew && (
        <>
          <section className="mb-8 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-snow">Lessons <span className="text-dim font-body text-sm ml-1">({course?.lessons?.length ?? 0})</span></h2>
              <button onClick={() => { setEditLesson(null); setLessonModal(true) }} className="btn-primary btn-sm">+ Add Lesson</button>
            </div>
            {!course?.lessons?.length ? (
              <div className="card p-8 text-center"><p className="text-dim text-sm">No lessons yet. Add your first video.</p></div>
            ) : (
              <div className="space-y-2">
                {course.lessons.map((lesson, i) => (
                  <div key={lesson.id} className="card p-4 flex items-center gap-4">
                    {lesson.thumbnail_url
                      ? <img src={lesson.thumbnail_url} alt="" className="w-14 h-10 rounded-md object-cover shrink-0 bg-muted" />
                      : <div className="w-14 h-10 rounded-md bg-muted flex items-center justify-center text-xs font-mono text-dim shrink-0">{i + 1 < 10 ? `0${i + 1}` : i + 1}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light text-sm truncate">{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lesson.video_source === 'cloudinary' && lesson.embed_url ? <span className="badge-amber text-xs">☁️ Cloudinary</span>
                          : lesson.video_source === 'youtube' ? <span className="badge-coral text-xs">▶ YouTube</span>
                            : lesson.video_source === 'google_drive' && lesson.embed_url ? <span className="badge-teal text-xs">📁 Drive</span>
                              : <span className="badge-soft text-xs">No video</span>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setEditLesson(lesson); setLessonModal(true) }} className="btn-ghost btn-sm">Edit</button>
                      <button onClick={() => deleteLesson(lesson)} className="btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Live Sessions */}
          <section className="animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-snow">Live Sessions <span className="text-dim font-body text-sm ml-1">({course?.live_sessions?.length ?? 0})</span></h2>
              <button onClick={() => setLiveModal(true)} className="btn-teal btn-sm">+ Schedule</button>
            </div>
            {!course?.live_sessions?.length ? (
              <div className="card p-8 text-center"><p className="text-dim text-sm">No live sessions yet.</p></div>
            ) : (
              <div className="space-y-2">
                {course.live_sessions.map(s => {
                  const date = new Date(s.starts_at)
                  return (
                    <div key={s.id} className="card p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-light text-sm">{s.title}</p>
                        <p className="text-xs text-dim mt-0.5">{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <a href={s.join_url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal font-mono truncate block mt-0.5 max-w-xs hover:underline">{s.join_url}</a>
                      </div>
                      <button onClick={() => deleteLiveSession(s)} className="btn-danger btn-sm shrink-0">Delete</button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}

      <LessonModal open={lessonModal} onClose={() => { setLessonModal(false); setEditLesson(null) }} onSaved={refreshCourse} courseId={id} lesson={editLesson} />
      <LiveSessionModal open={liveModal} onClose={() => setLiveModal(false)} onSaved={refreshCourse} courseId={id} />
    </div>
  )
}