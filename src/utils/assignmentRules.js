import { demoUsers } from '../data/seedData.js'

export function authenticateDemoUser(email, password) {
  return (
    demoUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    ) ?? null
  )
}

export function canAccessRole(user, allowedRole) {
  return Boolean(user && (!allowedRole || user.role === allowedRole))
}

export function getAssignmentsForAdmin(assignments, currentUser) {
  return currentUser?.role === 'admin'
    ? assignments.filter((assignment) => assignment.creatorId === currentUser.id)
    : []
}

export function getAssignmentsForStudent(assignments, currentUser) {
  return currentUser?.role === 'student'
    ? assignments.filter((assignment) => assignment.assignedStudentIds.includes(currentUser.id))
    : []
}

export function canManageAssignment(assignment, currentUser) {
  return currentUser?.role === 'admin' && assignment?.creatorId === currentUser.id
}

export function createAssignmentRecord(details, currentUser) {
  if (currentUser?.role !== 'admin') {
    return { success: false, error: 'Only admins can create assignments.' }
  }

  const studentIds = [...new Set(details.assignedStudentIds)]
  if (!studentIds.length) {
    return { success: false, error: 'Select at least one student.' }
  }
  if (studentIds.some((id) => !demoUsers.some((user) => user.id === id && user.role === 'student'))) {
    return { success: false, error: 'The student selection is invalid.' }
  }

  return {
    success: true,
    assignment: {
      ...details,
      id: crypto.randomUUID(),
      creatorId: currentUser.id,
      assignedStudentIds: studentIds,
      submissions: Object.fromEntries(studentIds.map((id) => [id, 'pending'])),
    },
  }
}

export function createSubmissionUpdate(assignment, updates, studentId, currentUser) {
  if (currentUser?.role !== 'student' || currentUser.id !== studentId) {
    return { success: false, error: 'You can only submit assignments for your own student account.' }
  }
  if (!assignment || !assignment.assignedStudentIds.includes(studentId)) {
    return { success: false, error: 'This assignment is not assigned to this student.' }
  }

  const existingStatus = updates[assignment.id]?.[studentId] ?? assignment.submissions[studentId]
  if (existingStatus === 'submitted') {
    return { success: false, error: 'This assignment has already been submitted.' }
  }

  return {
    success: true,
    updates: {
      ...updates,
      [assignment.id]: {
        ...updates[assignment.id],
        [studentId]: 'submitted',
      },
    },
  }
}
