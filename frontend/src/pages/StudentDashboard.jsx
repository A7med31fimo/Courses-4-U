// src/pages/StudentDashboard.jsx — NEW FILE

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import ProgressBar from '../components/ProgressBar'
import { PageSpinner, Empty, SkeletonCard } from '../components/UI'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all') // all | in-progress | complete

  useEffect(() => {
    api.get('/student/dashboard')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  const { stats, courses } = data

  const filtered = courses.filter(c => {
    if (filter === 'in-progress') return c.progress_pct > 0 && !c.is_complete
    if (filter === 'complete')    return c.is_complete
    if (filter === 'not-started') return c.progress_pct === 0
    return true
  })

  return (
    <div className="page">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <p className="text-xs text-dim uppercase tracking-wider font-medium mb-1">Student</p>
        <h1 className="font-display text-4xl font-semibold text-snow">
          My Learning
        </h1>
        <p className="text-dim text-sm mt-1">
          Welcome back, {user.name.split(' ')[0]} 👋
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger">
        {[
          { label: 'Enrolled',          value: stats.enrolled_courses,        icon: '📚', color: 'text-amber' },
          { label: 'In Progress',        value: stats.in_progress,             icon: '▶️', color: 'text-teal' },
          { label: 'Completed',          value: stats.completed_courses,       icon: '🏆', color: 'text-green' },
          { label: 'Lessons Done',       value: stats.total_lessons_completed, icon: '✅', color: 'text-soft' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`font-display text-3xl font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-dim mt-1">{label}</p>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎓</div>
          <p className="font-display text-xl text-soft mb-2">No courses yet</p>
          <p className="text-dim text-sm mb-6">Browse and enroll to start learning.</p>
          <Link to="/" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-card rounded-lg p-1 w-fit mb-6 flex-wrap">
            {[
              ['all',         'All',          courses.length],
              ['in-progress', 'In Progress',  stats.in_progress],
              ['complete',    'Completed',    stats.completed_courses],
              ['not-started', 'Not Started',  courses.filter(c => c.progress_pct === 0).length],
            ].map(([val, label, count]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === val ? 'bg-amber text-ink' : 'text-dim hover:text-light'
                }`}
              >
                {label}
                <span className={`text-xs ${filter === val ? 'text-ink/70' : 'text-dim'}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Course grid */}
          {filtered.length === 0 ? (
            <Empty icon="🔍" title="No courses in this filter" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
              {filtered.map(course => (
                <CourseProgressCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CourseProgressCard({ course }) {
  const { progress_pct, completed_count, total_lessons, is_complete } = course

  return (
    <Link
      to={`/courses/${course.id}`}
      className="card-hover block p-5 group"
    >
      {/* Category + complete badge */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {course.category && (
          <span className="badge-soft text-xs">{course.category}</span>
        )}
        {is_complete && (
          <span className="badge-green text-xs">🏆 Complete</span>
        )}
        {progress_pct > 0 && !is_complete && (
          <span className="badge-teal text-xs">▶ In Progress</span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-snow text-base leading-snug mb-1 group-hover:text-amber transition-colors line-clamp-2">
        {course.title}
      </h3>

      {/* Instructor */}
      <p className="text-xs text-dim mb-4">by {course.instructor?.name}</p>

      {/* Progress bar */}
      <ProgressBar pct={progress_pct} size="md" showLabel={false} className="mb-2" />

      {/* Progress label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-dim">
          {completed_count} / {total_lessons} lessons
        </span>
        <span className={`font-mono font-medium ${is_complete ? 'text-green' : 'text-soft'}`}>
          {progress_pct}%
        </span>
      </div>

      {/* Enrolled date */}
      <p className="text-xs text-dim mt-3 border-t border-line/50 pt-3">
        Enrolled {new Date(course.enrolled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </Link>
  )
}
