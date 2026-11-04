export const demoUsers = [
  { id: 'admin-sharma', name: 'Dr. Sharma', email: 'sharma@college.com', password: 'Sharma@123', role: 'admin' },
  { id: 'admin-mehta', name: 'Prof. Mehta', email: 'mehta@college.com', password: 'Mehta@123', role: 'admin' },
  { id: 'student-aarav', name: 'Aarav', email: 'aarav@college.com', password: 'Aarav@123', role: 'student' },
  { id: 'student-priya', name: 'Priya', email: 'priya@college.com', password: 'Priya@123', role: 'student' },
  { id: 'student-rahul', name: 'Rahul', email: 'rahul@college.com', password: 'Rahul@123', role: 'student' },
  { id: 'student-ananya', name: 'Ananya', email: 'ananya@college.com', password: 'Ananya@123', role: 'student' },
  { id: 'student-ishita', name: 'Ishita', email: 'ishita@college.com', password: 'Ishita@123', role: 'student' },
]

export function getDashboardPath(role) {
  return role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
}
