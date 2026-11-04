import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { HomeRedirect, LoginRedirect, RequireAuth } from './auth/RouteGuards.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RoleDashboard from './pages/RoleDashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<LoginRedirect />}>
            <Route path="/" element={<LoginPage />} />
          </Route>
          <Route element={<RequireAuth allowedRole="admin" />}>
            <Route path="/admin/dashboard" element={<RoleDashboard role="admin" />} />
          </Route>
          <Route element={<RequireAuth allowedRole="student" />}>
            <Route path="/student/dashboard" element={<RoleDashboard role="student" />} />
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
