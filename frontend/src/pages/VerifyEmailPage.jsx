// src/pages/VerifyEmailPage.jsx — NEW FILE
//
// This page is linked to from the verification email.
// Laravel sends: http://your-frontend/verify-email?id=1&hash=abc&expires=...&signature=...
// We read those params and call the backend to verify.

import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/UI'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying | success | error | already
  const [message, setMessage] = useState('')

  useEffect(() => {
    const id   = searchParams.get('id')
    const hash = searchParams.get('hash')

    if (!id || !hash) {
      setStatus('error')
      setMessage('Invalid verification link. Please request a new one.')
      return
    }

    // Call backend verification endpoint
    api.get(`/email/verify/${id}/${hash}`)
      .then(({ data }) => {
        if (data.message?.includes('already')) {
          setStatus('already')
        } else {
          setStatus('success')
          // Refresh user so email_verified flips to true
          refreshUser().catch(() => {})
        }
        setMessage(data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.')
      })
  }, [])

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center animate-fade-up">
        {status === 'verifying' && (
          <>
            <Spinner size="lg" className="mx-auto mb-4" />
            <h1 className="font-display text-2xl text-snow mb-2">Verifying your email…</h1>
            <p className="text-dim text-sm">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-display text-3xl font-semibold text-snow mb-2">Email verified!</h1>
            <p className="text-soft mb-6">Your account is now fully activated. You're ready to learn.</p>
            <Link to="/" className="btn-primary btn-lg">
              Start Learning →
            </Link>
          </>
        )}

        {status === 'already' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="font-display text-2xl font-semibold text-snow mb-2">Already verified</h1>
            <p className="text-soft mb-6">Your email is already confirmed.</p>
            <Link to="/" className="btn-ghost btn-lg">Go to courses</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="font-display text-2xl font-semibold text-snow mb-2">Verification failed</h1>
            <p className="text-soft mb-2">{message}</p>
            <p className="text-dim text-sm mb-6">Log in and use the banner to request a new verification email.</p>
            <Link to="/login" className="btn-primary btn-lg">Go to login</Link>
          </>
        )}
      </div>
    </div>
  )
}
