// src/pages/CoursesPage.jsx — REPLACE existing

import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import CourseCard from '../components/CourseCard'
import { SkeletonCard, Empty } from '../components/UI'

// Debounce helper — avoids API call on every keystroke
function useDebounce(value, ms = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debouncedValue
}

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses]       = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('all')

  const debouncedSearch = useDebounce(search)

  // Re-fetch whenever search or category changes
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (category && category !== 'all') params.set('category', category)

    api.get(`/courses?${params}`)
      .then(({ data }) => {
        // New shape: { courses: [...], categories: [...] }
        if (data.courses) {
          setCourses(Array.isArray(data.courses) ? data.courses : data.courses.data ?? [])
          setCategories(data.categories ?? [])
        } else {
          // Backwards compat if old shape
          setCourses(Array.isArray(data) ? data : data.data ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [debouncedSearch, category])

  const enrolled  = courses.filter(c => c.is_enrolled)
  const available = courses.filter(c => !c.is_enrolled)

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-4xl font-semibold text-snow mb-1">
            {user.role === 'student' ? 'Explore Courses' : 'All Courses'}
          </h1>
          <p className="text-dim text-sm">
            {loading ? 'Loading…' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {(user.role === 'instructor' || user.role === 'admin') && (
          <Link to="/dashboard" className="btn-primary shrink-0">+ My Dashboard</Link>
        )}
        {user.role === 'student' && (
          <Link to="/my-learning" className="btn-ghost shrink-0">📊 My Learning</Link>
        )}
      </div>

      {/* Search bar */}
      <div className="relative mb-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim pointer-events-none">🔍</span>
        <input
          type="text"
          className="input pl-10 pr-10"
          placeholder="Search courses by title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-light transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-amber text-ink'
                  : 'bg-card border border-line text-dim hover:text-light hover:border-amber/40'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <Empty
          icon="🔍"
          title="No courses found"
          sub={search || category !== 'all' ? 'Try different search terms or clear filters' : 'No courses available yet'}
        />
      ) : (
        <>
          {/* Enrolled section */}
          {user.role === 'student' && enrolled.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-display text-xl font-semibold text-snow">Continue Learning</h2>
                <span className="badge-green">{enrolled.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {enrolled.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            </section>
          )}

          {/* Browse section */}
          <section>
            {user.role === 'student' && enrolled.length > 0 && (
              <h2 className="font-display text-xl font-semibold text-snow mb-4">Browse All</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {(user.role === 'student' ? available : courses).map(c => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
