import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { HomeRedirect, LoginRedirect, RequireAuth } from './auth/RouteGuards.jsx'
import { AssignmentProvider } from './assignments/AssignmentProvider.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

const THEME_STORAGE_KEY = 'student-assignment-board-theme-v1'

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  } catch (error) {
    console.error('Unable to restore the appearance preference from local storage.', error)
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.error('Unable to save the appearance preference to local storage.', error)
    }
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AssignmentProvider>
          <Routes>
            <Route element={<LoginRedirect />}>
              <Route path="/" element={<LoginPage theme={theme} onToggleTheme={toggleTheme} />} />
            </Route>
            <Route element={<RequireAuth allowedRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard theme={theme} onToggleTheme={toggleTheme} />} />
            </Route>
            <Route element={<RequireAuth allowedRole="student" />}>
              <Route path="/student/dashboard" element={<StudentDashboard theme={theme} onToggleTheme={toggleTheme} />} />
            </Route>
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </AssignmentProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
