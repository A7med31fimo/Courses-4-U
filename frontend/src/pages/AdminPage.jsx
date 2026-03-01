// src/pages/AdminPage.jsx
import { useEffect, useState } from 'react'
import api from '../api/axios'
import { PageSpinner, Empty, SkeletonCard } from '../components/UI'

export default function AdminPage() {
  const [users, setUsers]   = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/courses'),
    ]).then(([coursesRes]) => {
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const instructors = courses.reduce((acc, c) => {
    if (c.instructor && !acc.find(i => i.id === c.instructor.id)) acc.push(c.instructor)
    return acc
  }, [])

  if (loading) return <PageSpinner />

  return (
    <div className="page">
      <div className="mb-8 animate-fade-up">
        <p className="text-xs text-dim uppercase tracking-wider font-medium mb-1">Administration</p>
        <h1 className="font-display text-4xl font-semibold text-snow">Admin Panel</h1>
        <p className="text-dim text-sm mt-1">Platform overview and management</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 stagger">
        {[
          { label: 'Total Courses',    value: courses.length,            icon: '📚', color: 'text-amber' },
          { label: 'Published',        value: courses.filter(c=>c.is_published).length, icon: '✅', color: 'text-green' },
          { label: 'Instructors',      value: instructors.length,        icon: '🎤', color: 'text-teal' },
          { label: 'Total Students',   value: courses.reduce((s,c)=>s+(c.students_count??0), 0), icon: '👥', color: 'text-soft' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <p className={`font-display text-3xl font-semibold ${color}`}>{value}</p>
            <p className="text-xs text-dim mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* All Courses */}
        <section className="animate-fade-up">
          <h2 className="font-display text-xl font-semibold text-snow mb-4">All Courses</h2>
          {courses.length === 0 ? (
            <Empty icon="📭" title="No courses yet" />
          ) : (
            <div className="space-y-2">
              {courses.map(c => (
                <div key={c.id} className="card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-light text-sm truncate">{c.title}</p>
                    <p className="text-xs text-dim mt-0.5">{c.instructor?.name} · {c.students_count ?? 0} students · {c.lessons_count ?? 0} lessons</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.is_published
                      ? <span className="badge-green">Live</span>
                      : <span className="badge-soft">Draft</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Instructors */}
        <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-xl font-semibold text-snow mb-4">Instructors</h2>
          {instructors.length === 0 ? (
            <Empty icon="🎤" title="No instructors yet" />
          ) : (
            <div className="space-y-2">
              {instructors.map(instructor => {
                const instructorCourses = courses.filter(c => c.instructor?.id === instructor.id)
                const published = instructorCourses.filter(c => c.is_published).length
                const students  = instructorCourses.reduce((s, c) => s + (c.students_count ?? 0), 0)

                return (
                  <div key={instructor.id} className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber/30 to-teal/20 border border-line flex items-center justify-center font-display font-semibold text-amber uppercase text-sm shrink-0">
                      {instructor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-light text-sm">{instructor.name}</p>
                      <p className="text-xs text-dim">{instructor.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-soft">{instructorCourses.length} courses</p>
                      <p className="text-xs text-dim">{students} students</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Platform note */}
      <div className="mt-10 card p-5 flex items-start gap-3 animate-fade-up">
        <span className="text-xl shrink-0">ℹ️</span>
        <div>
          <p className="text-sm font-medium text-light mb-0.5">Hackathon MVP Note</p>
          <p className="text-sm text-dim">
            Full user management (create/delete users, change roles) is a post-MVP feature.
            Currently, roles are set at registration. Instructors manage their own courses from the Dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
