import { demoUsers } from '../data/demoUsers.js'

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
