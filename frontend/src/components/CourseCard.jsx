// src/components/CourseCard.jsx — REPLACE existing

import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function CourseCard({ course }) {
  const showProgress = course.is_enrolled && course.progress_pct !== undefined

  return (
    <Link to={`/courses/${course.id}`} className="card-hover block p-5 group flex flex-col h-full">
      {/* Top badges row */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {course.category && (
          <span className="badge-soft text-xs">{course.category}</span>
        )}
        {course.is_enrolled && !course.is_complete && (
          <span className="badge-teal text-xs">Enrolled</span>
        )}
        {course.is_complete && (
          <span className="badge-green text-xs">🏆 Complete</span>
        )}
        {!course.is_published && (
          <span className="badge-soft text-xs">Draft</span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-snow text-lg leading-snug group-hover:text-amber transition-colors line-clamp-2 mb-2 flex-1">
        {course.title}
      </h3>

      {/* Description */}
      {course.description && (
        <p className="text-sm text-dim line-clamp-2 mb-4">{course.description}</p>
      )}

      {/* Progress bar (enrolled students only) */}
      {showProgress && (
        <ProgressBar pct={course.progress_pct} size="sm" showLabel={false} className="mb-3" />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-line/60">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber/30 to-teal/20 flex items-center justify-center text-xs font-semibold text-amber uppercase">
            {course.instructor?.name?.charAt(0) ?? '?'}
          </div>
          <span className="text-xs text-dim truncate max-w-[120px]">{course.instructor?.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-dim">
          {course.lessons_count !== undefined && (
            <span className="flex items-center gap-1">
              📹 {course.lessons_count}
            </span>
          )}
          {showProgress && (
            <span className={`font-mono font-medium ${course.progress_pct >= 100 ? 'text-green' : 'text-soft'}`}>
              {course.progress_pct}%
            </span>
          )}
          {!showProgress && course.students_count !== undefined && (
            <span className="flex items-center gap-1">
              👥 {course.students_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
