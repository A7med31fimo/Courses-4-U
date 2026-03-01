// src/components/EmailVerificationBanner.jsx — NEW FILE

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function EmailVerificationBanner() {
  const { user, resendVerification } = useAuth()
  const [sent, setSent]   = useState(false)
  const [busy, setBusy]   = useState(false)

  // Only show for unverified users
  if (!user || user.email_verified) return null

  const handleResend = async () => {
    setBusy(true)
    try {
      await resendVerification()
      setSent(true)
    } catch {}
    finally { setBusy(false) }
  }

  return (
    <div className="bg-amber/10 border-b border-amber/20 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span>✉️</span>
          <span className="text-amber font-medium">Verify your email</span>
          <span className="text-dim hidden sm:inline">
            — check your inbox at <span className="text-soft font-mono">{user.email}</span>
          </span>
        </div>
        {sent ? (
          <span className="text-xs text-green font-medium">Email sent ✓</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={busy}
            className="text-xs text-amber hover:text-amber/80 font-medium underline underline-offset-2 transition-colors shrink-0"
          >
            {busy ? 'Sending…' : 'Resend email'}
          </button>
        )}
      </div>
    </div>
  )
}
