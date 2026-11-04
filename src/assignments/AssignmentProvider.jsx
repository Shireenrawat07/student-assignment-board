import { useCallback, useMemo, useState } from 'react'
import { seedAssignments } from '../data/assignments.js'
import { AssignmentContext, SUBMISSION_STORAGE_KEY } from './assignmentContext.js'

function getStoredUpdates() {
  try {
    const stored = window.localStorage.getItem(SUBMISSION_STORAGE_KEY)
    if (!stored) return {}

    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new TypeError('Stored submission data must be an object.')
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([assignmentId, studentStatuses]) => {
        const assignment = seedAssignments.find((item) => item.id === assignmentId)
        if (!assignment || !studentStatuses || typeof studentStatuses !== 'object') return []

        const validStatuses = Object.fromEntries(
          Object.entries(studentStatuses).filter(
            ([studentId, status]) =>
              assignment.assignedStudentIds.includes(studentId) && status === 'submitted',
          ),
        )
        return Object.keys(validStatuses).length ? [[assignmentId, validStatuses]] : []
      }),
    )
  } catch (error) {
    console.error('Unable to restore assignment submissions from local storage.', error)
    return {}
  }
}

export function AssignmentProvider({ children }) {
  const [updates, setUpdates] = useState(getStoredUpdates)

  const markSubmitted = useCallback((assignmentId, studentId) => {
    const assignment = seedAssignments.find((item) => item.id === assignmentId)
    if (!assignment || !assignment.assignedStudentIds.includes(studentId)) {
      return { success: false, error: 'This assignment is not assigned to this student.' }
    }

    const existingStatus = updates[assignmentId]?.[studentId] ?? assignment.submissions[studentId]
    if (existingStatus === 'submitted') {
      return { success: false, error: 'This assignment has already been submitted.' }
    }

    const nextUpdates = {
      ...updates,
      [assignmentId]: {
        ...updates[assignmentId],
        [studentId]: 'submitted',
      },
    }

    try {
      window.localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(nextUpdates))
    } catch (error) {
      console.error('Unable to save the assignment submission to local storage.', error)
      return { success: false, error: 'Your submission could not be saved. Check your browser storage and try again.' }
    }

    setUpdates(nextUpdates)
    return { success: true }
  }, [updates])

  const value = useMemo(
    () => ({ assignments: seedAssignments, updates, markSubmitted }),
    [updates, markSubmitted],
  )

  return <AssignmentContext.Provider value={value}>{children}</AssignmentContext.Provider>
}
