import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canManageAssignment,
  createAssignmentRecord,
  createSubmissionUpdate,
  getAssignmentsForAdmin,
  getAssignmentsForStudent,
  getPendingSubmissionCount,
} from '../src/utils/assignmentRules.js'
import { demoUsers, seedAssignments } from '../src/data/seedData.js'

const admin = demoUsers.find((user) => user.id === 'admin-sharma')
const student = demoUsers.find((user) => user.id === 'student-aarav')
const assignmentDetails = {
  title: 'Test assignment',
  description: 'A focused rules test.',
  dueDate: '2026-12-01',
  driveLink: 'https://drive.google.com/file/d/example',
  assignedStudentIds: [student.id, student.id],
}

test('admin can create an assignment for selected students', () => {
  const result = createAssignmentRecord(assignmentDetails, admin)

  assert.equal(result.success, true)
  assert.equal(result.assignment.creatorId, admin.id)
  assert.equal(result.assignment.assignedStudentIds.length, 1)
  assert.equal(result.assignment.submissions[student.id], 'pending')
})

test('students cannot create assignments and invalid assignees are rejected', () => {
  assert.equal(createAssignmentRecord(assignmentDetails, student).success, false)
  assert.equal(
    createAssignmentRecord(
      { ...assignmentDetails, assignedStudentIds: ['admin-sharma'] },
      admin,
    ).success,
    false,
  )
})

test('assignment creation requires students and initializes each selected student', () => {
  const secondStudent = demoUsers.find((user) => user.id === 'student-priya')
  const emptySelection = createAssignmentRecord(
    { ...assignmentDetails, assignedStudentIds: [] },
    admin,
  )
  const selectedStudents = createAssignmentRecord(
    { ...assignmentDetails, assignedStudentIds: [student.id, secondStudent.id] },
    admin,
  )

  assert.equal(emptySelection.success, false)
  assert.deepEqual(selectedStudents.assignment.assignedStudentIds, [student.id, secondStudent.id])
  assert.deepEqual(selectedStudents.assignment.submissions, {
    [student.id]: 'pending',
    [secondStudent.id]: 'pending',
  })
})

test('admins and students only receive assignments within their scope', () => {
  const secondAdmin = demoUsers.find((user) => user.id === 'admin-mehta')
  const adminAssignments = getAssignmentsForAdmin(seedAssignments, admin)
  const studentAssignments = getAssignmentsForStudent(seedAssignments, student)

  assert.ok(adminAssignments.length > 0)
  assert.ok(adminAssignments.every((assignment) => assignment.creatorId === admin.id))
  assert.ok(studentAssignments.length > 0)
  assert.ok(studentAssignments.every((assignment) => assignment.assignedStudentIds.includes(student.id)))
  assert.deepEqual(getAssignmentsForAdmin(seedAssignments, student), [])
  assert.deepEqual(getAssignmentsForStudent(seedAssignments, admin), [])
  assert.equal(getAssignmentsForAdmin(seedAssignments, secondAdmin).some((item) => adminAssignments.includes(item)), false)
  assert.equal(canManageAssignment(seedAssignments[0], admin), true)
  assert.equal(canManageAssignment(seedAssignments[0], secondAdmin), false)
  assert.equal(canManageAssignment(seedAssignments[0], student), false)
})

test('a student can submit only their own assigned work once', () => {
  const assignment = {
    id: 'assignment-one',
    assignedStudentIds: [student.id],
    submissions: { [student.id]: 'pending' },
  }
  const result = createSubmissionUpdate(assignment, {}, student.id, student)

  assert.equal(result.success, true)
  assert.equal(result.updates[assignment.id][student.id], 'submitted')
  assert.equal(createSubmissionUpdate(assignment, {}, student.id, admin).success, false)
  assert.equal(
    createSubmissionUpdate(
      { ...assignment, assignedStudentIds: [] },
      {},
      student.id,
      student,
    ).success,
    false,
  )
  assert.equal(
    createSubmissionUpdate(
      assignment,
      { [assignment.id]: { [student.id]: 'submitted' } },
      student.id,
      student,
    ).success,
    false,
  )
})

test('submission preserves other students updates and respects seeded submitted status', () => {
  const secondStudent = demoUsers.find((user) => user.id === 'student-priya')
  const assignment = {
    id: 'assignment-with-existing-progress',
    assignedStudentIds: [student.id, secondStudent.id],
    submissions: {
      [student.id]: 'pending',
      [secondStudent.id]: 'submitted',
    },
  }
  const existingUpdates = {
    [assignment.id]: { [secondStudent.id]: 'submitted' },
  }
  const result = createSubmissionUpdate(assignment, existingUpdates, student.id, student)

  assert.equal(result.success, true)
  assert.deepEqual(result.updates[assignment.id], {
    [student.id]: 'submitted',
    [secondStudent.id]: 'submitted',
  })
  assert.equal(
    createSubmissionUpdate(assignment, {}, secondStudent.id, secondStudent).success,
    false,
  )
})

test('pending submission count matches outstanding work and excludes assignments with no students', () => {
  const secondStudent = demoUsers.find((user) => user.id === 'student-priya')
  const assignment = {
    id: 'assignment-progress',
    assignedStudentIds: [student.id, secondStudent.id],
    submissions: {
      [student.id]: 'submitted',
      [secondStudent.id]: 'pending',
    },
  }

  assert.equal(getPendingSubmissionCount(assignment), 1)
  assert.equal(
    getPendingSubmissionCount(assignment, {
      [assignment.id]: { [secondStudent.id]: 'submitted' },
    }),
    0,
  )
  assert.equal(
    getPendingSubmissionCount({ ...assignment, assignedStudentIds: [] }),
    0,
  )
})
