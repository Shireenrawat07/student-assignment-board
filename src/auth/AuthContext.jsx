import { useCallback, useMemo, useState } from 'react'
import { AuthContext, SESSION_KEY } from './authContext.js'
import { demoUsers } from '../data/demoUsers.js'

function getStoredUser() {
  try {
    const email = window.localStorage.getItem(SESSION_KEY)
    return demoUsers.find((user) => user.email === email) || null
  } catch (error) {
    console.error('Unable to restore the demo session from local storage.', error)
    return null
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getStoredUser)

  const login = useCallback((email, password) => {
    const user = demoUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase() &&
        candidate.password === password,
    )

    if (!user) {
      return { success: false, error: 'The email or password is incorrect. Check the demo accounts and try again.' }
    }

    try {
      window.localStorage.setItem(SESSION_KEY, user.email)
    } catch (error) {
      console.error('Unable to save the demo session to local storage.', error)
      return { success: false, error: 'Your session could not be saved in this browser. Check your storage settings and try again.' }
    }

    setCurrentUser(user)
    return { success: true, user }
  }, [])

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(SESSION_KEY)
    } catch (error) {
      console.error('Unable to clear the demo session from local storage.', error)
    }
    setCurrentUser(null)
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
    }),
    [currentUser, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
