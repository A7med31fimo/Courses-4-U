// src/pages/RegisterPage.jsx — REPLACE existing

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorMsg, Spinner } from '../components/UI'

// ✅ Field is defined OUTSIDE RegisterPage so React never remounts it on re-render.
// The bug: defining a component inside another component means React treats it as
// a brand-new type on every render → unmount → remount → cursor lost after 1 char.
function Field({ label, name, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <input
        type={type}
        className={`input ${error ? 'border-coral/60' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'student',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const data = await register(form)
      navigate(data.user.role === 'student' ? '/' : '/dashboard')
    } catch (err) {
      setErrors(
        err.response?.data?.errors || {
          general: [err.response?.data?.message || 'Registration failed.'],
        }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="text-2xl">📚</span>
          <span className="font-display font-semibold text-snow text-xl">
            Learn<span className="text-amber">You</span>
          </span>
        </Link>

        <div className="card p-8">
          <h1 className="font-display text-2xl font-semibold text-snow mb-1">
            Create your account
          </h1>
          <p className="text-sm text-dim mb-6">Start your learning journey today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Full name"
              name="name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={set('name')}
              error={errors.name?.[0]}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email?.[0]}
            />

            {/* Role selector */}
            <div>
              <label className="input-label">I want to</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[['student', '🎓', 'Learn'], ['instructor', '🎤', 'Teach']].map(([r, icon, label]) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${form.role === r
                        ? 'border-amber/60 bg-amber/10 text-amber'
                        : 'border-line bg-card text-dim hover:text-light hover:border-line/80'
                      }`}
                  >
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set('password')}
              error={errors.password?.[0]}
            />
            <Field
              label="Confirm password"
              name="password_confirmation"
              type="password"
              placeholder="Repeat password"
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              error={errors.password_confirmation?.[0]}
            />

            {errors.general && <ErrorMsg message={errors.general[0]} />}

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg mt-2">
              {loading ? <Spinner size="sm" /> : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-dim text-center mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-amber hover:text-amber/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}