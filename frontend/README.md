# Learn You — Frontend (React 18 + Vite)

## Stack
- React 18
- Vite 5
- React Router v6
- Axios
- Tailwind CSS 3

---

## ⚡ Quick Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Start dev server
```bash
npm run dev
# → http://localhost:5173
```

> The Vite dev server proxies `/api` requests to `http://localhost:8000`.
> Make sure the Laravel backend is running on port 8000.

### 3. Build for production
```bash
npm run build
```

---

## 🏗 Project Structure

```
src/
  api/
    axios.js          — Axios instance, token injection, 401 redirect
  context/
    AuthContext.jsx   — Global auth state (user, login, logout, register)
  layouts/
    Layout.jsx        — App shell with Navbar
  components/
    Navbar.jsx        — Top nav with role-aware links
    ProtectedRoute.jsx— Auth guard + role guard
    CourseCard.jsx    — Reusable course card
    UI.jsx            — Spinner, Modal, Empty, ErrorMsg, SkeletonCard, etc.
  pages/
    LoginPage.jsx     — Sign in with demo account shortcuts
    RegisterPage.jsx  — Register as student or instructor
    CoursesPage.jsx   — Browse/search courses; enrolled + available sections
    CourseDetailPage.jsx — Course overview, lesson list, live sessions, enroll
    LessonPage.jsx    — Video player with lesson sidebar navigation
    InstructorDashboard.jsx — Stats + course grid for instructors/admin
    ManageCoursePage.jsx    — Create/edit course, add/edit lessons, schedule live sessions
    AdminPage.jsx           — Platform-wide overview for admins
```

---

## 🎨 Design System

Fonts: **Playfair Display** (headings) + **DM Sans** (body) + **DM Mono** (code)

| Token  | Color   | Use |
|--------|---------|-----|
| `ink`  | #0D0F14 | Page background |
| `slate`| #161B26 | Navbar / sidebar |
| `card` | #1E2536 | Cards, inputs |
| `amber`| #F5A623 | Primary actions, active state |
| `teal` | #3ECFCF | Live sessions, instructor badge |
| `coral`| #FF6B6B | Admin badge, errors, danger |
| `green`| #44C87A | Enrolled, published, success |

---

## 🔐 Auth Flow

1. Token stored in `localStorage` as `token`
2. Axios interceptor attaches `Authorization: Bearer {token}` to every request
3. On 401 response → clear storage → redirect to `/login`
4. Role-based redirect after login: students → `/`, others → `/dashboard`

---

## 📱 Pages & Roles

| Page | Student | Instructor | Admin |
|------|---------|-----------|-------|
| `/` Courses | ✅ Published only | ✅ Own courses | ✅ All |
| `/courses/:id` | ✅ Enroll button | ✅ Edit button | ✅ Edit |
| `/courses/:id/lessons/:id` | ✅ If enrolled | ✅ | ✅ |
| `/dashboard` | ❌ | ✅ | ✅ |
| `/dashboard/courses/new` | ❌ | ✅ | ✅ |
| `/dashboard/courses/:id` | ❌ | ✅ Owner | ✅ |
| `/admin` | ❌ | ❌ | ✅ |
