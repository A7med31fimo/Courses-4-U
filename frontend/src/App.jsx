// src/App.jsx
// EMAIL VERIFICATION: VerifyEmailPage route commented out until mail service is purchased

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './layouts/Layout'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
// import VerifyEmailPage   from './pages/VerifyEmailPage'  // DISABLED
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonPage from './pages/LessonPage'
import StudentDashboard from './pages/StudentDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import ManageCoursePage from './pages/ManageCoursePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* DISABLED: email verify route — uncomment when mail service is ready */}
          {/* <Route path="/verify-email" element={<VerifyEmailPage />} /> */}

          {/* Protected — all roles */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />

              {/* Student only */}
              <Route element={<ProtectedRoute roles={['student']} />}>
                <Route path="/my-learning" element={<StudentDashboard />} />
              </Route>

              {/* Instructor + Admin */}
              <Route element={<ProtectedRoute roles={['instructor', 'admin']} />}>
                <Route path="/dashboard" element={<InstructorDashboard />} />
                <Route path="/dashboard/courses/new" element={<ManageCoursePage />} />
                <Route path="/dashboard/courses/:id" element={<ManageCoursePage />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}