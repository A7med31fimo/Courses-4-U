// src/pages/CourseDetailPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageSpinner, ErrorMsg, Spinner } from '../components/UI'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('lessons')

  const fetchCourse = () => {
    setLoading(true)
    api.get(`/courses/${id}`)
      .then(({ data }) => setCourse(data.data ?? data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCourse() }, [id])

  const handleEnroll = async () => {
    setEnrolling(true)
    setError('')
    try {
      await api.post(`/courses/${id}/enroll`)
      fetchCourse()
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <PageSpinner />
  if (!course) return null

  const isOwner = user.role === 'admin' || (user.role === 'instructor' && course.instructor?.id === user.id)
  const canWatch = user.role !== 'student' || course.is_enrolled

  return (
    <div className="page max-w-4xl">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-light transition-colors mb-6">
        ← Back to courses
      </Link>

      {/* Course header */}
      <div className="animate-fade-up">
        <div className="flex items-start gap-3 mb-3 flex-wrap">
          {course.is_published
            ? <span className="badge-green">Published</span>
            : <span className="badge-soft">Draft</span>}
          {course.is_enrolled && <span className="badge-teal">✓ Enrolled</span>}
        </div>

        <h1 className="font-display text-4xl font-semibold text-snow leading-tight mb-3">
          {course.title}
        </h1>

        {course.description && (
          <p className="text-soft leading-relaxed mb-4 max-w-2xl">{course.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-dim mb-6">
          {course.instructor && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber/30 to-teal/20 flex items-center justify-center text-xs font-semibold text-amber uppercase">
                {course.instructor.name.charAt(0)}
              </div>
              {course.instructor.name}
            </div>
          )}
          <span>📹 {course.lessons?.length ?? 0} lessons</span>
          <span>👥 {course.students_count ?? 0} students</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          {user.role === 'student' && !course.is_enrolled && course.is_published && (
            <button onClick={handleEnroll} disabled={enrolling} className="btn-primary btn-lg">
              {enrolling ? <Spinner size="sm" /> : 'Enroll Now — Free'}
            </button>
          )}
          {canWatch && (course.lessons?.length ?? 0) > 0 && (
            <Link
              to={`/courses/${id}/lessons/${course.lessons[0].id}`}
              className="btn-ghost btn-lg"
            >
              ▶ Start Watching
            </Link>
          )}
          {isOwner && (
            <Link to={`/dashboard/courses/${id}`} className="btn-ghost btn-lg">
              ✏️ Edit Course
            </Link>
          )}
        </div>

        {error && <ErrorMsg message={error} />}
      </div>

      <div className="divider" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 w-fit">
        {['lessons', 'live sessions'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-amber text-ink' : 'text-dim hover:text-light'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Lessons tab */}
      {tab === 'lessons' && (
        <div className="space-y-2 stagger">
          {!course.lessons?.length ? (
            <p className="text-dim text-sm py-8 text-center">No lessons yet.</p>
          ) : course.lessons.map((lesson, i) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={i + 1}
              courseId={id}
              canWatch={canWatch}
            />
          ))}
        </div>
      )}

      {/* Live sessions tab */}
      {tab === 'live sessions' && (
        <div className="space-y-3 stagger">
          {!course.live_sessions?.length ? (
            <p className="text-dim text-sm py-8 text-center">No live sessions scheduled.</p>
          ) : course.live_sessions.map(session => (
            <LiveSessionRow key={session.id} session={session} canView={canWatch} />
          ))}
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson, index, courseId, canWatch }) {
  const hasVideo = !!lesson.embed_url

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
      canWatch
        ? 'card-hover cursor-pointer'
        : 'bg-slate border-line opacity-60'
    }`}>
      {/* Number */}
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-mono font-medium text-dim shrink-0">
        {index < 10 ? `0${index}` : index}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {canWatch ? (
          <Link
            to={`/courses/${courseId}/lessons/${lesson.id}`}
            className="font-medium text-light hover:text-amber transition-colors block truncate"
          >
            {lesson.title}
          </Link>
        ) : (
          <p className="font-medium text-dim truncate">{lesson.title}</p>
        )}
        {lesson.description && (
          <p className="text-xs text-dim mt-0.5 line-clamp-1">{lesson.description}</p>
        )}
      </div>

      {/* Badge */}
      <div className="shrink-0">
        {!canWatch
          ? <span className="text-dim text-sm">🔒</span>
          : hasVideo
          ? <span className="badge-teal text-xs">▶ Video</span>
          : <span className="badge-soft text-xs">No video</span>}
      </div>
    </div>
  )
}

function LiveSessionRow({ session, canView }) {
  const date = new Date(session.starts_at)
  const isPast = date < new Date()

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="font-medium text-light mb-1">{session.title}</p>
        <div className="flex items-center gap-3 text-xs text-dim">
          <span>📅 {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span>🕐 {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          {isPast && <span className="badge-soft">Past</span>}
        </div>
      </div>
      {canView && (
        <a
          href={session.join_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-sm shrink-0 ${isPast ? 'btn-ghost opacity-50' : 'btn-teal'}`}
        >
          {isPast ? 'Recording?' : '🎥 Join Session'}
        </a>
      )}
    </div>
  )
}
