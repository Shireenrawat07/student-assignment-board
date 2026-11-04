import { useCallback, useMemo, useState } from 'react'
import { seedAssignments } from '../data/assignments.js'
import { demoUsers } from '../data/demoUsers.js'
import { useAuth } from '../auth/useAuth.js'
import {
  AssignmentContext,
  ASSIGNMENTS_STORAGE_KEY,
  SUBMISSION_STORAGE_KEY,
} from './assignmentContext.js'

function isValidAssignment(assignment) {
  return Boolean(
    assignment &&
      typeof assignment.id === 'string' &&
      typeof assignment.title === 'string' &&
      typeof assignment.description === 'string' &&
      typeof assignment.dueDate === 'string' &&
      typeof assignment.driveLink === 'string' &&
      typeof assignment.creatorId === 'string' &&
      Array.isArray(assignment.assignedStudentIds) &&
      assignment.assignedStudentIds.every((studentId) =>
        demoUsers.some((user) => user.id === studentId && user.role === 'student'),
      ) &&
      assignment.submissions &&
      typeof assignment.submissions === 'object',
  )
}

function getStoredAssignments() {
  try {
    const stored = window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY)
    if (!stored) return { assignments: seedAssignments, deletedIds: [] }

    const parsed = JSON.parse(stored)
    if (!parsed || !Array.isArray(parsed.assignments) || !Array.isArray(parsed.deletedIds)) {
      throw new TypeError('Stored assignment data has an invalid format.')
    }

    const seedAssignmentsById = new Map(seedAssignments.map((assignment) => [assignment.id, assignment]))
    let didMigrate = false
    const migratedStoredAssignments = parsed.assignments.map((assignment) => {
      if (!isValidAssignment(assignment)) return assignment

      const seedAssignment = seedAssignmentsById.get(assignment.id)
      if (
        !seedAssignment ||
        (assignment.title === seedAssignment.title &&
          assignment.driveLink === seedAssignment.driveLink)
      ) {
        return assignment
      }

      didMigrate = true
      return {
        ...assignment,
        title: seedAssignment.title,
        driveLink: seedAssignment.driveLink,
      }
    })

    const assignmentsById = new Map(seedAssignments.map((assignment) => [assignment.id, assignment]))
    migratedStoredAssignments.forEach((assignment) => {
      if (isValidAssignment(assignment)) assignmentsById.set(assignment.id, assignment)
    })

    const deletedIds = parsed.deletedIds.filter((id) => typeof id === 'string')
    deletedIds.forEach((id) => assignmentsById.delete(id))

    if (didMigrate) {
      try {
        window.localStorage.setItem(
          ASSIGNMENTS_STORAGE_KEY,
          JSON.stringify({ ...parsed, assignments: migratedStoredAssignments }),
        )
      } catch (error) {
        console.error('Unable to migrate seeded assignment titles and links in local storage.', error)
      }
    }

    return { assignments: [...assignmentsById.values()], deletedIds }
  } catch (error) {
    console.error('Unable to restore assignments from local storage.', error)
    return { assignments: seedAssignments, deletedIds: [] }
  }
}

function getStoredUpdates(assignments) {
  try {
    const stored = window.localStorage.getItem(SUBMISSION_STORAGE_KEY)
    if (!stored) return {}

    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new TypeError('Stored submission data must be an object.')
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([assignmentId, studentStatuses]) => {
        const assignment = assignments.find((item) => item.id === assignmentId)
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

function getInitialState() {
  const { assignments, deletedIds } = getStoredAssignments()
  return { assignments, deletedIds, updates: getStoredUpdates(assignments) }
}

function persistAssignmentChanges(nextState, shouldSaveUpdates = false) {
  let oldAssignments
  let oldUpdates
  try {
    oldAssignments = window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY)
    oldUpdates = shouldSaveUpdates
      ? window.localStorage.getItem(SUBMISSION_STORAGE_KEY)
      : null
  } catch (error) {
    console.error('Unable to access assignment storage before saving changes.', error)
    return { success: false, error: 'Browser storage is unavailable. Check your storage settings and try again.' }
  }

  try {
    window.localStorage.setItem(
      ASSIGNMENTS_STORAGE_KEY,
      JSON.stringify({
        assignments: nextState.assignments,
        deletedIds: nextState.deletedIds,
      }),
    )
    if (shouldSaveUpdates) {
      window.localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(nextState.updates))
    }
    return { success: true }
  } catch (error) {
    console.error('Unable to save assignment changes to local storage.', error)
    try {
      if (oldAssignments === null) window.localStorage.removeItem(ASSIGNMENTS_STORAGE_KEY)
      else window.localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, oldAssignments)
      if (shouldSaveUpdates) {
        if (oldUpdates === null) window.localStorage.removeItem(SUBMISSION_STORAGE_KEY)
        else window.localStorage.setItem(SUBMISSION_STORAGE_KEY, oldUpdates)
      }
    } catch (rollbackError) {
      console.error('Unable to restore assignment storage after a failed save.', rollbackError)
    }
    return { success: false, error: 'Changes could not be saved. Check your browser storage and try again.' }
  }
}

