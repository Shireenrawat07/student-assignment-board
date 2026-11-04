export const DEMO_PASSWORD = 'demo123'

export const demoUsers = [
  { id: 'admin-sharma', name: 'Dr. Sharma', email: 'sharma@college.com', password: DEMO_PASSWORD, role: 'admin' },
  { id: 'admin-mehta', name: 'Prof. Mehta', email: 'mehta@college.com', password: DEMO_PASSWORD, role: 'admin' },
  { id: 'student-aarav', name: 'Aarav', email: 'aarav@college.com', password: DEMO_PASSWORD, role: 'student' },
  { id: 'student-priya', name: 'Priya', email: 'priya@college.com', password: DEMO_PASSWORD, role: 'student' },
  { id: 'student-rahul', name: 'Rahul', email: 'rahul@college.com', password: DEMO_PASSWORD, role: 'student' },
  { id: 'student-ananya', name: 'Ananya', email: 'ananya@college.com', password: DEMO_PASSWORD, role: 'student' },
  { id: 'student-ishita', name: 'Ishita', email: 'ishita@college.com', password: DEMO_PASSWORD, role: 'student' },
]

export function getDashboardPath(role) {
  return role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
}
