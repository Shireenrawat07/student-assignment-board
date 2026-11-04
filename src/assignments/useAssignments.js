import { useContext } from 'react'
import { AssignmentContext } from './assignmentContext.js'

export function useAssignments() {
  const context = useContext(AssignmentContext)
  if (!context) {
    throw new Error('useAssignments must be used within an AssignmentProvider.')
  }
  return context
}