export function AssignmentProvider({ children }) {
  const { currentUser } = useAuth()
  const [state, setState] = useState(getInitialState)

  const markSubmitted = useCallback((assignmentId, studentId) => {
    if (currentUser?.role !== 'student' || currentUser.id !== studentId) {
      return { success: false, error: 'You can only submit assignments for your own student account.' }
    }

    const assignment = state.assignments.find((item) => item.id === assignmentId)
    if (!assignment || !assignment.assignedStudentIds.includes(studentId)) {
      return { success: false, error: 'This assignment is not assigned to this student.' }
    }

    const existingStatus = state.updates[assignmentId]?.[studentId] ?? assignment.submissions[studentId]
    if (existingStatus === 'submitted') {
      return { success: false, error: 'This assignment has already been submitted.' }
    }

    const nextState = {
      ...state,
      updates: {
        ...state.updates,
        [assignmentId]: {
          ...state.updates[assignmentId],
          [studentId]: 'submitted',
        },
      },
    }

    try {
      window.localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(nextState.updates))
    } catch (error) {
      console.error('Unable to save the assignment submission to local storage.', error)
      return { success: false, error: 'Your submission could not be saved. Check your browser storage and try again.' }
    }

    setState(nextState)
    return { success: true }
  }, [currentUser, state])

  const createAssignment = useCallback((details) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Only admins can create assignments.' }
    }
    const studentIds = [...new Set(details.assignedStudentIds)]
    if (!studentIds.length) return { success: false, error: 'Select at least one student.' }
    if (studentIds.some((id) => !demoUsers.some((user) => user.id === id && user.role === 'student'))) {
      return { success: false, error: 'The student selection is invalid.' }
    }

    const assignment = {
      ...details,
      id: crypto.randomUUID(),
      creatorId: currentUser.id,
      assignedStudentIds: studentIds,
      submissions: Object.fromEntries(studentIds.map((id) => [id, 'pending'])),
    }
    const nextState = {
      ...state,
      assignments: [...state.assignments, assignment],
      deletedIds: state.deletedIds.filter((id) => id !== assignment.id),
    }
    const result = persistAssignmentChanges(nextState)
    if (result.success) setState(nextState)
    return result
  }, [currentUser, state])

  const updateAssignment = useCallback((assignmentId, details) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Only admins can edit assignments.' }
    }
    const existing = state.assignments.find((assignment) => assignment.id === assignmentId)
    if (!existing || existing.creatorId !== currentUser.id) {
      return { success: false, error: 'You can only edit assignments you created.' }
    }

    const studentIds = [...new Set(details.assignedStudentIds)]
    if (!studentIds.length) return { success: false, error: 'Select at least one student.' }
    if (studentIds.some((id) => !demoUsers.some((user) => user.id === id && user.role === 'student'))) {
      return { success: false, error: 'The student selection is invalid.' }
    }

    const submissions = Object.fromEntries(
      studentIds.map((studentId) => [
        studentId,
        existing.assignedStudentIds.includes(studentId)
          ? state.updates[assignmentId]?.[studentId] ?? existing.submissions[studentId] ?? 'pending'
          : 'pending',
      ]),
    )
    const updated = { ...existing, ...details, assignedStudentIds: studentIds, submissions }
    const nextState = {
      ...state,
      assignments: state.assignments.map((assignment) =>
        assignment.id === assignmentId ? updated : assignment,
      ),
      updates: { ...state.updates },
    }
    delete nextState.updates[assignmentId]
    const result = persistAssignmentChanges(nextState, true)
    if (result.success) setState(nextState)
    return result
  }, [currentUser, state])

  const deleteAssignment = useCallback((assignmentId) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Only admins can delete assignments.' }
    }
    const existing = state.assignments.find((assignment) => assignment.id === assignmentId)
    if (!existing || existing.creatorId !== currentUser.id) {
      return { success: false, error: 'You can only delete assignments you created.' }
    }

    const nextState = {
      ...state,
      assignments: state.assignments.filter((assignment) => assignment.id !== assignmentId),
      deletedIds: [...new Set([...state.deletedIds, assignmentId])],
      updates: { ...state.updates },
    }
    delete nextState.updates[assignmentId]
    const result = persistAssignmentChanges(nextState, true)
    if (result.success) setState(nextState)
    return result
  }, [currentUser, state])

  const value = useMemo(
    () => ({
      assignments: state.assignments,
      updates: state.updates,
      markSubmitted,
      createAssignment,
      updateAssignment,
      deleteAssignment,
    }),
    [state, markSubmitted, createAssignment, updateAssignment, deleteAssignment],
  )

  return <AssignmentContext.Provider value={value}>{children}</AssignmentContext.Provider>
}
