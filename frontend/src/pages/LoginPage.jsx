// src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorMsg, Spinner } from '../components/UI'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'student' ? '/' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || 'Login failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate border-r border-line p-12">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">📚</span>
          <span className="font-display font-semibold text-snow text-xl">
            Learn<span className="text-amber">You</span>
          </span>
        </div>

        <div>
          <blockquote className="font-display text-3xl font-semibold text-snow leading-snug mb-4">
            "The beautiful thing about learning is that nobody can take it away from you."
          </blockquote>
          <p className="text-dim text-sm">— B.B. King</p>
        </div>

        <div className="flex gap-8">
          {[['50+', 'Courses'], ['1k+', 'Students'], ['20+', 'Instructors']].map(([n, l]) => (
            <div key={l}>
              <p className="font-display font-semibold text-amber text-2xl">{n}</p>
              <p className="text-xs text-dim mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">📚</span>
            <span className="font-display font-semibold text-snow text-xl">
              Learn<span className="text-amber">You</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-semibold text-snow mb-1">Welcome back</h1>
          <p className="text-sm text-dim mb-8">Sign in to continue learning</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email</label>
              <input
                type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required autoFocus
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={set('password')} required
              />
            </div>

            <ErrorMsg message={error} />

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
              {loading ? <Spinner size="sm" /> : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-dim text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber hover:text-amber/80 transition-colors font-medium">
              Create one
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 p-4 bg-card rounded-xl border border-line">
            <p className="text-xs text-dim font-medium uppercase tracking-wider mb-3">Demo accounts</p>
            <div className="space-y-2">
              {[
                ['Admin',      'admin@learnyou.com'],
                ['Instructor', 'instructor@learnyou.com'],
                ['Student',    'student@learnyou.com'],
              ].map(([role, email]) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => setForm({ email, password: 'password' })}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-xs text-soft group-hover:text-light transition-colors">{email}</span>
                  <span className={`badge text-xs ${role === 'Admin' ? 'badge-coral' : role === 'Instructor' ? 'badge-teal' : 'badge-soft'}`}>{role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
