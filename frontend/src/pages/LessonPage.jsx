// src/pages/LessonPage.jsx — REPLACE existing

import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import ProgressBar from '../components/ProgressBar'
import { PageSpinner } from '../components/UI'

function VideoPlayer({ lesson }) {
  if (!lesson.embed_url) {
    return (
      <div className="aspect-video rounded-xl bg-slate border border-line flex flex-col items-center justify-center mb-6">
        <span className="text-5xl mb-3">🎬</span>
        <p className="text-soft font-medium">No video attached yet</p>
      </div>
    )
  }

  if (lesson.is_native_video) {
    return (
      <div className="mb-6 rounded-xl overflow-hidden shadow-2xl shadow-ink/60 bg-ink">
        <video
          key={lesson.embed_url}
          src={lesson.embed_url}
          controls
          className="w-full max-h-[520px] object-contain"
          poster={lesson.thumbnail_url || undefined}
          preload="metadata"
          controlsList="nodownload"
          playsInline
        />
      </div>
    )
  }

  return (
    <div className="video-wrapper mb-6 shadow-2xl shadow-ink/60">
      <iframe
        key={lesson.embed_url}
        src={lesson.embed_url}
        title={lesson.title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isStudent = user?.role === 'student'

  const [course, setCourse] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  const { completedIds, progress, toggleComplete } = useProgress(
    isStudent ? courseId : null
  )

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/courses/${courseId}/lessons/${lessonId}`),
    ])
      .then(([courseRes, lessonRes]) => {
        setCourse(courseRes.data.data ?? courseRes.data)
        setLesson(lessonRes.data.data ?? lessonRes.data)
      })
      .catch(() => navigate(`/courses/${courseId}`))
      .finally(() => setLoading(false))
  }, [courseId, lessonId])

  if (loading) return <PageSpinner />
  if (!course || !lesson) return null

  const currentIndex = course.lessons?.findIndex(l => l.id === lesson.id) ?? 0
  const prevLesson   = currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  const nextLesson   = currentIndex < (course.lessons?.length ?? 0) - 1 ? course.lessons[currentIndex + 1] : null
  const isCompleted  = completedIds.has(lesson.id)

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="lg:w-80 xl:w-96 bg-slate border-b lg:border-b-0 lg:border-r border-line flex flex-col">
        <div className="p-4 border-b border-line shrink-0">
          <Link to={`/courses/${courseId}`} className="text-xs text-dim hover:text-amber transition-colors flex items-center gap-1 mb-2">
            ← Back to course
          </Link>
          <h2 className="font-display font-semibold text-snow text-sm leading-snug line-clamp-2">
            {course.title}
          </h2>
          {/* Course progress */}
          {isStudent && progress && (
            <div className="mt-3">
              <ProgressBar pct={progress.progress_pct} size="sm" />
              <p className="text-xs text-dim mt-1">
                {progress.completed_count} / {progress.total_lessons} lessons complete
              </p>
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="overflow-y-auto flex-1 p-2">
          {course.lessons?.map((l, i) => {
            const isActive    = l.id === lesson.id
            const isDone      = completedIds.has(l.id)

            return (
              <Link
                key={l.id}
                to={`/courses/${courseId}/lessons/${l.id}`}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all group ${
                  isActive ? 'bg-amber/10 border border-amber/20' : 'hover:bg-card border border-transparent'
                }`}
              >
                {/* Status icon */}
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 mt-0.5 transition-colors ${
                  isDone
                    ? 'bg-green/20 text-green'
                    : isActive
                    ? 'bg-amber text-ink font-bold'
                    : 'bg-muted text-dim font-mono'
                }`}>
                  {isDone ? '✓' : isActive ? '▶' : (i + 1 < 10 ? `0${i+1}` : i+1)}
                </div>

                <div className="flex-1 min-w-0">
                  {l.thumbnail_url && (
                    <img src={l.thumbnail_url} alt="" className="w-full h-10 rounded object-cover mb-1.5 opacity-80" />
                  )}
                  <p className={`text-xs font-medium leading-snug ${
                    isActive ? 'text-amber' : isDone ? 'text-soft' : 'text-soft group-hover:text-light transition-colors'
                  }`}>
                    {l.title}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Lesson header */}
          <div className="mb-5 animate-fade-up">
            <p className="text-xs text-dim mb-1 font-mono">
              Lesson {currentIndex + 1} of {course.lessons?.length ?? 0}
            </p>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="font-display text-3xl font-semibold text-snow">{lesson.title}</h1>

              {/* Mark complete button */}
              {isStudent && (
                <button
                  onClick={() => toggleComplete(lesson)}
                  className={`btn-sm shrink-0 transition-all ${
                    isCompleted
                      ? 'btn-ghost text-green border-green/30 hover:text-coral hover:border-coral/30'
                      : 'btn-ghost hover:border-green/40 hover:text-green'
                  }`}
                >
                  {isCompleted ? '✓ Completed' : 'Mark complete'}
                </button>
              )}
            </div>
          </div>

          {/* Video */}
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <VideoPlayer lesson={lesson} />
          </div>

          {/* Description */}
          {lesson.description && (
            <div className="card p-5 mb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <h3 className="font-display font-semibold text-light mb-2 text-sm uppercase tracking-wider">About this lesson</h3>
              <p className="text-soft leading-relaxed text-sm">{lesson.description}</p>
            </div>
          )}

          {/* Completion prompt */}
          {isStudent && !isCompleted && (
            <div className="card p-4 mb-6 flex items-center justify-between gap-4 border-dashed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-sm text-soft">Done with this lesson?</p>
              <button onClick={() => toggleComplete(lesson)} className="btn-primary btn-sm">
                ✓ Mark as complete
              </button>
            </div>
          )}

          {/* Course complete celebration */}
          {isStudent && progress?.is_complete && (
            <div className="card p-5 mb-6 border-green/30 bg-green/5 text-center animate-fade-up">
              <div className="text-4xl mb-2">🏆</div>
              <p className="font-display text-lg font-semibold text-green">Course Complete!</p>
              <p className="text-dim text-sm mt-1">You've finished all lessons in this course.</p>
            </div>
          )}

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            {prevLesson ? (
              <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`} className="btn-ghost flex-1 max-w-[220px] truncate">
                ← {prevLesson.title}
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="btn-primary flex-1 max-w-[220px] truncate text-right justify-end"
                onClick={() => { if (!isCompleted && isStudent) toggleComplete(lesson) }}
              >
                {nextLesson.title} →
              </Link>
            ) : (
              <Link to={`/courses/${courseId}`} className="btn-ghost">
                🎉 Back to course
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
