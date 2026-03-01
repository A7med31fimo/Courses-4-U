// src/pages/InstructorDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { PageSpinner, Empty, SkeletonCard } from '../components/UI'

export default function InstructorDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => setCourses(Array.isArray(data) ? data : data.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const published = courses.filter(c => c.is_published)
  const drafts    = courses.filter(c => !c.is_published)

  const totalStudents = courses.reduce((s, c) => s + (c.students_count ?? 0), 0)
  const totalLessons  = courses.reduce((s, c) => s + (c.lessons_count ?? 0), 0)

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-up">
        <div>
          <p className="text-xs text-dim uppercase tracking-wider font-medium mb-1">
            {user.role === 'admin' ? 'Admin view' : 'Instructor'}
          </p>
          <h1 className="font-display text-4xl font-semibold text-snow">My Dashboard</h1>
        </div>
        <Link to="/dashboard/courses/new" className="btn-primary shrink-0">
          + New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger">
        {[
          { label: 'Total Courses', value: courses.length, icon: '📚' },
          { label: 'Published',     value: published.length, icon: '✅' },
          { label: 'Students',      value: totalStudents, icon: '👥' },
          { label: 'Lessons',       value: totalLessons, icon: '📹' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4">
            <div className="text-2xl mb-2">{icon}</div>
            <p className="font-display text-2xl font-semibold text-snow">{value}</p>
            <p className="text-xs text-dim mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <Empty icon="📝" title="No courses yet" sub="Create your first course to get started." />
      ) : (
        <>
          {published.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display text-xl font-semibold text-snow mb-4 flex items-center gap-2">
                Published <span className="badge-green">{published.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {published.map(c => <DashboardCourseCard key={c.id} course={c} />)}
              </div>
            </section>
          )}
          {drafts.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-snow mb-4 flex items-center gap-2">
                Drafts <span className="badge-soft">{drafts.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {drafts.map(c => <DashboardCourseCard key={c.id} course={c} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function DashboardCourseCard({ course }) {
  return (
    <div className="card-hover p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display font-semibold text-snow text-base leading-snug line-clamp-2 flex-1">
          {course.title}
        </h3>
        {course.is_published
          ? <span className="badge-green shrink-0">Live</span>
          : <span className="badge-soft shrink-0">Draft</span>}
      </div>

      <p className="text-xs text-dim line-clamp-2 mb-4">{course.description || 'No description.'}</p>

      <div className="flex items-center gap-3 text-xs text-dim mb-4">
        <span>📹 {course.lessons_count ?? 0} lessons</span>
        <span>👥 {course.students_count ?? 0} students</span>
      </div>

      <div className="flex gap-2">
        <Link to={`/dashboard/courses/${course.id}`} className="btn-ghost btn-sm flex-1 justify-center">
          ✏️ Edit
        </Link>
        <Link to={`/courses/${course.id}`} className="btn-ghost btn-sm flex-1 justify-center">
          👁 View
        </Link>
      </div>
    </div>
  )
}
