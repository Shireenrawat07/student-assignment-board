import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { HomeRedirect, LoginRedirect, RequireAuth } from './auth/RouteGuards.jsx'
import { AssignmentProvider } from './assignments/AssignmentProvider.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AssignmentProvider>
          <Routes>
            <Route element={<LoginRedirect />}>
              <Route path="/" element={<LoginPage />} />
            </Route>
            <Route element={<RequireAuth allowedRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            <Route element={<RequireAuth allowedRole="student" />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Route>
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </AssignmentProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
