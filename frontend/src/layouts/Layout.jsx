// src/layouts/Layout.jsx
// EMAIL VERIFICATION: banner hidden until mail service is purchased

import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
// import EmailVerificationBanner from '../components/EmailVerificationBanner' // DISABLED

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <Navbar />
      {/* <EmailVerificationBanner /> */}{/* DISABLED: uncomment when mail service is ready */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}