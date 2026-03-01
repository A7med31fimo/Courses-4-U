// src/hooks/useProgress.js — NEW FILE
//
// Manages lesson completion state for a single course.
// Used in LessonPage and CourseDetailPage.
//
// Returns:
//   completedIds   Set<number>   — lesson IDs the student has completed
//   progress       object        — { total_lessons, completed_count, progress_pct, is_complete }
//   toggleComplete(lesson)       — marks or unmarks a lesson
//   loading        boolean

import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export function useProgress(courseId) {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'

  const [completedIds, setCompletedIds] = useState(new Set())
  const [progress, setProgress]         = useState(null)
  const [loading, setLoading]           = useState(false)

  // Fetch progress when courseId changes (students only)
  useEffect(() => {
    if (!isStudent || !courseId) return

    setLoading(true)
    api.get(`/courses/${courseId}/progress`)
      .then(({ data }) => {
        setProgress(data)
        setCompletedIds(new Set(data.completed_lesson_ids))
      })
      .catch(() => {
        // Not enrolled or error — just show no progress
        setProgress(null)
        setCompletedIds(new Set())
      })
      .finally(() => setLoading(false))
  }, [courseId, isStudent])

  // Mark or unmark a lesson as complete
  const toggleComplete = useCallback(async (lesson) => {
    if (!isStudent) return

    const isCompleted = completedIds.has(lesson.id)
    const url = `/courses/${courseId}/lessons/${lesson.id}/complete`

    // Optimistic update
    setCompletedIds(prev => {
      const next = new Set(prev)
      isCompleted ? next.delete(lesson.id) : next.add(lesson.id)
      return next
    })

    try {
      const { data } = isCompleted
        ? await api.delete(url)
        : await api.post(url)

      // Sync with server response
      setProgress(data.progress)
      setCompletedIds(new Set(data.progress.completed_lesson_ids))
    } catch {
      // Revert on error
      setCompletedIds(prev => {
        const next = new Set(prev)
        isCompleted ? next.add(lesson.id) : next.delete(lesson.id)
        return next
      })
    }
  }, [courseId, completedIds, isStudent])

  return { completedIds, progress, loading, toggleComplete }
}
