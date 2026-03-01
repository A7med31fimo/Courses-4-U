// src/layouts/Layout.jsx — REPLACE existing

import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import EmailVerificationBanner from '../components/EmailVerificationBanner'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
