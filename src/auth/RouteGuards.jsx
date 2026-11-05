import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { canAccessRole } from './authService.js'
import { getDashboardPath } from '../data/demoUsers.js'

export function RequireAuth({ allowedRole }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (!canAccessRole(currentUser, allowedRole)) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />
  }

  return <Outlet />
}

export function LoginRedirect() {
  const { currentUser } = useAuth()
  return currentUser ? <Navigate to={getDashboardPath(currentUser.role)} replace /> : <Outlet />
}

export function HomeRedirect() {
  const { currentUser } = useAuth()
  return <Navigate to={currentUser ? getDashboardPath(currentUser.role) : '/'} replace />
}
